
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, DollarSign, TrendingUp, Target, Award, Clock, BarChart3 } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useProjects } from "../hooks/useProjects";
import { currencyService } from "../services/currencyService";
import { useMemo } from 'react';

export function AnalyticsDetails() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const { projects } = useProjects();

  const analytics = useMemo(() => {
    const activeProjects = projects.filter(p => p.status !== 'Excluído');
    const totalRevenue = activeProjects.reduce((sum, p) => sum + (p.finalValue || p.initialValue || 0), 0);
    const completedRevenue = projects.filter(p => p.status === 'Finalizado').reduce((sum, p) => sum + (p.finalValue || p.initialValue || 0), 0);
    const budgetVariation = activeProjects.reduce((sum, p) => {
      const initial = p.initialValue || 0;
      const final = p.finalValue || 0;
      return sum + (final - initial);
    }, 0);

    return {
      totalRevenue,
      completedRevenue,
      budgetVariation,
      activeProjects: activeProjects.length,
      completedProjects: projects.filter(p => p.status === 'Finalizado').length
    };
  }, [projects]);

  const getPageContent = () => {
    switch (category) {
      case 'visao-geral':
        return {
          title: 'Visão Geral Financeira',
          icon: <DollarSign className="h-6 w-6 text-green-600" />,
          cards: [
            {
              title: 'Receita Total',
              value: currencyService.formatCurrency(analytics.totalRevenue, 'BRL'),
              description: 'Soma de todos os valores dos projetos ativos',
              color: 'text-green-600'
            },
            {
              title: 'Receita Realizada',
              value: currencyService.formatCurrency(analytics.completedRevenue, 'BRL'),
              description: 'Receita de projetos finalizados',
              color: 'text-blue-600'
            },
            {
              title: 'Margem de Lucro Estimada',
              value: '28%',
              description: 'Baseada na receita total',
              color: 'text-purple-600'
            },
            {
              title: 'Ticket Médio',
              value: currencyService.formatCurrency(analytics.totalRevenue / Math.max(analytics.activeProjects, 1), 'BRL'),
              description: 'Valor médio por projeto',
              color: 'text-orange-600'
            }
          ],
          charts: [
            {
              title: 'Evolução da Receita por Trimestre',
              data: [
                { periodo: 'Q1', receita: analytics.completedRevenue * 0.2 },
                { periodo: 'Q2', receita: analytics.completedRevenue * 0.3 },
                { periodo: 'Q3', receita: analytics.completedRevenue * 0.25 },
                { periodo: 'Q4', receita: analytics.completedRevenue * 0.25 }
              ]
            }
          ]
        };

      case 'performance':
        return {
          title: 'Análise de Performance',
          icon: <BarChart3 className="h-6 w-6 text-blue-600" />,
          cards: [
            {
              title: 'Orçamento Planejado',
              value: currencyService.formatCurrency(analytics.totalRevenue * 0.6, 'BRL'),
              description: '60% da receita total estimada',
              color: 'text-blue-600'
            },
            {
              title: 'Performance vs Meta',
              value: '+15%',
              description: 'Acima do planejado',
              color: 'text-green-600'
            },
            {
              title: 'Eficiência Operacional',
              value: '87%',
              description: 'Projetos entregues no prazo',
              color: 'text-purple-600'
            },
            {
              title: 'Utilização de Recursos',
              value: '92%',
              description: 'Capacidade utilizada',
              color: 'text-orange-600'
            }
          ]
        };

      case 'financeiro':
        return {
          title: 'Análise Financeira Detalhada',
          icon: <TrendingUp className="h-6 w-6 text-red-600" />,
          cards: [
            {
              title: 'Variação Orçamentária',
              value: analytics.budgetVariation >= 0 ? `+${currencyService.formatCurrency(analytics.budgetVariation, 'BRL')}` : currencyService.formatCurrency(analytics.budgetVariation, 'BRL'),
              description: 'Diferença entre valor inicial e final',
              color: analytics.budgetVariation >= 0 ? 'text-green-600' : 'text-red-600'
            },
            {
              title: 'Custo Médio por Projeto',
              value: currencyService.formatCurrency(analytics.totalRevenue * 0.7 / Math.max(analytics.activeProjects, 1), 'BRL'),
              description: 'Estimativa de custos',
              color: 'text-blue-600'
            },
            {
              title: 'Margem Bruta',
              value: '30%',
              description: 'Margem estimada',
              color: 'text-purple-600'
            },
            {
              title: 'Break-even Point',
              value: '70%',
              description: 'Do valor do projeto',
              color: 'text-orange-600'
            }
          ]
        };

      case 'qualidade':
        return {
          title: 'Métricas de Qualidade',
          icon: <Award className="h-6 w-6 text-purple-600" />,
          cards: [
            {
              title: 'Taxa de Entrega no Prazo',
              value: '95%',
              description: 'Projetos entregues pontualmente',
              color: 'text-green-600'
            },
            {
              title: 'Satisfação do Cliente',
              value: '4.8/5',
              description: 'Avaliação média',
              color: 'text-blue-600'
            },
            {
              title: 'Taxa de Retrabalho',
              value: '5%',
              description: 'Projetos que precisaram revisão',
              color: 'text-orange-600'
            },
            {
              title: 'NPS (Net Promoter Score)',
              value: '85',
              description: 'Índice de recomendação',
              color: 'text-purple-600'
            }
          ]
        };

      case 'estrategico':
        return {
          title: 'Indicadores Estratégicos',
          icon: <Clock className="h-6 w-6 text-yellow-600" />,
          cards: [
            {
              title: 'Crescimento Anual',
              value: '+35%',
              description: 'Comparado ao ano anterior',
              color: 'text-green-600'
            },
            {
              title: 'Market Share',
              value: '12%',
              description: 'Participação no mercado',
              color: 'text-blue-600'
            },
            {
              title: 'Retenção de Clientes',
              value: '88%',
              description: 'Clientes que retornam',
              color: 'text-purple-600'
            },
            {
              title: 'Time to Market',
              value: '3.2 meses',
              description: 'Tempo médio de entrega',
              color: 'text-orange-600'
            }
          ]
        };

      default:
        return {
          title: 'Análise Detalhada',
          icon: <BarChart3 className="h-6 w-6" />,
          cards: [],
          charts: []
        };
    }
  };

  const content = getPageContent();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/analytics')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Analytics
        </Button>
        <div className="flex items-center gap-3">
          {content.icon}
          <h1 className="text-3xl font-bold">{content.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {content.cards.map((card, index) => (
          <Card key={index} className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-700">
                {card.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${card.color}`}>
                {card.value}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {content.charts && content.charts.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {content.charts.map((chart, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{chart.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chart.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="periodo" />
                    <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value) => [currencyService.formatCurrency(Number(value), 'BRL'), 'Receita']} />
                    <Bar dataKey="receita" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Insights e Recomendações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900">📈 Tendência Positiva</h4>
              <p className="text-blue-800 text-sm mt-1">
                Os indicadores mostram crescimento consistente nos últimos meses.
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-yellow-900">⚠️ Área de Atenção</h4>
              <p className="text-yellow-800 text-sm mt-1">
                Monitorar de perto os prazos de entrega para manter a qualidade.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900">✅ Oportunidade</h4>
              <p className="text-green-800 text-sm mt-1">
                Potencial para expansão baseado no desempenho atual.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
