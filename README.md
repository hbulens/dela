# Fastify Webhook API

A fast, TypeScript-based Fastify server that provides webhook processing functionality equivalent to the Next.js API routes.

## Features

- **POST /webhook** - Receives and processes webhook data
- **GET /webhook** - Retrieves stored webhook data
- **POST /mailer** - Send emails using SendGrid
- **POST /dime/import** - Execute Dime.Scheduler stored procedures
- **POST /dime/job** - Create jobs in Dime.Scheduler
- **POST /dime/task** - Create tasks in Dime.Scheduler
- **POST /dime/job-with-task** - Create jobs with tasks in one call
- **GET /dime/test** - Test Dime.Scheduler connection
- **GET /health** - Health check endpoint
- TypeScript support with full type safety
- CORS enabled for cross-origin requests
- JSON request/response handling
- Error handling and logging
- SendGrid email integration
- Dime.Scheduler API integration

## Installation

```bash
npm install
```

## Latest Package Versions

This project uses the absolute latest stable versions of all dependencies:

- **Fastify**: ^5.6.1 (Latest major version with improved performance and security)
- **@fastify/cors**: ^11.1.0 (Latest CORS plugin with enhanced security)
- **@sendgrid/mail**: ^8.1.6 (Latest SendGrid SDK with new features)
- **TypeScript**: ^5.9.2 (Latest TypeScript with enhanced type checking)
- **Vite**: ^7.1.7 (Latest Vite 7 with Rolldown bundler and improved performance)
- **@types/node**: ^24.5.2 (Latest Node.js 24 type definitions)
- **vite-node**: ^3.2.4 (Latest Vite Node.js integration)

### Vite 7 Features

This project leverages Vite 7's new features:
- **Rolldown Bundler**: Faster builds with the new experimental Rolldown bundler
- **Node.js 22 Support**: Optimized for Node.js 22 with improved performance
- **Enhanced TypeScript Support**: Better integration with TypeScript 5.8
- **Improved Build Performance**: Faster development and production builds

## Prerequisites

- **Node.js**: Version 20.19+ or 22.12+ (required for Vite 7)
- **npm**: Version 10+ (recommended)

## Development

Start the development server:

```bash
npm run dev
```

The server will start on `http://localhost:3000` by default.

## Production

Build the project:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## API Endpoints

### POST /webhook

Receives webhook data and stores it in memory.

**Request:**
- Content-Type: `application/json`
- Body: JSON object with webhook data

**Response:**
```json
{
  "success": true,
  "message": "Webhook data received successfully",
  "data": { /* your webhook data */ }
}
```

### GET /webhook

Retrieves all stored webhook data.

**Response:**
```json
[
  {
    /* webhook data */,
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
]
```

### POST /mailer

Send emails using SendGrid.

**Request:**
- Content-Type: `application/json`
- Body: JSON object with email data

**Required fields:**
- `to` - Recipient email address(es) (string or array of strings)
- `subject` - Email subject
- `text` or `html` - Email content (at least one is required)

**Optional fields:**
- `from` - Sender email address (defaults to FROM_EMAIL env var)
- `cc` - CC recipients (string or array of strings)
- `bcc` - BCC recipients (string or array of strings)
- `replyTo` - Reply-to email address

**Example Request:**
```json
{
  "to": "recipient@example.com",
  "subject": "Test Email",
  "text": "This is a test email",
  "html": "<p>This is a <strong>test email</strong></p>"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email sent successfully",
  "messageId": "abc123-def456-ghi789"
}
```

### POST /dime/import

Execute stored procedures on Dime.Scheduler.

**Request:**
- Content-Type: `application/json`
- Body: JSON object with procedures array

**Example Request:**
```json
{
  "procedures": [
    {
      "StoredProcedureName": "mboc_upsertJob",
      "ParameterNames": [
        "SourceApp",
        "SourceType",
        "JobNo",
        "ShortDescription",
        "FreeDecimal4"
      ],
      "ParameterValues": [
        "CRONUSBE",
        "CRONUSBE",
        "JOB002",
        "Address",
        ""
      ]
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Procedures executed successfully",
  "data": "API response from Dime.Scheduler"
}
```

### POST /dime/job

Create a job in Dime.Scheduler.

**Request:**
```json
{
  "sourceApp": "CRONUSBE",
  "sourceType": "CRONUSBE",
  "jobNo": "JOB002",
  "shortDescription": "Address",
  "freeDecimal4": ""
}
```

### POST /dime/task

Create a task in Dime.Scheduler.

**Request:**
```json
{
  "sourceApp": "CRONUSBE",
  "sourceType": "CRONUSBE",
  "jobNo": "JOB002",
  "taskNo": "TASK002001",
  "shortDescription": "Test",
  "description": "Filter values",
  "useFixPlanningQty": true
}
```

### POST /dime/job-with-task

Create a job with a task in one API call.

**Request:**
```json
{
  "jobData": {
    "sourceApp": "CRONUSBE",
    "sourceType": "CRONUSBE",
    "jobNo": "JOB002",
    "shortDescription": "Address",
    "freeDecimal4": ""
  },
  "taskData": {
    "taskNo": "TASK002001",
    "taskShortDescription": "Test",
    "taskDescription": "Filter values",
    "useFixPlanningQty": true
  }
}
```

### GET /dime/test

Test connection to Dime.Scheduler API.

**Response:**
```json
{
  "success": true,
  "message": "Connection successful",
  "data": "Health check response"
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "emailService": "initialized"
}
```

## Environment Variables

- `PORT` - Server port (default: 3000)
- `HOST` - Server host (default: 0.0.0.0)
- `SENDGRID_API_KEY` - SendGrid API key for email functionality (required for /mailer endpoint)
- `FROM_EMAIL` - Default sender email address (default: noreply@example.com)
- `FROM_NAME` - Default sender name (default: Fastify Webhook API)
- `DIMESCHEDULER_BASE_URL` - Dime.Scheduler API base URL (required for /dime endpoints)
- `DIMESCHEDULER_API_KEY` - Dime.Scheduler API key (required for /dime endpoints)

## Project Structure

```
src/
├── index.ts              # Main server file
├── config/
│   ├── emailConfig.ts    # Email service configuration
│   └── dimeSchedulerConfig.ts  # Dime.Scheduler configuration
├── controllers/
│   ├── webhookController.ts  # Webhook endpoint handlers
│   ├── mailerController.ts   # Email endpoint handlers
│   ├── healthController.ts   # Health check handler
│   └── dimeSchedulerController.ts  # Dime.Scheduler handlers
├── routes/
│   ├── index.ts          # Route registration
│   ├── webhookRoutes.ts  # Webhook routes
│   ├── mailerRoutes.ts   # Email routes
│   ├── healthRoutes.ts   # Health check routes
│   └── dimeSchedulerRoutes.ts  # Dime.Scheduler routes
├── services/
│   ├── emailService.ts   # SendGrid email service
│   └── dimeSchedulerClient.ts  # Dime.Scheduler API client
├── store/
│   └── serverStore.ts    # In-memory data store
└── types/
    ├── email.ts          # Email-related TypeScript types
    └── dimeScheduler.ts  # Dime.Scheduler TypeScript types
```

## Architecture

The project follows a clean, REST-like architecture with separation of concerns:

- **Controllers** - Handle HTTP requests and responses, contain business logic
- **Routes** - Define API endpoints and map them to controller methods
- **Services** - Handle external service integrations (SendGrid)
- **Store** - Manage in-memory data storage
- **Config** - Handle application configuration and initialization
- **Types** - TypeScript type definitions for better type safety

This structure makes the code more maintainable, testable, and follows REST API best practices.

## Error Handling

The API includes comprehensive error handling for:
- Invalid JSON format
- Missing or incorrect Content-Type headers
- Server errors
- Empty request bodies
- Missing required email fields
- SendGrid API errors
- Email validation errors
