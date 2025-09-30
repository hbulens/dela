import { FastifyRequest, FastifyReply } from 'fastify';
import { emailService } from '../services/emailService.js';
import { EmailRequest } from '../types/email.js';
import { EmailTemplate } from '../templates/emailTemplate.js';

export class MailerController {
    /**
     * POST /mailer - Send emails using SendGrid
     * Handles both regular email requests and Dime.Scheduler appointment notifications
     */
    async sendEmail(request: FastifyRequest, reply: FastifyReply) {
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

            const body = request.body as any;

            // Check if this is a Dime.Scheduler appointment notification
            if (this.isDimeSchedulerAppointment(body)) {
                console.log('Detected Dime.Scheduler appointment notification');
                return this.handleAppointmentNotification(body, reply);
            }

            // Validate required fields for regular email
            const emailData = body as EmailRequest & {
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
                // Additional fields
                jobDescription?: string;
                taskDescription?: string;
                body?: string;
                contactAddress?: string;
                contactTelephone?: string;
                contactEmail?: string;
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
                    projectName: emailData.projectName,
                    // Additional fields
                    jobDescription: emailData.jobDescription,
                    taskDescription: emailData.taskDescription,
                    body: emailData.body,
                    contactAddress: emailData.contactAddress,
                    contactTelephone: emailData.contactTelephone,
                    contactEmail: emailData.contactEmail
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

    /**
     * Check if the request body is a Dime.Scheduler appointment
     */
    private isDimeSchedulerAppointment(body: any): boolean {
        return body &&
            typeof body.Id === 'number' &&
            typeof body.AppointmentNo === 'string' &&
            typeof body.StartDate === 'string' &&
            typeof body.EndDate === 'string' &&
            typeof body.Subject === 'string' &&
            body.Task !== undefined;
    }

    /**
     * Handle Dime.Scheduler appointment notification
     */
    private async handleAppointmentNotification(appointment: any, reply: FastifyReply) {
        try {
            console.log('Processing Dime.Scheduler appointment:', {
                id: appointment.Id,
                appointmentNo: appointment.AppointmentNo,
                subject: appointment.Subject,
                category: appointment.Category?.Name,
                resources: appointment.Resources?.length || 0
            });

            // Get recipient email from environment variable
            const recipientEmail = process.env.APPOINTMENT_RECIPIENT_EMAIL || process.env.DEFAULT_RECIPIENT_EMAIL;

            if (!recipientEmail) {
                return reply.status(400).send({
                    success: false,
                    message: 'No recipient email configured. Set APPOINTMENT_RECIPIENT_EMAIL or DEFAULT_RECIPIENT_EMAIL environment variable.'
                });
            }

            // Format dates for display
            const startDate = this.formatDate(appointment.StartDate);
            const endDate = this.formatDate(appointment.EndDate);

            // Determine email subject based on category
            const categoryName = appointment.Category?.Name || appointment.Subject;
            const emailSubject = `${appointment.Subject}`;

            // Prepare template data with all required fields
            const templateData = {
                subject: appointment.Subject,
                message: `U heeft een nieuwe afspraak in Dime.Scheduler. Bekijk de details hieronder.`,
                companyName: 'Dime.Scheduler',
                logoUrl: process.env.LOGO_URL || 'https://s3-eu-west-1.amazonaws.com/tpd/logos/5d1230ebbad7ae0001197d19/0x0.png',
                primaryColor: '#0080a6', // Always use the main brand color
                // Core fields
                jobDescription: appointment.Task?.Job?.Description,
                taskDescription: appointment.Task?.Description,
                body: appointment.Body,
                // Task assignment fields
                taskTitle: appointment.Subject,
                startDate: startDate,
                endDate: endDate,
                priority: this.determinePriority(appointment.Importance || 0),
                assignedBy: appointment.CreatedUser || 'Systeem',
                taskId: appointment.AppointmentNo,
                projectName: appointment.Task?.Job?.JobNo,
                // Contact information (from custom fields if available)
                contactAddress: appointment.ContactAddress || appointment.Task?.ContactAddress || appointment.Task?.Job?.ContactAddress,
                contactTelephone: appointment.ContactTelephone || appointment.Task?.ContactTelephone || appointment.Task?.Job?.ContactTelephone,
                contactEmail: appointment.ContactEmail || appointment.Task?.ContactEmail || appointment.Task?.Job?.ContactEmail
            };

            // Generate email content
            const emailData: EmailRequest = {
                to: recipientEmail,
                from: process.env.FROM_EMAIL || 'noreply@dimescheduler.com',
                subject: emailSubject,
                html: EmailTemplate.generateHTML(templateData),
                text: EmailTemplate.generateText(templateData)
            };

            // Log email details
            console.log('Sending appointment notification:', {
                to: emailData.to,
                subject: emailData.subject,
                appointmentId: appointment.Id,
                category: categoryName
            });

            // Send email
            const result = await emailService.sendEmail(emailData);

            if (result.success) {
                return reply.send({
                    success: true,
                    message: 'Appointment notification sent successfully',
                    messageId: result.messageId,
                    appointment: {
                        id: appointment.Id,
                        appointmentNo: appointment.AppointmentNo,
                        subject: appointment.Subject
                    }
                });
            } else {
                return reply.status(500).send({
                    success: false,
                    message: 'Failed to send appointment notification',
                    error: result.error
                });
            }
        } catch (error: any) {
            console.error('Error processing appointment notification:', error);
            return reply.status(500).send({
                success: false,
                message: 'Error processing appointment notification',
                error: error.message
            });
        }
    }

    /**
     * Format date to Dutch locale
     */
    private formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleString('nl-NL', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Determine priority level from importance value
     */
    private determinePriority(importance: number): string {
        if (importance >= 8) return 'Hoog';
        if (importance >= 4) return 'Gemiddeld';
        return 'Laag';
    }
}
