
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, AlertTriangle, Calendar, Clock } from "lucide-react";
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
    const checkAlerts = () => {
      const today = new Date();
      
      const duesToday = projects.filter(project => {
        if (project.status === 'Finalizado' || project.status === 'Cancelado') return false;
        return isToday(new Date(project.endDate));
      });

      const overdue = projects.filter(project => {
        if (project.status === 'Finalizado' || project.status === 'Cancelado') return false;
        const endDate = new Date(project.endDate);
        return isPast(endDate) && !isToday(endDate);
      });

      setAlerts({ duesToday, overdue });
      
      if (duesToday.length > 0 || overdue.length > 0) {
        setIsVisible(true);
      }
    };

    checkAlerts();
  }, [projects]);

  const getDaysOverdue = (endDate: string) => {
    return Math.abs(differenceInDays(new Date(), new Date(endDate)));
  };

  if (!isVisible || (alerts.duesToday.length === 0 && alerts.overdue.length === 0)) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-50 w-96 max-w-[90vw]">
      <Card className="border-red-200 bg-red-50 shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-red-800 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              🚨 Alertas de Prazo
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-6 w-6 p-0 hover:bg-red-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {alerts.duesToday.length > 0 && (
            <div>
              <div className="flex items-center mb-2">
                <Calendar className="w-4 h-4 mr-2 text-orange-600" />
                <span className="font-medium text-orange-800">Vencem Hoje ({alerts.duesToday.length})</span>
              </div>
              <div className="space-y-2">
                {alerts.duesToday.map((project) => (
                  <div key={project.id} className="bg-white p-3 rounded border border-orange-200">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-medium text-gray-900 text-sm">{project.name}</p>
                      <Badge className="bg-orange-100 text-orange-800 text-xs">
                        Hoje
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600">Cliente: {project.client}</p>
                    {project.team.length > 0 && (
                      <p className="text-xs text-gray-600">Responsável: {project.team[0]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {alerts.overdue.length > 0 && (
            <div>
              <div className="flex items-center mb-2">
                <Clock className="w-4 h-4 mr-2 text-red-600" />
                <span className="font-medium text-red-800">Em Atraso ({alerts.overdue.length})</span>
              </div>
              <div className="space-y-2">
                {alerts.overdue.slice(0, 5).map((project) => (
                  <div key={project.id} className="bg-white p-3 rounded border border-red-200">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-medium text-gray-900 text-sm">{project.name}</p>
                      <Badge className="bg-red-100 text-red-800 text-xs">
                        {getDaysOverdue(project.endDate)} dias
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600">Cliente: {project.client}</p>
                    {project.team.length > 0 && (
                      <p className="text-xs text-gray-600">Responsável: {project.team[0]}</p>
                    )}
                  </div>
                ))}
                {alerts.overdue.length > 5 && (
                  <p className="text-xs text-gray-600 text-center mt-2">
                    +{alerts.overdue.length - 5} projetos em atraso
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-red-200">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="w-full text-red-700 border-red-300 hover:bg-red-100"
            >
              Entendi
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
