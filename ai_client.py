"""The only file that sends PlanBee messages to OpenAI."""

import datetime as dt
import json
import re
import urllib.error
import urllib.request
from pathlib import Path


ROOT = Path(__file__).parent


def _read_env_file():
    values = {}
    env_path = ROOT / ".env"
    if not env_path.exists():
        return values
    for line in env_path.read_text(encoding="utf-8").splitlines():
        if "=" in line and not line.lstrip().startswith("#"):
            name, value = line.split("=", 1)
            values[name.strip()] = value.strip().strip('"').strip("'")
    return values


def _model_from_notes():
    notes = (ROOT / "NOTES.md").read_text(encoding="utf-8")
    match = re.search(r"\b[\w.-]*luna[\w.-]*\b", notes, re.IGNORECASE)
    if not match:
        raise RuntimeError("No Luna model is recorded in NOTES.md.")
    return match.group(0)


def _answer_text(response):
    parts = []
    for item in response.get("output", []):
        for content in item.get("content", []):
            if content.get("type") == "output_text" and content.get("text"):
                parts.append(content["text"])
    return "\n".join(parts).strip()


def _call_openai(instructions, input_items):
    api_key = _read_env_file().get("OPENAI_API_KEY")
    if not api_key or api_key == "paste-your-key-here":
        raise RuntimeError("missing_key")

    payload = json.dumps(
        {
            "model": _model_from_notes(),
            "instructions": instructions,
            "input": input_items,
            "max_output_tokens": 700,
        }
    ).encode("utf-8")
    request = urllib.request.Request(
        "https://api.openai.com/v1/responses",
        data=payload,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=45) as response:
            result = json.loads(response.read().decode("utf-8"))
    except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError, json.JSONDecodeError) as error:
        raise RuntimeError("api_unavailable") from error

    text = _answer_text(result)
    if not text:
        raise RuntimeError("api_unavailable")
    return text


def _task_lines(tasks):
    return "\n".join(
        f"- {task.get('title', '').strip()} | due {task.get('dueDate', 'no date')} | importance {task.get('importance', 'Medium')}"
        for task in tasks[:12]
        if isinstance(task, dict) and task.get("title")
    ) or "No tasks have been added yet."


def plan_tasks(tasks):
    today = dt.date.today().isoformat()
    user_message = (
        f"Today is {today}. Create a nightly homework schedule from these student tasks. "
        "Sort by importance first and then due date. Assume each task needs about 45 minutes because Version 1 does not ask students for time estimates. "
        "Start at a reasonable early-evening time, include a 10-minute break after about two work blocks, and never schedule work after 11:45 PM. "
        "Return 3-7 short lines in this format: time range — task — reason. Include a final one-line note. "
        "If all work will not fit before midnight, clearly name the task to discuss with a teacher or caregiver about an extension instead of suggesting an all-nighter. "
        "Do not do any homework. Do not invent assignments or due dates.\n\nTasks:\n" + _task_lines(tasks)
    )
    return _call_openai(
        (ROOT / "BRIEF.md").read_text(encoding="utf-8"),
        user_message,
    )


def chat_with_ai(message, history, tasks):
    input_items = []
    for item in history[-12:]:
        if not isinstance(item, dict) or item.get("role") not in {"user", "assistant"}:
            continue
        content = item.get("content")
        if isinstance(content, str) and content.strip():
            input_items.append({"role": item["role"], "content": content.strip()[:2000]})
    if not input_items or input_items[-1]["role"] != "user":
        raise ValueError("A student question is required.")

    task_context = _task_lines(tasks)
    input_items[-1]["content"] = (
        "The student's current assignments are:\n" + task_context + "\n\n"
        "Answer the student's latest planning question:\n" + input_items[-1]["content"]
    )
    return _call_openai(
        (ROOT / "BRIEF.md").read_text(encoding="utf-8"),
        input_items,
    )
