
import { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ProjectCard } from "../components/ProjectCard";
import { ProjectForm } from "../components/ProjectForm";
import { ProjectFilters } from "../components/ProjectFilters";
import { AlertPopup } from "../components/AlertPopup";
import { useProjects } from "../hooks/useProjects";
import { Project, FilterOptions } from "../types/project";
import { useNavigate } from "react-router-dom";

export function ProjectList() {
  const navigate = useNavigate();
  const { projects, addProject, updateProject, deleteProject } = useProjects();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    status: '',
    tags: []
  });

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = 
        project.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        project.client.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesStatus = !filters.status || project.status === filters.status;
      
      const matchesTags = filters.tags.length === 0 || 
        filters.tags.some(tag => project.tags.includes(tag));

      return matchesSearch && matchesStatus && matchesTags;
    });
  }, [projects, filters]);

  const availableTags = useMemo(() => {
    const allTags = projects.flatMap(project => project.tags);
    return Array.from(new Set(allTags)).sort();
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
    if (window.confirm('Tem certeza que deseja excluir este projeto?')) {
      deleteProject(id);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProject(null);
  };

  return (
    <div className="space-y-8">
      <AlertPopup projects={projects} />
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🚀 Gerencie todos os seus projetos em um só lugar</h1>
          <p className="text-gray-600">Organize, acompanhe e conclua seus projetos com eficiência</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-3">
          <Plus className="w-5 h-5" />
          Novo Projeto
        </Button>
      </div>

      <ProjectFilters
        filters={filters}
        onFiltersChange={setFilters}
        availableTags={availableTags}
      />

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onView={handleViewProject}
              onEdit={handleEditProject}
              onDelete={handleDeleteProject}
            />
          ))}
        </div>
      )}

      <ProjectForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
        project={editingProject}
      />
    </div>
  );
}
