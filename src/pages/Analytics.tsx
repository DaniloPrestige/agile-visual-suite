
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useProjects } from "../hooks/useProjects";
import { differenceInDays } from "date-fns";

export function Analytics() {
  const { projects } = useProjects();

  const analytics = useMemo(() => {
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

    // Projetos por tag
    const tagStats = projects.flatMap(p => p.tags).reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Projetos por responsável
    const teamStats = projects.flatMap(p => p.team).reduce((acc, member) => {
      acc[member] = (acc[member] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Projetos atrasados com detalhes
    const overdueDetails = projects
      .filter(p => {
        const endDate = new Date(p.endDate);
        const today = new Date();
        return endDate < today && p.status !== 'Finalizado' && p.status !== 'Cancelado';
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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics</h1>

      {/* Cards principais */}
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
          <CardTitle>Progresso Médio Geral</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Progresso Médio</span>
              <span className="font-medium">{analytics.avgProgress}%</span>
            </div>
            <Progress value={analytics.avgProgress} className="h-3" />
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
                <XAxis dataKey="name" />
                <YAxis />
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
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
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
