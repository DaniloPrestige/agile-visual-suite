
import html2canvas from 'html2canvas';
import { Project } from '../types/project';
import { currencyService } from './currencyService';

export class PDFExportService {
  static async exportProjects(projects: Project[], currentCurrency: 'BRL' | 'USD' | 'EUR' = 'BRL') {
    try {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      for (let i = 0; i < projects.length; i++) {
        if (i > 0) pdf.addPage();
        await this.addProjectPage(pdf, projects[i], currentCurrency);
      }
      
      const fileName = projects.length === 1 
        ? `projeto-${projects[0].name.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`
        : `projetos-export-${new Date().toISOString().split('T')[0]}.pdf`;
      
      pdf.save(fileName);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Erro ao exportar PDF. Tente novamente.');
    }
  }

  private static async addProjectPage(pdf: any, project: Project, currentCurrency: 'BRL' | 'USD' | 'EUR') {
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 20;
    let yPosition = margin;

    // Header
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('RELATÓRIO DO PROJETO', margin, yPosition);
    yPosition += 15;

    // Project Name
    pdf.setFontSize(16);
    pdf.text(project.name, margin, yPosition);
    yPosition += 10;

    // Basic Info
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    
    const basicInfo = [
      ['Cliente:', project.client],
      ['Status:', project.status],
      ['Fase:', project.phase],
      ['Data de Início:', new Date(project.startDate).toLocaleDateString('pt-BR')],
      ['Previsão de Conclusão:', new Date(project.endDate).toLocaleDateString('pt-BR')],
      ['Progresso:', `${project.progress}%`]
    ];

    basicInfo.forEach(([label, value]) => {
      pdf.setFont('helvetica', 'bold');
      pdf.text(label, margin, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(value, margin + 40, yPosition);
      yPosition += 7;
    });

    yPosition += 5;

    // Financial Info
    if (project.initialValue || project.finalValue) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('INFORMAÇÕES FINANCEIRAS', margin, yPosition);
      yPosition += 10;

      const convertedInitial = currencyService.convert(project.initialValue || 0, project.currency, currentCurrency);
      const convertedFinal = currencyService.convert(project.finalValue || 0, project.currency, currentCurrency);

      pdf.setFont('helvetica', 'normal');
      pdf.text(`Valor Inicial: ${currencyService.formatCurrency(convertedInitial, currentCurrency)}`, margin, yPosition);
      yPosition += 7;
      pdf.text(`Valor Final: ${currencyService.formatCurrency(convertedFinal, currentCurrency)}`, margin, yPosition);
      yPosition += 10;
    }

    // Description
    if (project.description) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('DESCRIÇÃO', margin, yPosition);
      yPosition += 10;
      
      pdf.setFont('helvetica', 'normal');
      const descriptionLines = pdf.splitTextToSize(project.description, pageWidth - 2 * margin);
      pdf.text(descriptionLines, margin, yPosition);
      yPosition += descriptionLines.length * 5 + 10;
    }

    // Team
    if (project.team.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('EQUIPE', margin, yPosition);
      yPosition += 10;
      
      pdf.setFont('helvetica', 'normal');
      project.team.forEach(member => {
        pdf.text(`• ${member}`, margin + 5, yPosition);
        yPosition += 7;
      });
      yPosition += 5;
    }

    // Tasks
    if (project.tasks.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('TAREFAS', margin, yPosition);
      yPosition += 10;
      
      const completedTasks = project.tasks.filter(t => t.completed).length;
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Total: ${project.tasks.length} | Concluídas: ${completedTasks} | Pendentes: ${project.tasks.length - completedTasks}`, margin, yPosition);
      yPosition += 10;

      project.tasks.slice(0, 10).forEach(task => {
        const status = task.completed ? '✓' : '○';
        pdf.text(`${status} ${task.title}`, margin + 5, yPosition);
        yPosition += 6;
      });

      if (project.tasks.length > 10) {
        pdf.text(`... e mais ${project.tasks.length - 10} tarefas`, margin + 5, yPosition);
        yPosition += 6;
      }
      yPosition += 5;
    }

    // Risks
    if (project.risks.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('RISCOS IDENTIFICADOS', margin, yPosition);
      yPosition += 10;
      
      pdf.setFont('helvetica', 'normal');
      project.risks.slice(0, 5).forEach(risk => {
        pdf.text(`• ${risk.name} (Impacto: ${risk.impact} - Probabilidade: ${risk.probability || 'N/A'})`, margin + 5, yPosition);
        yPosition += 6;
      });

      if (project.risks.length > 5) {
        pdf.text(`... e mais ${project.risks.length - 5} riscos`, margin + 5, yPosition);
        yPosition += 6;
      }
      yPosition += 5;
    }

    // Tags
    if (project.tags.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('TAGS', margin, yPosition);
      yPosition += 10;
      
      pdf.setFont('helvetica', 'normal');
      pdf.text(project.tags.map(tag => `#${tag}`).join(', '), margin, yPosition);
      yPosition += 10;
    }

    // Footer
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'italic');
    pdf.text(`Relatório gerado em ${new Date().toLocaleString('pt-BR')}`, margin, pageHeight - 15);
    pdf.text('Agile Canvas - Sistema de Gestão de Projetos', pageWidth - margin - 80, pageHeight - 15);
  }
}
