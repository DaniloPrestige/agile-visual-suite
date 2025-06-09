
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useProjects } from "../hooks/useProjects";
import { Project } from "../types/project";
import { AlertTriangle, Calendar, CheckCircle, Clock, Users, Tag, TrendingUp } from "lucide-react";
import { differenceInDays, isWithinInterval, subDays } from "date-fns";

export function Dashboard() {
  const navigate = useNavigate();
  const { projects } = useProjects();

  const dashboardData = useMemo(() => {
    const total = projects.length;
    const inProgress = projects.filter(p => p.status === 'Em andamento').length;
    const completed = projects.filter(p => p.status === 'Finalizado').length;
    const overdue = projects.filter(p => {
      const endDate = new Date(p.endDate);
      const today = new Date();
      return endDate < today && p.status !== 'Finalizado' && p.status !== 'Cancelado';
    }).length;

    const avgProgress = projects.length > 0 
      ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
      : 0;

    // Projetos recentes (últimos 7 dias)
    const recentProjects = projects.filter(p => {
      const startDate = new Date(p.startDate);
      const weekAgo = subDays(new Date(), 7);
      return isWithinInterval(startDate, { start: weekAgo, end: new Date() });
    });

    // Próximos vencimentos (próximos 7 dias)
    const upcomingDeadlines = projects.filter(p => {
      const endDate = new Date(p.endDate);
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      return endDate >= today && endDate <= nextWeek && p.status !== 'Finalizado';
    });

    return {
      total,
      inProgress,
      completed,
      overdue,
      avgProgress,
      recentProjects,
      upcomingDeadlines
    };
  }, [projects]);

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

  const getDaysUntilDeadline = (endDate: string) => {
    return differenceInDays(new Date(endDate), new Date());
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button onClick={() => navigate('/projects')}>
          Ver Todos os Projetos
        </Button>
      </div>

      {/* Cards principais de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/projects')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Projetos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.total}</div>
            <p className="text-xs text-muted-foreground">
              Todos os projetos cadastrados
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/analytics')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{dashboardData.inProgress}</div>
            <p className="text-xs text-muted-foreground">
              Projetos ativos no momento
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/analytics')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Finalizados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{dashboardData.completed}</div>
            <p className="text-xs text-muted-foreground">
              Projetos concluídos com sucesso
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/analytics')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atrasados</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{dashboardData.overdue}</div>
            <p className="text-xs text-muted-foreground">
              Projetos que passaram do prazo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progresso geral */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Progresso Médio Geral
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Progresso médio de todos os projetos</span>
              <span className="text-2xl font-bold">{dashboardData.avgProgress}%</span>
            </div>
            <Progress value={dashboardData.avgProgress} className="h-3" />
            <p className="text-xs text-muted-foreground">
              Baseado no progresso de tarefas concluídas em {dashboardData.total} projetos
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Seção de projetos recentes e próximos vencimentos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Projetos Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData.recentProjects.length === 0 ? (
              <p className="text-muted-foreground">Nenhum projeto criado nos últimos 7 dias.</p>
            ) : (
              <div className="space-y-3">
                {dashboardData.recentProjects.slice(0, 5).map((project) => (
                  <div key={project.id} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{project.name}</p>
                        <p className="text-sm text-muted-foreground">Cliente: {project.client}</p>
                      </div>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                    </div>
                    <div className="mt-2">
                      <Progress value={project.progress} className="h-2" />
                    </div>
                  </div>
                ))}
                {dashboardData.recentProjects.length > 5 && (
                  <Button variant="outline" onClick={() => navigate('/projects')} className="w-full">
                    Ver mais {dashboardData.recentProjects.length - 5} projetos
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Próximos Vencimentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData.upcomingDeadlines.length === 0 ? (
              <p className="text-muted-foreground">Nenhum projeto vence nos próximos 7 dias.</p>
            ) : (
              <div className="space-y-3">
                {dashboardData.upcomingDeadlines.slice(0, 5).map((project) => (
                  <div key={project.id} className="border-l-4 border-yellow-500 pl-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{project.name}</p>
                        <p className="text-sm text-muted-foreground">Cliente: {project.client}</p>
                        {project.team.length > 0 && (
                          <p className="text-sm text-muted-foreground">
                            Responsável: {project.team[0]}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline">
                        {getDaysUntilDeadline(project.endDate)} dias
                      </Badge>
                    </div>
                    <div className="mt-2">
                      <Progress value={project.progress} className="h-2" />
                    </div>
                  </div>
                ))}
                {dashboardData.upcomingDeadlines.length > 5 && (
                  <Button variant="outline" onClick={() => navigate('/analytics')} className="w-full">
                    Ver mais {dashboardData.upcomingDeadlines.length - 5} projetos
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ações rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={() => navigate('/projects')} className="h-20 flex flex-col gap-2">
              <Users className="h-6 w-6" />
              <span>Gerenciar Projetos</span>
            </Button>
            <Button onClick={() => navigate('/analytics')} variant="outline" className="h-20 flex flex-col gap-2">
              <TrendingUp className="h-6 w-6" />
              <span>Ver Analytics</span>
            </Button>
            <Button onClick={() => window.location.reload()} variant="outline" className="h-20 flex flex-col gap-2">
              <Tag className="h-6 w-6" />
              <span>Atualizar Dashboard</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
