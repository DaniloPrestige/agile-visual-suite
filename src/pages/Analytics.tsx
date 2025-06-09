
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useProjects } from "../hooks/useProjects";
import { differenceInDays } from "date-fns";
import { DollarSign, TrendingUp, Target, Clock, Award, BarChart3 } from "lucide-react";
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
      tagStats,
      teamStats,
      overdueDetails,
      poorPerformance
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
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const teamData = Object.entries(analytics.teamStats)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const handleKPIClick = (type: string) => {
    console.log(`Clicked on KPI: ${type}`);
    // Implementar navegação específica para cada KPI
    navigate('/projects');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics</h1>

      {/* Cards principais de KPIs clicáveis */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-green-500"
          onClick={() => handleKPIClick('revenue')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visão Geral</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">Receita Total</div>
            <div className="text-2xl font-bold text-green-600">
              {currencyService.formatCurrency(analytics.totalRevenue, 'BRL')}
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-blue-500"
          onClick={() => handleKPIClick('performance')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">Orçamento Total</div>
            <div className="text-2xl font-bold text-blue-600">
              {currencyService.formatCurrency(analytics.totalRevenue, 'BRL')}
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-purple-500"
          onClick={() => handleKPIClick('financial')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Financeiro</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">Variação</div>
            <div className={`text-2xl font-bold ${analytics.budgetVariation >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              +{currencyService.formatCurrency(Math.abs(analytics.budgetVariation), 'BRL')}
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-yellow-500"
          onClick={() => handleKPIClick('quality')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Qualidade</CardTitle>
            <Award className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">% Variação</div>
            <div className="text-2xl font-bold text-yellow-600">
              +{analytics.budgetVariation >= 0 ? '0' : Math.abs(Math.round((analytics.budgetVariation / analytics.totalRevenue) * 100))}%
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-orange-500"
          onClick={() => handleKPIClick('strategic')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estratégico</CardTitle>
            <Target className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">Entrega no Prazo</div>
            <div className="text-2xl font-bold text-orange-600">{analytics.deliveryRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Cards de métricas secundárias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Projetos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{analytics.inProgress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Finalizados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{analytics.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atrasados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{analytics.overdue}</div>
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

      {/* Gráficos */}
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
                  fontSize={12}
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
            <CardTitle>Projetos por Tag</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tagData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Análises detalhadas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        <Card>
          <CardHeader>
            <CardTitle>Projetos com Pior Desempenho</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.poorPerformance.length === 0 ? (
              <p className="text-muted-foreground">Todos os projetos estão com bom desempenho!</p>
            ) : (
              <div className="space-y-4">
                {analytics.poorPerformance.map((project) => (
                  <div key={project.id} className="border-l-4 border-yellow-500 pl-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">{project.name}</p>
                        <p className="text-sm text-muted-foreground">Cliente: {project.client}</p>
                        {project.team.length > 0 && (
                          <p className="text-sm text-muted-foreground">
                            Responsável: {project.team[0]}
                          </p>
                        )}
                      </div>
                      <Badge variant="secondary">{project.progress}%</Badge>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Projetos por responsável */}
      {Object.keys(analytics.teamStats).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Projetos por Responsável</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={teamData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" fontSize={12} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={120} 
                  fontSize={12}
                />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
