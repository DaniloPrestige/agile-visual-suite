
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import { useProjects } from "../hooks/useProjects";
import { ProjectForm } from "../components/ProjectForm";
import { ProjectCard } from "../components/ProjectCard";
import { ProjectCardCompact } from "../components/ProjectCardCompact";
import { pdfExportService } from "../services/pdfExportService";
import { Project } from "../types/project";
import { Plus, Search, Download, Grid, List, Filter, FileText } from "lucide-react";
import { toast } from "sonner";

export function ProjectList() {
  const navigate = useNavigate();
  const { projects, addProject, updateProject, deleteProject } = useProjects();
  const [searchTerm, setSearchTerm] = useState('');
  const [phaseFilter, setPhaseFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState('active');

  const filteredProjects = useMemo(() => {
    let filtered = projects;

    // Filtro por tab ativa
    switch (activeTab) {
      case 'active':
        filtered = filtered.filter(p => p.status !== 'Excluído');
        break;
      case 'completed':
        filtered = filtered.filter(p => p.status === 'Finalizado');
        break;
      case 'deleted':
        filtered = filtered.filter(p => p.status === 'Excluído');
        break;
    }

    // Filtro por busca (nome, cliente, tags)
    if (searchTerm) {
      filtered = filtered.filter(project => 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtro por fase
    if (phaseFilter !== 'all') {
      filtered = filtered.filter(project => project.phase === phaseFilter);
    }

    return filtered;
  }, [projects, searchTerm, phaseFilter, activeTab]);

  const handleAddProject = (projectData: Omit<Project, 'id' | 'progress' | 'tasks' | 'files' | 'comments' | 'risks' | 'history'>) => {
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
      progress: 0,
      tasks: [],
      files: [],
      comments: [],
      risks: [],
      history: [{
        id: Date.now().toString(),
        action: 'Projeto criado',
        date: new Date().toISOString(),
        user: 'Sistema'
      }]
    };
    addProject(newProject);
    setShowNewProjectForm(false);
    toast.success('Projeto criado com sucesso!');
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
  };

  const handleUpdateProject = (projectData: Partial<Project>) => {
    if (editingProject) {
      updateProject(editingProject.id, projectData);
      setEditingProject(null);
      toast.success('Projeto atualizado com sucesso!');
    }
  };

  const handleDeleteProject = (id: string) => {
    deleteProject(id);
    toast.success('Projeto excluído!');
  };

  const handleViewProject = (project: Project) => {
    navigate(`/projects/${project.id}`);
  };

  const handleStatusChange = (id: string, status: Project['status']) => {
    updateProject(id, { status });
    toast.success(`Status do projeto alterado para ${status}`);
  };

  const handleExportProjects = async () => {
    try {
      await pdfExportService.exportProjectsList(filteredProjects);
      toast.success('Lista de projetos exportada com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar lista de projetos');
    }
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'Em andamento':
        return 'bg-blue-100 text-blue-800';
      case 'Finalizado':
        return 'bg-green-100 text-green-800';
      case 'Cancelado':
        return 'bg-gray-100 text-gray-800';
      case 'Atrasado':
        return 'bg-red-100 text-red-800';
      case 'Excluído':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Projetos</h1>
            <p className="text-sm text-muted-foreground">Gerencie todos os seus projetos em um só lugar</p>
          </div>
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handleExportProjects} variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Exportar PDF
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Exportar lista de projetos para PDF</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={() => setShowNewProjectForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Projeto
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Criar um novo projeto</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Filtros e controles */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por nome, cliente ou tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-80"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <Select value={phaseFilter} onValueChange={setPhaseFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filtrar por fase" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as fases</SelectItem>
                      <SelectItem value="Iniciação">Iniciação</SelectItem>
                      <SelectItem value="Planejamento">Planejamento</SelectItem>
                      <SelectItem value="Execução">Execução</SelectItem>
                      <SelectItem value="Monitoramento">Monitoramento</SelectItem>
                      <SelectItem value="Encerramento">Encerramento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Visualização em grade</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Visualização em lista</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs para diferentes status */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active" className="flex items-center gap-2">
              Ativos ({projects.filter(p => p.status !== 'Excluído').length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              Finalizados ({projects.filter(p => p.status === 'Finalizado').length})
            </TabsTrigger>
            <TabsTrigger value="deleted" className="flex items-center gap-2">
              Lixeira ({projects.filter(p => p.status === 'Excluído').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {filteredProjects.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="text-6xl mb-4">📁</div>
                  <h3 className="text-lg font-semibold mb-2">Nenhum projeto encontrado</h3>
                  <p className="text-gray-500 mb-6">
                    {searchTerm || phaseFilter !== 'all'
                      ? 'Tente ajustar os filtros de busca.'
                      : 'Comece criando seu primeiro projeto.'}
                  </p>
                  {!searchTerm && phaseFilter === 'all' && (
                    <Button onClick={() => setShowNewProjectForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeiro Projeto
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                : "space-y-4"
              }>
                {filteredProjects.map((project) => (
                  viewMode === 'grid' ? (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onEdit={handleEditProject}
                      onDelete={handleDeleteProject}
                      onView={handleViewProject}
                      onStatusChange={handleStatusChange}
                      currentCurrency="BRL"
                    />
                  ) : (
                    <ProjectCardCompact
                      key={project.id}
                      project={project}
                      onEdit={handleEditProject}
                      onDelete={handleDeleteProject}
                      onView={handleViewProject}
                      onStatusChange={handleStatusChange}
                      isSelected={false}
                      onSelectChange={() => {}}
                      currentCurrency="BRL"
                    />
                  )
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Dialog para novo projeto */}
        <Dialog open={showNewProjectForm} onOpenChange={setShowNewProjectForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Novo Projeto</DialogTitle>
            </DialogHeader>
            <ProjectForm
              onSubmit={handleAddProject}
              isOpen={showNewProjectForm}
              onClose={() => setShowNewProjectForm(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Dialog para editar projeto */}
        <Dialog open={!!editingProject} onOpenChange={(open) => !open && setEditingProject(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Projeto</DialogTitle>
            </DialogHeader>
            {editingProject && (
              <ProjectForm
                project={editingProject}
                onSubmit={handleUpdateProject}
                isOpen={!!editingProject}
                onClose={() => setEditingProject(null)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
