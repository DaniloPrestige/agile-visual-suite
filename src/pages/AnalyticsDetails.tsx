
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
            { type: 'Tendência Positiva', description: `Você tem ${activeProjects.length} projetos cadastrados no sistema.` },
            { type: 'Área de Atenção', description: `${projects.filter(p => p.status === 'Em andamento').length} projetos estão em andamento e precisam de acompanhamento.` },
            { type: 'Oportunidade', description: `${projects.filter(p => p.status === 'Finalizado').length} projetos foram finalizados com sucesso.` }
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
          chartData: activeProjects.map((project, index) => ({
            name: project.name.length > 10 ? project.name.substring(0, 10) + '...' : project.name,
            progresso: project.progress,
            valor: project.finalValue || project.initialValue
          }))
        };
      
      case 'team':
        const allTeamMembers = [...new Set(activeProjects.flatMap(p => p.team))];
        return {
          title: 'Análise de Equipe',
          insights: [
            { type: 'Tendência Positiva', description: `${allTeamMembers.length} pessoas estão envolvidas nos projetos ativos.` },
            { type: 'Área de Atenção', description: 'Distribuição de carga de trabalho entre os membros da equipe.' },
            { type: 'Oportunidade', description: 'Identificar membros com mais experiência para mentoria.' }
          ],
          metrics: {
            totalMembers: allTeamMembers.length,
            activeMembers: [...new Set(activeProjects.filter(p => p.status === 'Em andamento').flatMap(p => p.team))].length,
            avgProjectsPerMember: allTeamMembers.length > 0 ? Math.round(activeProjects.length / allTeamMembers.length) : 0,
            efficiency: 87
          },
          chartData: allTeamMembers.map(member => ({
            name: member,
            projetos: activeProjects.filter(p => p.team.includes(member)).length,
            concluidos: projects.filter(p => p.team.includes(member) && p.status === 'Finalizado').length
          }))
        };

      case 'time':
        const onTimeProjects = projects.filter(p => {
          const endDate = new Date(p.endDate);
          const today = new Date();
          return p.status === 'Finalizado';
        }).length;
        
        return {
          title: 'Análise de Tempo',
          insights: [
            { type: 'Tendência Positiva', description: `${onTimeProjects} projetos foram finalizados.` },
            { type: 'Área de Atenção', description: 'Monitoramento de prazos é essencial para o sucesso dos projetos.' },
            { type: 'Oportunidade', description: 'Implementar marcos intermediários pode melhorar o controle de prazos.' }
          ],
          metrics: {
            onTime: onTimeProjects,
            delayed: projects.filter(p => {
              const endDate = new Date(p.endDate);
              const today = new Date();
              return endDate < today && p.status !== 'Finalizado' && p.status !== 'Cancelado';
            }).length,
            avgDuration: 45,
            efficiency: onTimeProjects > 0 ? Math.round((onTimeProjects / projects.length) * 100) : 0
          },
          chartData: activeProjects.map((project, index) => ({
            name: project.name.length > 8 ? project.name.substring(0, 8) + '...' : project.name,
            diasRestantes: Math.max(0, Math.ceil((new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))),
            progresso: project.progress
          }))
        };

      case 'quality':
        return {
          title: 'Análise de Qualidade',
          insights: [
            { type: 'Tendência Positiva', description: `Taxa de projetos finalizados: ${projects.filter(p => p.status === 'Finalizado').length}/${projects.length}` },
            { type: 'Área de Atenção', description: 'Monitoramento contínuo da qualidade dos entregáveis.' },
            { type: 'Oportunidade', description: 'Padronização de processos pode elevar qualidade geral.' }
          ],
          metrics: {
            qualityScore: 8.5,
            reworkRate: 12,
            clientSatisfaction: 92,
            defectRate: 3.2
          },
          chartData: [
            { name: 'Finalizado', value: projects.filter(p => p.status === 'Finalizado').length, color: '#22c55e' },
            { name: 'Em Andamento', value: projects.filter(p => p.status === 'Em andamento').length, color: '#3b82f6' },
            { name: 'Atrasado', value: projects.filter(p => {
              const endDate = new Date(p.endDate);
              const today = new Date();
              return endDate < today && p.status !== 'Finalizado';
            }).length, color: '#f59e0b' },
            { name: 'Cancelado', value: projects.filter(p => p.status === 'Cancelado').length, color: '#ef4444' }
          ]
        };

      case 'financial':
        const totalRevenue = activeProjects.reduce((sum, p) => sum + (p.finalValue || p.initialValue), 0);
        return {
          title: 'Análise Financeira',
          insights: [
            { type: 'Tendência Positiva', description: `Receita total dos projetos ativos: R$ ${totalRevenue.toLocaleString('pt-BR')}` },
            { type: 'Área de Atenção', description: 'Controle de custos operacionais é fundamental para rentabilidade.' },
            { type: 'Oportunidade', description: 'Otimização de processos pode aumentar margem de lucro.' }
          ],
          metrics: {
            totalRevenue: totalRevenue,
            profit: Math.round(totalRevenue * 0.25),
            profitMargin: 25,
            roi: 185
          },
          chartData: activeProjects.map(project => ({
            name: project.name.length > 10 ? project.name.substring(0, 10) + '...' : project.name,
            receita: project.finalValue || project.initialValue,
            lucro: Math.round((project.finalValue || project.initialValue) * 0.25)
          }))
        };

      case 'risks':
        const totalRisks = activeProjects.reduce((sum, p) => sum + p.risks.length, 0);
        return {
          title: 'Análise de Riscos',
          insights: [
            { type: 'Tendência Positiva', description: `${totalRisks} riscos identificados nos projetos ativos.` },
            { type: 'Área de Atenção', description: 'Monitoramento contínuo de riscos é essencial.' },
            { type: 'Oportunidade', description: 'Implementar análise preditiva pode reduzir riscos futuros.' }
          ],
          metrics: {
            totalRisks: totalRisks,
            highRisks: activeProjects.reduce((sum, p) => sum + p.risks.filter(r => r.impact === 'alto').length, 0),
            mitigatedRisks: activeProjects.reduce((sum, p) => sum + p.risks.filter(r => r.status === 'mitigado').length, 0),
            riskScore: totalRisks > 0 ? 3.2 : 0
          },
          chartData: [
            { name: 'Baixo', quantidade: activeProjects.reduce((sum, p) => sum + p.risks.filter(r => r.impact === 'baixo').length, 0), color: '#22c55e' },
            { name: 'Médio', quantidade: activeProjects.reduce((sum, p) => sum + p.risks.filter(r => r.impact === 'médio').length, 0), color: '#f59e0b' },
            { name: 'Alto', quantidade: activeProjects.reduce((sum, p) => sum + p.risks.filter(r => r.impact === 'alto').length, 0), color: '#ef4444' }
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
              <div className="text-2xl font-bold text-blue-600">{typeof value === 'number' && key.includes('Revenue') ? `R$ ${value.toLocaleString('pt-BR')}` : value}</div>
              <div className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráficos Específicos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Análise Principal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              {category === 'quality' || category === 'risks' ? (
                <div className="space-y-4">
                  <PieChart width="100%" height={250}>
                    <Pie
                      data={data.chartData}
                      cx="50%"
                      cy="45%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey={category === 'quality' ? 'value' : 'quantidade'}
                    >
                      {data.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                  <div className="flex flex-wrap justify-center gap-4 text-sm">
                    {data.chartData.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: entry.color || COLORS[index % COLORS.length] }}
                        />
                        <span>{entry.name}: {entry.value || entry.quantidade}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <BarChart data={data.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey={Object.keys(data.chartData[0] || {}).find(k => k !== 'name')} fill="#3b82f6" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comparativo Detalhado</CardTitle>
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
