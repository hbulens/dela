# Fastify Webhook API

A fast, TypeScript-based Fastify server that provides webhook processing functionality equivalent to the Next.js API routes.

## Features

- **POST /webhook** - Receives and processes webhook data
- **GET /webhook** - Retrieves stored webhook data
- **POST /mailer** - Send emails using SendGrid
- **POST /dimescheduler/import** - Execute Dime.Scheduler stored procedures
- **POST /dimescheduler/job** - Create jobs in Dime.Scheduler
- **POST /dimescheduler/task** - Create tasks in Dime.Scheduler
- **POST /dimescheduler/job-with-task** - Create jobs with tasks in one call
- **POST /dimescheduler/upsert-appointment** - Upsert appointments in Dime.Scheduler
- **POST /dimescheduler/appointment-category** - Update appointment category
- **GET /dimescheduler/appointments** - Query appointments by date range and resources
- **POST /dimescheduler/set-category-for-drager-appointments** - Bulk update categories for SICK/AFWEZIGHEID appointments
- **POST /dimescheduler/set-timemarker-for-drager-appointments** - Bulk update time markers for SICK/AFWEZIGHEID appointments
- **GET /dimescheduler/test** - Test Dime.Scheduler connection
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

Send emails using SendGrid. This endpoint intelligently handles both regular email requests and Dime.Scheduler appointment notifications.

#### Regular Email Mode

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

#### Dime.Scheduler Appointment Notification Mode

The same endpoint automatically detects and handles Dime.Scheduler appointment objects (from webhooks or direct API calls).

**Environment Variables Required:**
- `APPOINTMENT_RECIPIENT_EMAIL` - Primary recipient email address
- `DEFAULT_RECIPIENT_EMAIL` - Fallback recipient email address

**Example Appointment Request:**
```json
{
  "Id": 1212993,
  "AppointmentNo": "rVjMXrDY",
  "StartDate": "2025-10-02T09:00:00",
  "EndDate": "2025-10-02T17:00:00",
  "Subject": "Sick",
  "Body": " - \r\n",
  "CreatedUser": "Hendrik Bulens",
  "Resources": [...],
  "Task": {
    "Description": "Sick",
    "Job": {
      "JobNo": "AFWEZIGHEID",
      "Description": "AFWEZIGHEID"
    },
    "Category": {
      "Name": "SICK",
      "Color": "#ff0000"
    }
  },
  "Category": {
    "Name": "SICK",
    "Color": "#ff0000"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Appointment notification sent successfully",
  "messageId": "abc123-def456-ghi789",
  "appointment": {
    "id": 1212993,
    "appointmentNo": "rVjMXrDY",
    "subject": "Sick"
  }
}
```

**Features:**
- Automatically detects Dime.Scheduler appointment format
- Formats dates in Dutch locale
- Uses category color for email branding (#0080a6 as default)
- Includes all appointment details in a beautiful HTML template
- Maps importance levels to priority (Hoog/Gemiddeld/Laag)

### POST /dimescheduler/import

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

### POST /dimescheduler/job

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

### POST /dimescheduler/task

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

### POST /dimescheduler/job-with-task

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

### POST /dimescheduler/upsert-appointment

Upsert (create or update) an appointment in Dime.Scheduler.

**Request:**
```json
{
  "sourceApp": "CRONUSBE",
  "sourceType": "CRONUSBE",
  "jobNo": "JOB002",
  "taskNo": "TASK002001",
  "subject": "Appointment subject",
  "start": "2025-09-30T10:00:00",
  "end": "2025-09-30T11:00:00",
  "resourceNo": "RESOURCE001",
  "category": "APPOINTMENT"
}
```

### POST /dimescheduler/appointment-category

Update the category of an existing appointment.

**Request:**
```json
{
  "sourceApp": null,
  "sourceType": null,
  "appointmentNo": "APT001",
  "appointmentId": 12345,
  "category": "COMPLETED",
  "appointmentGuid": null,
  "sentFromBackOffice": true
}
```

**Note:** At least one appointment identifier (appointmentId, appointmentNo, or appointmentGuid) must be provided.

### GET /dimescheduler/appointments

Query appointments by date range and optional resources.

**Query Parameters:**
- `startDate` (required) - Start date in ISO 8601 format (e.g., `2025-09-01T00:00:00`)
- `endDate` (required) - End date in ISO 8601 format (e.g., `2025-09-30T23:59:59`)
- `resources` (optional) - Resource identifier(s). Can be a single string or array of strings

**Example Request:**
```
GET /dimescheduler/appointments?startDate=2025-09-01T00:00:00&endDate=2025-09-30T23:59:59&resources=RESOURCE001&resources=RESOURCE002
```

**Response:**
```json
{
  "success": true,
  "message": "Appointments retrieved successfully",
  "data": [
    {
      "id": 12345,
      "subject": "Appointment 1",
      "start": "2025-09-15T10:00:00",
      "end": "2025-09-15T11:00:00",
      "resourceNo": "RESOURCE001"
    }
  ]
}
```

### POST /dimescheduler/set-category-for-drager-appointments

Bulk operation that queries appointments and automatically updates the category to "GEREED" for appointments where `task.taskNo = "SICK"` and `task.job.jobNo = "AFWEZIGHEID"`.

**Query Parameters:**
- `startDate` (required) - Start date in ISO 8601 format (e.g., `2025-10-01T00:00:00`)
- `endDate` (required) - End date in ISO 8601 format (e.g., `2025-10-03T23:59:59`)
- `resources` (optional) - Resource identifier(s). Can be a single string or array of strings

**Example Request:**
```
POST /dimescheduler/set-category-for-drager-appointments?startDate=2025-10-01&endDate=2025-10-03&resources=API&resources=API2
```

**Response:**
```json
{
  "success": true,
  "message": "Updated 5 of 5 matching appointments",
  "data": {
    "totalAppointments": 20,
    "matchingAppointments": 5,
    "successCount": 5,
    "failureCount": 0,
    "results": [
      {
        "appointmentId": 12345,
        "appointmentNo": "APT001",
        "status": "success"
      }
    ]
  }
}
```

### POST /dimescheduler/set-timemarker-for-drager-appointments

Bulk operation that queries appointments and automatically updates the time marker for appointments where `task.taskNo = "SICK"` and `task.job.jobNo = "AFWEZIGHEID"`.

Uses the import API with the `mboc_updateAppointmentTimeMarker` stored procedure as documented in the [Dime.Scheduler API reference](https://docs.dimescheduler.com/develop/api/appointment#set-time-marker).

**Query Parameters:**
- `startDate` (required) - Start date in ISO 8601 format (e.g., `2025-10-01T00:00:00`)
- `endDate` (required) - End date in ISO 8601 format (e.g., `2025-10-03T23:59:59`)
- `timeMarker` (required) - The time marker code to set (e.g., `TIMEMARKER002`)
- `resources` (optional) - Resource identifier(s). Can be a single string or array of strings

**Example Request:**
```
POST /dimescheduler/set-timemarker-for-drager-appointments?startDate=2025-10-01&endDate=2025-10-03&timeMarker=TIMEMARKER002&resources=API&resources=API2
```

**Response:**
```json
{
  "success": true,
  "message": "Updated 5 of 5 matching appointments to time marker TIMEMARKER002",
  "data": {
    "totalAppointments": 20,
    "matchingAppointments": 5,
    "successCount": 5,
    "failureCount": 0,
    "timeMarker": "TIMEMARKER002",
    "results": [
      {
        "appointmentId": 12345,
        "appointmentNo": "APT001",
        "status": "success"
      }
    ]
  }
}
```

### GET /dimescheduler/test

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
│   ├── dimeSchedulerClient.ts  # Dime.Scheduler API client
│   └── endpoints/        # Dime.Scheduler endpoint classes
│       ├── baseEndpoint.ts      # Base endpoint with shared functionality
│       ├── jobEndpoint.ts       # Job-related operations
│       ├── taskEndpoint.ts      # Task-related operations
│       └── appointmentEndpoint.ts  # Appointment-related operations
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

## Dime.Scheduler Client Architecture

The Dime.Scheduler client uses an endpoint-based architecture for better organization and maintainability:

```typescript
import { DimeSchedulerClient } from './services/dimeSchedulerClient.js';

const client = new DimeSchedulerClient({
  baseUrl: 'https://api.dimescheduler.com',
  apiKey: 'your-api-key',
  timeout: 30000
});

// Jobs endpoint
await client.jobs.upsert(jobData);
await client.jobs.upsertWithTask(jobData, taskData);

// Tasks endpoint
await client.tasks.upsert(taskData);

// Appointments endpoint
await client.appointments.query(startDate, endDate, resources);
await client.appointments.upsert(appointmentData);
await client.appointments.setCategory(categoryData);
await client.appointments.setTimeMarker({ appointmentId, timeMarker });

// Direct API access (if needed)
await client.executeProcedures(procedures);
await client.testConnection();
```

### Benefits

- **Organized**: Related operations grouped by resource type
- **Intuitive**: Clear API structure (e.g., `client.appointments.query()`)
- **Maintainable**: Easy to add new endpoints and operations
- **Type-safe**: Full TypeScript support with type definitions

## Error Handling

The API includes comprehensive error handling for:
- Invalid JSON format
- Missing or incorrect Content-Type headers
- Server errors
- Empty request bodies
- Missing required email fields
- SendGrid API errors
- Email validation errors
- Dime.Scheduler API errors
