# Job Application Tracker API (In-progress)

![Backend CI](https://github.com/Inez-y/job-application-tracker/actions/workflows/backend-ci.yml/badge.svg)

## Overview

Job Application Tracker API is a production-style backend built with ASP.NET Core and PostgreSQL. The API helps users manage their job search process by tracking job applications, notes, status changes, interviews, reminders, documents, and reusable email templates.

The project focuses on backend engineering concepts commonly used in real-world applications, including authentication, authorization, relational database modeling, file handling, background-ready reminder logic, structured logging, health checks, integration testing, and CI/CD.

This backend is designed to support a future React/TypeScript frontend.

## Tech Stack

### Backend

- C#
- ASP.NET Core Web API
- Entity Framework Core
- PostgreSQL
- JWT Authentication
- Refresh Tokens
- FluentValidation
- Swagger / OpenAPI
- Serilog
- Health Checks

### Testing

- xUnit
- FluentAssertions
- WebApplicationFactory
- Testcontainers
- PostgreSQL test container
- Coverlet code coverage

### DevOps

- Docker Compose
- GitHub Actions
- CI pipeline for restore, build, test, and coverage artifact upload

---

## Features

- JWT authentication with refresh tokens
- Register, login, refresh token, and logout flow
- User-scoped job application tracking
- Protected endpoints with authorization
- Search, filter, sort, and pagination for job applications
- Notes per application
- Status history tracking
- Interview scheduling
- Reminders for follow-ups, deadlines, interviews, and assignments
- Global upcoming reminders endpoint
- Mark reminders complete/incomplete
- File uploads and downloads for resumes, cover letters, job descriptions, and assignments
- Email templates with placeholders
- Email template preview using job application data
- Dashboard analytics
- Health checks
- Structured logging with Serilog
- Centralized exception handling middleware
- Reusable current-user service
- Integration tests with Testcontainers PostgreSQL
- GitHub Actions CI with code coverage

---

## Architecture

The backend follows a layered project structure:

```text
backend/
  JobTracker.Api/
  JobTracker.Application/
  JobTracker.Domain/
  JobTracker.Infrastructure/
  JobTracker.Tests/
````

### Project Responsibilities

#### `JobTracker.Api`

Contains the ASP.NET Core Web API layer.

Responsibilities:

* Controllers
* API request/response DTOs
* Authentication endpoints
* Middleware
* Swagger configuration
* Dependency injection setup
* JWT token service
* Current user service
* Validation
* API-specific mappers

#### `JobTracker.Domain`

Contains core domain models and enums.

Examples:

* `User`
* `JobApplication`
* `ApplicationNote`
* `ApplicationStatusHistory`
* `Interview`
* `Reminder`
* `Document`
* `EmailTemplate`

#### `JobTracker.Infrastructure`

Contains database-related infrastructure.

Responsibilities:

* `AppDbContext`
* Entity Framework Core configuration
* Database mappings
* Migrations

#### `JobTracker.Tests`

Contains integration tests.

Responsibilities:

* Auth tests
* Protected endpoint tests
* User data isolation tests
* Testcontainers PostgreSQL setup
* API behavior verification

---

## Database Schema

The database is designed around user-owned job application data.

### Main Tables

```text
Users
JobApplications
ApplicationNotes
ApplicationStatusHistories
Interviews
Reminders
Documents
EmailTemplates
```

### Entity Relationships

```text
User
  ├── JobApplications
  └── EmailTemplates

JobApplication
  ├── ApplicationNotes
  ├── ApplicationStatusHistories
  ├── Interviews
  ├── Reminders
  └── Documents
```

### Users

Stores account information and refresh token data.

Important fields:

```text
Id
Email
PasswordHash
FirstName
LastName
RefreshToken
RefreshTokenExpiresAt
CreatedAt
```

### JobApplications

Stores each job application owned by a user.

Important fields:

```text
Id
UserId
CompanyName
JobTitle
Location
JobUrl
Status
DateApplied
Deadline
SalaryRange
Notes
CreatedAt
UpdatedAt
```

### ApplicationNotes

Stores notes attached to a job application.

Important fields:

```text
Id
JobApplicationId
Content
CreatedAt
```

### ApplicationStatusHistories

Stores status changes over time.

Important fields:

```text
Id
JobApplicationId
OldStatus
NewStatus
ChangedAt
```

### Interviews

Stores scheduled interviews for job applications.

Important fields:

```text
Id
JobApplicationId
Title
Type
ScheduledAt
DurationMinutes
InterviewerName
MeetingLink
Location
Notes
CreatedAt
UpdatedAt
```

### Reminders

Stores reminders for deadlines, interviews, follow-ups, and assignments.

Important fields:

```text
Id
JobApplicationId
Title
Type
RemindAt
IsCompleted
CreatedAt
UpdatedAt
```

### Documents

Stores metadata for uploaded documents.

Important fields:

```text
Id
JobApplicationId
OriginalFileName
StoredFileName
ContentType
SizeBytes
Type
UploadedAt
```

### EmailTemplates

Stores reusable email templates owned by each user.

Important fields:

```text
Id
UserId
Name
Type
Subject
Body
CreatedAt
UpdatedAt
```

---

## API Endpoints

### Authentication

| Method | Endpoint             | Description               |
| ------ | -------------------- | ------------------------- |
| `POST` | `/api/auth/register` | Register a new user       |
| `POST` | `/api/auth/login`    | Log in and receive tokens |
| `POST` | `/api/auth/refresh`  | Refresh access token      |
| `POST` | `/api/auth/logout`   | Invalidate refresh token  |

### Job Applications

| Method   | Endpoint                     | Description                    |
| -------- | ---------------------------- | ------------------------------ |
| `GET`    | `/api/job-applications`      | Get paginated job applications |
| `GET`    | `/api/job-applications/{id}` | Get one job application        |
| `POST`   | `/api/job-applications`      | Create a job application       |
| `PUT`    | `/api/job-applications/{id}` | Update a job application       |
| `DELETE` | `/api/job-applications/{id}` | Delete a job application       |

### Query Parameters for Job Applications

`GET /api/job-applications` supports:

| Parameter       | Description                                                              |
| --------------- | ------------------------------------------------------------------------ |
| `search`        | Search company, job title, or location                                   |
| `status`        | Filter by application status                                             |
| `sortBy`        | Sort by `createdAt`, `company`, `jobTitle`, `deadline`, or `dateApplied` |
| `sortDirection` | `asc` or `desc`                                                          |
| `page`          | Page number                                                              |
| `pageSize`      | Number of items per page                                                 |

Example:

```text
GET /api/job-applications?search=microsoft&status=1&sortBy=deadline&sortDirection=asc&page=1&pageSize=10
```

### Application Notes

| Method   | Endpoint                                                  | Description                  |
| -------- | --------------------------------------------------------- | ---------------------------- |
| `GET`    | `/api/job-applications/{jobApplicationId}/notes`          | Get notes for an application |
| `POST`   | `/api/job-applications/{jobApplicationId}/notes`          | Add note                     |
| `DELETE` | `/api/job-applications/{jobApplicationId}/notes/{noteId}` | Delete note                  |

### Status History

| Method | Endpoint                                    | Description               |
| ------ | ------------------------------------------- | ------------------------- |
| `GET`  | `/api/job-applications/{id}/status-history` | Get status change history |

### Interviews

| Method   | Endpoint                                                            | Description       |
| -------- | ------------------------------------------------------------------- | ----------------- |
| `GET`    | `/api/job-applications/{jobApplicationId}/interviews`               | Get interviews    |
| `GET`    | `/api/job-applications/{jobApplicationId}/interviews/{interviewId}` | Get one interview |
| `POST`   | `/api/job-applications/{jobApplicationId}/interviews`               | Create interview  |
| `PUT`    | `/api/job-applications/{jobApplicationId}/interviews/{interviewId}` | Update interview  |
| `DELETE` | `/api/job-applications/{jobApplicationId}/interviews/{interviewId}` | Delete interview  |

### Reminders

| Method   | Endpoint                                                                     | Description                                    |
| -------- | ---------------------------------------------------------------------------- | ---------------------------------------------- |
| `GET`    | `/api/job-applications/{jobApplicationId}/reminders`                         | Get reminders for an application               |
| `POST`   | `/api/job-applications/{jobApplicationId}/reminders`                         | Create reminder                                |
| `PUT`    | `/api/job-applications/{jobApplicationId}/reminders/{reminderId}`            | Update reminder                                |
| `DELETE` | `/api/job-applications/{jobApplicationId}/reminders/{reminderId}`            | Delete reminder                                |
| `PATCH`  | `/api/job-applications/{jobApplicationId}/reminders/{reminderId}/complete`   | Mark reminder complete                         |
| `PATCH`  | `/api/job-applications/{jobApplicationId}/reminders/{reminderId}/incomplete` | Mark reminder incomplete                       |
| `GET`    | `/api/reminders/upcoming`                                                    | Get upcoming reminders across all applications |

### Documents

| Method   | Endpoint                                                                   | Description            |
| -------- | -------------------------------------------------------------------------- | ---------------------- |
| `GET`    | `/api/job-applications/{jobApplicationId}/documents`                       | Get uploaded documents |
| `POST`   | `/api/job-applications/{jobApplicationId}/documents`                       | Upload document        |
| `GET`    | `/api/job-applications/{jobApplicationId}/documents/{documentId}/download` | Download document      |
| `DELETE` | `/api/job-applications/{jobApplicationId}/documents/{documentId}`          | Delete document        |

Supported file types:

```text
PDF
DOC
DOCX
TXT
```

### Email Templates

| Method   | Endpoint                                                       | Description                    |
| -------- | -------------------------------------------------------------- | ------------------------------ |
| `GET`    | `/api/email-templates`                                         | Get user email templates       |
| `GET`    | `/api/email-templates/{id}`                                    | Get one template               |
| `POST`   | `/api/email-templates`                                         | Create template                |
| `PUT`    | `/api/email-templates/{id}`                                    | Update template                |
| `DELETE` | `/api/email-templates/{id}`                                    | Delete template                |
| `GET`    | `/api/email-templates/{templateId}/preview/{jobApplicationId}` | Preview template with job data |

Supported placeholders:

```text
{{CompanyName}}
{{JobTitle}}
{{Location}}
{{DateApplied}}
{{Deadline}}
```

### Dashboard

| Method | Endpoint               | Description             |
| ------ | ---------------------- | ----------------------- |
| `GET`  | `/api/dashboard/stats` | Get dashboard analytics |

Dashboard stats include:

```text
Total applications
Applications by status
Upcoming deadlines
Recent applications
Offer count
Rejection count
Interviewing count
```

### Health Check

| Method | Endpoint  | Description               |
| ------ | --------- | ------------------------- |
| `GET`  | `/health` | Check API/database health |

---

## Authentication Flow

The API uses JWT access tokens and refresh tokens.

### Register

```text
POST /api/auth/register
```

Request:

```json
{
  "email": "test@example.com",
  "password": "Password123!",
  "firstName": "Test",
  "lastName": "User"
}
```

Response:

```json
{
  "accessToken": "jwt-access-token",
  "refreshToken": "refresh-token",
  "email": "test@example.com",
  "userId": "user-guid"
}
```

### Login

```text
POST /api/auth/login
```

Request:

```json
{
  "email": "test@example.com",
  "password": "Password123!"
}
```

Response:

```json
{
  "accessToken": "jwt-access-token",
  "refreshToken": "refresh-token",
  "email": "test@example.com",
  "userId": "user-guid"
}
```

### Refresh Token

```text
POST /api/auth/refresh
```

Request:

```json
{
  "refreshToken": "refresh-token"
}
```

Response:

```json
{
  "accessToken": "new-jwt-access-token",
  "refreshToken": "new-refresh-token",
  "email": "test@example.com",
  "userId": "user-guid"
}
```

### Logout

```text
POST /api/auth/logout
```

Request:

```json
{
  "refreshToken": "refresh-token"
}
```

Response:

```text
204 No Content
```

### Protected Endpoints

Protected endpoints require the access token in the Authorization header:

```text
Authorization: Bearer <accessToken>
```

---

## Setup Instructions

### Prerequisites

Install:

```text
.NET SDK
Docker Desktop
Git
```

Optional:

```text
Postman
pgAdmin
Visual Studio
VS Code
```

### Clone Repository

```bash
git clone https://github.com/Inez-y/job-application-tracker.git
cd job-application-tracker
```

### Start PostgreSQL

```bash
docker compose up -d
```

### Restore Packages

```bash
cd backend
dotnet restore
```

### Apply Database Migrations

```bash
dotnet ef database update \
  --project JobTracker.Infrastructure \
  --startup-project JobTracker.Api
```

### Run API

```bash
dotnet run --project JobTracker.Api
```

### Open Swagger

After the API starts, open the Swagger URL shown in the terminal.

Example:

```text
http://localhost:YOUR_PORT/swagger
```

---

## Environment Configuration

The API uses `appsettings.json` for local development.

Example:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5433;Database=jobtracker;Username=jobtracker_user;Password=jobtracker_password"
  },
  "Jwt": {
    "Key": "THIS_IS_A_DEVELOPMENT_SECRET_KEY_CHANGE_LATER_123456789",
    "Issuer": "JobTracker",
    "Audience": "JobTrackerUsers"
  },
  "AllowedHosts": "*"
}
```

Do not use development secrets in production.

For production, use environment variables or a secret manager.

---

## Docker Compose

The project uses Docker Compose to run PostgreSQL locally.

Example:

```yaml
services:
  postgres:
    image: postgres:16
    container_name: jobtracker-postgres
    environment:
      POSTGRES_DB: jobtracker
      POSTGRES_USER: jobtracker_user
      POSTGRES_PASSWORD: jobtracker_password
    ports:
      - "5433:5432"
    volumes:
      - jobtracker_postgres_data:/var/lib/postgresql/data

volumes:
  jobtracker_postgres_data:
```

---

## Running Tests

From the `backend` folder:

```bash
dotnet test
```

The test suite uses:

```text
xUnit
FluentAssertions
WebApplicationFactory
Testcontainers
PostgreSQL
```

Testcontainers automatically starts a temporary PostgreSQL container during integration tests.

### Test Coverage

Run tests with coverage:

```bash
dotnet test JobTracker.sln --collect:"XPlat Code Coverage"
```

Coverage files are generated under:

```text
JobTracker.Tests/TestResults/
```

---

## CI/CD

GitHub Actions runs backend CI automatically.

The workflow performs:

```text
Restore dependencies
Build solution
Run tests
Collect code coverage
Upload coverage artifact
```

Workflow file:

```text
.github/workflows/backend-ci.yml
```

---

## Validation

The API uses FluentValidation for request validation.

Examples of validation rules:

```text
Email must be valid
Password must meet minimum length
Company name is required
Job title is required
Job URL must be valid
Notes cannot exceed max length
Deadline cannot be in the past
```

Invalid requests return:

```text
400 Bad Request
```

---

## Error Handling

The API includes centralized exception handling middleware.

Unexpected errors return a consistent JSON response:

```json
{
  "statusCode": 500,
  "message": "An unexpected error occurred."
}
```

Unauthorized access returns:

```json
{
  "statusCode": 401,
  "message": "Unauthorized."
}
```

---

## Logging

The API uses Serilog for structured logging.

Logs are written to:

```text
Console
logs/jobtracker-.log
```

Log files are excluded from Git.

The API logs:

```text
HTTP requests
Unhandled exceptions
Authentication events
Important backend operations
```

Sensitive information such as passwords and tokens should never be logged.

---

## Security Considerations

Implemented security features:

```text
Password hashing
JWT authentication
Refresh token invalidation
Protected API endpoints
User-scoped resource access
Ownership checks before read/update/delete
File type restrictions for uploads
No direct exposure of stored file names in API responses
```

Important ownership rule:

```text
Users can only access their own job applications and related resources.
```

If a user attempts to access another user’s resource, the API returns:

```text
404 Not Found
```

This avoids revealing whether another user’s resource exists.

---

## Example Usage Flow

```text
1. Register a new account
2. Login and receive access/refresh tokens
3. Authorize Swagger with the access token
4. Create a job application
5. Add notes
6. Update application status
7. View status history
8. Schedule an interview
9. Create a reminder
10. Upload related documents
11. Create an email template
12. Preview the email template using application data
13. View dashboard stats
```

---

## Project Status

Current status:

```text
Backend API: In progress / functional
Authentication: Complete
Job application CRUD: Complete
Notes: Complete
Status history: Complete
Interviews: Complete
Reminders: Complete
Documents: Complete
Email templates: Complete
Dashboard stats: Complete
Tests: In progress / integration tests added
CI: Added
Frontend: Not started
```

---

## Future Improvements

Planned improvements:

```text
Build React + TypeScript frontend
Add role-based authorization
Add email sending for reminders and templates
Add background jobs with Hangfire or Quartz.NET
Add Azure Blob Storage or AWS S3 for documents
Add Dockerfile for API containerization
Add production deployment
Add refresh token rotation hardening
Add rate limiting
Add pagination to more list endpoints
Add audit logging
Add OpenAPI examples
Add seed/demo data
Add frontend dashboard charts
Add calendar view for interviews and reminders
Add Google Calendar integration
Add email provider integration
Add full text search
Add soft delete support for job applications
Add admin/demo user mode
```

---
