
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjectCard } from '../components/ProjectCard';
import { ProjectCardCompact } from '../components/ProjectCardCompact';
import { ProjectForm } from '../components/ProjectForm';
import { ProjectFilters } from '../components/ProjectFilters';
import { useProjects } from '../hooks/useProjects';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Grid, List, Plus, BarChart3, Users, CheckCircle, AlertTriangle } from "lucide-react";
import { Project, FilterOptions } from '../types/project';

export function Projects() {
  const navigate = useNavigate();
  const { projects, addProject, updateProject, deleteProject } = useProjects();
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    status: '',
    phase: '',
    search: '',
    tags: []
  });

  // Get all unique tags from projects
  const availableTags = useMemo(() => {
    const allTags = projects.flatMap(project => project.tags);
    return Array.from(new Set(allTags));
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      // Status filter
      if (filters.status && project.status !== filters.status) {
        return false;
      }

      // Phase filter
      if (filters.phase && project.phase !== filters.phase) {
        return false;
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!project.name.toLowerCase().includes(searchLower) &&
            !project.client.toLowerCase().includes(searchLower) &&
            !project.description.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Tags filter
      if (filters.tags.length > 0) {
        if (!filters.tags.some(tag => project.tags.includes(tag))) {
          return false;
        }
      }

      return true;
    });
  }, [projects, filters]);

  const stats = useMemo(() => {
    const total = projects.filter(p => p.status !== 'Excluído').length;
    const inProgress = projects.filter(p => p.status === 'Em andamento').length;
    const completed = projects.filter(p => p.status === 'Finalizado').length;
    const overdue = projects.filter(p => {
      const endDate = new Date(p.endDate);
      const today = new Date();
      return endDate < today && p.status !== 'Finalizado' && p.status !== 'Cancelado' && p.status !== 'Excluído';
    }).length;

    return { total, inProgress, completed, overdue };
  }, [projects]);

  const handleCreateProject = (projectData: Omit<Project, 'id' | 'progress' | 'tasks' | 'files' | 'comments' | 'risks' | 'history'>) => {
    addProject(projectData);
    setShowForm(false);
  };

  const handleEditProject = (projectData: Partial<Project>) => {
    if (editingProject) {
      updateProject(editingProject.id, projectData);
      setEditingProject(null);
      setShowForm(false);
    }
  };

  const handleDeleteProject = (id: string) => {
    deleteProject(id);
  };

  const handleViewProject = (project: Project) => {
    navigate(`/projects/${project.id}`);
  };

  const handleStatusChange = (id: string, status: Project['status']) => {
    updateProject(id, { status });
  };

  const handleSelectProject = (id: string, selected: boolean) => {
    if (selected) {
      setSelectedProjects(prev => [...prev, id]);
    } else {
      setSelectedProjects(prev => prev.filter(projectId => projectId !== id));
    }
  };

  const openEditForm = (project: Project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProject(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl">🚀 Gerencie todos os seus projetos em um só lugar</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Organize, acompanhe e finalize seus projetos com eficiência
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Projeto
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Projetos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Finalizados</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atrasados</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and View Toggle */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        <ProjectFilters 
          filters={filters} 
          onFiltersChange={setFilters} 
          availableTags={availableTags}
        />
        
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {filteredProjects.length} projeto(s) encontrado(s)
          </Badge>
          <div className="flex rounded-md border">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Projects Grid/List */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            Nenhum projeto encontrado
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {projects.length === 0 
              ? "Crie seu primeiro projeto para começar a organizar seu trabalho."
              : "Ajuste os filtros ou crie um novo projeto."
            }
          </p>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Criar Primeiro Projeto
          </Button>
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        }>
          {filteredProjects.map((project) => (
            viewMode === 'grid' ? (
              <ProjectCard
                key={project.id}
                project={project}
                onView={handleViewProject}
                onEdit={openEditForm}
                onDelete={handleDeleteProject}
              />
            ) : (
              <ProjectCardCompact
                key={project.id}
                project={project}
                onView={handleViewProject}
                onEdit={openEditForm}
                onDelete={handleDeleteProject}
                onStatusChange={handleStatusChange}
                isSelected={selectedProjects.includes(project.id)}
                onSelectChange={(selected) => handleSelectProject(project.id, selected)}
                currentCurrency="BRL"
              />
            )
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={closeForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProject ? 'Editar Projeto' : 'Criar Novo Projeto'}
            </DialogTitle>
          </DialogHeader>
          <ProjectForm
            isOpen={showForm}
            onClose={closeForm}
            project={editingProject}
            onSubmit={editingProject ? handleEditProject : handleCreateProject}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
