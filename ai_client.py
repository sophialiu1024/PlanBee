"""The only file that sends PlanBee messages to OpenAI."""

import json
import os
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


def plan_tasks(tasks):
    env = _read_env_file()
    api_key = env.get("OPENAI_API_KEY") or os.environ.get("OPENAI_API_KEY")
    if not api_key or api_key == "paste-your-key-here":
        raise RuntimeError("missing_key")

    brief = (ROOT / "BRIEF.md").read_text(encoding="utf-8")
    task_lines = "\n".join(
        f"- {task.get('title', '').strip()} | due {task.get('dueDate', 'no date')} | importance {task.get('importance', 'Medium')}"
        for task in tasks[:12]
    )
    user_message = (
        "Organize these student tasks into a short, practical plan. "
        "Return 3-6 concise bullets. Put the most urgent and important work first. "
        "Include one realistic break suggestion. If the workload would push bedtime past midnight, "
        "say to ask a teacher or caregiver about an extension instead of recommending an all-nighter. "
        "Do not do any homework.\n\nTasks:\n" + task_lines
    )
    payload = json.dumps(
        {
            "model": _model_from_notes(),
            "instructions": brief,
            "input": user_message,
            "max_output_tokens": 500,
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
