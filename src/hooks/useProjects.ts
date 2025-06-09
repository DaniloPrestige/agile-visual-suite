import { useState, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Project, Task, ProjectFile, Comment, Risk, HistoryEntry } from '../types/project';

export function useProjects() {
  const [projects, setProjects] = useLocalStorage<Project[]>('agile-canvas-projects', []);

  const addProject = useCallback((project: Omit<Project, 'id' | 'progress' | 'tasks' | 'files' | 'comments' | 'risks' | 'history'>) => {
    const newProject: Project = {
      ...project,
      id: crypto.randomUUID(),
      progress: 0,
      tasks: [],
      files: [],
      comments: [],
      risks: [],
      history: [{
        id: crypto.randomUUID(),
        projectId: '',
        action: 'Projeto criado',
        details: `Projeto "${project.name}" foi criado`,
        timestamp: new Date().toISOString(),
        user: 'Sistema'
      }],
      // Ensure default values for new fields
      phase: project.phase || 'Iniciação',
      initialValue: project.initialValue || 0,
      finalValue: project.finalValue || 0,
      currency: project.currency || 'BRL'
    };
    newProject.history[0].projectId = newProject.id;
    
    setProjects(prev => [...prev, newProject]);
    return newProject;
  }, [setProjects]);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(project => {
      if (project.id === id) {
        const updatedProject = { ...project, ...updates };
        
        // Add history entry
        const historyEntry: HistoryEntry = {
          id: crypto.randomUUID(),
          projectId: id,
          action: 'Projeto atualizado',
          details: `Projeto "${updatedProject.name}" foi modificado`,
          timestamp: new Date().toISOString(),
          user: 'Sistema'
        };
        
        updatedProject.history = [...(updatedProject.history || []), historyEntry];
        return updatedProject;
      }
      return project;
    }));
  }, [setProjects]);

  const deleteProject = useCallback((id: string) => {
    setProjects(prev => prev.filter(project => project.id !== id));
  }, [setProjects]);

  const addTask = useCallback((projectId: string, title: string) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      projectId,
      title,
      completed: false,
      createdAt: new Date().toISOString()
    };

    setProjects(prev => prev.map(project => {
      if (project.id === projectId) {
        const updatedTasks = [...project.tasks, newTask];
        const progress = Math.round((updatedTasks.filter(t => t.completed).length / updatedTasks.length) * 100) || 0;
        
        return {
          ...project,
          tasks: updatedTasks,
          progress,
          history: [...project.history, {
            id: crypto.randomUUID(),
            projectId,
            action: 'Tarefa adicionada',
            details: `Nova tarefa: "${title}"`,
            timestamp: new Date().toISOString(),
            user: 'Sistema'
          }]
        };
      }
      return project;
    }));
  }, [setProjects]);

  const toggleTask = useCallback((projectId: string, taskId: string) => {
    setProjects(prev => prev.map(project => {
      if (project.id === projectId) {
        const updatedTasks = project.tasks.map(task => 
          task.id === taskId ? { ...task, completed: !task.completed } : task
        );
        const progress = Math.round((updatedTasks.filter(t => t.completed).length / updatedTasks.length) * 100) || 0;
        
        const task = project.tasks.find(t => t.id === taskId);
        return {
          ...project,
          tasks: updatedTasks,
          progress,
          history: [...project.history, {
            id: crypto.randomUUID(),
            projectId,
            action: 'Tarefa atualizada',
            details: `Tarefa "${task?.title}" ${!task?.completed ? 'concluída' : 'reaberta'}`,
            timestamp: new Date().toISOString(),
            user: 'Sistema'
          }]
        };
      }
      return project;
    }));
  }, [setProjects]);

  const addComment = useCallback((projectId: string, text: string, author: string = 'Usuário') => {
    const newComment: Comment = {
      id: crypto.randomUUID(),
      projectId,
      author,
      text,
      createdAt: new Date().toISOString()
    };

    setProjects(prev => prev.map(project => {
      if (project.id === projectId) {
        return {
          ...project,
          comments: [...project.comments, newComment],
          history: [...project.history, {
            id: crypto.randomUUID(),
            projectId,
            action: 'Comentário adicionado',
            details: `Novo comentário de ${author}`,
            timestamp: new Date().toISOString(),
            user: 'Sistema'
          }]
        };
      }
      return project;
    }));
  }, [setProjects]);

  const addRisk = useCallback((projectId: string, risk: Omit<Risk, 'id' | 'projectId' | 'createdAt'>) => {
    const newRisk: Risk = {
      ...risk,
      id: crypto.randomUUID(),
      projectId,
      createdAt: new Date().toISOString()
    };

    setProjects(prev => prev.map(project => {
      if (project.id === projectId) {
        return {
          ...project,
          risks: [...project.risks, newRisk],
          history: [...project.history, {
            id: crypto.randomUUID(),
            projectId,
            action: 'Risco adicionado',
            details: `Novo risco: "${risk.name}"`,
            timestamp: new Date().toISOString(),
            user: 'Sistema'
          }]
        };
      }
      return project;
    }));
  }, [setProjects]);

  const updateRisk = useCallback((projectId: string, riskId: string, updates: Partial<Risk>) => {
    setProjects(prev => prev.map(project => {
      if (project.id === projectId) {
        const updatedRisks = project.risks.map(risk => 
          risk.id === riskId ? { ...risk, ...updates } : risk
        );
        
        const risk = project.risks.find(r => r.id === riskId);
        return {
          ...project,
          risks: updatedRisks,
          history: [...project.history, {
            id: crypto.randomUUID(),
            projectId,
            action: 'Risco atualizado',
            details: `Risco "${risk?.name}" foi modificado`,
            timestamp: new Date().toISOString(),
            user: 'Sistema'
          }]
        };
      }
      return project;
    }));
  }, [setProjects]);

  return {
    projects,
    addProject,
    updateProject,
    deleteProject,
    addTask,
    toggleTask,
    addComment,
    addRisk,
    updateRisk
  };
}
