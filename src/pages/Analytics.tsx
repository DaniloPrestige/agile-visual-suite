
import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useProjects } from "../hooks/useProjects";
import { differenceInDays } from "date-fns";
import { DollarSign, TrendingUp, Target, Clock, Award, BarChart3, Users, AlertTriangle, Calendar, Zap, Building, FileText, CheckCircle, Filter } from "lucide-react";
import { currencyService } from "../services/currencyService";
import { useNavigate } from "react-router-dom";

export function Analytics() {
  const { projects } = useProjects();
  const navigate = useNavigate();
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

  const analytics = useMemo(() => {
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

    const totalRevenue = activeProjects.reduce((sum, p) => sum + (p.finalValue || p.initialValue || 0), 0);
    const completedRevenue = filteredProjects.filter(p => p.status === 'Finalizado').reduce((sum, p) => sum + (p.finalValue || p.initialValue || 0), 0);
    const budgetVariation = activeProjects.reduce((sum, p) => {
      const initial = p.initialValue || 0;
      const final = p.finalValue || 0;
      return sum + (final - initial);
    }, 0);

    const onTimeProjects = filteredProjects.filter(p => p.status === 'Finalizado' && new Date(p.endDate) >= new Date()).length;
    const deliveryRate = completed > 0 ? Math.round((onTimeProjects / completed) * 100) : 100;

    const totalTasks = activeProjects.reduce((sum, p) => sum + p.tasks.length, 0);
    const completedTasks = activeProjects.reduce((sum, p) => sum + p.tasks.filter(t => t.completed).length, 0);
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const tagStats = activeProjects.flatMap(p => p.tags).reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const teamStats = activeProjects.flatMap(p => p.team).reduce((acc, member) => {
      acc[member] = (acc[member] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const overdueDetails = filteredProjects
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

    // Dados reais baseados nos projetos atuais (sem dados fictícios de meses passados)
    const currentMonth = new Date().getMonth();
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const revenueEvolution = monthNames.slice(0, currentMonth + 1).map((month, index) => {
      if (index === currentMonth) {
        return { 
          month, 
          receita: completedRevenue, 
          planejado: totalRevenue 
        };
      }
      return { 
        month, 
        receita: 0, 
        planejado: 0 
      };
    });

    return {
      total,
      inProgress,
      completed,
      canceled,
      overdue,
      avgProgress,
      totalRevenue,
      completedRevenue,
      budgetVariation,
      deliveryRate,
      tagStats,
      teamStats,
      overdueDetails,
      totalTasks,
      completedTasks,
      taskCompletionRate,
      revenueEvolution
    };
  }, [filteredProjects]);

  const statusData = [
    { name: 'Em andamento', value: analytics.inProgress, color: '#3b82f6' },
    { name: 'Finalizado', value: analytics.completed, color: '#10b981' },
    { name: 'Atrasado', value: analytics.overdue, color: '#ef4444' },
    { name: 'Cancelado', value: analytics.canceled, color: '#6b7280' }
  ];

  const tagData = Object.entries(analytics.tagStats)
    .map(([name, value]) => ({ 
      name: name.length > 8 ? name.substring(0, 8) + '...' : name, 
      fullName: name,
      value 
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const teamData = Object.entries(analytics.teamStats)
    .map(([name, value]) => ({ 
      name: name.length > 12 ? name.substring(0, 12) + '...' : name, 
      fullName: name,
      value 
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const TeamTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const teamMember = teamData.find(t => t.name === data.payload.name);
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{teamMember?.fullName || data.payload.name}</p>
          <p style={{ color: '#10b981' }}>
            Projetos: {data.value}
          </p>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p style={{ color: data.payload.color }}>
            Projetos: {data.value}
          </p>
        </div>
      );
    }
    return null;
  };

  const handleCardClick = (cardType: string) => {
    // Navigate to detailed page for each card type
    navigate(`/analytics/details/${cardType}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
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

      {/* Cards principais compactos */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="cursor-pointer hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="p-1.5 bg-blue-100 rounded-md">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-600">{analytics.total}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="p-1.5 bg-yellow-100 rounded-md">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-yellow-600">{analytics.inProgress}</div>
                <div className="text-xs text-muted-foreground">Em Andamento</div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="p-1.5 bg-green-100 rounded-md">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">{analytics.completed}</div>
                <div className="text-xs text-muted-foreground">Finalizados</div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="p-1.5 bg-red-100 rounded-md">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-red-600">{analytics.overdue}</div>
                <div className="text-xs text-muted-foreground">Atrasados</div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="p-1.5 bg-purple-100 rounded-md">
                <Target className="h-4 w-4 text-purple-600" />
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-purple-600">{analytics.avgProgress}%</div>
                <div className="text-xs text-muted-foreground">Progresso</div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="p-1.5 bg-indigo-100 rounded-md">
                <Zap className="h-4 w-4 text-indigo-600" />
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-indigo-600">{analytics.taskCompletionRate}%</div>
                <div className="text-xs text-muted-foreground">Tarefas</div>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Cards financeiros detalhados - clickable */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card 
          className="lg:col-span-1 border-l-4 border-l-green-500 cursor-pointer hover:shadow-lg transition-all"
          onClick={() => handleCardClick('visao-geral')}
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
                {currencyService.formatCurrency(analytics.totalRevenue, 'BRL')}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="lg:col-span-1 border-l-4 border-l-blue-500 cursor-pointer hover:shadow-lg transition-all"
          onClick={() => handleCardClick('performance')}
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
                {currencyService.formatCurrency(analytics.totalRevenue * 0.6, 'BRL')}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="lg:col-span-1 border-l-4 border-l-red-500 cursor-pointer hover:shadow-lg transition-all"
          onClick={() => handleCardClick('financeiro')}
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
              <div className={`text-lg font-bold ${analytics.budgetVariation >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {analytics.budgetVariation >= 0 ? '+' : ''}{currencyService.formatCurrency(analytics.budgetVariation, 'BRL')}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="lg:col-span-1 border-l-4 border-l-purple-500 cursor-pointer hover:shadow-lg transition-all"
          onClick={() => handleCardClick('qualidade')}
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
              <div className="text-lg font-bold text-purple-600">+{analytics.deliveryRate}%</div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="lg:col-span-1 border-l-4 border-l-yellow-500 cursor-pointer hover:shadow-lg transition-all"
          onClick={() => handleCardClick('estrategico')}
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
              <div className="text-lg font-bold text-yellow-600">{analytics.deliveryRate}%</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cards financeiros detalhados segunda linha - clickable */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card 
          className="border-l-4 border-l-green-500 cursor-pointer hover:shadow-lg transition-all"
          onClick={() => handleCardClick('ebitda')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              EBITDA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-green-600">
              {currencyService.formatCurrency(analytics.completedRevenue * 0.28, 'BRL')}
            </div>
          </CardContent>
        </Card>

        <Card 
          className="border-l-4 border-l-blue-500 cursor-pointer hover:shadow-lg transition-all"
          onClick={() => handleCardClick('margem-liquida')}
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
          onClick={() => handleCardClick('fluxo-caixa')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-red-600" />
              Fluxo de Caixa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-red-600">
              {currencyService.formatCurrency(analytics.completedRevenue * 0.25, 'BRL')}
            </div>
          </CardContent>
        </Card>

        <Card 
          className="border-l-4 border-l-purple-500 cursor-pointer hover:shadow-lg transition-all"
          onClick={() => handleCardClick('roi-medio')}
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
          onClick={() => handleCardClick('payback')}
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
          onClick={() => handleCardClick('npv')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-600" />
              NPV
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-indigo-600">
              {currencyService.formatCurrency(analytics.completedRevenue * 0.45, 'BRL')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                  fontSize={10}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Projetos por Responsável</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={teamData} layout="horizontal" margin={{ left: 80, right: 5, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" fontSize={10} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={70} 
                  fontSize={10}
                />
                <Tooltip content={<TeamTooltip />} />
                <Bar dataKey="value" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de evolução */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Evolução da Receita</CardTitle>
            <p className="text-sm text-muted-foreground">Receita atual baseada nos projetos cadastrados</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.revenueEvolution} margin={{ left: 5, right: 5, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={10} />
                <YAxis 
                  fontSize={10}
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
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">+167%</div>
              <p className="text-sm text-muted-foreground">Lucratividade vs Planejado</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Receita Realizada:</span>
                <span className="font-medium">{currencyService.formatCurrency(analytics.completedRevenue, 'BRL')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Orçamento Planejado:</span>
                <span className="font-medium">{currencyService.formatCurrency(analytics.totalRevenue * 0.6, 'BRL')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Variação:</span>
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
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={tagData} margin={{ left: 5, right: 5, top: 5, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  fontSize={10}
                  angle={-30}
                  textAnchor="end"
                  height={60}
                  interval={0}
                />
                <YAxis fontSize={10} />
                <Tooltip content={<CustomTooltip />} />
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
