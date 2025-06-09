
export interface Project {
  id: string;
  name: string;
  client: string;
  description: string;
  status: 'Em andamento' | 'Finalizado' | 'Atrasado' | 'Cancelado' | 'Excluído';
  phase: 'Iniciação' | 'Planejamento' | 'Execução' | 'Monitoramento' | 'Encerramento';
  startDate: string;
  endDate: string;
  tags: string[];
  team: string[];
  progress: number;
  tasks: Task[];
  files: ProjectFile[];
  comments: Comment[];
  risks: Risk[];
  history: HistoryEntry[];
  initialValue: number;
  finalValue: number;
  currency: 'BRL' | 'USD' | 'EUR';
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface ProjectFile {
  id: string;
  projectId: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  url: string;
}

export interface Comment {
  id: string;
  projectId: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface Risk {
  id: string;
  projectId: string;
  name: string;
  impact: 'baixo' | 'médio' | 'alto';
  probability: 'baixa' | 'média' | 'alta';
  contingencyPlan: string;
  status: 'ativo' | 'mitigado' | 'encerrado';
  createdAt: string;
}

export interface HistoryEntry {
  id: string;
  projectId: string;
  action: string;
  details: string;
  timestamp: string;
  user: string;
}

export type FilterOptions = {
  search: string;
  status: string;
  tags: string[];
};

export interface CurrencyRates {
  BRL: number;
  USD: number;
  EUR: number;
}

export interface ProjectStats {
  total: number;
  active: number;
  completed: number;
  overdue: number;
  deleted: number;
  avgProgress: number;
  totalValue: number;
  completedValue: number;
}
