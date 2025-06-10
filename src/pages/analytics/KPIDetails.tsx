
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProjects } from "../../hooks/useProjects";
import { useMemo } from "react";
import { currencyService } from "../../services/currencyService";

export function KPIDetails() {
  const navigate = useNavigate();
  const { projects } = useProjects();

  const kpiMetrics = useMemo(() => {
    const activeProjects = projects.filter(p => p.status !== 'Excluído');
    const completedProjects = projects.filter(p => p.status === 'Finalizado');
    const inProgressProjects = projects.filter(p => p.status === 'Em andamento');
    
    const totalRevenue = activeProjects.reduce((sum, p) => sum + (p.finalValue || p.initialValue || 0), 0);
    const completedRevenue = completedProjects.reduce((sum, p) => sum + (p.finalValue || p.initialValue || 0), 0);
    
    const avgProgress = inProgressProjects.length > 0 
      ? Math.round(inProgressProjects.reduce((sum, p) => sum + p.progress, 0) / inProgressProjects.length)
      : 0;

    const completionRate = activeProjects.length > 0 
      ? Math.round((completedProjects.length / activeProjects.length) * 100)
      : 0;

    return {
      totalRevenue,
      completedRevenue,
      avgProgress,
      completionRate,
      totalProjects: activeProjects.length,
      completedProjects: completedProjects.length,
      inProgressProjects: inProgressProjects.length
    };
  }, [projects]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/analytics')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Analytics
        </Button>
        <h1 className="text-3xl font-bold">KPI - Indicadores de Performance</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Receita Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {currencyService.formatCurrency(kpiMetrics.totalRevenue, 'BRL')}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Soma de todos os projetos ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Receita Realizada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {currencyService.formatCurrency(kpiMetrics.completedRevenue, 'BRL')}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Receita de projetos finalizados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Taxa de Conclusão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {kpiMetrics.completionRate}%
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Projetos finalizados vs total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progresso Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {kpiMetrics.avgProgress}%
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Média dos projetos em andamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Projetos Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-600">
              {kpiMetrics.totalProjects}
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              <div>Em andamento: {kpiMetrics.inProgressProjects}</div>
              <div>Finalizados: {kpiMetrics.completedProjects}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {kpiMetrics.avgProgress >= 70 ? (
                <TrendingUp className="h-8 w-8 text-green-600" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-600" />
              )}
              <span className={`text-2xl font-bold ${kpiMetrics.avgProgress >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                {kpiMetrics.avgProgress >= 70 ? 'Boa' : 'Precisa Atenção'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Baseado no progresso médio dos projetos
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
