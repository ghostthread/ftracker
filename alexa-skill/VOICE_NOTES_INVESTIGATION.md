# Voice Notes Investigation — Alexa Skill (North Star)

**Goal:** Let users optionally add a description when logging an expense via voice.  
**Example flow:** "I spent 100 on concert" → Alexa confirms → user says "popcorn" → saved with note.  
**Outcome:** Dropped. AMAZON.SearchQuery is not reliably matchable in this skill's dialog architecture.

---

## Context

The core flow (amount + category + yes/no confirm) works reliably end-to-end.  
All voice note failures were in the **second turn** — after Alexa confirms the expense and asks for a note.

The fundamental blocker: **AMAZON.SearchQuery** (Alexa's open-ended free-text slot) consistently loses to **AMAZON.FallbackIntent** regardless of carrier phrase, intent structure, or model configuration.

---

## Attempts

### 1. NoteType as a closed custom slot type

**Approach:** Added `NoteType` to `en-US.json` with a fixed list of values (e.g., "popcorn", "coffee", etc.)  
**Problem:** Notes are free-form by nature — a closed enum defeats the purpose.  
**Fix:** Switched to `AMAZON.SearchQuery`.

---

### 2. Free-form note in LogExpenseIntent via AMAZON.SearchQuery

**Approach:** Added a `note` slot (AMAZON.SearchQuery) directly inside `LogExpenseIntent`.  
Dialog management elicited all three slots: amount → category → note.  
**Problem:** Three-slot elicitation with SearchQuery caused the NLU to fail on the note turn. Alexa couldn't confidently disambiguate "popcorn" as a note vs. an unrelated utterance.  
**Result:** FallbackIntent.

---

### 3. Separate NoteReplyIntent

**Approach:** Created a standalone `NoteReplyIntent` with samples like `"{note}"` (slot only, no carrier phrase).  
**Problem:** With no carrier phrase, AMAZON.SearchQuery requires a mandatory carrier phrase per Alexa documentation. Without it, the slot is ignored and FallbackIntent fires.  
**Result:** FallbackIntent.

---

### 4. Carrier phrase "for {note}" (mid-utterance)

**Approach:** Samples: `"for {note}"`, `"it was for {note}"`.  
**Problem:** "it was for {note}" collided with "it was {amount}" from LogExpenseIntent — same structure, NLU couldn't pick between them.  
**Result:** Ambiguous NLU → FallbackIntent.

---

### 5. Carrier phrase "yes for {note}"

**Approach:** Samples: `"yes for {note}"`, `"yes it was {note}"`.  
**Problem:** Any utterance starting with "yes" is dominated by **AMAZON.YesIntent** — a built-in with massive training data. The "yes" prefix caused YesIntent to win, and the note was silently dropped (expense saved without note).  
**Result:** Expense saved without note; note ignored.

---

### 6. Carrier phrase "add note {note}" (no built-in collision)

**Approach:** `ConfirmWithNoteIntent` with samples `"add note {note}"`, `"note it as {note}"`, `"the note is {note}"`.  
Prompt told user: *"Say yes to save, or add note popcorn to include a note."*  
**Reasoning:** "add note" doesn't collide with any AMAZON built-in intent. Should be safe.  
**Tested utterances:**
- "add note post malone concert" → FallbackIntent
- "add note popcorb" → FallbackIntent  

**Problem:** AMAZON.SearchQuery still loses to FallbackIntent even with a distinctive carrier. This is a platform-level issue: in skill-managed dialogs with FallbackIntent enabled, Alexa's NLU does not give SearchQuery-based intents enough confidence to win.  
**Result:** FallbackIntent every time.

---

## Root Cause

`AMAZON.SearchQuery` is documented as unreliable in **skill-managed multi-turn dialogs**. Alexa requires `AMAZON.SearchQuery` to have a carrier phrase, but even with one:

- The NLU confidence score for SearchQuery-based intents is lower than FallbackIntent's threshold
- `AMAZON.FallbackIntent` is a catch-all that fires whenever no other intent reaches confidence threshold
- With FallbackIntent enabled, SearchQuery-heavy intents consistently lose in the second turn of a dialog

There is no known workaround within the current skill architecture (no ASK SDK, no APL, raw JSON in/out).

---

## Final Decision

**Dropped voice notes.** The skill now has a clean yes/no confirm flow:

1. User: "I spent 200 on concert"  
2. Alexa: "200 rupees for entertainment. Say yes to save or no to cancel."  
3. User: "yes" → saved  

Notes can be added later via the web dashboard (not yet built).

---

## What Was Removed

- `ConfirmWithNoteIntent` from `en-US.json`
- `_clean_note()` helper from `lambda_function.py`
- `note` field from the pending expense dict
- `ConfirmWithNoteIntent` handler block from `handler()`
- All "add note" references from prompts and reprompts

---

## Other Bugs Fixed During This Investigation

| Bug | Fix |
|-----|-----|
| `build.sh` created nested `lambda/` folder inside zip | Fixed: now copies directly to `build/`, zips with `lambda_function.py` at root |
| Trailing commas in `en-US.json` | Fixed each time they appeared (JSON doesn't allow trailing commas) |
| Deployed Lambda had hardcoded `GIST_ID` and `GITHUB_TOKEN` exposed | Credentials were exposed in conversation — rotate `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` immediately |
| Version mismatch between repo and deployed code | Multiple debugging rounds lost to testing stale deployed versions |

---

## Alternatives Not Tried (Future Reference)

- **APL (Alexa Presentation Language):** On Echo Show devices, could show a text input. Adds significant complexity.
- **One-shot note in the original utterance:** "I spent 100 on concert for popcorn" — would need `note` slot in `LogExpenseIntent` with careful NLU training. Risk: "for" is already used for category resolution.
- **Disable AMAZON.FallbackIntent:** Removing FallbackIntent might let SearchQuery win, but would break the graceful reprompt behavior for unrecognized input.
- **ASK SDK migration:** The SDK has `Dialog.DelegateRequest` and other primitives that give more control over multi-turn. Could help but is a significant rewrite.
