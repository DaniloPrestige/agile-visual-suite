
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Award, Clock, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProjects } from "../../hooks/useProjects";
import { useMemo } from "react";
import { differenceInDays } from "date-fns";

export function QualityDetails() {
  const navigate = useNavigate();
  const { projects } = useProjects();

  const qualityMetrics = useMemo(() => {
    const completedProjects = projects.filter(p => p.status === 'Finalizado');
    const activeProjects = projects.filter(p => p.status !== 'Excluído');
    
    const onTimeProjects = completedProjects.filter(p => 
      new Date(p.endDate) >= new Date()
    ).length;
    
    const deliveryRate = completedProjects.length > 0 
      ? Math.round((onTimeProjects / completedProjects.length) * 100)
      : 100;

    const overdueProjects = projects.filter(p => {
      const endDate = new Date(p.endDate);
      const today = new Date();
      return endDate < today && p.status !== 'Finalizado' && p.status !== 'Cancelado' && p.status !== 'Excluído';
    });

    const avgProgress = activeProjects.filter(p => p.status === 'Em andamento').reduce((sum, p, _, arr) => {
      return sum + (p.progress / arr.length);
    }, 0);

    const riskLevel = overdueProjects.length > activeProjects.length * 0.3 ? 'Alto' : 
                     overdueProjects.length > activeProjects.length * 0.1 ? 'Médio' : 'Baixo';

    return {
      deliveryRate,
      onTimeProjects,
      totalCompleted: completedProjects.length,
      overdueProjects: overdueProjects.length,
      avgProgress: Math.round(avgProgress),
      riskLevel,
      totalActive: activeProjects.length
    };
  }, [projects]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/analytics')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Analytics
        </Button>
        <h1 className="text-3xl font-bold">Indicadores de Qualidade</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              Taxa de Entrega no Prazo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {qualityMetrics.deliveryRate}%
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {qualityMetrics.onTimeProjects} de {qualityMetrics.totalCompleted} projetos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Projetos Atrasados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {qualityMetrics.overdueProjects}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              de {qualityMetrics.totalActive} projetos ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-blue-600" />
              Progresso Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {qualityMetrics.avgProgress}%
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Projetos em andamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nível de Risco</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge 
              className={`text-lg px-4 py-2 ${
                qualityMetrics.riskLevel === 'Alto' ? 'bg-red-100 text-red-800' :
                qualityMetrics.riskLevel === 'Médio' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}
            >
              {qualityMetrics.riskLevel}
            </Badge>
            <p className="text-sm text-muted-foreground mt-2">
              Baseado em projetos atrasados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Eficiência Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              qualityMetrics.deliveryRate >= 80 && qualityMetrics.avgProgress >= 70 ? 'text-green-600' :
              qualityMetrics.deliveryRate >= 60 && qualityMetrics.avgProgress >= 50 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {qualityMetrics.deliveryRate >= 80 && qualityMetrics.avgProgress >= 70 ? 'Excelente' :
               qualityMetrics.deliveryRate >= 60 && qualityMetrics.avgProgress >= 50 ? 'Boa' :
               'Precisa Melhorar'}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Avaliação geral de qualidade
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
