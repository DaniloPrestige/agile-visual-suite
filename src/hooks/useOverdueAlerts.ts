
import { useState, useEffect } from 'react';
import { Project } from '../types/project';

const ALERT_COOLDOWN_MS = 60 * 60 * 1000; // 60 minutos
const LAST_ALERT_KEY = 'agile-canvas-last-overdue-alert';

export function useOverdueAlerts(projects: Project[]) {
  const [shouldShowAlert, setShouldShowAlert] = useState(false);

  useEffect(() => {
    const overdueProjects = projects.filter(p => {
      const endDate = new Date(p.endDate);
      const today = new Date();
      return endDate < today && p.status !== 'Finalizado' && p.status !== 'Cancelado' && p.status !== 'Excluído';
    });

    if (overdueProjects.length === 0) {
      setShouldShowAlert(false);
      return;
    }

    const lastAlertTime = localStorage.getItem(LAST_ALERT_KEY);
    const now = Date.now();

    if (!lastAlertTime || (now - parseInt(lastAlertTime)) > ALERT_COOLDOWN_MS) {
      setShouldShowAlert(true);
      localStorage.setItem(LAST_ALERT_KEY, now.toString());
    } else {
      setShouldShowAlert(false);
    }
  }, [projects]);

  const dismissAlert = () => {
    setShouldShowAlert(false);
  };

  return { shouldShowAlert, dismissAlert };
}
