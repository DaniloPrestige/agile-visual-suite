import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Download, FileText } from "lucide-react";
import { useProjects } from "../hooks/useProjects";
import { Project, Risk, Task } from "../types/project";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, toggleTask, addTask, addComment, addRisk, updateRisk } = useProjects();
  
  const [project, setProject] = useState<Project | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newRisk, setNewRisk] = useState({
    name: '',
    impact: 'médio' as Risk['impact'],
    probability: 'média' as Risk['probability'],
    contingencyPlan: '',
    status: 'ativo' as Risk['status']
  });
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'média' as Task['priority'],
    status: 'pendente' as Task['status'],
    assignee: '',
    dueDate: ''
  });

  useEffect(() => {
    const currentProject = projects.find(p => p.id === id);
    setProject(currentProject || null);
  }, [projects, id]);

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Projeto não encontrado.</p>
        <Button onClick={() => navigate('/projects')} className="mt-4">
          Voltar para Projetos
        </Button>
      </div>
    );
  }

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'Em andamento':
        return 'bg-blue-100 text-blue-800';
      case 'Finalizado':
        return 'bg-green-100 text-green-800';
      case 'Atrasado':
        return 'bg-red-100 text-red-800';
      case 'Cancelado':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (impact: Risk['impact'], probability: Risk['probability']) => {
    const level = (impact === 'alto' || probability === 'alta') ? 'alto' : 
                  (impact === 'médio' || probability === 'média') ? 'médio' : 'baixo';
    
    switch (level) {
      case 'alto':
        return 'bg-red-100 text-red-800';
      case 'médio':
        return 'bg-yellow-100 text-yellow-800';
      case 'baixo':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddTask = () => {
    if (newTask.title.trim()) {
      addTask(project.id, {
        title: newTask.title.trim(),
        description: newTask.description.trim() || undefined,
        priority: newTask.priority,
        status: newTask.status,
        assignee: newTask.assignee.trim() || undefined,
        dueDate: newTask.dueDate || undefined
      });
      setNewTask({
        title: '',
        description: '',
        priority: 'média',
        status: 'pendente',
        assignee: '',
        dueDate: ''
      });
    }
  };

  const isTaskOverdue = (task: Task) => {
    if (!task.dueDate || task.completed) return false;
    return new Date(task.dueDate) < new Date();
  };

  const getTaskPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'alta':
        return 'bg-red-100 text-red-800';
      case 'média':
        return 'bg-yellow-100 text-yellow-800';
      case 'baixa':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTaskStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'concluída':
        return 'bg-green-100 text-green-800';
      case 'em andamento':
        return 'bg-blue-100 text-blue-800';
      case 'pendente':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      addComment(project.id, newComment.trim());
      setNewComment('');
    }
  };

  const handleAddRisk = () => {
    if (newRisk.name.trim()) {
      addRisk(project.id, newRisk);
      setNewRisk({
        name: '',
        impact: 'médio',
        probability: 'média',
        contingencyPlan: '',
        status: 'ativo'
      });
    }
  };

  const handleRiskStatusChange = (riskId: string, status: Risk['status']) => {
    updateRisk(project.id, riskId, { status });
  };

  const generateReport = () => {
    // TODO: Implement PDF export functionality
    console.log('Gerando relatório:', project);
    alert('Funcionalidade de relatório será implementada em breve');
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/projects')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-3xl font-bold flex-1">{project.name}</h1>
        <Button onClick={generateReport} className="gap-2">
          <FileText className="w-4 h-4" />
          Gerar Relatório
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-semibold">{project.name}</h2>
              <p className="text-muted-foreground">Cliente: {project.client}</p>
            </div>
            <Badge className={getStatusColor(project.status)}>
              {project.status}
            </Badge>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progresso Geral</span>
                <span>{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-3" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="tasks">Tarefas</TabsTrigger>
          <TabsTrigger value="files">Arquivos</TabsTrigger>
          <TabsTrigger value="comments">Comentários</TabsTrigger>
          <TabsTrigger value="risks">Riscos</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Projeto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="font-medium">Descrição:</span>
                  <p className="text-muted-foreground mt-1">{project.description}</p>
                </div>
                <div>
                  <span className="font-medium">Data de Início:</span>
                  <p className="text-muted-foreground">{format(new Date(project.startDate), 'dd/MM/yyyy', { locale: ptBR })}</p>
                </div>
                <div>
                  <span className="font-medium">Data de Fim:</span>
                  <p className="text-muted-foreground">{format(new Date(project.endDate), 'dd/MM/yyyy', { locale: ptBR })}</p>
                </div>
                {project.team.length > 0 && (
                  <div>
                    <span className="font-medium">Equipe:</span>
                    <p className="text-muted-foreground">{project.team.join(', ')}</p>
                  </div>
                )}
                {project.tags.length > 0 && (
                  <div>
                    <span className="font-medium">Tags:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {project.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">#{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Total de Tarefas:</span>
                  <span className="font-medium">{project.tasks.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tarefas Concluídas:</span>
                  <span className="font-medium">{project.tasks.filter(t => t.completed).length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Comentários:</span>
                  <span className="font-medium">{project.comments.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Riscos Ativos:</span>
                  <span className="font-medium">{project.risks.filter(r => r.status === 'ativo').length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Arquivos:</span>
                  <span className="font-medium">{project.files.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Nova Tarefa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Título da Tarefa*</Label>
                  <Input
                    placeholder="Digite o título da tarefa..."
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Responsável</Label>
                  <Input
                    placeholder="Nome do responsável..."
                    value={newTask.assignee}
                    onChange={(e) => setNewTask({...newTask, assignee: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label>Descrição</Label>
                <Textarea
                  placeholder="Descrição da tarefa (opcional)..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Prioridade</Label>
                  <Select value={newTask.priority} onValueChange={(value: Task['priority']) => setNewTask({...newTask, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="média">Média</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={newTask.status} onValueChange={(value: Task['status']) => setNewTask({...newTask, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="em andamento">Em Andamento</SelectItem>
                      <SelectItem value="concluída">Concluída</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Data de Vencimento</Label>
                  <Input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                  />
                </div>
              </div>

              <Button onClick={handleAddTask} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Tarefa
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tarefas ({project.tasks.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {project.tasks.length === 0 ? (
                <p className="text-muted-foreground">Nenhuma tarefa adicionada ainda.</p>
              ) : (
                <div className="space-y-3">
                  {project.tasks.map((task) => (
                    <div key={task.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={task.completed}
                            onCheckedChange={() => toggleTask(project.id, task.id)}
                          />
                          <div>
                            <h4 className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {task.title}
                            </h4>
                            {task.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {task.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getTaskPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                          <Badge className={getTaskStatusColor(task.status)}>
                            {task.status}
                          </Badge>
                          {isTaskOverdue(task) && (
                            <Badge variant="destructive">
                              Atrasada
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-sm text-muted-foreground space-y-1">
                        {task.assignee && (
                          <div>Responsável: {task.assignee}</div>
                        )}
                        {task.dueDate && (
                          <div>Vencimento: {format(new Date(task.dueDate), 'dd/MM/yyyy', { locale: ptBR })}</div>
                        )}
                        <div>Criada em: {formatDate(task.createdAt)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Arquivos do Projeto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                <div className="space-y-2">
                  <Download className="w-8 h-8 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Funcionalidade de upload será implementada
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Formatos aceitos: PDF, DOCX, XLSX, CSV, TXT, PNG, JPG, JPEG, SVG
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Comentário</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Textarea
                  placeholder="Escreva seu comentário..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <Button onClick={handleAddComment} className="w-full">
                  Adicionar Comentário
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comentários ({project.comments.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {project.comments.length === 0 ? (
                <p className="text-muted-foreground">Nenhum comentário ainda.</p>
              ) : (
                <div className="space-y-4">
                  {project.comments.map((comment) => (
                    <div key={comment.id} className="border-l-4 border-primary pl-4">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium">{comment.author}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{comment.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Novo Risco</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nome do Risco</Label>
                  <Input
                    value={newRisk.name}
                    onChange={(e) => setNewRisk({...newRisk, name: e.target.value})}
                    placeholder="Ex: Atraso na entrega"
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={newRisk.status} onValueChange={(value: Risk['status']) => setNewRisk({...newRisk, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="mitigado">Mitigado</SelectItem>
                      <SelectItem value="encerrado">Encerrado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Impacto</Label>
                  <Select value={newRisk.impact} onValueChange={(value: Risk['impact']) => setNewRisk({...newRisk, impact: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixo">Baixo</SelectItem>
                      <SelectItem value="médio">Médio</SelectItem>
                      <SelectItem value="alto">Alto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Probabilidade</Label>
                  <Select value={newRisk.probability} onValueChange={(value: Risk['probability']) => setNewRisk({...newRisk, probability: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="média">Média</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Plano de Contingência</Label>
                <Textarea
                  value={newRisk.contingencyPlan}
                  onChange={(e) => setNewRisk({...newRisk, contingencyPlan: e.target.value})}
                  placeholder="Descreva as ações para mitigar este risco..."
                />
              </div>

              <Button onClick={handleAddRisk} className="w-full">
                Adicionar Risco
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Riscos Identificados ({project.risks.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {project.risks.length === 0 ? (
                <p className="text-muted-foreground">Nenhum risco identificado ainda.</p>
              ) : (
                <div className="space-y-4">
                  {project.risks.map((risk) => (
                    <div key={risk.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{risk.name}</h4>
                        <div className="flex gap-2">
                          <Badge className={getRiskColor(risk.impact, risk.probability)}>
                            Impacto: {risk.impact} | Probabilidade: {risk.probability}
                          </Badge>
                          <Select value={risk.status} onValueChange={(value: Risk['status']) => handleRiskStatusChange(risk.id, value)}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ativo">Ativo</SelectItem>
                              <SelectItem value="mitigado">Mitigado</SelectItem>
                              <SelectItem value="encerrado">Encerrado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Plano de Contingência:</strong> {risk.contingencyPlan}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Criado em: {formatDate(risk.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Alterações</CardTitle>
            </CardHeader>
            <CardContent>
              {project.history.length === 0 ? (
                <p className="text-muted-foreground">Nenhuma alteração registrada.</p>
              ) : (
                <div className="space-y-3">
                  {project.history.map((entry) => (
                    <div key={entry.id} className="border-l-2 border-muted pl-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{entry.action}</p>
                          <p className="text-sm text-muted-foreground">{entry.details}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(entry.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
