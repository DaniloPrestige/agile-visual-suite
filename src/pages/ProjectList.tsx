import { useState, useMemo, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Download, Check, Trash2, X, Search, TrashIcon } from "lucide-react";
import { ProjectCardCompact } from "../components/ProjectCardCompact";
import { ProjectForm } from "../components/ProjectForm";
import { AlertPopup } from "../components/AlertPopup";
import { useProjects } from "../hooks/useProjects";
import { Project, FilterOptions } from "../types/project";
import { useNavigate } from "react-router-dom";
import { currencyService } from "../services/currencyService";
import { PDFExportService } from "../services/pdfExportService";

export function ProjectList() {
  const navigate = useNavigate();
  const { projects, addProject, updateProject, deleteProject } = useProjects();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('active');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type: 'complete' | 'delete' | 'activate' | 'permanent-delete', projects: string[] } | null>(null);
  const [currentCurrency, setCurrentCurrency] = useState<'BRL' | 'USD' | 'EUR'>('BRL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    currencyService.updateRates();
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesTab = activeTab === 'active' 
        ? ['Em andamento', 'Atrasado'].includes(project.status)
        : activeTab === 'completed'
        ? project.status === 'Finalizado'
        : project.status === 'Excluído';

      return matchesSearch && matchesTab;
    });
  }, [projects, searchTerm, activeTab]);

  const projectStats = useMemo(() => {
    const active = projects.filter(p => ['Em andamento', 'Atrasado'].includes(p.status));
    const completed = projects.filter(p => p.status === 'Finalizado');
    const deleted = projects.filter(p => p.status === 'Excluído');
    
    return {
      total: projects.length - deleted.length,
      active: active.length,
      completed: completed.length,
      overdue: projects.filter(p => p.status === 'Atrasado').length,
      deleted: deleted.length
    };
  }, [projects]);

  const handleCreateProject = (projectData: Omit<Project, 'id' | 'progress' | 'tasks' | 'files' | 'comments' | 'risks' | 'history'>) => {
    addProject(projectData);
    setIsFormOpen(false);
    setEditingProject(null);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsFormOpen(true);
  };

  const handleUpdateProject = (projectData: Omit<Project, 'id' | 'progress' | 'tasks' | 'files' | 'comments' | 'risks' | 'history'>) => {
    if (editingProject) {
      updateProject(editingProject.id, projectData);
    }
    setIsFormOpen(false);
    setEditingProject(null);
  };

  const handleViewProject = (project: Project) => {
    navigate(`/projects/${project.id}`);
  };

  const handleStatusChange = (projectId: string, newStatus: Project['status']) => {
    if (newStatus === 'Finalizado') {
      setConfirmAction({ type: 'complete', projects: [projectId] });
    } else if (newStatus === 'Excluído') {
      setConfirmAction({ type: 'delete', projects: [projectId] });
    } else if (newStatus === 'Em andamento') {
      setConfirmAction({ type: 'activate', projects: [projectId] });
    }
    setShowConfirmDialog(true);
  };

  const handleBulkComplete = () => {
    if (selectedProjects.length > 0) {
      setConfirmAction({ type: 'complete', projects: selectedProjects });
      setShowConfirmDialog(true);
    }
  };

  const handleBulkDelete = () => {
    if (selectedProjects.length > 0) {
      if (activeTab === 'deleted') {
        setConfirmAction({ type: 'permanent-delete', projects: selectedProjects });
      } else {
        setConfirmAction({ type: 'delete', projects: selectedProjects });
      }
      setShowConfirmDialog(true);
    }
  };

  const handleBulkActivate = () => {
    if (selectedProjects.length > 0) {
      setConfirmAction({ type: 'activate', projects: selectedProjects });
      setShowConfirmDialog(true);
    }
  };

  const handlePermanentDelete = () => {
    if (selectedProjects.length > 0) {
      setConfirmAction({ type: 'permanent-delete', projects: selectedProjects });
      setShowConfirmDialog(true);
    }
  };

  const handleExportProjects = async () => {
    const projectsToExport = selectedProjects.length > 0 
      ? projects.filter(p => selectedProjects.includes(p.id))
      : filteredProjects;
    
    if (projectsToExport.length === 0) {
      alert('Nenhum projeto selecionado para exportar');
      return;
    }

    try {
      await PDFExportService.exportProjects(projectsToExport, currentCurrency);
    } catch (error) {
      console.error('Error exporting projects:', error);
      alert('Erro ao exportar projetos. Tente novamente.');
    }
  };

  const handleConfirmAction = () => {
    if (!confirmAction) return;

    confirmAction.projects.forEach(projectId => {
      const project = projects.find(p => p.id === projectId);
      if (project) {
        if (confirmAction.type === 'complete') {
          updateProject(projectId, { ...project, status: 'Finalizado' as Project['status'] });
        } else if (confirmAction.type === 'delete') {
          updateProject(projectId, { ...project, status: 'Excluído' as Project['status'] });
        } else if (confirmAction.type === 'activate') {
          updateProject(projectId, { ...project, status: 'Em andamento' as Project['status'] });
        } else if (confirmAction.type === 'permanent-delete') {
          deleteProject(projectId);
        }
      }
    });

    setSelectedProjects([]);
    setShowConfirmDialog(false);
    setConfirmAction(null);
  };

  const handleSelectAll = () => {
    if (selectedProjects.length === filteredProjects.length) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(filteredProjects.map(p => p.id));
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProject(null);
  };

  const getConfirmationMessage = () => {
    if (!confirmAction) return '';
    
    switch (confirmAction.type) {
      case 'complete':
        return `Tem certeza que deseja finalizar ${confirmAction.projects.length} projeto(s)?`;
      case 'delete':
        return `Tem certeza que deseja mover ${confirmAction.projects.length} projeto(s) para a lixeira?`;
      case 'activate':
        return `Tem certeza que deseja reativar ${confirmAction.projects.length} projeto(s)?`;
      case 'permanent-delete':
        return `Tem certeza que deseja excluir permanentemente ${confirmAction.projects.length} projeto(s)? Esta ação NÃO pode ser desfeita.`;
      default:
        return '';
    }
  };

  const getConfirmationTitle = () => {
    if (!confirmAction) return '';
    
    switch (confirmAction.type) {
      case 'complete':
        return 'Finalizar Projeto(s)';
      case 'delete':
        return 'Mover para Lixeira';
      case 'activate':
        return 'Reativar Projeto(s)';
      case 'permanent-delete':
        return 'Excluir Permanentemente';
      default:
        return '';
    }
  };

  const getActionButtonText = () => {
    if (!confirmAction) return '';
    
    switch (confirmAction.type) {
      case 'complete':
        return 'Finalizar';
      case 'delete':
        return 'Mover para Lixeira';
      case 'activate':
        return 'Reativar';
      case 'permanent-delete':
        return 'Excluir Permanentemente';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <AlertPopup projects={projects} />
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg text-gray-900 mb-2">Gerencie todos os seus projetos em um só lugar</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={() => setIsFormOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            Novo Projeto
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{projectStats.total}</div>
            <div className="text-sm text-gray-600">Total de Projetos</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{projectStats.active}</div>
            <div className="text-sm text-gray-600">Em Progresso</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{projectStats.completed}</div>
            <div className="text-sm text-gray-600">Finalizados</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{projectStats.overdue}</div>
            <div className="text-sm text-gray-600">Atrasados</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar por nome, cliente ou tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={handleExportProjects}>
          <Download className="w-4 h-4 mr-2" />
          Exportar PDF
        </Button>
      </div>

      {selectedProjects.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox checked={true} />
            <span className="font-medium">{selectedProjects.length} projeto(s) selecionado(s)</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportProjects}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            {activeTab === 'deleted' ? (
              <>
                <Button variant="outline" size="sm" onClick={handleBulkActivate}>
                  <Check className="w-4 h-4 mr-2" />
                  Reativar
                </Button>
                <Button variant="outline" size="sm" onClick={handlePermanentDelete} className="text-red-600">
                  <TrashIcon className="w-4 h-4 mr-2" />
                  Excluir Definitivamente
                </Button>
              </>
            ) : activeTab === 'completed' ? (
              <Button variant="outline" size="sm" onClick={handleBulkActivate}>
                <Check className="w-4 h-4 mr-2" />
                Reativar
              </Button>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={handleBulkComplete}>
                  <Check className="w-4 h-4 mr-2" />
                  Finalizar
                </Button>
                <Button variant="outline" size="sm" onClick={handleBulkDelete} className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Mover para Lixeira
                </Button>
              </>
            )}
            <Button variant="ghost" size="sm" onClick={() => setSelectedProjects([])}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Ativos ({projectStats.active})</TabsTrigger>
          <TabsTrigger value="completed">Finalizados ({projectStats.completed})</TabsTrigger>
          <TabsTrigger value="deleted">Lixeira ({projectStats.deleted})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-lg">
              <div className="max-w-md mx-auto">
                <div className="text-6xl mb-4">📋</div>
                <p className="text-gray-500 text-lg mb-4">
                  {projects.length === 0 
                    ? 'Nenhum projeto encontrado. Crie seu primeiro projeto!'
                    : 'Nenhum projeto encontrado com os filtros aplicados.'
                  }
                </p>
                {projects.length === 0 && (
                  <Button onClick={() => setIsFormOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeiro Projeto
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Checkbox 
                    checked={selectedProjects.length === filteredProjects.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <span>Selecionar todos ({filteredProjects.length})</span>
                </div>
                {activeTab === 'deleted' && selectedProjects.length > 0 && (
                  <Button variant="outline" size="sm" onClick={handlePermanentDelete} className="text-red-600">
                    <TrashIcon className="w-4 h-4 mr-2" />
                    Excluir Definitivamente
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProjects.map((project) => (
                  <ProjectCardCompact
                    key={project.id}
                    project={project}
                    onView={handleViewProject}
                    onEdit={handleEditProject}
                    onDelete={(id) => handleStatusChange(id, 'Excluído')}
                    onStatusChange={handleStatusChange}
                    isSelected={selectedProjects.includes(project.id)}
                    onSelectChange={(selected) => {
                      if (selected) {
                        setSelectedProjects([...selectedProjects, project.id]);
                      } else {
                        setSelectedProjects(selectedProjects.filter(id => id !== project.id));
                      }
                    }}
                    currentCurrency={currentCurrency}
                  />
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <ProjectForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
        project={editingProject}
      />

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {getConfirmationTitle()}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {getConfirmationMessage()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmAction}
              className={confirmAction?.type === 'permanent-delete' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {getActionButtonText()}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
