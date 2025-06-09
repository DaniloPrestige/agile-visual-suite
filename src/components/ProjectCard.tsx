
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Project } from "../types/project";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Eye, Edit, Trash2, Calendar, Users, Tag } from "lucide-react";

interface ProjectCardProps {
  project: Project;
  onView: (project: Project) => void;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}

export function ProjectCard({ project, onView, onEdit, onDelete }: ProjectCardProps) {
  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'Em andamento':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'Finalizado':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'Atrasado':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'Cancelado':
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'Em andamento':
        return '🔄';
      case 'Finalizado':
        return '✅';
      case 'Atrasado':
        return '⚠️';
      case 'Cancelado':
        return '❌';
      default:
        return '📋';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  return (
    <Card className="hover:shadow-xl transition-all duration-300 border border-gray-200 bg-white">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start mb-2">
          <CardTitle className="text-xl font-bold text-gray-900 line-clamp-2 flex-1 mr-2">
            {project.name}
          </CardTitle>
          <Badge className={`${getStatusColor(project.status)} px-3 py-1 text-sm font-medium whitespace-nowrap`}>
            {getStatusIcon(project.status)} {project.status}
          </Badge>
        </div>
        <div className="flex items-center text-gray-600 mb-3">
          <Users className="w-4 h-4 mr-2" />
          <span className="text-sm">Cliente: {project.client}</span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-gray-700">Progresso</span>
            <span className="font-bold text-blue-600">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-3 bg-gray-200" />
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center text-gray-600">
            <Calendar className="w-4 h-4 mr-2 text-green-600" />
            <div>
              <div className="text-xs text-gray-500">Início</div>
              <div className="font-medium">{formatDate(project.startDate)}</div>
            </div>
          </div>
          <div className="flex items-center text-gray-600">
            <Calendar className="w-4 h-4 mr-2 text-red-600" />
            <div>
              <div className="text-xs text-gray-500">Conclusão</div>
              <div className="font-medium">{formatDate(project.endDate)}</div>
            </div>
          </div>
        </div>

        {project.team.length > 0 && (
          <div>
            <div className="flex items-center mb-2">
              <Users className="w-4 h-4 mr-2 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Equipe:</span>
            </div>
            <p className="text-sm text-gray-600 pl-6">{project.team.slice(0, 2).join(', ')}{project.team.length > 2 ? ` +${project.team.length - 2} mais` : ''}</p>
          </div>
        )}

        {project.tags.length > 0 && (
          <div>
            <div className="flex items-center mb-2">
              <Tag className="w-4 h-4 mr-2 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Tags:</span>
            </div>
            <div className="flex flex-wrap gap-1 pl-6">
              {project.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border-blue-200">
                  #{tag}
                </Badge>
              ))}
              {project.tags.length > 3 && (
                <Badge variant="outline" className="text-xs px-2 py-1 bg-gray-50 text-gray-600">
                  +{project.tags.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-4 border-t border-gray-100">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(project)}
            className="flex-1 hover:bg-blue-50 hover:border-blue-300"
          >
            <Eye className="w-4 h-4 mr-2" />
            Visualizar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(project)}
            className="hover:bg-green-50 hover:border-green-300"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(project.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
