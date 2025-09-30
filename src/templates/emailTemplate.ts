export interface EmailTemplateData {
  recipientName?: string;
  senderName?: string;
  subject?: string;
  message?: string;
  companyName?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  // Task assignment specific fields
  taskTitle?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  description?: string;
  priority?: string;
  assignedBy?: string;
  taskId?: string;
  projectName?: string;
}

export class EmailTemplate {
  private static defaultColors = {
    primary: '#0080a6',
    secondary: '#64748b',
    background: '#f8fafc',
    text: '#1e293b',
    border: '#e2e8f0'
  };

  static generateHTML(data: EmailTemplateData): string {
    const colors = {
      primary: data.primaryColor || this.defaultColors.primary,
      secondary: data.secondaryColor || this.defaultColors.secondary,
      background: this.defaultColors.background,
      text: this.defaultColors.text,
      border: this.defaultColors.border
    };

    // Generate task assignment content if task data is provided
    const isTaskAssignment = data.taskTitle || data.startDate || data.endDate;
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.subject || 'Task Assignment - Dime.Scheduler'}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: ${colors.text};
            background-color: ${colors.background};
        }
        .container {
            max-width: 650px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        .header {
            background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%);
            color: white;
            padding: 40px 32px 20px 32px;
            text-align: center;
            position: relative;
        }
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 8px;
            position: relative;
            z-index: 1;
        }
        .company-name {
            font-size: 16px;
            opacity: 0.9;
            position: relative;
            z-index: 1;
        }
        .content {
            padding: 20px 32px 40px 32px;
        }
        .greeting {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 20px;
            color: ${colors.primary};
        }
        .message {
            font-size: 16px;
            line-height: 1.7;
            margin-bottom: 32px;
            color: #374151;
        }
        .task-card {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 24px;
            margin: 24px 0;
            box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .task-title {
            font-size: 18px;
            font-weight: 700;
            color: ${colors.primary};
            margin-bottom: 16px;
            display: flex;
            align-items: center;
        }
        .task-title::before {
            content: '📋';
            margin-right: 8px;
            font-size: 20px;
        }
        .task-details {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .task-details li {
            display: flex;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
            font-size: 14px;
        }
        .task-details li:last-child {
            border-bottom: none;
        }
        .task-details li::before {
            content: attr(data-icon);
            margin-right: 12px;
            font-size: 16px;
            width: 20px;
            text-align: center;
        }
        .task-label {
            font-weight: 600;
            color: #374151;
            min-width: 100px;
        }
        .task-value {
            color: #6b7280;
            flex: 1;
        }
        .priority-high {
            background-color: #fef2f2;
            color: #dc2626;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
        }
        .priority-medium {
            background-color: #fffbeb;
            color: #d97706;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
        }
        .priority-low {
            background-color: #f0fdf4;
            color: #16a34a;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
        }
        .action-button {
            display: inline-block;
            background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%);
            color: white;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 24px 0;
            text-align: center;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            transition: all 0.2s ease;
        }
        .action-button:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 8px -1px rgba(0, 0, 0, 0.15);
        }
        .footer {
            background-color: ${colors.background};
            padding: 32px;
            text-align: center;
            border-top: 1px solid ${colors.border};
        }
        .footer-text {
            font-size: 14px;
            color: ${colors.secondary};
            margin-bottom: 16px;
        }
        .footer-links {
            margin-top: 20px;
        }
        .footer-links a {
            color: ${colors.primary};
            text-decoration: none;
            margin: 0 16px;
            font-size: 14px;
            font-weight: 500;
        }
        .footer-links a:hover {
            text-decoration: underline;
        }
        .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent 0%, ${colors.border} 50%, transparent 100%);
            margin: 24px 0;
        }
        @media (max-width: 600px) {
            .container {
                margin: 0;
                border-radius: 0;
            }
            .header, .content, .footer {
                padding: 24px 20px;
            }
            .task-card {
                padding: 20px;
            }
            .task-details li {
                flex-direction: column;
                align-items: flex-start;
            }
            .task-label {
                min-width: auto;
                margin-bottom: 4px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">${data.logoUrl ? `<img src="${data.logoUrl}" alt="Logo" style="height: 48px;">` : '📅'}</div>
            <div class="company-name">${data.companyName || 'Dime.Scheduler'}</div>
        </div>
        
        <div class="content">
            <div class="greeting">
                Beste,
            </div>
            
            <div class="message">
                ${isTaskAssignment 
                  ? 'Dit is om u te informeren dat een nieuwe taak aan u is toegewezen. Bekijk de details hieronder en zorg ervoor dat u beschikbaar bent voor de geplande tijd.'
                  : (data.message || 'Bedankt voor het gebruik van onze service. Dit is een geautomatiseerd bericht van de Dime.Scheduler API.')
                }
            </div>
            
            ${isTaskAssignment ? `
            <div class="task-card">
                <div class="task-title">${data.taskTitle || '{Taak Titel}'}</div>
                <ul class="task-details">
                    <li data-icon="📅">
                        <span class="task-label">Startdatum:</span>
                        <span class="task-value">${data.startDate || '{Startdatum}'}</span>
                    </li>
                    <li data-icon="🏁">
                        <span class="task-label">Einddatum:</span>
                        <span class="task-value">${data.endDate || '{Einddatum}'}</span>
                    </li>
                    <li data-icon="📍">
                        <span class="task-label">Locatie:</span>
                        <span class="task-value">${data.location || '{Locatie}'}</span>
                    </li>
                    <li data-icon="📝">
                        <span class="task-label">Beschrijving:</span>
                        <span class="task-value">${data.description || '{Taak Beschrijving}'}</span>
                    </li>
                    <li data-icon="⚡">
                        <span class="task-label">Prioriteit:</span>
                        <span class="task-value">
                            <span class="priority-${(data.priority || 'medium').toLowerCase()}">${data.priority || 'Gemiddeld'}</span>
                        </span>
                    </li>
                    <li data-icon="👤">
                        <span class="task-label">Toegewezen door:</span>
                        <span class="task-value">${data.assignedBy || '{Toegewezen door}'}</span>
                    </li>
                    <li data-icon="🆔">
                        <span class="task-label">Taak ID:</span>
                        <span class="task-value">${data.taskId || '{Taak ID}'}</span>
                    </li>
                    <li data-icon="📁">
                        <span class="task-label">Project:</span>
                        <span class="task-value">${data.projectName || '{Project Naam}'}</span>
                    </li>
                </ul>
            </div>
            
            <div style="text-align: center;">
                <a href="#" class="action-button">Bekijk Taak Details</a>
            </div>
            ` : ''}
            
        </div>
        
        <div class="footer">
            <div class="footer-text">
                Deze e-mail is automatisch verzonden door het Dime.Scheduler API systeem.
            </div>
            <div class="footer-links">
                <a href="https://dimescheduler.com">Bezoek Website</a>
                <a href="mailto:support@dimescheduler.com">Contact Ondersteuning</a>
                <a href="https://dimescheduler.com/docs">Documentatie</a>
            </div>
        </div>
    </div>
</body>
</html>`;
  }

  static generateText(data: EmailTemplateData): string {
    const isTaskAssignment = data.taskTitle || data.startDate || data.endDate;
    
    return `
${data.companyName || 'Dime.Scheduler'} - ${data.subject || 'Taak Toewijzing'}

Beste,

${isTaskAssignment 
  ? 'Dit is om u te informeren dat een nieuwe taak aan u is toegewezen. Bekijk de details hieronder en zorg ervoor dat u beschikbaar bent voor de geplande tijd.'
  : (data.message || 'Bedankt voor het gebruik van onze service. Dit is een geautomatiseerd bericht van de Dime.Scheduler API.')
}

${isTaskAssignment ? `
TAAK TOEWIJZING DETAILS:
========================

Taak Titel: ${data.taskTitle || '{Taak Titel}'}
Startdatum: ${data.startDate || '{Startdatum}'}
Einddatum: ${data.endDate || '{Einddatum}'}
Locatie: ${data.location || '{Locatie}'}
Beschrijving: ${data.description || '{Taak Beschrijving}'}
Prioriteit: ${data.priority || 'Gemiddeld'}
Toegewezen door: ${data.assignedBy || '{Toegewezen door}'}
Dossier: ${data.projectName || '{Project Naam}'}

Bekijk de taak details en bevestig uw beschikbaarheid.
` : ''}

---
Deze e-mail is automatisch verzonden door het Dime.Scheduler API systeem.
Bezoek: https://dimescheduler.com
Ondersteuning: support@dimescheduler.com
    `.trim();
  }
}
