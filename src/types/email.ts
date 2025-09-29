export interface EmailRequest {
  to: string | string[];
  from: string;
  subject: string;
  text?: string;
  html?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
}

export interface EmailResponse {
  success: boolean;
  message: string;
  messageId?: string;
  error?: string;
}

export interface SendGridConfig {
  apiKey: string;
  fromEmail: string;
  fromName?: string;
}
