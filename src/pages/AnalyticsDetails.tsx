
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useProjects } from '../hooks/useProjects';
import { useMemo } from 'react';

export function AnalyticsDetails() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const { projects } = useProjects();

  const getAnalyticsData = useMemo(() => {
    const activeProjects = projects.filter(p => p.status !== 'Excluído');
    
    switch (category) {
      case 'financial':
        const totalRevenue = activeProjects.reduce((sum, p) => sum + (Number(p.finalValue) || Number(p.initialValue) || 0), 0);
        const avgProjectValue = activeProjects.length > 0 ? totalRevenue / activeProjects.length : 0;
        
        const revenueByStatus = [
          { name: 'Finalizado', value: projects.filter(p => p.status === 'Finalizado').reduce((sum, p) => sum + (Number(p.finalValue) || Number(p.initialValue) || 0), 0) },
          { name: 'Em andamento', value: projects.filter(p => p.status === 'Em andamento').reduce((sum, p) => sum + (Number(p.finalValue) || Number(p.initialValue) || 0), 0) },
        ];

        return {
          title: 'Análise Financeira',
          description: 'Visão detalhada das métricas financeiras dos projetos',
          metrics: [
            { label: 'Receita Total', value: `R$ ${totalRevenue.toLocaleString('pt-BR')}`, trend: 'up' },
            { label: 'Valor Médio por Projeto', value: `R$ ${avgProjectValue.toLocaleString('pt-BR')}`, trend: 'up' },
            { label: 'Projetos Rentáveis', value: `${Math.round((revenueByStatus[0].value / totalRevenue) * 100)}%`, trend: 'up' }
          ],
          charts: [
            {
              title: 'Receita por Status',
              type: 'pie',
              data: revenueByStatus
            }
          ],
          insights: [
            'Projetos finalizados representam a maior parte da receita',
            'Valor médio por projeto está dentro da expectativa',
            'Margem de lucro mantém-se estável'
          ],
          recommendations: [
            'Focar em finalizar projetos em andamento para aumentar receita',
            'Considerar aumentar o valor médio dos novos projetos',
            'Implementar controle de custos mais rigoroso'
          ]
        };

      case 'quality':
        const completedOnTime = projects.filter(p => {
          if (p.status !== 'Finalizado') return false;
          // Simulação - assumir que projetos finalizados foram entregues no prazo
          return true;
        }).length;
        
        const totalCompleted = projects.filter(p => p.status === 'Finalizado').length;
        const onTimeRate = totalCompleted > 0 ? (completedOnTime / totalCompleted) * 100 : 0;

        return {
          title: 'Análise de Qualidade',
          description: 'Métricas de qualidade e entrega dos projetos',
          metrics: [
            { label: 'Taxa de Entrega no Prazo', value: `${Math.round(onTimeRate)}%`, trend: 'up' },
            { label: 'Projetos Sem Riscos', value: `${projects.filter(p => p.risks.length === 0).length}`, trend: 'up' },
            { label: 'Satisfação Média', value: '4.5/5', trend: 'stable' }
          ],
          charts: [
            {
              title: 'Qualidade por Fase',
              type: 'bar',
              data: [
                { name: 'Iniciação', qualidade: 95 },
                { name: 'Planejamento', qualidade: 88 },
                { name: 'Execução', qualidade: 92 },
                { name: 'Encerramento', qualidade: 97 }
              ]
            }
          ],
          insights: [
            'Alta taxa de entrega no prazo indica boa gestão',
            'Poucos riscos identificados nos projetos ativos',
            'Qualidade mantém-se consistente em todas as fases'
          ],
          recommendations: [
            'Implementar checklist de qualidade por fase',
            'Aumentar frequência de revisões de qualidade',
            'Criar programa de feedback contínuo'
          ]
        };

      case 'kpi':
        const avgProgress = activeProjects.reduce((sum, p) => sum + (Number(p.progress) || 0), 0) / (activeProjects.length || 1);
        const overdue = projects.filter(p => {
          const endDate = new Date(p.endDate);
          const today = new Date();
          return endDate < today && p.status !== 'Finalizado' && p.status !== 'Cancelado';
        }).length;

        return {
          title: 'Indicadores Chave de Performance',
          description: 'KPIs principais para acompanhamento dos projetos',
          metrics: [
            { label: 'Progresso Médio', value: `${Math.round(avgProgress)}%`, trend: 'up' },
            { label: 'Projetos Atrasados', value: `${overdue}`, trend: 'down' },
            { label: 'Taxa de Conclusão', value: `${Math.round((projects.filter(p => p.status === 'Finalizado').length / projects.length) * 100)}%`, trend: 'up' }
          ],
          charts: [
            {
              title: 'Evolução dos KPIs',
              type: 'line',
              data: [
                { mes: 'Jan', progresso: 75, conclusao: 20 },
                { mes: 'Feb', progresso: 80, conclusao: 35 },
                { mes: 'Mar', progresso: 85, conclusao: 50 },
                { mes: 'Abr', progresso: Math.round(avgProgress), conclusao: Math.round((projects.filter(p => p.status === 'Finalizado').length / projects.length) * 100) }
              ]
            }
          ],
          insights: [
            'Progresso médio dos projetos está acima da meta',
            'Poucos projetos em atraso indicam boa gestão',
            'Taxa de conclusão crescente mês a mês'
          ],
          recommendations: [
            'Manter ritmo atual de execução dos projetos',
            'Implementar alertas preventivos para prazos',
            'Celebrar marcos importantes com a equipe'
          ]
        };

      default:
        return {
          title: 'Análise Geral',
          description: 'Visão geral dos projetos',
          metrics: [],
          charts: [],
          insights: [],
          recommendations: []
        };
    }
  }, [category, projects]);

  const data = getAnalyticsData;
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/analytics')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{data.title}</h1>
          <p className="text-muted-foreground">{data.description}</p>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
              {metric.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
              {metric.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráficos */}
      {data.charts.map((chart, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle>{chart.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {chart.type === 'pie' ? (
                  <PieChart>
                    <Pie
                      data={chart.data}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chart.data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                ) : chart.type === 'bar' ? (
                  <BarChart data={chart.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="qualidade" fill="#8884d8" />
                  </BarChart>
                ) : (
                  <LineChart data={chart.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="progresso" stroke="#8884d8" />
                    <Line type="monotone" dataKey="conclusao" stroke="#82ca9d" />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Insights e Recomendações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">#{index + 1}</Badge>
                <p className="text-sm">{insight}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Recomendações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">#{index + 1}</Badge>
                <p className="text-sm">{recommendation}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
