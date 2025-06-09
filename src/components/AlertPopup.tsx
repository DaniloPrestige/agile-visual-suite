
import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X, AlertTriangle, Calendar } from "lucide-react";
import { Project } from "../types/project";
import { differenceInDays, isToday, isPast } from "date-fns";

interface AlertPopupProps {
  projects: Project[];
}

export function AlertPopup({ projects }: AlertPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [alerts, setAlerts] = useState<{
    duesToday: Project[];
    overdue: Project[];
  }>({ duesToday: [], overdue: [] });

  useEffect(() => {
    const duesToday = projects.filter(project => {
      const endDate = new Date(project.endDate);
      return isToday(endDate) && project.status !== 'Finalizado' && project.status !== 'Cancelado';
    });

    const overdue = projects.filter(project => {
      const endDate = new Date(project.endDate);
      return isPast(endDate) && !isToday(endDate) && project.status !== 'Finalizado' && project.status !== 'Cancelado';
    });

    if (duesToday.length > 0 || overdue.length > 0) {
      setAlerts({ duesToday, overdue });
      setIsVisible(true);
    }
  }, [projects]);

  if (!isVisible) return null;

  const getDaysOverdue = (endDate: string) => {
    return Math.abs(differenceInDays(new Date(), new Date(endDate)));
  };

  return (
    <div className="fixed top-20 right-4 z-50 w-80 max-w-sm">
      <Alert className="bg-yellow-50 border-yellow-200">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertDescription>
          <div className="flex justify-between items-start mb-3">
            <h4 className="font-semibold text-yellow-800">Alertas de Prazos</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-6 w-6 p-0 text-yellow-600 hover:text-yellow-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-3">
            {alerts.duesToday.length > 0 && (
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <Calendar className="h-3 w-3" />
                  <span className="text-sm font-medium">Vencem hoje:</span>
                </div>
                {alerts.duesToday.map(project => (
                  <div key={project.id} className="text-xs bg-white p-2 rounded border">
                    <div className="font-medium">{project.name}</div>
                    <div className="text-gray-600">
                      Cliente: {project.client}
                      {project.team.length > 0 && (
                        <div>Responsável: {project.team[0]}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {alerts.overdue.length > 0 && (
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <AlertTriangle className="h-3 w-3" />
                  <span className="text-sm font-medium">Atrasados:</span>
                </div>
                {alerts.overdue.slice(0, 3).map(project => (
                  <div key={project.id} className="text-xs bg-white p-2 rounded border">
                    <div className="font-medium">{project.name}</div>
                    <div className="text-gray-600">
                      Cliente: {project.client}
                      <div className="text-red-600 font-medium">
                        {getDaysOverdue(project.endDate)} dias de atraso
                      </div>
                      {project.team.length > 0 && (
                        <div>Responsável: {project.team[0]}</div>
                      )}
                    </div>
                  </div>
                ))}
                {alerts.overdue.length > 3 && (
                  <div className="text-xs text-gray-500 mt-1">
                    +{alerts.overdue.length - 3} outros projetos atrasados
                  </div>
                )}
              </div>
            )}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
