// Simple test script to verify the mailer endpoint
// Run this after starting the server with: node test-email.js

const testEmail = async () => {
  try {
    console.log('Testing email...');
    const response = await fetch('http://localhost:3000/mailer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: 'hendrik@dimescheduler.com',
        subject: 'Test Email from Fastify API',
        text: 'This is a test email sent from the Fastify webhook API.',
        html: '<p>This is a <strong>test email</strong> sent from the Fastify webhook API.</p>'
      })
    });

    const result = await response.json();
    console.log('Email test result:', result);
  } catch (error) {
    console.error('Error testing email:', error);
  }
};

testEmail();
