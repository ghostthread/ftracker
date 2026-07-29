# Personal Finance Voice Tracker

A voice-first personal finance tracker that uses **Amazon Alexa** to log expenses in under 10 seconds.

## Overview

Say "Alexa, tell Expense Tracker I spent $50 on lunch" and your expense is instantly logged, categorized, and ready for analysis. The system provides real-time dashboard insights and spending analytics without any manual data entry.

## Quick Links

- 📋 [Product Requirements](./prd.md)
- 📚 [Alexa Fundamentals](./ALEXA_FUNDAMENTALS.md) - Learning guide for Alexa skill development
- 🏗️ [Technical Architecture](./docs/ARCHITECTURE.md) - System design and component overview

## Project Structure

```
ftracker/
├── alexa-skill/          # Alexa Custom Skill (Node.js)
├── backend/              # Spring Boot REST API
├── frontend/             # React TypeScript Dashboard
├── infrastructure/       # Terraform/CloudFormation
├── docs/                 # Documentation
└── prd.md               # Product Requirements Document
```

## Key Features

### MVP (Phase 1)
- 🎤 Voice-based expense logging via Alexa
- 📂 11 predefined expense categories (Food, Grocery, Fuel, Shopping, Rent, Bills, Travel, Entertainment, Health, Subscription, Misc.)
- 📊 Daily/Weekly/Monthly spending summaries
- 💹 Category-wise analytics
- 📝 Edit and delete transactions
- 🔍 Search and filter capabilities

### Future Features
- AI-powered insights
- Receipt OCR scanning
- Bank/SMS integration
- WhatsApp/Telegram bots
- Mobile app
- Smartwatch support
- Budget recommendations

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Voice | Alexa Custom Skill |
| Integration | AWS Lambda |
| Backend | Java + Spring Boot |
| Auth | OAuth2 + JWT |
| Database | PostgreSQL |
| Frontend | React + TypeScript |
| Charts | Recharts / Chart.js |
| Cloud | AWS |
| CI/CD | GitHub Actions |
| IaC | Terraform/OpenTofu |

## Architecture Flow

```
User speaks to Alexa
         ↓
   Alexa Skill
         ↓
  AWS Lambda
         ↓
Spring Boot API
         ↓
PostgreSQL
         ↓
React Dashboard
```

## Getting Started

### Prerequisites
- Node.js 14+ (for Alexa skill)
- Java 11+ (for backend)
- PostgreSQL 13+
- AWS Account
- Alexa Developer Account

### Development Setup

1. **Clone and navigate to the project**
   ```bash
   cd ftracker
   ```

2. **Alexa Skill Development**
   ```bash
   cd alexa-skill
   npm install
   npm run build
   ```

3. **Backend Setup**
   ```bash
   cd backend
   ./gradlew build
   ```

4. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/expenses` | Create new expense |
| GET | `/expenses` | Retrieve user expenses |
| GET | `/dashboard` | Get dashboard data |
| GET | `/reports/weekly` | Weekly spending report |
| GET | `/reports/monthly` | Monthly spending report |

## Success Metrics

- ✅ Expense logged in **< 10 seconds**
- ✅ **95% voice recognition accuracy**
- ✅ Dashboard updates in **< 2 seconds**
- ✅ **< 1% duplicate transactions**

## Learning Resources

New to Alexa skill development? Start with [ALEXA_FUNDAMENTALS.md](./ALEXA_FUNDAMENTALS.md) to understand:
- Alexa skill components and lifecycle
- Intents, slots, and utterances
- Account linking and authentication
- Request/response model
- Testing and deployment

## Development Phases

### Phase 1 (POC) - Current
- Alexa Skill
- Lambda integration
- Spring Boot APIs
- PostgreSQL setup
- Basic dashboard

### Phase 2
- Authentication & authorization
- Reports and analytics
- Budget tracking
- Edit/Delete functionality

### Phase 3
- AI insights
- Mobile app
- OCR receipt scanning
- Push notifications

## Security & Privacy

- OAuth2 + JWT authentication
- HTTPS everywhere
- Financial data encryption at rest and in transit
- AWS IAM for service-to-service auth
- Secrets management via AWS Secrets Manager

## Contributing

This is an internal project. Follow the standard Git workflow:
1. Create a feature branch
2. Make changes
3. Test locally
4. Open a pull request

## Support

For questions about:
- **Alexa skills**: See [ALEXA_FUNDAMENTALS.md](./ALEXA_FUNDAMENTALS.md)
- **Architecture**: Check `docs/ARCHITECTURE.md`
- **API design**: Review the PRD and backend code

---

**Project Status**: POC Phase  
**Last Updated**: July 2026
