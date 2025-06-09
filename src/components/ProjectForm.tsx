
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Project } from "../types/project";

interface ProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (project: Omit<Project, 'id' | 'progress' | 'tasks' | 'files' | 'comments' | 'risks' | 'history'>) => void;
  project?: Project | null;
}

export function ProjectForm({ isOpen, onClose, onSubmit, project }: ProjectFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    description: '',
    status: 'Em andamento' as Project['status'],
    phase: 'Iniciação' as Project['phase'],
    startDate: '',
    endDate: '',
    tags: '',
    team: '',
    initialValue: 0,
    finalValue: 0,
    currency: 'BRL' as Project['currency']
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        client: project.client,
        description: project.description,
        status: project.status,
        phase: project.phase,
        startDate: project.startDate,
        endDate: project.endDate,
        tags: project.tags.join(', '),
        team: project.team.join(', '),
        initialValue: project.initialValue || 0,
        finalValue: project.finalValue || 0,
        currency: project.currency || 'BRL'
      });
    } else {
      setFormData({
        name: '',
        client: '',
        description: '',
        status: 'Em andamento',
        phase: 'Iniciação',
        startDate: '',
        endDate: '',
        tags: '',
        team: '',
        initialValue: 0,
        finalValue: 0,
        currency: 'BRL'
      });
    }
    setIsSubmitting(false);
  }, [project, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const projectData = {
        name: formData.name.trim(),
        client: formData.client.trim(),
        description: formData.description.trim(),
        status: formData.status,
        phase: formData.phase,
        startDate: formData.startDate,
        endDate: formData.endDate,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        team: formData.team.split(',').map(member => member.trim()).filter(Boolean),
        initialValue: formData.initialValue,
        finalValue: formData.finalValue,
        currency: formData.currency
      };

      await onSubmit(projectData);
      
      // Reset form
      setFormData({
        name: '',
        client: '',
        description: '',
        status: 'Em andamento',
        phase: 'Iniciação',
        startDate: '',
        endDate: '',
        tags: '',
        team: '',
        initialValue: 0,
        finalValue: 0,
        currency: 'BRL'
      });
      
      onClose();
    } catch (error) {
      console.error('Erro ao salvar projeto:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = formData.name.trim() && formData.client.trim() && formData.team.trim() && formData.startDate && formData.endDate;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {project ? '✏️ Editar Projeto' : '📝 Novo Projeto'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium">Nome do Projeto *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ex: Sistema de Vendas"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="client" className="text-sm font-medium">Cliente *</Label>
              <Input
                id="client"
                value={formData.client}
                onChange={(e) => handleInputChange('client', e.target.value)}
                placeholder="Ex: Empresa ABC Ltda"
                required
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-sm font-medium">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descreva os objetivos e escopo do projeto..."
              rows={3}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status" className="text-sm font-medium">Status *</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Em andamento">🔄 Em andamento</SelectItem>
                  <SelectItem value="Finalizado">✅ Finalizado</SelectItem>
                  <SelectItem value="Atrasado">⚠️ Atrasado</SelectItem>
                  <SelectItem value="Cancelado">❌ Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="phase" className="text-sm font-medium">Fase *</Label>
              <Select value={formData.phase} onValueChange={(value) => handleInputChange('phase', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Iniciação">🚀 Iniciação</SelectItem>
                  <SelectItem value="Planejamento">📋 Planejamento</SelectItem>
                  <SelectItem value="Execução">⚡ Execução</SelectItem>
                  <SelectItem value="Monitoramento">👁️ Monitoramento</SelectItem>
                  <SelectItem value="Encerramento">🏁 Encerramento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="initialValue" className="text-sm font-medium">Valor Inicial *</Label>
              <Input
                id="initialValue"
                type="number"
                step="0.01"
                value={formData.initialValue}
                onChange={(e) => handleInputChange('initialValue', parseFloat(e.target.value) || 0)}
                placeholder="0,00"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="finalValue" className="text-sm font-medium">Valor Final</Label>
              <Input
                id="finalValue"
                type="number"
                step="0.01"
                value={formData.finalValue}
                onChange={(e) => handleInputChange('finalValue', parseFloat(e.target.value) || 0)}
                placeholder="0,00"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="currency" className="text-sm font-medium">Moeda *</Label>
              <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BRL">🇧🇷 Real (BRL)</SelectItem>
                  <SelectItem value="USD">🇺🇸 Dólar (USD)</SelectItem>
                  <SelectItem value="EUR">🇪🇺 Euro (EUR)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="team" className="text-sm font-medium">Equipe *</Label>
            <Input
              id="team"
              value={formData.team}
              onChange={(e) => handleInputChange('team', e.target.value)}
              placeholder="João Silva, maria@empresa.com, Pedro"
              required
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">Separe nomes/emails por vírgula</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate" className="text-sm font-medium">Data de Início *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="endDate" className="text-sm font-medium">Previsão de Conclusão *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                required
                className="mt-1"
                min={formData.startDate}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="tags" className="text-sm font-medium">Tags</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              placeholder="TI, urgente, mobile, frontend"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">Separe as tags por vírgula</p>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={!isFormValid || isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? 'Salvando...' : (project ? '💾 Atualizar Projeto' : '✨ Criar Projeto')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
