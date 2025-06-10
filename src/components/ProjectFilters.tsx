
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { FilterOptions } from "../types/project";

interface ProjectFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  availableTags: string[];
}

export function ProjectFilters({ filters, onFiltersChange, availableTags }: ProjectFiltersProps) {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({ ...filters, status: value === "all" ? "" : value });
  };

  const handlePhaseChange = (value: string) => {
    onFiltersChange({ ...filters, phase: value === "all" ? "" : value });
  };

  const handleTagToggle = (tag: string) => {
    const currentTags = filters.tags;
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    
    onFiltersChange({ ...filters, tags: newTags });
  };

  const clearFilters = () => {
    onFiltersChange({ search: '', status: '', phase: '', tags: [] });
  };

  return (
    <div className="space-y-4 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="🔍 Buscar por nome ou cliente..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="h-10"
          />
        </div>
        
        <Select value={filters.status || "all"} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full sm:w-48 h-10">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="Em andamento">Em andamento</SelectItem>
            <SelectItem value="Finalizado">Finalizado</SelectItem>
            <SelectItem value="Atrasado">Atrasado</SelectItem>
            <SelectItem value="Cancelado">Cancelado</SelectItem>
            <SelectItem value="Excluído">Excluído</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.phase || "all"} onValueChange={handlePhaseChange}>
          <SelectTrigger className="w-full sm:w-48 h-10">
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

        <Button variant="outline" onClick={clearFilters} className="h-10">
          🗑️ Limpar Filtros
        </Button>
      </div>

      {availableTags.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-3 text-gray-700">🏷️ Filtrar por tags:</p>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <Badge
                key={tag}
                variant={filters.tags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer hover:bg-blue-100 transition-colors px-3 py-1"
                onClick={() => handleTagToggle(tag)}
              >
                #{tag}
                {filters.tags.includes(tag) && (
                  <X className="w-3 h-3 ml-1" />
                )}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
