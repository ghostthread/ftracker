# Alexa Skill: Expense Tracker

The voice interface for the Personal Finance Voice Tracker. This Alexa skill enables users to log expenses in seconds using natural language.

## Quick Start

### Prerequisites

- Node.js 14+ and npm
- AWS Account
- Alexa Developer Account
- Alexa Skills Toolkit (ASK) CLI

### Installation

1. **Install ASK CLI globally** (if not already installed)
   ```bash
   npm install -g ask-cli
   ```

2. **Configure ASK CLI**
   ```bash
   ask configure
   ```
   Follow the prompts to connect your AWS and Alexa Developer accounts.

3. **Install dependencies**
   ```bash
   npm install
   cd lambda
   npm install
   ```

## Project Structure

```
alexa-skill/
├── lambda/                      # AWS Lambda handler code
│   ├── index.js                 # Main Alexa skill logic
│   ├── package.json             # Node.js dependencies
│   └── (future: handlers/)      # Modular intent handlers
├── skill-package/
│   ├── skill.json               # Skill manifest
│   ├── interactionModels/
│   │   └── custom/
│   │       └── en-US.json       # Interaction model (intents, slots)
│   └── isps/                    # In-Skill Purchasing (future)
├── .ask/
│   └── config                   # ASK CLI configuration
└── README.md                    # This file
```

## Development Workflow

### 1. Local Development

#### Test in Alexa Simulator (No deployment)

The Alexa Developer Console provides a simulator where you can test utterances:

1. Go to [Alexa Developer Console](https://developer.amazon.com/alexa/console)
2. Select your skill "Expense Tracker"
3. Click "Test"
4. Type an utterance in the simulator: `"log 50 dollars for groceries"`
5. Review the request/response JSON

#### Edit Interaction Model

All utterances and intents are in `skill-package/interactionModels/custom/en-US.json`:

```json
{
  "name": "LogExpenseIntent",
  "samples": [
    "I spent {amount} on {category}",
    "log {amount} for {category}"
  ]
}
```

**After editing**: Run `ask deploy` to push changes to the console.

### 2. Lambda Development

The Lambda function in `lambda/index.js` handles:
- Parsing intent requests from Alexa
- Calling the Spring Boot backend API
- Formatting responses back to Alexa

#### Key Patterns

**Extract slot values:**
```javascript
const amount = slots.amount?.value;
const category = slots.category?.value;
```

**Call backend API:**
```javascript
const response = await axios.post(
  `${API_BASE_URL}/expenses`,
  expenseData,
  {
    headers: { 'Authorization': `Bearer ${accessToken}` },
    timeout: REQUEST_TIMEOUT
  }
);
```

**Return response:**
```javascript
return responseBuilder
  .withSpeechOutput("Got it. Logged 50 dollars for groceries.")
  .withSimpleCard("Expense Logged", "Amount: $50\nCategory: Groceries")
  .getResponse();
```

### 3. Deployment

#### Deploy to AWS

```bash
ask deploy
```

This will:
1. Zip the lambda code
2. Upload to AWS Lambda
3. Update the skill in Alexa Developer Console

**Configure Lambda Environment Variables** (in AWS Console):
```
API_BASE_URL=https://api.example.com
```

#### Test with Real Device

After deploying:
1. Enable the skill on your Alexa device
2. Say: "Alexa, ask Expense Tracker to log 50 dollars for groceries"
3. Monitor logs: `ask simulate` or AWS CloudWatch

## Intent Reference

### LogExpenseIntent (Primary)

**Invoke**: "I spent {amount} on {category}"

**Slots**:
- `amount`: Number (required) - Expense amount
- `category`: Custom type (required) - Predefined categories
- `note`: Text (optional) - Additional details

**Example**:
- "I spent 50 on groceries"
- "log 100 dollars for fuel"
- "spent 25 on lunch food"

### GetTodaysSummaryIntent

**Invoke**: "what did I spend today"

**Returns**: Today's total spending and transaction count

### GetWeeklySummaryIntent

**Invoke**: "show me weekly spending"

**Returns**: Week's total and daily average

### GetMonthlySummaryIntent

**Invoke**: "what did I spend this month"

**Returns**: Month's total and daily average

### GetCategoryBreakdownIntent

**Invoke**: "show me spending by category"

**Returns**: Top 3 spending categories

### ListCategoriesIntent

**Invoke**: "what categories do you have"

**Returns**: All available expense categories

## Available Categories

- Food
- Grocery
- Fuel / Gas
- Shopping / Clothes
- Rent
- Bills / Utilities
- Travel
- Entertainment
- Health
- Subscription
- Misc / Other

## Account Linking

The skill requires OAuth2 account linking so users can authenticate with the Spring Boot backend.

### Configuration (in Alexa Developer Console)

1. Go to **Build > Account Linking**
2. Set the following:
   - **Authorization URI**: `https://api.example.com/oauth/authorize`
   - **Access Token URI**: `https://api.example.com/oauth/token`
   - **Client ID**: From your Spring Boot app
   - **Client Secret**: From your Spring Boot app
   - **Scope**: `expenses:read expenses:write`

### In Lambda

The access token is available in the request:
```javascript
const accessToken = requestEnvelope.context.System.user.accessToken;
```

Pass it to backend APIs:
```javascript
headers: {
  'Authorization': `Bearer ${accessToken}`
}
```

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "You need to link your account" | No access token | User must link account in Alexa app |
| "I need both an amount and a category" | Missing slots | Provide amount and category |
| "The service is temporarily unavailable" | Backend API down | Check Spring Boot logs |
| "401 Unauthorized" | Invalid token | Token expired, user needs to relink |

### Debugging

**Check Lambda logs:**
```bash
ask logs
```

**View request/response:**
1. Alexa Developer Console → Build → JSON Editor
2. Check "Request" and "Response" tabs

**Local testing:**
Add to `lambda/index.js`:
```javascript
console.log('Request:', JSON.stringify(requestEnvelope, null, 2));
console.log('Response:', JSON.stringify(response, null, 2));
```

## Testing

### Unit Tests

Create test files:
```bash
cd lambda
npm test
```

Example test:
```javascript
describe('LogExpenseIntentHandler', () => {
  it('should log an expense', async () => {
    const handlerInput = createMockHandlerInput({
      intent: 'LogExpenseIntent',
      slots: { amount: '50', category: 'groceries' }
    });

    const response = await LogExpenseIntentHandler.handle(handlerInput);
    expect(response.outputSpeech.text).toContain('50');
  });
});
```

### Integration Testing

Test with a real or simulated Alexa device:

```bash
ask simulate --text "log 50 dollars for groceries"
```

## Environment Variables

Set in AWS Lambda Console (or locally for testing):

```bash
API_BASE_URL=http://localhost:8080/api        # Backend API URL
REQUEST_TIMEOUT=5000                          # API request timeout (ms)
LOG_LEVEL=INFO                                # Logging level
```

## Performance Considerations

### Response Time Target: < 2 seconds

- Keep Lambda execution under 1 second
- Use timeout guards on API calls (5 seconds max)
- Cache category list (doesn't change)

### Optimize

1. **Parallel requests**: Fetch category data asynchronously if needed
2. **Error fast**: Return early if slots are missing
3. **Reuse connections**: axios instance with keep-alive

## Documentation

- [Alexa Fundamentals](../ALEXA_FUNDAMENTALS.md) - Learning guide
- [Alexa Skills Kit Docs](https://developer.amazon.com/docs/ask-overviews/build-skills-with-the-alexa-skills-kit.html)
- [ASK CLI Reference](https://developer.amazon.com/docs/smapi/quick-start-alexa-skills-kit-command-line-interface.html)
- [Account Linking](https://developer.amazon.com/docs/custom-skills/configure-account-linking-for-custom-skills.html)

## Common Tasks

### Add a New Intent

1. **Update interaction model** (`skill-package/interactionModels/custom/en-US.json`)
   ```json
   {
     "name": "MyNewIntent",
     "samples": ["sample utterance 1", "sample utterance 2"]
   }
   ```

2. **Add handler in Lambda** (`lambda/index.js`)
   ```javascript
   const MyNewIntentHandler = {
     canHandle(handlerInput) {
       return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
         && Alexa.getIntentName(handlerInput.requestEnvelope) === 'MyNewIntent';
     },
     handle(handlerInput) {
       // Your logic here
       return handlerInput.responseBuilder.withSpeechOutput('...').getResponse();
     }
   };
   ```

3. **Register handler** in skill builder
   ```javascript
   const skillBuilder = Alexa.SkillBuilders.custom()
     .addRequestHandler(MyNewIntentHandler)
     // ... other handlers
   ```

4. **Deploy**
   ```bash
   ask deploy
   ```

### Modify Utterances

1. Edit `skill-package/interactionModels/custom/en-US.json`
2. Run `ask deploy`
3. Test in Alexa Simulator

### View Lambda Logs

```bash
ask logs
# or in AWS Console:
# CloudWatch > Log Groups > /aws/lambda/ask-ftracker-expense-tracker
```

## Troubleshooting

### Skill Not Appearing on Device

- Verify the skill is enabled in Alexa app
- Check the skill is in the same AWS region
- Wait 15-30 minutes for propagation

### Utterances Not Being Recognized

- Review skill-package/interactionModels/custom/en-US.json
- Add more sample utterances
- Check that slots are properly defined
- Run `ask deploy` to apply changes

### API Calls Timing Out

- Increase REQUEST_TIMEOUT in lambda/index.js
- Check that Spring Boot API is reachable
- Review backend logs

### Account Linking Not Working

- Verify OAuth2 endpoints in Alexa Developer Console
- Check that Spring Boot is returning valid tokens
- Test token validation in Lambda logs

---

**Next Step**: Review [ALEXA_FUNDAMENTALS.md](../ALEXA_FUNDAMENTALS.md) for an in-depth guide to Alexa skill components.
