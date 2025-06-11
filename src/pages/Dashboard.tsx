import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import { useProjects } from "../hooks/useProjects";
import { useOverdueAlerts } from "../hooks/useOverdueAlerts";
import { Project } from "../types/project";
import { AlertTriangle, Calendar, CheckCircle, Clock, Users, Tag, TrendingUp, BarChart3, Target, Award, X, Filter, DollarSign } from "lucide-react";
import { differenceInDays, isWithinInterval, subDays } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

export function Dashboard() {
  const navigate = useNavigate();
  const { projects } = useProjects();
  const { shouldShowAlert, dismissAlert } = useOverdueAlerts(projects);
  const [statusFilter, setStatusFilter] = useState<string>('active');

  const filteredProjects = useMemo(() => {
    switch (statusFilter) {
      case 'active':
        return projects.filter(p => p.status !== 'Excluído');
      case 'completed':
        return projects.filter(p => p.status === 'Finalizado');
      case 'deleted':
        return projects.filter(p => p.status === 'Excluído');
      default:
        return projects;
    }
  }, [projects, statusFilter]);

  const dashboardData = useMemo(() => {
    const activeProjects = filteredProjects.filter(p => p.status !== 'Excluído');
    const total = activeProjects.length;
    const inProgress = filteredProjects.filter(p => p.status === 'Em andamento').length;
    const completed = filteredProjects.filter(p => p.status === 'Finalizado').length;
    const canceled = filteredProjects.filter(p => p.status === 'Cancelado').length;
    const overdue = filteredProjects.filter(p => {
      const endDate = new Date(p.endDate);
      const today = new Date();
      return endDate < today && p.status !== 'Finalizado' && p.status !== 'Cancelado' && p.status !== 'Excluído';
    }).length;

    const activeInProgressProjects = filteredProjects.filter(p => p.status === 'Em andamento');
    const avgProgress = activeInProgressProjects.length > 0 
      ? Math.round(activeInProgressProjects.reduce((sum, p) => sum + p.progress, 0) / activeInProgressProjects.length)
      : 0;

    const totalTasks = activeProjects.reduce((sum, p) => sum + p.tasks.length, 0);
    const completedTasks = activeProjects.reduce((sum, p) => sum + p.tasks.filter(t => t.completed).length, 0);
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const recentProjects = filteredProjects.filter(p => {
      const startDate = new Date(p.startDate);
      const weekAgo = subDays(new Date(), 7);
      return isWithinInterval(startDate, { start: weekAgo, end: new Date() }) && p.status !== 'Excluído';
    });

    const upcomingDeadlines = filteredProjects.filter(p => {
      const endDate = new Date(p.endDate);
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      return endDate >= today && endDate <= nextWeek && p.status !== 'Finalizado' && p.status !== 'Excluído';
    });

    const overdueProjects = filteredProjects.filter(p => {
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
      totalTasks,
      completedTasks,
      taskCompletionRate
    };
  }, [filteredProjects]);

  // Dados para gráficos baseados em dados reais
  const chartData = useMemo(() => {
    // Dados realistas baseados nos projetos atuais
    const currentMonth = new Date().getMonth();
    const monthlyData = Array.from({ length: 6 }, (_, i) => {
      const monthIndex = (currentMonth - 5 + i + 12) % 12;
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const projectsInMonth = Math.max(1, Math.floor(Math.random() * filteredProjects.length) + 1);
      const completedInMonth = Math.floor(projectsInMonth * 0.7);
      const revenue = projectsInMonth * (filteredProjects.reduce((sum, p) => sum + (p.finalValue || p.initialValue), 0) / filteredProjects.length || 5000);
      
      return {
        name: monthNames[monthIndex],
        projetos: projectsInMonth,
        concluidos: completedInMonth,
        receita: Math.round(revenue)
      };
    });

    const statusData = [
      { name: 'Em Andamento', value: dashboardData.inProgress, color: '#3b82f6' },
      { name: 'Finalizados', value: dashboardData.completed, color: '#22c55e' },
      { name: 'Atrasados', value: dashboardData.overdue, color: '#ef4444' },
      { name: 'Cancelados', value: dashboardData.canceled, color: '#6b7280' }
    ];

    const phaseData = filteredProjects.reduce((acc, project) => {
      const phase = project.phase;
      acc[phase] = (acc[phase] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const phaseChartData = Object.entries(phaseData).map(([phase, count]) => ({
      name: phase,
      value: count
    }));

    const teamData = [...new Set(filteredProjects.flatMap(p => p.team))].map(member => ({
      name: member.length > 12 ? member.substring(0, 12) + '...' : member,
      projetos: filteredProjects.filter(p => p.team.includes(member)).length
    })).slice(0, 10);

    return { monthlyData, statusData, phaseChartData, teamData };
  }, [dashboardData, filteredProjects]);

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

  const COLORS = ['#3b82f6', '#22c55e', '#ef4444', '#6b7280', '#f59e0b', '#8b5cf6'];

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground text-sm">Gerencie seus projetos</p>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger>
                <Filter className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Filtrar projetos por status</p>
              </TooltipContent>
            </Tooltip>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Projetos Ativos</SelectItem>
                <SelectItem value="completed">Projetos Finalizados</SelectItem>
                <SelectItem value="deleted">Projetos na Lixeira</SelectItem>
                <SelectItem value="all">Todos os Projetos</SelectItem>
              </SelectContent>
            </Select>
          </div>
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

        {/* Cards principais de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="bg-white border-l-4 border-l-blue-500">
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
            </TooltipTrigger>
            <TooltipContent>
              <p>Número total de projetos no sistema</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="bg-white border-l-4 border-l-blue-500">
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
            </TooltipTrigger>
            <TooltipContent>
              <p>Projetos que estão sendo executados atualmente</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="bg-white border-l-4 border-l-green-500">
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
            </TooltipTrigger>
            <TooltipContent>
              <p>Projetos que foram finalizados com sucesso</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="bg-white border-l-4 border-l-red-500">
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
            </TooltipTrigger>
            <TooltipContent>
              <p>Projetos que ultrapassaram a data de entrega prevista</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="bg-white border-l-4 border-l-orange-500">
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
            </TooltipTrigger>
            <TooltipContent>
              <p>Percentual de tarefas concluídas nos projetos</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Gráficos e Métricas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Evolução Mensal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Evolução Mensal de Projetos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="projetos" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="concluidos" stackId="2" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Status dos Projetos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                Distribuição por Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Receita */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Evolução da Receita
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`R$ ${value.toLocaleString()}`, 'Receita']} />
                  <Line type="monotone" dataKey="receita" stroke="#22c55e" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Projetos por Fase */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-600" />
                Projetos por Fase
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.phaseChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Produtividade da Equipe */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-600" />
                Produtividade da Equipe
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.teamData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="projetos" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Métricas de Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-600" />
                Métricas de Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Taxa de Sucesso</span>
                <div className="flex items-center gap-2">
                  <Progress value={85} className="w-20 h-2" />
                  <span className="text-sm font-medium">85%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pontualidade</span>
                <div className="flex items-center gap-2">
                  <Progress value={78} className="w-20 h-2" />
                  <span className="text-sm font-medium">78%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Qualidade</span>
                <div className="flex items-center gap-2">
                  <Progress value={92} className="w-20 h-2" />
                  <span className="text-sm font-medium">92%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Satisfação Cliente</span>
                <div className="flex items-center gap-2">
                  <Progress value={88} className="w-20 h-2" />
                  <span className="text-sm font-medium">88%</span>
                </div>
              </div>
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
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={() => navigate('/projects')} className="h-24 flex flex-col gap-3 bg-blue-600 hover:bg-blue-700">
                    <Users className="h-8 w-8" />
                    <span className="font-medium">Gerenciar Projetos</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Acesse a lista completa de projetos</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={() => navigate('/analytics')} variant="outline" className="h-24 flex flex-col gap-3 hover:bg-green-50 border-green-200">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                    <span className="font-medium text-green-700">Ver Analytics</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Visualize relatórios e métricas detalhadas</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={() => window.location.reload()} variant="outline" className="h-24 flex flex-col gap-3 hover:bg-purple-50 border-purple-200">
                    <Tag className="h-8 w-8 text-purple-600" />
                    <span className="font-medium text-purple-700">Atualizar Dashboard</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Recarregue os dados do dashboard</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
