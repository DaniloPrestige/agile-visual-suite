
import { useState, useMemo, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Download, Check, Trash2, X } from "lucide-react";
import { ProjectCardCompact } from "../components/ProjectCardCompact";
import { ProjectForm } from "../components/ProjectForm";
import { ProjectFilters } from "../components/ProjectFilters";
import { AlertPopup } from "../components/AlertPopup";
import { useProjects } from "../hooks/useProjects";
import { Project, FilterOptions } from "../types/project";
import { useNavigate } from "react-router-dom";
import { currencyService } from "../services/currencyService";

export function ProjectList() {
  const navigate = useNavigate();
  const { projects, addProject, updateProject, deleteProject } = useProjects();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('active');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type: 'complete' | 'delete', projects: string[] } | null>(null);
  const [currentCurrency, setCurrentCurrency] = useState<'BRL' | 'USD' | 'EUR'>('BRL');
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    status: '',
    tags: []
  });

  useEffect(() => {
    currencyService.updateRates();
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = 
        project.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        project.client.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesStatus = !filters.status || project.status === filters.status;
      
      const matchesTags = filters.tags.length === 0 || 
        filters.tags.some(tag => project.tags.includes(tag));

      const matchesTab = activeTab === 'active' 
        ? ['Em andamento', 'Atrasado'].includes(project.status)
        : activeTab === 'completed'
        ? project.status === 'Finalizado'
        : project.status === 'Excluído';

      return matchesSearch && matchesStatus && matchesTags && matchesTab;
    });
  }, [projects, filters, activeTab]);

  const availableTags = useMemo(() => {
    const allTags = projects.flatMap(project => project.tags);
    return Array.from(new Set(allTags)).sort();
  }, [projects]);

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

  const handleDeleteProject = (id: string) => {
    setConfirmAction({ type: 'delete', projects: [id] });
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
      setConfirmAction({ type: 'delete', projects: selectedProjects });
      setShowConfirmDialog(true);
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

  const handleExportProjects = () => {
    const projectsToExport = selectedProjects.length > 0 
      ? projects.filter(p => selectedProjects.includes(p.id))
      : filteredProjects;
    
    console.log('Exporting projects:', projectsToExport);
    // TODO: Implement PDF export
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProject(null);
  };

  return (
    <div className="space-y-6">
      <AlertPopup projects={projects} />
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Projetos</h1>
          <p className="text-gray-600">Gerencie seus projetos</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={currentCurrency} onValueChange={(value: 'BRL' | 'USD' | 'EUR') => setCurrentCurrency(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BRL">🇧🇷 BRL</SelectItem>
              <SelectItem value="USD">🇺🇸 USD</SelectItem>
              <SelectItem value="EUR">🇪🇺 EUR</SelectItem>
            </SelectContent>
          </Select>
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
        <Card className="border-l-4 border-l-gray-500">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{projectStats.active}</div>
            <div className="text-sm text-gray-600">Pendentes</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{projectStats.overdue}</div>
            <div className="text-sm text-gray-600">Atrasados</div>
          </CardContent>
        </Card>
      </div>

      <ProjectFilters
        filters={filters}
        onFiltersChange={setFilters}
        availableTags={availableTags}
      />

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
            <Button variant="outline" size="sm" onClick={handleBulkComplete}>
              <Check className="w-4 h-4 mr-2" />
              Finalizar
            </Button>
            <Button variant="outline" size="sm" onClick={handleBulkDelete} className="text-red-600">
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir
            </Button>
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
              {activeTab === 'active' && (
                <div className="flex items-center gap-2 text-sm">
                  <Checkbox 
                    checked={selectedProjects.length === filteredProjects.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <span>Selecionar todos ({filteredProjects.length})</span>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProjects.map((project) => (
                  <ProjectCardCompact
                    key={project.id}
                    project={project}
                    onView={handleViewProject}
                    onEdit={handleEditProject}
                    onDelete={handleDeleteProject}
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
              {confirmAction?.type === 'complete' ? 'Finalizar Projeto(s)' : 'Excluir Projeto(s)'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === 'complete' 
                ? `Tem certeza que deseja finalizar ${confirmAction.projects.length} projeto(s)?`
                : `Tem certeza que deseja excluir ${confirmAction?.projects.length} projeto(s)? Esta ação pode ser revertida.`
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
