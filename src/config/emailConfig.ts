import { emailService } from '../services/emailService.js';

export function initializeEmailService(): void {
  const sendGridApiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.FROM_EMAIL || 'noreply@example.com';
  const fromName = process.env.FROM_NAME || 'Fastify Webhook API';

  if (sendGridApiKey) {
    emailService.initialize({
      apiKey: sendGridApiKey,
      fromEmail,
      fromName
    });
    console.log('Email service initialized with SendGrid');
  } else {
    console.warn('SENDGRID_API_KEY not found. Email functionality will be disabled.');
  }
}
