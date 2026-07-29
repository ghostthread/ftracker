import json
import logging
import os
import urllib.request
import uuid
from datetime import datetime, timezone

logger = logging.getLogger()
logger.setLevel(logging.INFO)

PENDING_KEY = "pending"
GIST_FILENAME = "ftracker-expenses.json"


# ── Response helpers ──────────────────────────────────────────────────────────

def _speak(text, reprompt=None, attrs=None):
    resp = {
        "outputSpeech": {"type": "PlainText", "text": text},
        "shouldEndSession": reprompt is None,
    }
    if reprompt:
        resp["reprompt"] = {"outputSpeech": {"type": "PlainText", "text": reprompt}}
    return {"version": "1.0", "sessionAttributes": attrs or {}, "response": resp}


def _elicit(slot_name, intent, speech, reprompt_text, attrs=None):
    return {
        "version": "1.0",
        "sessionAttributes": attrs or {},
        "response": {
            "outputSpeech": {"type": "PlainText", "text": speech},
            "reprompt": {"outputSpeech": {"type": "PlainText", "text": reprompt_text}},
            "shouldEndSession": False,
            "directives": [{
                "type": "Dialog.ElicitSlot",
                "slotToElicit": slot_name,
                "updatedIntent": {
                    "name": intent.get("name"),
                    "confirmationStatus": "NONE",
                    "slots": intent.get("slots", {}),
                },
            }],
        },
    }


def _slot(intent, name):
    return ((intent.get("slots") or {}).get(name) or {}).get("value")


def _resolve_category(intent):
    slot = (intent.get("slots") or {}).get("category") or {}
    authorities = (slot.get("resolutions") or {}).get("resolutionsPerAuthority") or []
    for auth in authorities:
        if (auth.get("status") or {}).get("code") == "ER_SUCCESS_MATCH":
            values = auth.get("values") or []
            if values:
                val = values[0].get("value", {})
                return val.get("id"), val.get("name")
    return None, None


def _save_expense(expense):
    gist_id = '4fd7542d4f254bb5e6a0b71f5ca84532'
    token = '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'
    url = f"https://api.github.com/gists/{gist_id}"

    def _req(method, payload=None):
        data = json.dumps(payload).encode() if payload else None
        req = urllib.request.Request(
            url, data=data, method=method,
            headers={
                "Authorization": f"Bearer {token}",
                "Accept": "application/vnd.github+json",
                "Content-Type": "application/json",
                "X-GitHub-Api-Version": "2022-11-28",
                "User-Agent": "ftracker-lambda",
            },
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read())

    try:
        gist = _req("GET")
        data = json.loads(gist["files"][GIST_FILENAME]["content"])
    except Exception:
        data = {"expenses": []}

    now = datetime.now(timezone.utc)
    record = {
        "id": str(uuid.uuid4()),
        "amount": float(expense["amount"]),
        "category": expense["category"],
        "categoryName": expense["category_name"],
        "source": "VOICE",
        "createdAt": now.isoformat(),
    }
    data["expenses"].append(record)
    data["lastUpdated"] = now.isoformat()

    _req("PATCH", {"files": {GIST_FILENAME: {"content": json.dumps(data, indent=2)}}})
    logger.info("Saved: %s", json.dumps(record))


# ── Main handler ──────────────────────────────────────────────────────────────

def handler(event, context):
    logger.info(json.dumps(event))

    req = event.get("request", {})
    session = event.get("session", {})
    attrs = dict(session.get("attributes") or {})
    req_type = req.get("type")

    if req_type == "LaunchRequest":
        return _speak(
            "North Star ready. Say: I spent 50 on coffee, or I spent 200 on grocery.",
            reprompt="What would you like to log?",
            attrs=attrs,
        )

    if req_type == "SessionEndedRequest":
        return {"version": "1.0", "response": {}}

    if req_type != "IntentRequest":
        return _speak("Sorry, I didn't understand that.")

    intent = req.get("intent", {})
    name = intent.get("name", "")

    # ── Log expense ───────────────────────────────────────────────────────────
    if name == "LogExpenseIntent":
        amount = _slot(intent, "amount")
        category_id, category_name = _resolve_category(intent)

        logger.info("LogExpense amount=%s category_id=%s", amount, category_id)

        if not amount:
            return _elicit(
                "amount", intent,
                "How much did you spend?",
                "Please tell me the amount.",
                attrs,
            )

        if not category_id:
            return _elicit(
                "category", intent,
                f"What did you spend {amount} on? Say food, grocery, fuel, or similar.",
                "What category was that? For example: food, grocery, or travel.",
                attrs,
            )

        attrs[PENDING_KEY] = {
            "amount": amount,
            "category": category_id,
            "category_name": category_name,
            "source": "VOICE",
        }
        return _speak(
            f"{amount} rupees for {category_name}. Say yes to save or no to cancel.",
            reprompt="Say yes to save or no to cancel.",
            attrs=attrs,
        )

    # ── Confirmation: Yes ─────────────────────────────────────────────────────
    if name == "AMAZON.YesIntent" and PENDING_KEY in attrs:
        expense = attrs.pop(PENDING_KEY)
        try:
            _save_expense(expense)
        except Exception as e:
            logger.error("Failed to save: %s", e)
            return _speak("Sorry, I couldn't save that. Please check the skill configuration.", attrs=attrs)
        return _speak(f"Saved. {expense['amount']} rupees for {expense['category_name']}.", attrs=attrs)

    # ── Confirmation: No ──────────────────────────────────────────────────────
    if name == "AMAZON.NoIntent" and PENDING_KEY in attrs:
        attrs.pop(PENDING_KEY)
        return _speak("Cancelled.", attrs=attrs)

    # ── Standard intents ──────────────────────────────────────────────────────
    if name == "AMAZON.HelpIntent":
        return _speak(
            "Say: I spent 200 on grocery. I'll confirm the amount and category, then say yes to save.",
            reprompt="What would you like to log?",
            attrs=attrs,
        )

    if name in ("AMAZON.StopIntent", "AMAZON.CancelIntent"):
        attrs.pop(PENDING_KEY, None)
        return _speak("Goodbye!")

    if name == "GetSummaryIntent":
        period = _slot(intent, "timePeriod") or "this period"
        return _speak(f"{period} summary coming soon.", attrs=attrs)

    if name == "AnalyticsIntent":
        return _speak("Analytics coming soon.", attrs=attrs)

    if name == "BulkExpenseIntent":
        return _speak("Bulk entry isn't available yet. Log one expense at a time.", attrs=attrs)

    if name == "AMAZON.FallbackIntent":
        if PENDING_KEY in attrs:
            e = attrs[PENDING_KEY]
            return _speak(
                f"{e['amount']} rupees for {e['category_name']}. Say yes to save or no to cancel.",
                reprompt="Say yes to save or no to cancel.",
                attrs=attrs,
            )
        return _speak(
            "I didn't catch that. Try: I spent 50 on coffee.",
            reprompt="What would you like to log?",
            attrs=attrs,
        )

    return _speak(
        "I didn't catch that. Try: I spent 50 on coffee.",
        reprompt="What would you like to log?",
        attrs=attrs,
    )


lambda_handler = handler
