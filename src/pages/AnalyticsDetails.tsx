
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, Users, Clock, DollarSign, AlertTriangle, CheckCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useProjects } from "../hooks/useProjects";
import { useMemo } from 'react';

export function AnalyticsDetails() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const { projects } = useProjects();

  const data = useMemo(() => {
    const activeProjects = projects.filter(p => p.status !== 'Excluído');
    
    switch (category) {
      case 'projects':
        return {
          title: 'Análise de Projetos',
          insights: [
            { type: 'Tendência Positiva', description: 'Taxa de crescimento de 15% nos últimos 3 meses em novos projetos iniciados.' },
            { type: 'Área de Atenção', description: 'Tempo médio de execução aumentou 8% comparado ao trimestre anterior.' },
            { type: 'Oportunidade', description: 'Clientes com projetos finalizados demonstram 85% de satisfação para novos contratos.' }
          ],
          metrics: {
            total: activeProjects.length,
            completed: projects.filter(p => p.status === 'Finalizado').length,
            inProgress: projects.filter(p => p.status === 'Em andamento').length,
            overdue: projects.filter(p => {
              const endDate = new Date(p.endDate);
              const today = new Date();
              return endDate < today && p.status !== 'Finalizado' && p.status !== 'Cancelado';
            }).length
          },
          chartData: [
            { name: 'Jan', projetos: 12, finalizados: 8 },
            { name: 'Fev', projetos: 15, finalizados: 12 },
            { name: 'Mar', projetos: 18, finalizados: 14 },
            { name: 'Abr', projetos: 22, finalizados: 16 },
            { name: 'Mai', projetos: 25, finalizados: 19 },
            { name: 'Jun', projetos: 28, finalizados: 22 }
          ]
        };
      
      case 'team':
        return {
          title: 'Análise de Equipe',
          insights: [
            { type: 'Tendência Positiva', description: 'Produtividade da equipe aumentou 12% com melhor distribuição de tarefas.' },
            { type: 'Área de Atenção', description: 'Sobrecarga em 3 membros principais - considerar redistribuição.' },
            { type: 'Oportunidade', description: 'Membros com menor carga podem assumir mais responsabilidades.' }
          ],
          metrics: {
            totalMembers: [...new Set(activeProjects.flatMap(p => p.team))].length,
            activeMembers: [...new Set(activeProjects.filter(p => p.status === 'Em andamento').flatMap(p => p.team))].length,
            avgProjectsPerMember: Math.round(activeProjects.length / [...new Set(activeProjects.flatMap(p => p.team))].length),
            efficiency: 87
          },
          chartData: [
            { name: 'João Silva', projetos: 5, concluidas: 23 },
            { name: 'Maria Santos', projetos: 3, concluidas: 18 },
            { name: 'Pedro Lima', projetos: 4, concluidas: 15 },
            { name: 'Ana Costa', projetos: 2, concluidas: 12 }
          ]
        };

      case 'time':
        return {
          title: 'Análise de Tempo',
          insights: [
            { type: 'Tendência Positiva', description: '78% dos projetos estão sendo entregues dentro do prazo estabelecido.' },
            { type: 'Área de Atenção', description: 'Projetos de grande porte apresentam 25% mais atraso que a média.' },
            { type: 'Oportunidade', description: 'Implementar marcos intermediários pode reduzir riscos de atraso em 40%.' }
          ],
          metrics: {
            onTime: projects.filter(p => {
              const endDate = new Date(p.endDate);
              const today = new Date();
              return p.status === 'Finalizado' && endDate >= today;
            }).length,
            delayed: projects.filter(p => {
              const endDate = new Date(p.endDate);
              const today = new Date();
              return endDate < today && p.status !== 'Finalizado' && p.status !== 'Cancelado';
            }).length,
            avgDuration: 45,
            efficiency: 78
          },
          chartData: [
            { name: 'Semana 1', planejado: 20, realizado: 18 },
            { name: 'Semana 2', planejado: 25, realizado: 28 },
            { name: 'Semana 3', planejado: 30, realizado: 25 },
            { name: 'Semana 4', planejado: 35, realizado: 32 }
          ]
        };

      case 'quality':
        return {
          title: 'Análise de Qualidade',
          insights: [
            { type: 'Tendência Positiva', description: 'Taxa de retrabalho diminuiu 18% com implementação de revisões.' },
            { type: 'Área de Atenção', description: 'Projetos com prazo apertado apresentam 30% mais problemas de qualidade.' },
            { type: 'Oportunidade', description: 'Padronização de processos pode elevar qualidade geral em 25%.' }
          ],
          metrics: {
            qualityScore: 8.5,
            reworkRate: 12,
            clientSatisfaction: 92,
            defectRate: 3.2
          },
          chartData: [
            { name: 'Excelente', value: 45, color: '#22c55e' },
            { name: 'Bom', value: 35, color: '#3b82f6' },
            { name: 'Regular', value: 15, color: '#f59e0b' },
            { name: 'Ruim', value: 5, color: '#ef4444' }
          ]
        };

      case 'financial':
        return {
          title: 'Análise Financeira',
          insights: [
            { type: 'Tendência Positiva', description: 'Receita cresceu 22% comparado ao mesmo período do ano anterior.' },
            { type: 'Área de Atenção', description: 'Margem de lucro diminuiu 5% devido ao aumento de custos operacionais.' },
            { type: 'Oportunidade', description: 'Otimização de processos pode aumentar margem em até 15%.' }
          ],
          metrics: {
            totalRevenue: activeProjects.reduce((sum, p) => sum + (p.finalValue || p.initialValue), 0),
            profit: 125000,
            profitMargin: 28,
            roi: 185
          },
          chartData: [
            { name: 'Jan', receita: 85000, lucro: 24000 },
            { name: 'Fev', receita: 92000, lucro: 27000 },
            { name: 'Mar', receita: 88000, lucro: 25000 },
            { name: 'Abr', receita: 95000, lucro: 29000 },
            { name: 'Mai', receita: 102000, lucro: 32000 },
            { name: 'Jun', receita: 108000, lucro: 35000 }
          ]
        };

      case 'risks':
        return {
          title: 'Análise de Riscos',
          insights: [
            { type: 'Tendência Positiva', description: '65% dos riscos identificados foram mitigados com sucesso.' },
            { type: 'Área de Atenção', description: 'Riscos técnicos representam 40% dos problemas em projetos ativos.' },
            { type: 'Oportunidade', description: 'Implementar análise preditiva pode reduzir riscos em 35%.' }
          ],
          metrics: {
            totalRisks: activeProjects.reduce((sum, p) => sum + p.risks.length, 0),
            highRisks: activeProjects.reduce((sum, p) => sum + p.risks.filter(r => r.impact === 'alto').length, 0),
            mitigatedRisks: activeProjects.reduce((sum, p) => sum + p.risks.filter(r => r.status === 'mitigado').length, 0),
            riskScore: 3.2
          },
          chartData: [
            { name: 'Baixo', quantidade: 15, color: '#22c55e' },
            { name: 'Médio', quantidade: 8, color: '#f59e0b' },
            { name: 'Alto', quantidade: 3, color: '#ef4444' }
          ]
        };

      default:
        return {
          title: 'Análise Detalhada',
          insights: [],
          metrics: {},
          chartData: []
        };
    }
  }, [category, projects]);

  const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => navigate('/analytics')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Analytics
        </Button>
        <h1 className="text-2xl font-bold">{data.title}</h1>
      </div>

      {/* Insights e Recomendações */}
      <Card>
        <CardHeader>
          <CardTitle>Insights e Recomendações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.insights.map((insight, index) => (
            <div key={index} className={`p-4 rounded-lg border-l-4 ${
              insight.type === 'Tendência Positiva' ? 'bg-blue-50 border-blue-500' :
              insight.type === 'Área de Atenção' ? 'bg-yellow-50 border-yellow-500' :
              'bg-green-50 border-green-500'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {insight.type === 'Tendência Positiva' && <TrendingUp className="w-5 h-5 text-blue-600" />}
                {insight.type === 'Área de Atenção' && <AlertTriangle className="w-5 h-5 text-yellow-600" />}
                {insight.type === 'Oportunidade' && <CheckCircle className="w-5 h-5 text-green-600" />}
                <span className="font-semibold">{insight.type}</span>
              </div>
              <p className="text-gray-700">{insight.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(data.metrics).map(([key, value], index) => (
          <Card key={key}>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{value}</div>
              <div className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráficos Específicos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tendência Temporal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              {category === 'quality' || category === 'risks' ? (
                <PieChart>
                  <Pie
                    data={data.chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              ) : (
                <LineChart data={data.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey={Object.keys(data.chartData[0] || {}).find(k => k !== 'name')} stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comparativo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                {Object.keys(data.chartData[0] || {}).filter(k => k !== 'name' && k !== 'color').map((key, index) => (
                  <Bar key={key} dataKey={key} fill={COLORS[index % COLORS.length]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
