# Alexa Skill Development: Step-by-Step Setup Guide

This guide walks you through setting up your local development environment and deploying the Expense Tracker skill.

## Phase 1: Prerequisites & Account Setup (15 min)

### 1. Create Developer Accounts

**Amazon Alexa Developer Account**
1. Go to [developer.amazon.com](https://developer.amazon.com)
2. Click "Sign In" (top right)
3. Create account or sign in with Amazon account
4. Save your credentials

**AWS Account** (if you don't have one)
1. Go to [aws.amazon.com](https://aws.amazon.com)
2. Click "Create Account"
3. Complete sign-up
4. Save your credentials

### 2. Install Required Tools

**Node.js 14+**
```bash
# Check if installed
node --version

# If not, install from nodejs.org
```

**AWS CLI**
```bash
# Install
npm install -g aws-cli

# Configure
aws configure
# Enter your AWS Access Key ID and Secret
```

**ASK CLI** (Alexa Skills Kit Command Line)
```bash
npm install -g ask-cli
```

**Verify installation**
```bash
ask --version
ask configure
# Follow prompts to connect AWS and Alexa Developer accounts
```

---

## Phase 2: Skill Configuration (10 min)

### 1. Create Skill in Alexa Developer Console

1. Go to [Alexa Developer Console](https://developer.amazon.com/alexa/console)
2. Click **"Create Skill"**
3. **Skill name**: Expense Tracker
4. **Language**: English (US)
5. **Skill type**: Custom
6. **Hosting**: Alexa-hosted (Node.js)
7. Click **Create**

### 2. Get Your Skill ID

After creating:
1. In Alexa Developer Console, click on your skill
2. Copy the **Skill ID** from the URL or settings
3. Save it: `amzn1.ask.skill.xxx...`

### 3. Configure ASK for This Project

Update `.ask/config` with your Skill ID:

```json
{
  "deploy_settings": {
    "default": {
      "skill_id": "amzn1.ask.skill.YOUR_SKILL_ID_HERE",
      ...
    }
  }
}
```

---

## Phase 3: Local Development Setup (10 min)

### 1. Install Dependencies

```bash
# Root of alexa-skill/
npm install

# Lambda function dependencies
cd lambda
npm install
cd ..
```

### 2. Create `.env` File (Optional - for local testing)

```bash
# alexa-skill/.env
API_BASE_URL=http://localhost:8080/api
REQUEST_TIMEOUT=5000
```

---

## Phase 4: Test Interaction Model (10 min)

The interaction model defines what users can say. It's already set up, but let's verify it.

### 1. Review Intents

Open `skill-package/interactionModels/custom/en-US.json`

You'll see:
- **LogExpenseIntent**: Main feature - "I spent X on Y"
- **GetTodaysSummaryIntent**: "what did I spend today"
- **GetWeeklySummaryIntent**: "show me weekly spending"
- **GetMonthlySummaryIntent**: "what did I spend this month"
- **GetCategoryBreakdownIntent**: "show me spending by category"
- **ListCategoriesIntent**: "what categories do you have"

### 2. Test in Alexa Simulator

1. Go to [Alexa Developer Console](https://developer.amazon.com/alexa/console)
2. Select your "Expense Tracker" skill
3. Click **Build** → **Interaction Model**
4. Review the intents and slots
5. Click **Save Model**, then **Build Model**

This validates your JSON and makes it available for testing.

### 3. Test in Simulator

1. Go to **Test** tab
2. Enable testing
3. In the "Alexa Simulator" text input, type:
   - "ask expense tracker to log 50 dollars for groceries"
   - "ask expense tracker what did I spend today"
4. See the request and response JSON

---

## Phase 5: Lambda Development (20 min)

### 1. Review Lambda Handler

Open `lambda/index.js` - this is your skill's brain.

**Key parts:**
- **Intent Handlers**: `LogExpenseIntentHandler`, `GetTodaysSummaryIntentHandler`, etc.
- **API Calls**: Axios calls to your Spring Boot backend
- **Error Handling**: Account linking, API errors, missing slots

### 2. Update Backend API URL

In `lambda/index.js`, update the API endpoint (currently a placeholder):

```javascript
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080/api';
```

Later, when you deploy to AWS Lambda, set this as an environment variable.

### 3. Add a Simple Test

Create `lambda/__tests__/logExpense.test.js`:

```javascript
const Alexa = require('ask-sdk-core');

describe('LogExpenseIntent', () => {
  it('should extract amount and category', () => {
    const mockRequest = {
      request: {
        intent: {
          slots: {
            amount: { value: '50' },
            category: { value: 'groceries' }
          }
        }
      }
    };

    expect(mockRequest.request.intent.slots.amount.value).toBe('50');
    expect(mockRequest.request.intent.slots.category.value).toBe('groceries');
  });
});
```

Run tests:
```bash
cd lambda
npm test
```

---

## Phase 6: Deploy Skill (15 min)

### 1. Deploy Interaction Model & Lambda

```bash
ask deploy
```

This will:
1. Validate your skill.json
2. Upload interaction model to Alexa
3. Zip and upload Lambda function to AWS
4. Link everything together

**Output will show:**
```
- Skill with uuid xxx created successfully.
- Lambda function 'ask-ftracker-expense-tracker' uploaded.
- Skill models deployed.
```

### 2. Configure Lambda Environment Variables

Now your Lambda needs to know the API endpoint.

**In AWS Console:**
1. Go to **Lambda** service
2. Find function: `ask-ftracker-expense-tracker`
3. Click **Configuration** → **Environment Variables**
4. Add:
   - **API_BASE_URL**: `http://localhost:8080/api` (for testing)
   - **REQUEST_TIMEOUT**: `5000`

### 3. Test with Your Alexa Device

1. Enable the skill in your Alexa app
2. Wait 30 seconds
3. Say: "Alexa, ask Expense Tracker to log 50 dollars for groceries"

**If it works**: You'll hear "Got it. I logged 50 dollars for groceries."

**If it fails**: Check Lambda logs:
```bash
ask logs
```

---

## Phase 7: Account Linking Setup (20 min)

Your skill needs to authenticate users so each person's expenses stay private.

### 1. Prepare Backend (Spring Boot)

Your Spring Boot app needs OAuth2 endpoints:
- **GET /oauth/authorize** - User login page
- **POST /oauth/token** - Issues access token
- Scope: `expenses:read expenses:write`

See backend documentation for implementation.

### 2. Configure in Alexa Developer Console

1. Go to **Build** → **Account Linking**
2. Fill in:
   - **Authorization URI**: `https://YOUR_API.com/oauth/authorize`
   - **Access Token URI**: `https://YOUR_API.com/oauth/token`
   - **Client ID**: From your Spring Boot config
   - **Client Secret**: From your Spring Boot config
   - **Scopes**: `expenses:read expenses:write`

### 3. Test Account Linking

1. Open Alexa app
2. Navigate to your skill
3. Click **Link Account**
4. You'll be redirected to your login page
5. Enter credentials
6. Return to Alexa

Now your skill has an access token and can call the API on your behalf.

---

## Phase 8: Development Workflow

### Daily Development

**To test changes:**

1. **Edit interaction model** (if adding new intents)
   ```
   Edit: skill-package/interactionModels/custom/en-US.json
   Deploy: ask deploy
   Test: Alexa Simulator or device
   ```

2. **Edit Lambda code**
   ```
   Edit: lambda/index.js or lambda/handlers/*.js
   Deploy: ask deploy
   Test: ask logs (to check CloudWatch logs)
   ```

3. **View logs**
   ```bash
   ask logs
   # or
   aws logs tail /aws/lambda/ask-ftracker-expense-tracker --follow
   ```

### Adding a New Intent

Example: Add "GetBudgetRemainingIntent"

1. **Add to interaction model**
   ```json
   {
     "name": "GetBudgetRemainingIntent",
     "samples": [
       "how much is my budget",
       "show my remaining budget"
     ]
   }
   ```

2. **Add handler in Lambda**
   ```javascript
   const GetBudgetRemainingIntentHandler = {
     canHandle(handlerInput) {
       return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
         && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetBudgetRemainingIntent';
     },
     async handle(handlerInput) {
       // Your logic here
     }
   };
   ```

3. **Register in skill builder**
   ```javascript
   const skillBuilder = Alexa.SkillBuilders.custom()
     .addRequestHandler(GetBudgetRemainingIntentHandler)
     // ...
   ```

4. **Deploy**
   ```bash
   ask deploy
   ```

---

## Common Issues & Solutions

### "Skill is not found"
- Make sure skill is enabled in Alexa app
- Wait 30+ seconds for propagation
- Check that you're using the correct skill name "Expense Tracker"

### "Lambda function not responding"
- Check that Lambda environment variables are set
- Verify API_BASE_URL is correct
- Check CloudWatch logs: `ask logs`

### "Account linking failed"
- Verify OAuth endpoints are correct in Alexa console
- Test endpoints with curl/Postman
- Check Spring Boot logs

### "Utterances not recognized"
- Check you saved and built the interaction model
- Add more sample utterances
- Test in Alexa Simulator first

### "API timeout"
- Increase REQUEST_TIMEOUT in lambda/index.js
- Check that Spring Boot API is running
- Verify network connectivity from Lambda (VPC, security groups)

---

## Next Steps

1. ✅ **Complete this setup guide**
2. 📖 **Read** [ALEXA_FUNDAMENTALS.md](../ALEXA_FUNDAMENTALS.md) for deeper learning
3. 🏗️ **Start** Spring Boot backend development
4. 🔗 **Configure** OAuth2 account linking
5. 🧪 **Test** full end-to-end flow with a real Alexa device

---

**Questions?** Check:
- [README.md](./README.md) - Project structure and common tasks
- [ALEXA_FUNDAMENTALS.md](../ALEXA_FUNDAMENTALS.md) - Learning resource
- [Alexa Skills Kit Docs](https://developer.amazon.com/docs/ask-overviews/build-skills-with-the-alexa-skills-kit.html)

---

**Last Updated**: July 2026
