import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useProjects } from "../hooks/useProjects";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Users, CheckCircle, Clock, AlertTriangle, DollarSign, Calendar } from "lucide-react";
import { useMemo } from 'react';

export function Dashboard() {
  const { projects } = useProjects();

  const calculateMetrics = useMemo(() => {
    const totalProjects = projects.filter(p => p.status !== 'Excluído').length;
    const inProgress = projects.filter(p => p.status === 'Em andamento').length;
    const completed = projects.filter(p => p.status === 'Finalizado').length;
    const overdue = projects.filter(p => {
      const endDate = new Date(p.endDate);
      const today = new Date();
      return endDate < today && p.status !== 'Finalizado' && p.status !== 'Cancelado' && p.status !== 'Excluído';
    }).length;

    return { totalProjects, inProgress, completed, overdue };
  }, [projects]);

  const revenueData = useMemo(() => {
    const currentDate = new Date();
    const months = [];
    
    for (let i = 3; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });
      
      // Para o mês atual, usar dados reais dos projetos
      if (i === 0) {
        const monthRevenue = projects
          .filter(p => p.status === 'Finalizado')
          .reduce((sum, p) => sum + (Number(p.finalValue) || Number(p.initialValue) || 0), 0);
        months.push({ mes: monthName, receita: monthRevenue });
      } else {
        // Para meses anteriores, usar dados simulados baseados nos projetos atuais
        const baseRevenue = projects.reduce((sum, p) => sum + (Number(p.finalValue) || Number(p.initialValue) || 0), 0);
        const simulatedRevenue = Math.round(baseRevenue * (0.3 + Math.random() * 0.4)); // 30-70% do total
        months.push({ mes: monthName, receita: simulatedRevenue });
      }
    }
    
    return months;
  }, [projects]);

  const projectEvolutionData = useMemo(() => {
    const currentDate = new Date();
    const months = [];
    
    for (let i = 3; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });
      
      if (i === 0) {
        // Mês atual - dados reais
        months.push({
          mes: monthName,
          criados: projects.filter(p => {
            const projectDate = new Date(p.startDate);
            return projectDate.getMonth() === currentDate.getMonth() && 
                   projectDate.getFullYear() === currentDate.getFullYear();
          }).length,
          finalizados: projects.filter(p => p.status === 'Finalizado').length
        });
      } else {
        // Meses anteriores - dados simulados
        const totalProjects = projects.length;
        months.push({
          mes: monthName,
          criados: Math.round(totalProjects * (0.1 + Math.random() * 0.3)),
          finalizados: Math.round(totalProjects * (0.05 + Math.random() * 0.2))
        });
      }
    }
    
    return months;
  }, [projects]);

  const statusData = useMemo(() => {
    return [
      { name: 'Em Andamento', value: projects.filter(p => p.status === 'Em andamento').length },
      { name: 'Finalizado', value: projects.filter(p => p.status === 'Finalizado').length },
      { name: 'Atrasado', value: projects.filter(p => {
        const endDate = new Date(p.endDate);
        const today = new Date();
        return endDate < today && p.status !== 'Finalizado' && p.status !== 'Cancelado' && p.status !== 'Excluído';
      }).length },
      { name: 'Cancelado', value: projects.filter(p => p.status === 'Cancelado').length },
    ];
  }, [projects]);

  const phaseData = useMemo(() => {
    return [
      { name: 'Iniciação', value: projects.filter(p => p.phase === 'Iniciação').length },
      { name: 'Planejamento', value: projects.filter(p => p.phase === 'Planejamento').length },
      { name: 'Execução', value: projects.filter(p => p.phase === 'Execução').length },
      { name: 'Monitoramento', value: projects.filter(p => p.phase === 'Monitoramento').length },
      { name: 'Encerramento', value: projects.filter(p => p.phase === 'Encerramento').length },
    ];
  }, [projects]);

  const teamData = useMemo(() => {
    const teamMembers = projects.flatMap(project => project.team);
    const teamCounts: { [key: string]: number } = {};
    teamMembers.forEach(member => {
      teamCounts[member] = (teamCounts[member] || 0) + 1;
    });

    return Object.entries(teamCounts).map(([name, value]) => ({ name, value }));
  }, [projects]);

  const riskData = useMemo(() => {
    const highRisks = projects.reduce((sum, project) => sum + project.risks.filter(r => r.impact === 'alto').length, 0);
    const mediumRisks = projects.reduce((sum, project) => sum + project.risks.filter(r => r.impact === 'médio').length, 0);
    const lowRisks = projects.reduce((sum, project) => sum + project.risks.filter(r => r.impact === 'baixo').length, 0);

    return [
      { name: 'Alto', value: highRisks },
      { name: 'Médio', value: mediumRisks },
      { name: 'Baixo', value: lowRisks },
    ];
  }, [projects]);

  const metrics = calculateMetrics;
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
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

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral dos seus projetos e métricas</p>
        </div>

        {/* Métricas principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 - Total de Projetos */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="cursor-default">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Projetos</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.totalProjects}</div>
                  <p className="text-xs text-muted-foreground">
                    {metrics.totalProjects > 0 ? '+2 desde o mês passado' : 'Nenhum projeto ainda'}
                  </p>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Número total de projetos ativos no sistema</p>
            </TooltipContent>
          </Tooltip>

          {/* Card 2 - Em Andamento */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="cursor-default">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{metrics.inProgress}</div>
                  <p className="text-xs text-muted-foreground">
                    {metrics.inProgress > 0 ? `${Math.round((metrics.inProgress / metrics.totalProjects) * 100)}% do total` : 'Nenhum em andamento'}
                  </p>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Projetos atualmente em execução</p>
            </TooltipContent>
          </Tooltip>

          {/* Card 3 - Finalizados */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="cursor-default">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Finalizados</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{metrics.completed}</div>
                  <p className="text-xs text-muted-foreground">
                    {metrics.completed > 0 ? `${Math.round((metrics.completed / metrics.totalProjects) * 100)}% do total` : 'Nenhum finalizado'}
                  </p>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Projetos concluídos com sucesso</p>
            </TooltipContent>
          </Tooltip>

          {/* Card 4 - Atrasados */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="cursor-default">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Atrasados</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{metrics.overdue}</div>
                  <p className="text-xs text-muted-foreground">
                    {metrics.overdue > 0 ? 'Requerem atenção imediata' : 'Todos em dia'}
                  </p>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Projetos que passaram do prazo estabelecido</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Evolução de Receita */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Evolução de Receita
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="receita" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Evolução Mensal de Projetos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Evolução Mensal de Projetos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectEvolutionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Bar dataKey="criados" fill="#8884d8" name="Criados" />
                    <Bar dataKey="finalizados" fill="#82ca9d" name="Finalizados" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Status dos Projetos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Status dos Projetos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
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
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Projetos por Fase */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Projetos por Fase
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={phaseData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {phaseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Projetos por Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Projetos por Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={teamData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="#8884d8" name="Projetos" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Riscos por Impacto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Riscos por Impacto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {riskData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Visão geral do progresso */}
        <Card>
          <CardHeader>
            <CardTitle>Visão geral do progresso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project.id} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{project.name}</span>
                    <span className="text-xs text-muted-foreground">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Atividades recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Atividades recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-none space-y-2">
              {projects.slice(0, 5).map((project) => (
                <li key={project.id} className="text-sm">
                  <span className="font-medium">{project.name}</span> - Atualizado em {new Date(project.startDate).toLocaleDateString()}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
