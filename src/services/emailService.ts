import sgMail from '@sendgrid/mail';
import { EmailRequest, EmailResponse, SendGridConfig } from '../types/email.js';

class EmailService {
  private isInitialized = false;

  initialize(config: SendGridConfig): void {
    if (!config.apiKey) {
      throw new Error('SendGrid API key is required');
    }
    
    sgMail.setApiKey(config.apiKey);
    this.isInitialized = true;
  }

  async sendEmail(emailData: EmailRequest): Promise<EmailResponse> {
    if (!this.isInitialized) {
      throw new Error('Email service not initialized. Please set SENDGRID_API_KEY environment variable.');
    }

    try {
      const msg: any = {
        to: emailData.to,
        from: emailData.from,
        subject: emailData.subject,
      };

      // Add content (text or html)
      if (emailData.text && emailData.html) {
        msg.content = [
          { type: 'text/plain', value: emailData.text },
          { type: 'text/html', value: emailData.html }
        ];
      } else if (emailData.text) {
        msg.content = [{ type: 'text/plain', value: emailData.text }];
      } else if (emailData.html) {
        msg.content = [{ type: 'text/html', value: emailData.html }];
      }

      // Add optional fields only if they exist
      if (emailData.cc) msg.cc = emailData.cc;
      if (emailData.bcc) msg.bcc = emailData.bcc;
      if (emailData.replyTo) msg.replyTo = emailData.replyTo;

      const response = await sgMail.send(msg);
      
      return {
        success: true,
        message: 'Email sent successfully',
        messageId: response[0].headers['x-message-id'] as string
      };
    } catch (error: any) {
      console.error('SendGrid error:', error);
      
      return {
        success: false,
        message: 'Failed to send email',
        error: error.message || 'Unknown error occurred'
      };
    }
  }
}

export const emailService = new EmailService();
