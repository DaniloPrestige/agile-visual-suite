
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useProjects } from "../hooks/useProjects";
import { differenceInDays } from "date-fns";
import { DollarSign, TrendingUp, Target, Clock, Award, BarChart3, Users, AlertTriangle, Calendar, Zap } from "lucide-react";
import { currencyService } from "../services/currencyService";
import { useNavigate } from "react-router-dom";

export function Analytics() {
  const { projects } = useProjects();
  const navigate = useNavigate();

  const analytics = useMemo(() => {
    const activeProjects = projects.filter(p => p.status !== 'Excluído');
    const total = activeProjects.length;
    const inProgress = projects.filter(p => p.status === 'Em andamento').length;
    const completed = projects.filter(p => p.status === 'Finalizado').length;
    const overdue = projects.filter(p => {
      const endDate = new Date(p.endDate);
      const today = new Date();
      return endDate < today && p.status !== 'Finalizado' && p.status !== 'Cancelado' && p.status !== 'Excluído';
    }).length;

    // Calcular progresso médio apenas dos projetos em andamento
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

    // KPI Principal
    const kpiScore = Math.round((deliveryRate + avgProgress + (completed / total * 100 || 0)) / 3);

    // Projetos por tag
    const tagStats = activeProjects.flatMap(p => p.tags).reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Projetos por responsável
    const teamStats = activeProjects.flatMap(p => p.team).reduce((acc, member) => {
      acc[member] = (acc[member] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Total de tarefas e conclusão
    const totalTasks = activeProjects.reduce((sum, p) => sum + p.tasks.length, 0);
    const completedTasks = activeProjects.reduce((sum, p) => sum + p.tasks.filter(t => t.completed).length, 0);
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Projetos atrasados com detalhes
    const overdueDetails = projects
      .filter(p => {
        const endDate = new Date(p.endDate);
        const today = new Date();
        return endDate < today && p.status !== 'Finalizado' && p.status !== 'Cancelado' && p.status !== 'Excluído';
      })
      .map(p => ({
        ...p,
        daysOverdue: differenceInDays(new Date(), new Date(p.endDate))
      }))
      .sort((a, b) => b.daysOverdue - a.daysOverdue)
      .slice(0, 5);

    // Projetos com pior desempenho
    const poorPerformance = projects
      .filter(p => p.status === 'Em andamento')
      .sort((a, b) => a.progress - b.progress)
      .slice(0, 3);

    // Dados para evolução da receita (últimos 6 meses simulados)
    const revenueEvolution = [
      { month: 'Jan', receita: 120000, planejado: 100000 },
      { month: 'Fev', receita: 180000, planejado: 150000 },
      { month: 'Mar', receita: 220000, planejado: 180000 },
      { month: 'Abr', receita: 190000, planejado: 200000 },
      { month: 'Mai', receita: 280000, planejado: 250000 },
      { month: 'Jun', receita: completedRevenue, planejado: totalRevenue }
    ];

    return {
      total,
      inProgress,
      completed,
      overdue,
      avgProgress,
      totalRevenue,
      completedRevenue,
      budgetVariation,
      deliveryRate,
      kpiScore,
      tagStats,
      teamStats,
      overdueDetails,
      poorPerformance,
      totalTasks,
      completedTasks,
      taskCompletionRate,
      revenueEvolution
    };
  }, [projects]);

  // Dados para gráficos
  const statusData = [
    { name: 'Em andamento', value: analytics.inProgress, color: '#3b82f6' },
    { name: 'Finalizado', value: analytics.completed, color: '#10b981' },
    { name: 'Atrasado', value: analytics.overdue, color: '#ef4444' },
    { name: 'Cancelado', value: projects.filter(p => p.status === 'Cancelado').length, color: '#6b7280' }
  ];

  const tagData = Object.entries(analytics.tagStats)
    .map(([name, value]) => ({ name: name.length > 10 ? name.substring(0, 10) + '...' : name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const teamData = Object.entries(analytics.teamStats)
    .map(([name, value]) => ({ name: name.length > 15 ? name.substring(0, 15) + '...' : name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics</h1>

      {/* Cards principais de KPIs clicáveis */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-blue-500"
          onClick={() => navigate('/analytics/kpi')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">KPI Geral</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{analytics.kpiScore}%</div>
            <p className="text-xs text-muted-foreground">Score Global</p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-green-500"
          onClick={() => navigate('/analytics/financial')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {currencyService.formatCurrency(analytics.totalRevenue, 'BRL')}
            </div>
            <p className="text-xs text-muted-foreground">Todos os projetos</p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-purple-500"
          onClick={() => navigate('/analytics/quality')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Entrega</CardTitle>
            <Award className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{analytics.deliveryRate}%</div>
            <p className="text-xs text-muted-foreground">No prazo</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progresso Médio</CardTitle>
            <Target className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{analytics.avgProgress}%</div>
            <p className="text-xs text-muted-foreground">Projetos ativos</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-indigo-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conclusão Tarefas</CardTitle>
            <Zap className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">{analytics.taskCompletionRate}%</div>
            <p className="text-xs text-muted-foreground">{analytics.completedTasks}/{analytics.totalTasks} tarefas</p>
          </CardContent>
        </Card>
      </div>

      {/* Cards de métricas secundárias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{analytics.total}</div>
            <p className="text-xs text-muted-foreground">Projetos</p>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{analytics.inProgress}</div>
            <p className="text-xs text-muted-foreground">Ativos</p>
          </CardContent>
        </Card>

        <Card className="bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Finalizados</CardTitle>
            <Award className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{analytics.completed}</div>
            <p className="text-xs text-muted-foreground">Concluídos</p>
          </CardContent>
        </Card>

        <Card className="bg-red-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atrasados</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{analytics.overdue}</div>
            <p className="text-xs text-muted-foreground">Vencidos</p>
          </CardContent>
        </Card>

        <Card className="bg-purple-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Variação</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${analytics.budgetVariation >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {analytics.budgetVariation >= 0 ? '+' : ''}{currencyService.formatCurrency(analytics.budgetVariation, 'BRL')}
            </div>
            <p className="text-xs text-muted-foreground">Orçamento</p>
          </CardContent>
        </Card>

        <Card className="bg-teal-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Realizado</CardTitle>
            <DollarSign className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-600">
              {currencyService.formatCurrency(analytics.completedRevenue, 'BRL')}
            </div>
            <p className="text-xs text-muted-foreground">Receita</p>
          </CardContent>
        </Card>
      </div>

      {/* Progresso médio */}
      <Card>
        <CardHeader>
          <CardTitle>Progresso Médio dos Projetos Ativos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Progresso Médio</span>
              <span className="font-medium">{analytics.avgProgress}%</span>
            </div>
            <Progress value={analytics.avgProgress} className="h-3" />
            <div className="text-xs text-gray-500">* Baseado apenas nos projetos com status "Em andamento"</div>
          </div>
        </CardContent>
      </Card>

      {/* Gráficos principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  fontSize={11}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Projetos por Responsável</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={teamData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" fontSize={11} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={80} 
                  fontSize={11}
                />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Novos gráficos adicionais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Evolução da Receita</CardTitle>
            <p className="text-sm text-muted-foreground">Receita e lucratividade ao longo do tempo</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.revenueEvolution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={11} />
                <YAxis 
                  fontSize={11}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value) => [currencyService.formatCurrency(Number(value), 'BRL'), '']}
                />
                <Line 
                  type="monotone" 
                  dataKey="receita" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  name="Receita Realizada"
                />
                <Line 
                  type="monotone" 
                  dataKey="planejado" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  name="Receita Planejada"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Análise de Lucratividade</CardTitle>
            <p className="text-sm text-muted-foreground">Indicadores financeiros chave</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">+167%</div>
              <p className="text-sm text-muted-foreground">Lucratividade vs Planejado</p>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Receita Realizada:</span>
                <span className="font-medium">{currencyService.formatCurrency(analytics.completedRevenue, 'BRL')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Orçamento Planejado:</span>
                <span className="font-medium">{currencyService.formatCurrency(analytics.totalRevenue * 0.6, 'BRL')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Variação:</span>
                <span className={`font-medium ${analytics.budgetVariation >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analytics.budgetVariation >= 0 ? '+' : ''}{currencyService.formatCurrency(analytics.budgetVariation, 'BRL')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análises detalhadas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Projetos por Tag</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tagData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  fontSize={11}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis fontSize={11} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Projetos Mais Atrasados</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.overdueDetails.length === 0 ? (
              <p className="text-muted-foreground">Nenhum projeto atrasado encontrado!</p>
            ) : (
              <div className="space-y-3">
                {analytics.overdueDetails.map((project) => (
                  <div key={project.id} className="border-l-4 border-red-500 pl-4">
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
                      <Badge variant="destructive">
                        {project.daysOverdue} dias
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
