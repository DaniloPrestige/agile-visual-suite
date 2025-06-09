
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Project } from "../types/project";
import { currencyService } from "../services/currencyService";

interface ProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (project: Omit<Project, 'id' | 'progress' | 'tasks' | 'files' | 'comments' | 'risks' | 'history'>) => void;
  project?: Project | null;
}

export function ProjectForm({ isOpen, onClose, onSubmit, project }: ProjectFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    client: '',
    startDate: '',
    endDate: '',
    status: 'Em andamento' as Project['status'],
    phase: 'Iniciação' as Project['phase'],
    team: [] as string[],
    tags: [] as string[],
    initialValue: 0,
    finalValue: 0,
    currency: 'BRL' as 'BRL' | 'USD' | 'EUR'
  });

  const [currentTeamMember, setCurrentTeamMember] = useState('');
  const [currentTag, setCurrentTag] = useState('');
  const [initialValueInput, setInitialValueInput] = useState('');
  const [finalValueInput, setFinalValueInput] = useState('');

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description,
        client: project.client,
        startDate: project.startDate,
        endDate: project.endDate,
        status: project.status,
        phase: project.phase || 'Iniciação',
        team: project.team,
        tags: project.tags,
        initialValue: project.initialValue || 0,
        finalValue: project.finalValue || 0,
        currency: project.currency || 'BRL'
      });
      setInitialValueInput(currencyService.formatCurrency(project.initialValue || 0, project.currency || 'BRL'));
      setFinalValueInput(currencyService.formatCurrency(project.finalValue || 0, project.currency || 'BRL'));
    } else {
      resetForm();
    }
  }, [project, isOpen]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      client: '',
      startDate: '',
      endDate: '',
      status: 'Em andamento',
      phase: 'Iniciação',
      team: [],
      tags: [],
      initialValue: 0,
      finalValue: 0,
      currency: 'BRL'
    });
    setCurrentTeamMember('');
    setCurrentTag('');
    setInitialValueInput('');
    setFinalValueInput('');
  };

  const handleInitialValueChange = (value: string) => {
    const parsedValue = currencyService.parseCurrencyInput(value);
    setFormData(prev => ({ ...prev, initialValue: parsedValue }));
    setInitialValueInput(currencyService.formatCurrency(parsedValue, formData.currency));
  };

  const handleFinalValueChange = (value: string) => {
    const parsedValue = currencyService.parseCurrencyInput(value);
    setFormData(prev => ({ ...prev, finalValue: parsedValue }));
    setFinalValueInput(currencyService.formatCurrency(parsedValue, formData.currency));
  };

  const handleCurrencyChange = (newCurrency: 'BRL' | 'USD' | 'EUR') => {
    setFormData(prev => ({ ...prev, currency: newCurrency }));
    setInitialValueInput(currencyService.formatCurrency(formData.initialValue, newCurrency));
    setFinalValueInput(currencyService.formatCurrency(formData.finalValue, newCurrency));
  };

  const addTeamMember = () => {
    if (currentTeamMember.trim() && !formData.team.includes(currentTeamMember.trim())) {
      setFormData(prev => ({
        ...prev,
        team: [...prev.team, currentTeamMember.trim()]
      }));
      setCurrentTeamMember('');
    }
  };

  const removeTeamMember = (index: number) => {
    setFormData(prev => ({
      ...prev,
      team: prev.team.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.client.trim() || !formData.startDate || !formData.endDate) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    onSubmit(formData);
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{project ? 'Editar Projeto' : 'Novo Projeto'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Projeto *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Digite o nome do projeto"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="client">Cliente *</Label>
              <Input
                id="client"
                value={formData.client}
                onChange={(e) => setFormData(prev => ({ ...prev, client: e.target.value }))}
                placeholder="Nome do cliente"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva o projeto..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Data de Início *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">Previsão de Conclusão *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phase">Fase *</Label>
              <Select value={formData.phase} onValueChange={(value: Project['phase']) => setFormData(prev => ({ ...prev, phase: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Iniciação">Iniciação</SelectItem>
                  <SelectItem value="Planejamento">Planejamento</SelectItem>
                  <SelectItem value="Execução">Execução</SelectItem>
                  <SelectItem value="Monitoramento">Monitoramento</SelectItem>
                  <SelectItem value="Encerramento">Encerramento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Moeda</Label>
              <Select value={formData.currency} onValueChange={handleCurrencyChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BRL">Real (R$)</SelectItem>
                  <SelectItem value="USD">Dólar ($)</SelectItem>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="initialValue">Valor Inicial</Label>
              <Input
                id="initialValue"
                value={initialValueInput}
                onChange={(e) => handleInitialValueChange(e.target.value)}
                placeholder="0,00"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="finalValue">Valor Final</Label>
              <Input
                id="finalValue"
                value={finalValueInput}
                onChange={(e) => handleFinalValueChange(e.target.value)}
                placeholder="0,00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Equipe</Label>
            <div className="flex gap-2">
              <Input
                value={currentTeamMember}
                onChange={(e) => setCurrentTeamMember(e.target.value)}
                placeholder="Nome do membro da equipe"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTeamMember())}
              />
              <Button type="button" onClick={addTeamMember}>Adicionar</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.team.map((member, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {member}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removeTeamMember(index)} />
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                placeholder="Digite uma tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag}>Adicionar</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  #{tag}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(index)} />
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {project ? 'Atualizar' : 'Criar'} Projeto
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
