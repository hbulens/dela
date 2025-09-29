import { FastifyRequest, FastifyReply } from 'fastify';
import { emailService } from '../services/emailService.js';
import { EmailRequest } from '../types/email.js';
import { EmailTemplate } from '../templates/emailTemplate.js';

export class MailerController {
    /**
     * POST /mailer - Send emails using SendGrid
     */
    static async sendEmail(request: FastifyRequest, reply: FastifyReply) {
        try {
            console.log('Sending email...');
            // Check if request has body and correct content type
            const contentType = request.headers['content-type'];
            if (!contentType || !contentType.includes('application/json')) {
                return reply.status(400).send({
                    success: false,
                    message: 'Content-Type must be application/json'
                });
            }

      // Validate required fields
      const emailData = request.body as EmailRequest & {
        recipientName?: string;
        senderName?: string;
        companyName?: string;
        logoUrl?: string;
        primaryColor?: string;
        secondaryColor?: string;
        useTemplate?: boolean;
        message?: string;
        // Task assignment fields
        taskTitle?: string;
        startDate?: string;
        endDate?: string;
        location?: string;
        description?: string;
        priority?: string;
        assignedBy?: string;
        taskId?: string;
        projectName?: string;
      };

            if (!emailData.to) {
                return reply.status(400).send({
                    success: false,
                    message: 'Recipient email address (to) is required'
                });
            }

            if (!emailData.subject) {
                return reply.status(400).send({
                    success: false,
                    message: 'Email subject is required'
                });
            }

            // Set default from email if not provided
            const fromEmail = process.env.FROM_EMAIL || 'noreply@example.com';
            if (!emailData.from) {
                emailData.from = fromEmail;
            }

            // Generate beautiful HTML template if requested or if no content provided
            if (emailData.useTemplate || (!emailData.text && !emailData.html)) {
        const templateData = {
          recipientName: emailData.recipientName,
          senderName: emailData.senderName || 'Dime.Scheduler Team',
          subject: emailData.subject,
          message: emailData.text || emailData.message || 'Thank you for using our service. This is an automated message from the Dime.Scheduler API.',
          companyName: emailData.companyName || 'Dime.Scheduler',
          logoUrl: emailData.logoUrl,
          primaryColor: emailData.primaryColor,
          secondaryColor: emailData.secondaryColor,
          // Task assignment data
          taskTitle: emailData.taskTitle,
          startDate: emailData.startDate,
          endDate: emailData.endDate,
          location: emailData.location,
          description: emailData.description,
          priority: emailData.priority,
          assignedBy: emailData.assignedBy,
          taskId: emailData.taskId,
          projectName: emailData.projectName
        };

                emailData.html = EmailTemplate.generateHTML(templateData);
                emailData.text = EmailTemplate.generateText(templateData);
            }

            // Log the email request for debugging
            console.log('Email request received:', {
                to: emailData.to,
                from: emailData.from,
                subject: emailData.subject
            });

            // Send email
            const result = await emailService.sendEmail(emailData);

            if (result.success) {
                return reply.send({
                    success: true,
                    message: result.message,
                    messageId: result.messageId
                });
            } else {
                return reply.status(500).send({
                    success: false,
                    message: result.message,
                    error: result.error
                });
            }
        } catch (error) {
            console.error('Error processing email request:', error);
            return reply.status(500).send({
                success: false,
                message: 'Error processing email request'
            });
        }
    }
}
