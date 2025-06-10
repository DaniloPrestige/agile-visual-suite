
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProjects } from "../../hooks/useProjects";
import { useMemo } from "react";
import { currencyService } from "../../services/currencyService";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function FinancialDetails() {
  const navigate = useNavigate();
  const { projects } = useProjects();

  const financialData = useMemo(() => {
    const activeProjects = projects.filter(p => p.status !== 'Excluído');
    
    const totalInitial = activeProjects.reduce((sum, p) => sum + (p.initialValue || 0), 0);
    const totalFinal = activeProjects.reduce((sum, p) => sum + (p.finalValue || p.initialValue || 0), 0);
    const variation = totalFinal - totalInitial;
    const variationPercent = totalInitial > 0 ? Math.round((variation / totalInitial) * 100) : 0;

    const completedRevenue = projects
      .filter(p => p.status === 'Finalizado')
      .reduce((sum, p) => sum + (p.finalValue || p.initialValue || 0), 0);

    const pendingRevenue = totalFinal - completedRevenue;

    const monthlyData = activeProjects.map(project => ({
      name: project.name.substring(0, 15) + (project.name.length > 15 ? '...' : ''),
      inicial: project.initialValue || 0,
      final: project.finalValue || project.initialValue || 0
    }));

    return {
      totalInitial,
      totalFinal,
      variation,
      variationPercent,
      completedRevenue,
      pendingRevenue,
      monthlyData
    };
  }, [projects]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/analytics')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Analytics
        </Button>
        <h1 className="text-3xl font-bold">Detalhes Financeiros</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Orçamento Inicial
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {currencyService.formatCurrency(financialData.totalInitial, 'BRL')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              Valor Final
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {currencyService.formatCurrency(financialData.totalFinal, 'BRL')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {financialData.variation >= 0 ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-600" />
              )}
              Variação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${financialData.variation >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {financialData.variation >= 0 ? '+' : ''}{currencyService.formatCurrency(financialData.variation, 'BRL')}
            </div>
            <p className="text-sm text-muted-foreground">
              {financialData.variationPercent >= 0 ? '+' : ''}{financialData.variationPercent}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Receita Realizada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {currencyService.formatCurrency(financialData.completedRevenue, 'BRL')}
            </div>
            <p className="text-sm text-muted-foreground">
              Projetos finalizados
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Comparação Orçamento vs Valor Final por Projeto</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={financialData.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                fontSize={12}
                tickFormatter={(value) => currencyService.formatCurrency(value, 'BRL')}
              />
              <Tooltip 
                formatter={(value) => [currencyService.formatCurrency(Number(value), 'BRL'), '']}
              />
              <Bar dataKey="inicial" fill="#3b82f6" name="Orçamento Inicial" />
              <Bar dataKey="final" fill="#10b981" name="Valor Final" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
