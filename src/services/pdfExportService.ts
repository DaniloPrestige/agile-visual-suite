
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

    // Header with company name and logo area
    pdf.setFillColor(66, 133, 244); // Blue header
    pdf.rect(0, 0, pageWidth, 40, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PRESTIGE COSMETICOS', margin, 25);
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('RELATORIO EXECUTIVO DE PROJETOS', margin, 32);
    pdf.text(`Gerado em: ${new Date().toLocaleString('pt-BR')} | Responsavel: Sistema`, margin, 37);

    yPosition = 50;

    // Executive Summary Box
    pdf.setDrawColor(100, 100, 100);
    pdf.setLineWidth(0.5);
    pdf.rect(margin, yPosition, pageWidth - 2 * margin, 35);
    
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('RESUMO EXECUTIVO', margin + 5, yPosition + 10);

    const convertedInitial = currencyService.convert(project.initialValue || 0, project.currency, currentCurrency);
    const convertedFinal = currencyService.convert(project.finalValue || 0, project.currency, currentCurrency);

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    // Left column
    pdf.text(`Total de Projetos: 1`, margin + 5, yPosition + 18);
    pdf.text(`Projetos Concluidos: ${project.status === 'Finalizado' ? '1 (100%)' : '0 (0%)'}`, margin + 5, yPosition + 23);
    pdf.text(`Projetos Ativos: ${project.status === 'Em andamento' ? '1' : '0'}`, margin + 5, yPosition + 28);
    pdf.text(`Taxa de Entrega no Prazo: ${project.status === 'Finalizado' ? '100%' : '0%'}`, margin + 5, yPosition + 33);

    // Right column
    pdf.text(`Valor Total do Portfolio: ${currencyService.formatCurrency(convertedFinal || convertedInitial, currentCurrency)}`, pageWidth/2 + 10, yPosition + 18);
    pdf.text(`Progresso Medio: ${project.progress}%`, pageWidth/2 + 10, yPosition + 23);
    pdf.text(`Projetos Atrasados: ${project.status === 'Atrasado' ? '1' : '0'}`, pageWidth/2 + 10, yPosition + 28);

    yPosition += 45;

    // Project Details Box
    pdf.rect(margin, yPosition, pageWidth - 2 * margin, 25);
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`1. ${project.name}`, margin + 5, yPosition + 10);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Cliente: ${project.client} | Responsavel: ${project.team.length > 0 ? project.team[0] : 'Nao definido'}`, margin + 5, yPosition + 16);
    pdf.text(`Status: ${project.status} | Prioridade: ${project.phase} | Progresso: ${project.progress}%`, margin + 5, yPosition + 21);

    yPosition += 35;

    // Project Details Section
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DETALHES DO PROJETO', margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    // Two columns layout
    const leftCol = margin;
    const rightCol = pageWidth / 2 + 10;
    
    pdf.text(`Inicio: ${new Date(project.startDate).toLocaleDateString('pt-BR')}`, leftCol, yPosition);
    pdf.text(`Fim Previsto: ${new Date(project.endDate).toLocaleDateString('pt-BR')}`, rightCol, yPosition);
    yPosition += 8;
    
    pdf.text(`Fase: ${project.phase}`, leftCol, yPosition);
    pdf.text(`Valor: ${currencyService.formatCurrency(convertedFinal || convertedInitial, currentCurrency)}`, rightCol, yPosition);
    yPosition += 15;

    // Progress bar representation
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Progresso:', leftCol, yPosition);
    
    // Draw progress bar
    const barWidth = 100;
    const barHeight = 8;
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(leftCol + 25, yPosition - 5, barWidth, barHeight);
    pdf.setFillColor(100, 200, 100);
    pdf.rect(leftCol + 25, yPosition - 5, (barWidth * project.progress) / 100, barHeight, 'F');
    
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${project.progress}%`, leftCol + 25 + barWidth + 5, yPosition);
    yPosition += 20;

    // Description
    if (project.description) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DESCRICAO:', margin, yPosition);
      yPosition += 8;
      
      pdf.setFont('helvetica', 'normal');
      const descriptionLines = pdf.splitTextToSize(project.description, pageWidth - 2 * margin);
      pdf.text(descriptionLines, margin, yPosition);
      yPosition += descriptionLines.length * 5 + 10;
    }

    // Team
    if (project.team.length > 0) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('EQUIPE:', margin, yPosition);
      yPosition += 8;
      
      pdf.setFont('helvetica', 'normal');
      project.team.forEach(member => {
        pdf.text(`- ${member}`, margin + 5, yPosition);
        yPosition += 5;
      });
      yPosition += 8;
    }

    // Tasks Summary
    if (project.tasks.length > 0) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('TAREFAS:', margin, yPosition);
      yPosition += 8;
      
      const completedTasks = project.tasks.filter(t => t.completed).length;
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Total: ${project.tasks.length} | Concluidas: ${completedTasks} | Pendentes: ${project.tasks.length - completedTasks}`, margin, yPosition);
      yPosition += 8;

      // Show first 5 tasks
      project.tasks.slice(0, 5).forEach(task => {
        const status = task.completed ? '[X]' : '[ ]';
        pdf.text(`${status} ${task.title}`, margin + 5, yPosition);
        yPosition += 5;
      });

      if (project.tasks.length > 5) {
        pdf.text(`... e mais ${project.tasks.length - 5} tarefas`, margin + 5, yPosition);
        yPosition += 5;
      }
      yPosition += 8;
    }

    // Risks
    if (project.risks.length > 0) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('RISCOS IDENTIFICADOS:', margin, yPosition);
      yPosition += 8;
      
      pdf.setFont('helvetica', 'normal');
      project.risks.slice(0, 3).forEach(risk => {
        pdf.text(`- ${risk.name} (Impacto: ${risk.impact} - Probabilidade: ${risk.probability || 'N/A'})`, margin + 5, yPosition);
        yPosition += 5;
      });

      if (project.risks.length > 3) {
        pdf.text(`... e mais ${project.risks.length - 3} riscos`, margin + 5, yPosition);
        yPosition += 5;
      }
      yPosition += 8;
    }

    // Tags
    if (project.tags.length > 0) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('TAGS:', margin, yPosition);
      yPosition += 8;
      
      pdf.setFont('helvetica', 'normal');
      pdf.text(project.tags.map(tag => `#${tag}`).join(', '), margin, yPosition);
      yPosition += 8;
    }

    // Footer
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'italic');
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Relatorio gerado em ${new Date().toLocaleString('pt-BR')}`, margin, pageHeight - 15);
    pdf.text('Agile Canvas - Sistema de Gestao de Projetos', pageWidth - margin - 60, pageHeight - 15);
  }
}
