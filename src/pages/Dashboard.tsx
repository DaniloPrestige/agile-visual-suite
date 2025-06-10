
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { useProjects } from "../hooks/useProjects";
import { useOverdueAlerts } from "../hooks/useOverdueAlerts";
import { Project } from "../types/project";
import { AlertTriangle, Calendar, CheckCircle, Clock, Users, Tag, TrendingUp, BarChart3, DollarSign, Target, Award, X, Building, FileText, Zap } from "lucide-react";
import { differenceInDays, isWithinInterval, subDays } from "date-fns";
import { currencyService } from "../services/currencyService";

export function Dashboard() {
  const navigate = useNavigate();
  const { projects } = useProjects();
  const { shouldShowAlert, dismissAlert } = useOverdueAlerts(projects);

  const dashboardData = useMemo(() => {
    const activeProjects = projects.filter(p => p.status !== 'Excluído');
    const total = activeProjects.length;
    const inProgress = projects.filter(p => p.status === 'Em andamento').length;
    const completed = projects.filter(p => p.status === 'Finalizado').length;
    const canceled = projects.filter(p => p.status === 'Cancelado').length;
    const overdue = projects.filter(p => {
      const endDate = new Date(p.endDate);
      const today = new Date();
      return endDate < today && p.status !== 'Finalizado' && p.status !== 'Cancelado' && p.status !== 'Excluído';
    }).length;

    // Calcular progresso médio apenas dos projetos em andamento (ativos)
    const activeInProgressProjects = projects.filter(p => p.status === 'Em andamento');
    const avgProgress = activeInProgressProjects.length > 0 
      ? Math.round(activeInProgressProjects.reduce((sum, p) => sum + p.progress, 0) / activeInProgressProjects.length)
      : 0;

    // Cálculos financeiros
    const totalRevenue = activeProjects.reduce((sum, p) => sum + (p.finalValue || p.initialValue || 0), 0);
    const completedRevenue = projects.filter(p => p.status === 'Finalizado').reduce((sum, p) => sum + (p.finalValue || p.initialValue || 0), 0);
    const budgetVariation = activeProjects.reduce((sum, p) => {
      const initial = p.initialValue || 0;
      const final = p.finalValue || 0;
      return sum + (final - initial);
    }, 0);

    // Métricas de qualidade
    const onTimeProjects = projects.filter(p => p.status === 'Finalizado' && new Date(p.endDate) >= new Date()).length;
    const deliveryRate = completed > 0 ? Math.round((onTimeProjects / completed) * 100) : 100;

    // Total de tarefas
    const totalTasks = activeProjects.reduce((sum, p) => sum + p.tasks.length, 0);
    const completedTasks = activeProjects.reduce((sum, p) => sum + p.tasks.filter(t => t.completed).length, 0);
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Projetos recentes (últimos 7 dias)
    const recentProjects = projects.filter(p => {
      const startDate = new Date(p.startDate);
      const weekAgo = subDays(new Date(), 7);
      return isWithinInterval(startDate, { start: weekAgo, end: new Date() }) && p.status !== 'Excluído';
    });

    // Próximos vencimentos (próximos 7 dias)
    const upcomingDeadlines = projects.filter(p => {
      const endDate = new Date(p.endDate);
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      return endDate >= today && endDate <= nextWeek && p.status !== 'Finalizado' && p.status !== 'Excluído';
    });

    // Projetos atrasados
    const overdueProjects = projects.filter(p => {
      const endDate = new Date(p.endDate);
      const today = new Date();
      return endDate < today && p.status !== 'Finalizado' && p.status !== 'Cancelado' && p.status !== 'Excluído';
    });

    return {
      total,
      inProgress,
      completed,
      canceled,
      overdue,
      avgProgress,
      activeProjects: activeInProgressProjects.length,
      recentProjects,
      upcomingDeadlines,
      overdueProjects,
      totalRevenue,
      completedRevenue,
      budgetVariation,
      deliveryRate,
      totalTasks,
      completedTasks,
      taskCompletionRate
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
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Gerencie seus projetos</p>
      </div>

      {/* Alerta de projetos atrasados */}
      {shouldShowAlert && dashboardData.overdueProjects.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="flex justify-between items-center">
            <span>
              <strong>Atenção!</strong> Você tem {dashboardData.overdueProjects.length} projeto(s) atrasado(s). 
              <Button variant="link" className="p-0 h-auto text-red-600 underline ml-1" onClick={() => navigate('/analytics')}>
                Ver detalhes
              </Button>
            </span>
            <Button variant="ghost" size="sm" onClick={dismissAlert}>
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Cards financeiros principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card 
          className="lg:col-span-1 border-l-4 border-l-green-500 cursor-pointer hover:shadow-lg transition-all"
          onClick={() => navigate('/analytics')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              Visão Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <DollarSign className="h-3 w-3 text-orange-600" />
                <span className="text-xs">Receita Total</span>
              </div>
              <div className="text-lg font-bold text-green-600">
                {currencyService.formatCurrency(dashboardData.totalRevenue, 'BRL')}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="lg:col-span-1 border-l-4 border-l-blue-500 cursor-pointer hover:shadow-lg transition-all"
          onClick={() => navigate('/analytics')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Target className="h-3 w-3 text-pink-600" />
                <span className="text-xs">Orçamento Total</span>
              </div>
              <div className="text-lg font-bold text-blue-600">
                {currencyService.formatCurrency(dashboardData.totalRevenue * 0.6, 'BRL')}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="lg:col-span-1 border-l-4 border-l-red-500 cursor-pointer hover:shadow-lg transition-all"
          onClick={() => navigate('/analytics')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-red-600" />
              Financeiro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="text-xs">Variação</span>
              </div>
              <div className={`text-lg font-bold ${dashboardData.budgetVariation >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {dashboardData.budgetVariation >= 0 ? '+' : ''}{currencyService.formatCurrency(dashboardData.budgetVariation, 'BRL')}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="lg:col-span-1 border-l-4 border-l-purple-500 cursor-pointer hover:shadow-lg transition-all"
          onClick={() => navigate('/analytics')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Award className="h-4 w-4 text-purple-600" />
              Qualidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Award className="h-3 w-3 text-purple-600" />
                <span className="text-xs">% Variação</span>
              </div>
              <div className="text-lg font-bold text-purple-600">+{dashboardData.deliveryRate}%</div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="lg:col-span-1 border-l-4 border-l-yellow-500 cursor-pointer hover:shadow-lg transition-all"
          onClick={() => navigate('/analytics')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              Estratégico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-orange-600" />
                <span className="text-xs">Entrega no Prazo</span>
              </div>
              <div className="text-lg font-bold text-yellow-600">{dashboardData.deliveryRate}%</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cards financeiros detalhados segunda linha */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card 
          className="border-l-4 border-l-green-500 cursor-pointer hover:shadow-lg transition-all"
          onClick={() => navigate('/analytics')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              EBITDA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-green-600">
              {currencyService.formatCurrency(dashboardData.completedRevenue * 0.28, 'BRL')}
            </div>
          </CardContent>
        </Card>

        <Card 
          className="border-l-4 border-l-blue-500 cursor-pointer hover:shadow-lg transition-all"
          onClick={() => navigate('/analytics')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              Margem Líquida
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-blue-600">15%</div>
          </CardContent>
        </Card>

        <Card 
          className="border-l-4 border-l-red-500 cursor-pointer hover:shadow-lg transition-all"
          onClick={() => navigate('/analytics')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-red-600" />
              Fluxo de Caixa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-red-600">
              {currencyService.formatCurrency(dashboardData.completedRevenue * 0.25, 'BRL')}
            </div>
          </CardContent>
        </Card>

        <Card 
          className="border-l-4 border-l-purple-500 cursor-pointer hover:shadow-lg transition-all"
          onClick={() => navigate('/analytics')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-600" />
              ROI Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-purple-600">+24%</div>
          </CardContent>
        </Card>

        <Card 
          className="border-l-4 border-l-yellow-500 cursor-pointer hover:shadow-lg transition-all"
          onClick={() => navigate('/analytics')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              Payback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-yellow-600">18 meses</div>
          </CardContent>
        </Card>

        <Card 
          className="border-l-4 border-l-indigo-500 cursor-pointer hover:shadow-lg transition-all"
          onClick={() => navigate('/analytics')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-600" />
              NPV
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-indigo-600">
              {currencyService.formatCurrency(dashboardData.completedRevenue * 0.45, 'BRL')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progresso Médio Geral - Destaque no topo */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">Progresso Médio dos Projetos Ativos</div>
              <div className="text-sm text-gray-600">Baseado em {dashboardData.activeProjects} projetos em andamento</div>
              <div className="text-xs text-gray-500 mt-1">* Métrica calculada apenas com base nos projetos com status "Em andamento"</div>
            </div>
          </CardTitle>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">{dashboardData.avgProgress}%</div>
            <div className="text-sm text-gray-500">Progresso Geral</div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Progress value={dashboardData.avgProgress} className="h-4 bg-blue-100" />
            <div className="flex justify-between text-sm text-gray-600">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards principais de estatísticas clicáveis */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card 
          className="bg-white border-l-4 border-l-blue-500 cursor-pointer hover:shadow-lg transition-all"
          onClick={() => navigate('/projects')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total de Projetos</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{dashboardData.total}</div>
            <p className="text-sm text-gray-500 mt-1">
              Todos os projetos cadastrados
            </p>
          </CardContent>
        </Card>

        <Card 
          className="bg-white border-l-4 border-l-blue-500 cursor-pointer hover:shadow-lg transition-all"
          onClick={() => navigate('/analytics')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Em Andamento</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{dashboardData.inProgress}</div>
            <p className="text-sm text-gray-500 mt-1">
              Projetos ativos no momento
            </p>
          </CardContent>
        </Card>

        <Card 
          className="bg-white border-l-4 border-l-green-500 cursor-pointer hover:shadow-lg transition-all"
          onClick={() => navigate('/analytics')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Finalizados</CardTitle>
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{dashboardData.completed}</div>
            <p className="text-sm text-gray-500 mt-1">
              Projetos concluídos com sucesso
            </p>
          </CardContent>
        </Card>

        <Card 
          className="bg-white border-l-4 border-l-red-500 cursor-pointer hover:shadow-lg transition-all"
          onClick={() => navigate('/analytics')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Atrasados</CardTitle>
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{dashboardData.overdue}</div>
            <p className="text-sm text-gray-500 mt-1">
              Projetos que passaram do prazo
            </p>
          </CardContent>
        </Card>

        <Card 
          className="bg-white border-l-4 border-l-orange-500 cursor-pointer hover:shadow-lg transition-all"
          onClick={() => navigate('/analytics')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Conclusão Tarefas</CardTitle>
            <div className="p-2 bg-orange-100 rounded-lg">
              <Target className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{dashboardData.taskCompletionRate}%</div>
            <p className="text-sm text-gray-500 mt-1">
              {dashboardData.completedTasks}/{dashboardData.totalTasks} tarefas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Seção de projetos recentes e próximos vencimentos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              📅 Projetos Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData.recentProjects.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📋</div>
                <p className="text-gray-500">Nenhum projeto criado nos últimos 7 dias.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {dashboardData.recentProjects.slice(0, 5).map((project) => (
                  <div key={project.id} className="border-l-4 border-blue-500 pl-4 hover:bg-gray-50 p-2 rounded">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-900">{project.name}</p>
                        <p className="text-sm text-gray-600">Cliente: {project.client}</p>
                      </div>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <Progress value={project.progress} className="h-2 flex-1 mr-3" />
                      <span className="text-sm font-medium text-gray-600">{project.progress}%</span>
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
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              ⏰ Próximos Vencimentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData.upcomingDeadlines.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">✅</div>
                <p className="text-gray-500">Nenhum projeto vence nos próximos 7 dias.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {dashboardData.upcomingDeadlines.slice(0, 5).map((project) => (
                  <div key={project.id} className="border-l-4 border-yellow-500 pl-4 hover:bg-gray-50 p-2 rounded">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-900">{project.name}</p>
                        <p className="text-sm text-gray-600">Cliente: {project.client}</p>
                        {project.team.length > 0 && (
                          <p className="text-sm text-gray-600">
                            Responsável: {project.team[0]}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                        {getDaysUntilDeadline(project.endDate)} dias
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <Progress value={project.progress} className="h-2 flex-1 mr-3" />
                      <span className="text-sm font-medium text-gray-600">{project.progress}%</span>
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
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            🚀 Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={() => navigate('/projects')} className="h-24 flex flex-col gap-3 bg-blue-600 hover:bg-blue-700">
              <Users className="h-8 w-8" />
              <span className="font-medium">Gerenciar Projetos</span>
            </Button>
            <Button onClick={() => navigate('/analytics')} variant="outline" className="h-24 flex flex-col gap-3 hover:bg-green-50 border-green-200">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <span className="font-medium text-green-700">Ver Analytics</span>
            </Button>
            <Button onClick={() => window.location.reload()} variant="outline" className="h-24 flex flex-col gap-3 hover:bg-purple-50 border-purple-200">
              <Tag className="h-8 w-8 text-purple-600" />
              <span className="font-medium text-purple-700">Atualizar Dashboard</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
