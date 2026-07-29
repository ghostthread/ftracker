# Personal Finance Voice Tracker

## Overview

Voice-first personal finance tracker using **Alexa** to log expenses in
seconds. Users record expenses via voice, the backend stores them, and a
dashboard provides spending insights.

### Goal

Reduce expense logging friction to **\<10 seconds** while providing
meaningful weekly/monthly analytics.

------------------------------------------------------------------------

# Business Requirements

## Objectives

-   Voice-first expense logging
-   Zero manual entry
-   Real-time sync
-   Weekly & monthly insights
-   Spending trends
-   Budget tracking
-   Simple dashboard

## User Flow

``` text
Purchase
    ↓
"Alexa, tell Expense Tracker I spent 250 on food"
    ↓
Alexa Skill
    ↓
AWS Lambda
    ↓
Spring Boot API
    ↓
PostgreSQL
    ↓
Dashboard Updates
```

## MVP Features

-   Log expense via Alexa
-   Categories (Food, Grocery, Fuel, Shopping, Rent, Bills, Travel,
    Entertainment, Health, Subscription, Misc.)
-   Transaction history
-   Daily/Weekly/Monthly summaries
-   Category-wise analytics
-   Edit/Delete transactions
-   Search & filters

## Future Features

-   AI insights
-   OCR receipt scanning
-   Bank/SMS integration
-   WhatsApp/Telegram bot
-   Mobile app
-   Smartwatch support
-   Budget recommendations

------------------------------------------------------------------------

# Technical Design

## Tech Stack

  Layer         Technology
  ------------- ---------------------
  Voice         Alexa Custom Skill
  Integration   AWS Lambda
  Backend       Java + Spring Boot
  Auth          OAuth2 + JWT
  Database      PostgreSQL
  Frontend      React + TypeScript
  Charts        Recharts / Chart.js
  Cloud         AWS
  CI/CD         GitHub Actions
  IaC           Terraform/OpenTofu

## APIs

    POST /expenses
    GET  /expenses
    GET  /dashboard
    GET  /reports/weekly
    GET  /reports/monthly

## Expense Model

``` text
Expense
- id
- userId
- category
- amount
- note
- source (Alexa)
- createdAt
```

------------------------------------------------------------------------

# Dashboard

## Metrics

-   Today's Spending
-   Weekly Spending
-   Monthly Spending
-   Average Daily Spend
-   Remaining Budget

## Charts

-   Spending Trend
-   Category Pie Chart
-   Monthly Comparison
-   Weekly Comparison

## AI Insights

-   Highest spending category
-   Budget exceeded alerts
-   Monthly comparison
-   Spending recommendations

------------------------------------------------------------------------

# Development Roadmap

## Phase 1 (POC)

-   Alexa Skill
-   Lambda integration
-   Spring Boot APIs
-   PostgreSQL
-   Basic dashboard

## Phase 2

-   Authentication
-   Reports
-   Budget tracking
-   Edit/Delete

## Phase 3

-   AI insights
-   Mobile app
-   OCR
-   Notifications

------------------------------------------------------------------------

# POC Research Areas

## Alexa

-   Custom Skills
-   Intents & Slots
-   Account Linking
-   Invocation Names

## Voice Processing

-   Amount recognition
-   Category extraction
-   Accent handling
-   Confirmation flow

## Backend

-   REST API design
-   Validation
-   Idempotency
-   Error handling

## Dashboard

-   Chart libraries
-   Aggregation strategy
-   Real-time updates

## Infrastructure

-   Lambda vs always-on backend
-   API Gateway
-   Monitoring
-   Logging

## Security

-   OAuth2/JWT
-   HTTPS
-   Encryption
-   Secrets management

------------------------------------------------------------------------

# Risks & Challenges

  -------------------------------------------------------------------------
  Area             Challenge                  Mitigation
  ---------------- -------------------------- -----------------------------
  Voice            Incorrect amount/category  Confirmation & edit support
  Recognition                                 

  Duplicate        Same expense logged twice  Idempotency keys
  Requests                                    

  NLP              Different speaking styles  Synonyms & training
                                              utterances

  Authentication   Alexa account mapping      OAuth2 account linking

  Analytics        Slow reports               Indexing & caching

  Cost             Lambda/API usage           Monitor & optimize

  Security         Financial data             Encryption & IAM
  -------------------------------------------------------------------------

------------------------------------------------------------------------

# Success Metrics

-   Expense logged in **\<10 sec**

-   95% successful voice recognition

-   Dashboard updates in **\<2 sec**

-   \<1% duplicate transactions
