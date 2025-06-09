
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Project } from "../types/project";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Eye, Edit, Calendar, Users } from "lucide-react";
import { currencyService } from "../services/currencyService";

interface ProjectCardCompactProps {
  project: Project;
  onView: (project: Project) => void;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Project['status']) => void;
  isSelected: boolean;
  onSelectChange: (selected: boolean) => void;
  currentCurrency: 'BRL' | 'USD' | 'EUR';
}

export function ProjectCardCompact({ 
  project, 
  onView, 
  onEdit, 
  onDelete, 
  onStatusChange,
  isSelected, 
  onSelectChange,
  currentCurrency 
}: ProjectCardCompactProps) {
  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'Em andamento':
        return 'bg-blue-100 text-blue-800';
      case 'Finalizado':
        return 'bg-green-100 text-green-800';
      case 'Atrasado':
        return 'bg-red-100 text-red-800';
      case 'Cancelado':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPhaseColor = (phase: Project['phase']) => {
    switch (phase) {
      case 'Iniciação':
        return 'bg-purple-100 text-purple-800';
      case 'Planejamento':
        return 'bg-blue-100 text-blue-800';
      case 'Execução':
        return 'bg-orange-100 text-orange-800';
      case 'Monitoramento':
        return 'bg-yellow-100 text-yellow-800';
      case 'Encerramento':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const convertedValue = currencyService.convert(
    project.initialValue || 0, 
    project.currency, 
    currentCurrency
  );

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border border-gray-200 bg-white">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <Checkbox 
            checked={isSelected}
            onCheckedChange={onSelectChange}
            className="mt-1"
          />
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-2">
              <h3 
                className="font-bold text-lg text-gray-900 truncate cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => onView(project)}
              >
                {project.name}
              </h3>
              <div className="flex gap-1 ml-2">
                <Badge className={`${getStatusColor(project.status)} text-xs px-2 py-1`}>
                  {project.status}
                </Badge>
                <Badge className={`${getPhaseColor(project.phase)} text-xs px-2 py-1`}>
                  {project.phase}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
              <div>
                <span className="text-gray-500">Cliente:</span>
                <p className="font-medium truncate">{project.client}</p>
              </div>
              <div>
                <span className="text-gray-500">Valor:</span>
                <p className="font-medium">{currencyService.formatCurrency(convertedValue, currentCurrency)}</p>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Progresso</span>
                <span className="font-bold text-blue-600">{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 mb-3">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-green-600" />
                <span>{formatDate(project.startDate)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-red-600" />
                <span>{formatDate(project.endDate)}</span>
              </div>
            </div>

            {project.team.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                <Users className="w-3 h-3" />
                <span>{project.team.slice(0, 2).join(', ')}{project.team.length > 2 ? ` +${project.team.length - 2}` : ''}</span>
              </div>
            )}

            {project.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {project.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs px-2 py-0 bg-blue-50 text-blue-700">
                    #{tag}
                  </Badge>
                ))}
                {project.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs px-2 py-0 bg-gray-50">
                    +{project.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <Button variant="outline" size="sm" onClick={() => onView(project)} className="flex-1 text-xs">
                <Eye className="w-3 h-3 mr-1" />
                Ver
              </Button>
              <Button variant="outline" size="sm" onClick={() => onEdit(project)} className="text-xs">
                <Edit className="w-3 h-3" />
              </Button>
              <Select value={project.status} onValueChange={(value: Project['status']) => onStatusChange(project.id, value)}>
                <SelectTrigger className="w-24 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Em andamento">Ativo</SelectItem>
                  <SelectItem value="Finalizado">Finalizado</SelectItem>
                  <SelectItem value="Excluído">Excluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
