
import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Calendar, Users, Tag, FileText, MessageSquare, AlertTriangle, Clock, Plus, Upload, Download, Edit, CheckCircle, Trash2, X } from "lucide-react";
import { useProjects } from "../hooks/useProjects";
import { ProjectForm } from "../components/ProjectForm";
import { PDFExportService } from "../services/pdfExportService";
import { Project, Task, Risk } from "../types/project";

export function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, updateProject, addTask, updateTask, toggleTask, addComment, addRisk, updateRisk } = useProjects();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'baixa' | 'média' | 'alta'>('média');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newRisk, setNewRisk] = useState({
    name: '',
    impact: 'médio' as 'baixo' | 'médio' | 'alto',
    probability: 'média' as 'baixa' | 'média' | 'alta',
    contingencyPlan: ''
  });
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showRiskForm, setShowRiskForm] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type: 'complete' | 'delete', projectId: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const project = projects.find(p => p.id === id);

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Projeto não encontrado</h2>
          <Button onClick={() => navigate('/projects')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Projetos
          </Button>
        </div>
      </div>
    );
  }

  const handleAddTask = () => {
    if (newTaskTitle.trim() && id) {
      addTask(id, {
        title: newTaskTitle,
        description: newTaskDescription,
        priority: newTaskPriority,
        status: 'pendente',
        assignee: newTaskAssignee || undefined,
        dueDate: newTaskDueDate || undefined
      });
      
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskPriority('média');
      setNewTaskAssignee('');
      setNewTaskDueDate('');
      setShowTaskForm(false);
    }
  };

  const handleAddComment = () => {
    if (newComment.trim() && id) {
      addComment(id, newComment);
      setNewComment('');
    }
  };

  const handleAddRisk = () => {
    if (newRisk.name.trim() && id) {
      addRisk(id, {
        name: newRisk.name,
        impact: newRisk.impact,
        probability: newRisk.probability,
        contingencyPlan: newRisk.contingencyPlan,
        status: 'ativo'
      });
      
      setNewRisk({
        name: '',
        impact: 'médio',
        probability: 'média',
        contingencyPlan: ''
      });
      setShowRiskForm(false);
    }
  };

  const handleTaskStatusChange = (taskId: string, newStatus: Task['status']) => {
    if (id) {
      updateTask(id, taskId, { status: newStatus });
    }
  };

  const handleRiskStatusChange = (riskId: string, newStatus: Risk['status']) => {
    if (id) {
      updateRisk(id, riskId, { status: newStatus });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0 && id) {
      Array.from(files).forEach(file => {
        console.log('File uploaded:', file.name);
        // Aqui você implementaria a lógica real de upload
        // Por enquanto, vamos apenas simular
      });
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files && files.length > 0 && id) {
      Array.from(files).forEach(file => {
        console.log('File dropped:', file.name);
        // Aqui você implementaria a lógica real de upload
        // Por enquanto, vamos apenas simular
      });
    }
  };

  const handleExportProject = async () => {
    try {
      await PDFExportService.exportProjects([project], 'BRL');
    } catch (error) {
      console.error('Error exporting project:', error);
      alert('Erro ao exportar projeto. Tente novamente.');
    }
  };

  const handleEditProject = () => {
    setIsEditFormOpen(true);
  };

  const handleUpdateProject = (projectData: Omit<Project, 'id' | 'progress' | 'tasks' | 'files' | 'comments' | 'risks' | 'history'>) => {
    if (id) {
      updateProject(id, projectData);
      setIsEditFormOpen(false);
    }
  };

  const handleCompleteProject = () => {
    if (id) {
      setConfirmAction({ type: 'complete', projectId: id });
      setShowConfirmDialog(true);
    }
  };

  const handleDeleteProject = () => {
    if (id) {
      setConfirmAction({ type: 'delete', projectId: id });
      setShowConfirmDialog(true);
    }
  };

  const handleConfirmAction = () => {
    if (!confirmAction) return;

    if (confirmAction.type === 'complete') {
      updateProject(confirmAction.projectId, { status: 'Finalizado' as Project['status'] });
    } else if (confirmAction.type === 'delete') {
      updateProject(confirmAction.projectId, { status: 'Excluído' as Project['status'] });
    }

    setShowConfirmDialog(false);
    setConfirmAction(null);
    navigate('/projects');
  };

  const getStatusColor = (status: string) => {
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta':
        return 'text-red-600 bg-red-50';
      case 'média':
        return 'text-yellow-600 bg-yellow-50';
      case 'baixa':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'alto':
        return 'text-red-600 bg-red-50';
      case 'médio':
        return 'text-yellow-600 bg-yellow-50';
      case 'baixo':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/projects')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-600">Cliente: {project.client}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportProject}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" onClick={handleEditProject}>
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
          <Button variant="outline" onClick={handleCompleteProject}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Finalizar
          </Button>
          <Button variant="outline" onClick={handleDeleteProject} className="text-red-600">
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir
          </Button>
        </div>
      </div>

      {/* Project Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Visão Geral do Projeto</CardTitle>
                <Badge className={getStatusColor(project.status)}>
                  {project.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">{project.description}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">Início: {new Date(project.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">Fim: {new Date(project.endDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">Equipe: {project.team.length} membros</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">Fase: {project.phase}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progresso do Projeto</span>
                  <span>{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>

              {project.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{project.tasks.length}</div>
                <div className="text-sm text-gray-600">Total de Tarefas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{project.tasks.filter(t => t.completed).length}</div>
                <div className="text-sm text-gray-600">Tarefas Concluídas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{project.risks.length}</div>
                <div className="text-sm text-gray-600">Riscos Identificados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{project.comments.length}</div>
                <div className="text-sm text-gray-600">Comentários</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks">Tarefas ({project.tasks.length})</TabsTrigger>
          <TabsTrigger value="files">Arquivos ({project.files.length})</TabsTrigger>
          <TabsTrigger value="comments">Comentários ({project.comments.length})</TabsTrigger>
          <TabsTrigger value="risks">Riscos ({project.risks.length})</TabsTrigger>
          <TabsTrigger value="history">Histórico ({project.history.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Tarefas do Projeto</h3>
            <Button onClick={() => setShowTaskForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Tarefa
            </Button>
          </div>

          {showTaskForm && (
            <Card>
              <CardHeader>
                <CardTitle>Adicionar Nova Tarefa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Título da tarefa"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Descrição da tarefa"
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                />
                <div className="grid grid-cols-3 gap-4">
                  <Select value={newTaskPriority} onValueChange={(value: 'baixa' | 'média' | 'alta') => setNewTaskPriority(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="média">Média</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Responsável"
                    value={newTaskAssignee}
                    onChange={(e) => setNewTaskAssignee(e.target.value)}
                  />
                  <Input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddTask}>Adicionar Tarefa</Button>
                  <Button variant="outline" onClick={() => setShowTaskForm(false)}>
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            {project.tasks.map((task) => (
              <Card key={task.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => toggleTask(project.id, task.id)}
                          className="w-4 h-4"
                        />
                        <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
                          {task.title}
                        </h4>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </div>
                      {task.description && (
                        <p className="text-gray-600 text-sm mb-2 ml-7">{task.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500 ml-7">
                        {task.assignee && (
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {task.assignee}
                          </span>
                        )}
                        {task.dueDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                        <span>Criada em {new Date(task.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Select value={task.status} onValueChange={(value: Task['status']) => handleTaskStatusChange(task.id, value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="em andamento">Em Andamento</SelectItem>
                        <SelectItem value="concluída">Concluída</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="files" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Arquivos do Projeto</h3>
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Arquivo
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileUpload}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
          />

          <Card 
            className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <CardContent className="p-8 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Arraste arquivos aqui ou clique para fazer upload</p>
              <p className="text-sm text-gray-500">Formatos suportados: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, JPEG</p>
              <Button variant="outline" className="mt-4" onClick={() => fileInputRef.current?.click()}>
                Selecionar Arquivos
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {project.files.map((file) => (
              <Card key={file.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {(file.size / 1024).toFixed(1)} KB • {new Date(file.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="comments" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Comentários</h3>
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <Textarea
                  placeholder="Adicione um comentário..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Adicionar Comentário
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {project.comments.map((comment) => (
              <Card key={comment.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-600">
                        {comment.author.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{comment.author}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.text}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="risks" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Riscos do Projeto</h3>
            <Button onClick={() => setShowRiskForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Risco
            </Button>
          </div>

          {showRiskForm && (
            <Card>
              <CardHeader>
                <CardTitle>Adicionar Novo Risco</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Nome do risco"
                  value={newRisk.name}
                  onChange={(e) => setNewRisk({...newRisk, name: e.target.value})}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Select 
                    value={newRisk.impact} 
                    onValueChange={(value: 'baixo' | 'médio' | 'alto') => setNewRisk({...newRisk, impact: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Impacto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixo">Baixo</SelectItem>
                      <SelectItem value="médio">Médio</SelectItem>
                      <SelectItem value="alto">Alto</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select 
                    value={newRisk.probability} 
                    onValueChange={(value: 'baixa' | 'média' | 'alta') => setNewRisk({...newRisk, probability: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Probabilidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="média">Média</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Textarea
                  placeholder="Plano de contingência"
                  value={newRisk.contingencyPlan}
                  onChange={(e) => setNewRisk({...newRisk, contingencyPlan: e.target.value})}
                />
                <div className="flex gap-2">
                  <Button onClick={handleAddRisk}>Adicionar Risco</Button>
                  <Button variant="outline" onClick={() => setShowRiskForm(false)}>
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            {project.risks.map((risk) => (
              <Card key={risk.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                        <h4 className="font-medium">{risk.name}</h4>
                        <Badge className={getImpactColor(risk.impact)}>
                          Impacto {risk.impact}
                        </Badge>
                        <Badge variant="outline">
                          Prob. {risk.probability}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{risk.contingencyPlan}</p>
                      <p className="text-xs text-gray-500">
                        Criado em {new Date(risk.createdAt).toLocaleDateString()}
                      </p>
                    </div>
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
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <h3 className="text-lg font-medium">Histórico do Projeto</h3>
          <div className="space-y-3">
            {project.history.map((entry) => (
              <Card key={entry.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{entry.action}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(entry.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm">{entry.details}</p>
                      <p className="text-xs text-gray-500 mt-1">por {entry.user}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Form Dialog */}
      <Dialog open={isEditFormOpen} onOpenChange={setIsEditFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Projeto</DialogTitle>
          </DialogHeader>
          <ProjectForm
            isOpen={isEditFormOpen}
            onClose={() => setIsEditFormOpen(false)}
            project={project}
            onSubmit={handleUpdateProject}
          />
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.type === 'complete' ? 'Finalizar Projeto' : 'Excluir Projeto'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === 'complete' 
                ? 'Tem certeza que deseja finalizar este projeto? Esta ação pode ser revertida posteriormente.'
                : 'Tem certeza que deseja excluir este projeto? Ele será movido para a lixeira.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction}>
              {confirmAction?.type === 'complete' ? 'Finalizar' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
