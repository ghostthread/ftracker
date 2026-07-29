# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ftracker** is a voice-first personal finance tracker. Users say "Alexa, tell North Star I spent 200 on grocery" and the expense is logged. The skill invocation name is **"north star"**.

Current state: **POC phase** — the Alexa skill + Lambda are functional; the Spring Boot backend and React frontend are not yet built.

## Architecture

```
Alexa Device → Alexa Skill (en-US.json) → AWS Lambda (Python) → Spring Boot API (TODO) → PostgreSQL → React Dashboard (TODO)
```

Only the Alexa/Lambda layer exists today. The backend `POST /api/expenses` call in `lambda_function.py` is stubbed out (marked `TODO Step 2`).

### Alexa Skill (`alexa-skill/`)

- **`lambda/lambda_function.py`** — single-file Python handler. No SDK; raw JSON in/out. Handles: `LaunchRequest`, `LogExpenseIntent`, `GetSummaryIntent`, `AnalyticsIntent`, `BulkExpenseIntent`, plus AMAZON built-ins.
- **`skill-package/interactionModels/custom/en-US.json`** — defines intents, slots, utterances, and two custom slot types: `CategoryType` (11 categories: FOOD, GROCERY, FUEL, SHOPPING, RENT, BILLS, TRAVEL, ENTERTAINMENT, HEALTH, SUBSCRIPTION, MISC) and `TimePeriodType`.
- **`skill-package/skill.json`** — skill manifest (publishing info, endpoint config).
- **`.ask/config`** — ASK CLI config; `skill_id` is blank and must be filled in before `ask deploy`.

### Interaction flow in `lambda_function.py`

`LogExpenseIntent` uses a two-turn confirmation pattern:
1. Collect `amount` + `category` slots (elicits missing ones via `Dialog.ElicitSlot`).
2. Ask "Shall I save it?" → store pending expense in `sessionAttributes["pending"]`.
3. `AMAZON.YesIntent` reads from `sessionAttributes` and (will) POST to backend; `AMAZON.NoIntent` cancels.

Category resolution uses `slot.resolutions.resolutionsPerAuthority` to get the canonical `id` (e.g., `FOOD`) and display `name` (e.g., `food`) — `_resolve_category()` handles this.

## Commands

### Build & deploy the Alexa skill

```bash
# Package Lambda into ftracker-skill.zip (for manual upload or Alexa Code import)
cd alexa-skill
./build.sh

# Deploy via ASK CLI (requires skill_id set in .ask/config)
ask deploy
```

### View Lambda logs

```bash
ask logs
# or
aws logs tail /aws/lambda/ask-ftracker-expense-tracker --follow
```

### Future components (not yet scaffolded)

```bash
# Backend
cd backend && ./gradlew build
cd backend && ./gradlew test
cd backend && ./gradlew bootRun

# Frontend
cd frontend && npm install && npm start
```

## Key constraints

- **Alexa Code import has a 100-file limit.** `build.sh` warns if the zip exceeds this. Keep `requirements.txt` minimal; add dependencies only when needed.
- **Lambda runtime is Python 3.12** (set in `.ask/config`). The handler entry point is `lambda_function.handler` (aliased as `lambda_handler` at the bottom of the file).
- **No ASK SDK** — the current handler uses raw JSON, not `ask-sdk-core`. The `lambda/package/` directory contains an old SDK install; it is not loaded at runtime. Add back the SDK only when the POC transitions to full development.
- **Session state** is passed entirely via `sessionAttributes` (short-lived, in-memory per session). No DynamoDB persistence yet.
- **Amounts are in rupees** (responses say "rupees"); the interaction model also accepts "dollars" as an utterance variant but the backend will store the numeric value only.
