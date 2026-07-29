# Alexa Skills Fundamentals

A comprehensive guide to understanding Amazon Alexa skill development, ideal for developers building the expense tracker voice application.

## Table of Contents

1. [What is an Alexa Skill?](#what-is-an-alexa-skill)
2. [Core Components](#core-components)
3. [Interaction Model](#interaction-model)
4. [Request/Response Flow](#requestresponse-flow)
5. [Account Linking](#account-linking)
6. [Development & Testing](#development--testing)
7. [Deployment](#deployment)
8. [Best Practices](#best-practices)

---

## What is an Alexa Skill?

An **Alexa skill** is an application that extends Alexa's capabilities. Think of it as an "app" for Alexa devices. Users invoke skills by saying:

```
"Alexa, ask [Skill Name] to [action]"
```

### Example for our expense tracker:
```
"Alexa, ask Expense Tracker to log $50 for lunch"
"Alexa, tell Expense Tracker I spent 250 on groceries"
```

### Types of Skills

| Type | Description | Example |
|------|-------------|---------|
| **Custom Skills** | Full control, handles specific intents | Expense Tracker (our app) |
| **Smart Home Skills** | Controls smart devices | Light bulb control |
| **Flash Briefing** | Content delivery (news, weather) | Daily news briefing |
| **Music & Audio** | Streaming services | Spotify skill |
| **Video** | Video content | Netflix skill |

For our project, we're building a **Custom Skill**.

---

## Core Components

### 1. **Alexa Voice Service (AVS)**
The cloud-based service that:
- Captures user voice
- Processes natural language
- Routes to your skill's backend
- Returns responses

```
┌─────────────────────┐
│  Alexa Device       │
│  (Echo, Show, etc)  │
└──────────┬──────────┘
           │ (sends audio)
           ↓
┌─────────────────────┐
│   Alexa Voice       │
│   Service (AVS)     │
└──────────┬──────────┘
           │ (routes request)
           ↓
┌─────────────────────┐
│  Your Skill's       │
│  Lambda Function    │
└─────────────────────┘
```

### 2. **Skill Service Backend**
Your application (Lambda function for our project) that:
- Receives structured requests from AVS
- Processes the user's intent
- Calls your business logic (Spring Boot API)
- Returns a response to Alexa

### 3. **Skill Configuration**
Defined in JSON files and the Alexa Developer Console:
- **Interaction Model**: How users speak to the skill
- **Permissions**: What data the skill can access
- **Account Linking**: OAuth2 integration
- **Endpoint**: Where AVS sends requests (Lambda ARN)

---

## Interaction Model

The interaction model defines **what users can say** and **how the skill interprets it**.

### Key Concepts

#### **Intents**
Actions the user wants to perform. Examples:

```
LogExpenseIntent    → "I spent $50 on lunch"
GetBudgetIntent     → "What's my budget for this month?"
ListCategoriesIntent → "What categories do you have?"
```

#### **Slots**
Variables in user utterances. Examples:

```
Utterance: "I spent {amount} on {category}"
           ─────────────    ──────────
           Slot: AMOUNT     Slot: CATEGORY

User says: "I spent 50 dollars on groceries"
Parsed as: amount=50, category=groceries
```

#### **Utterances**
The different ways users can say the same thing:

```
LogExpenseIntent:
  - "I spent {amount} on {category}"
  - "log {amount} for {category}"
  - "add {category} expense for {amount}"
  - "spent {amount} on {category} today"
```

### Sample Interaction Model (JSON)

```json
{
  "interactionModel": {
    "languageModel": {
      "invocationName": "expense tracker",
      "intents": [
        {
          "name": "LogExpenseIntent",
          "slots": [
            {
              "name": "amount",
              "type": "AMAZON.NUMBER"
            },
            {
              "name": "category",
              "type": "AMAZON.CATEGORY"
            }
          ],
          "samples": [
            "I spent {amount} on {category}",
            "log {amount} for {category}",
            "add {category} expense for {amount}"
          ]
        }
      ]
    }
  }
}
```

### Built-in Slot Types

Alexa provides pre-built slot types:
- `AMAZON.NUMBER` - Numbers
- `AMAZON.DURATION` - Time periods
- `AMAZON.DATE` - Dates
- `AMAZON.TIME` - Times
- `AMAZON.CURRENCY_AMOUNT` - Money amounts
- Custom types - Define your own (e.g., expense categories)

---

## Request/Response Flow

### Request Lifecycle

```
1. User speaks to Alexa
   └─ "Alexa, tell Expense Tracker I spent 50 on groceries"

2. AVS captures and processes speech
   └─ Natural language understanding

3. Request sent to your Lambda function
   └─ JSON payload with parsed intent and slots

4. Your Lambda handles the request
   └─ Extract intent and slots
   └─ Call Spring Boot API
   └─ Process response

5. Lambda returns response to Alexa
   └─ Spoken text and optional visual display

6. Alexa speaks response to user
   └─ "Got it. Logged 50 dollars for groceries"
```

### Request JSON Structure

```json
{
  "version": "1.0",
  "session": {
    "new": false,
    "sessionId": "amzn1.echo-api.session.xxx",
    "application": {
      "applicationId": "amzn1.ask.skill.xxx"
    },
    "user": {
      "userId": "amzn1.ask.account.XXXXXXX"
    }
  },
  "request": {
    "type": "IntentRequest",
    "requestId": "amzn1.echo-api.request.xxx",
    "timestamp": "2026-07-15T10:30:00Z",
    "locale": "en-US",
    "intent": {
      "name": "LogExpenseIntent",
      "slots": {
        "amount": {
          "name": "amount",
          "value": "50"
        },
        "category": {
          "name": "category",
          "value": "groceries"
        }
      }
    }
  }
}
```

### Response JSON Structure

```json
{
  "version": "1.0",
  "sessionAttributes": {
    "lastExpense": "50 on groceries"
  },
  "response": {
    "outputSpeech": {
      "type": "PlainText",
      "text": "Got it. Logged 50 dollars for groceries."
    },
    "card": {
      "type": "Simple",
      "title": "Expense Logged",
      "content": "Amount: $50\nCategory: Groceries\nTime: 10:30 AM"
    },
    "shouldEndSession": true
  }
}
```

---

## Account Linking

### Why Account Linking?

Your expense tracker needs to:
1. Identify the user
2. Load their budget and preferences
3. Save expenses to their account
4. Prevent other users from accessing their data

### OAuth2 Flow

```
1. User hasn't linked their account
   └─ Alexa prompts: "You need to link your account"

2. User opens Alexa app
   └─ Clicks "Link Account"

3. Redirected to your login page
   └─ User logs in with their credentials

4. Your server generates an Access Token
   └─ Returns to Alexa

5. Alexa includes token in future requests
   └─ Your Lambda uses token to call Spring Boot API

6. Spring Boot verifies token
   └─ Returns user-specific data
```

### Implementation Steps

1. **Create OAuth2 endpoint** in Spring Boot
   - Handle login
   - Generate JWT tokens

2. **Configure Account Linking** in Alexa Console
   - Authorization URI: Your login page
   - Access Token URI: Where you issue tokens
   - Client ID & Client Secret

3. **Extract token in Lambda**
   ```javascript
   const token = request.context.System.user.accessToken;
   // Pass to Spring Boot API in Authorization header
   ```

---

## Development & Testing

### Local Development Setup

1. **Use Alexa Skills Toolkit (ASK)**
   ```bash
   npm install -g ask-cli
   ask configure
   ```

2. **Project Structure**
   ```
   alexa-skill/
   ├── lambda/
   │   ├── index.js         (Main handler)
   │   └── handlers/        (Intent handlers)
   ├── skill-package/
   │   ├── interactionModels/
   │   │   └── custom/
   │   │       └── en-US.json
   │   ├── skill.json
   │   └── README.md
   └── .ask/
       └── config
   ```

3. **Handler Example**
   ```javascript
   const LogExpenseIntentHandler = {
     canHandle(handlerInput) {
       return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
         && Alexa.getIntentName(handlerInput.requestEnvelope) === 'LogExpenseIntent';
     },
     async handle(handlerInput) {
       const slots = handlerInput.requestEnvelope.request.intent.slots;
       const amount = slots.amount.value;
       const category = slots.category.value;
       
       // Call Spring Boot API
       const result = await expenseApi.logExpense(amount, category);
       
       return handlerInput.responseBuilder
         .withSpeechOutput(`Logged ${amount} for ${category}`)
         .getResponse();
     }
   };
   ```

### Testing

#### **Using Alexa Simulator**
- Test in Alexa Developer Console
- Type utterances instead of speaking
- See request/response JSON

#### **Unit Testing**
```javascript
describe('LogExpenseIntentHandler', () => {
  it('should log an expense', async () => {
    // Mock handlerInput
    // Assert the response
  });
});
```

#### **Integration Testing**
- Deploy to Lambda
- Test with real Alexa device
- Monitor CloudWatch logs

---

## Deployment

### 1. **Package Skill**
```bash
ask deploy
```

### 2. **Lambda Configuration**
- ZIP up your Node.js code
- Upload to AWS Lambda
- Set handler to `index.handler`
- Add environment variables (API endpoints, secrets)
- Set timeout (default 3 sec, increase for API calls)

### 3. **Enable Skill**
- In Alexa Developer Console, enable the skill
- Link your Lambda ARN as the endpoint
- Configure account linking

### 4. **Publish Skill**
- For private use: enable in developer account
- For public: submit for Amazon review (privacy, security, UX)

---

## Best Practices

### 1. **Confirmation for Critical Actions**
Always confirm destructive or important operations:
```javascript
if (!slotConfirmed) {
  return handlerInput.responseBuilder
    .addConfirmIntentDirective()
    .getResponse();
}
```

### 2. **Handle Missing Slots**
Users might not provide all information:
```javascript
if (!slots.amount.value) {
  return handlerInput.responseBuilder
    .withSpeechOutput("How much did you spend?")
    .addElicitSlotDirective("amount", intentName)
    .getResponse();
}
```

### 3. **Idempotency for Duplicates**
If the same request is sent twice (network issues):
- Use idempotency keys in API calls
- Check if expense already exists
- Return success without creating duplicate

### 4. **Error Handling**
Always have fallback responses:
```javascript
try {
  // Call API
} catch (error) {
  return handlerInput.responseBuilder
    .withSpeechOutput("Sorry, something went wrong. Please try again.")
    .getResponse();
}
```

### 5. **Keep Responses Conversational**
- Natural language, not robotic
- Short and clear (< 20 words for spoken)
- Provide next steps when possible

```
❌ Bad: "Expense with ID 12345 created in category GROCERY with amount 50.00"
✅ Good: "Got it. I logged 50 dollars for groceries."
```

### 6. **Logging and Monitoring**
- Log all requests and errors to CloudWatch
- Monitor Lambda duration and errors
- Set up CloudWatch alarms

### 7. **Permissions**
Only request permissions you need:
```json
{
  "permissions": [
    "alexa::alerts:reminders:skill:readwrite"
  ]
}
```

For our app: minimal permissions (no device access needed)

---

## Key Takeaways for Our Expense Tracker

✅ **Single Intent**: LogExpenseIntent (main functionality)
✅ **Slots**: amount, category, optional note/date
✅ **Account Linking**: OAuth2 via Spring Boot
✅ **Backend**: Lambda → Spring Boot → PostgreSQL
✅ **Idempotency**: Use request IDs to prevent duplicates
✅ **Confirmation**: Ask user to confirm before logging
✅ **Error Handling**: Gracefully handle API failures
✅ **Monitoring**: CloudWatch logs for debugging

---

## Resources

- [Alexa Skills Kit Documentation](https://developer.amazon.com/docs/ask-overviews/build-skills-with-the-alexa-skills-kit.html)
- [Interaction Model Reference](https://developer.amazon.com/docs/custom-skills/create-the-interaction-model-for-your-skill.html)
- [ASK CLI Documentation](https://developer.amazon.com/docs/smapi/quick-start-alexa-skills-kit-command-line-interface.html)
- [Account Linking Guide](https://developer.amazon.com/docs/custom-skills/configure-account-linking-for-custom-skills.html)

---

**Last Updated**: July 2026
