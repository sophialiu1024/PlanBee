# PlanBee notes

## How to run it

1. Open Terminal in this folder.
2. Run `python3 server.py`.
3. Open http://127.0.0.1:8000 in a browser.

The AI model is `gpt-5.6-luna`. The server reads the OpenAI key from `.env`; the browser never receives it.

## Done in Version 1

- Added a sleep-friendly homework planner with sample tasks.
- Tasks can be added with a due date and importance, then sorted in the planner.
- Added a single AI planning action that gives concise priorities, breaks, and extension guidance.
- Added the safety note not to enter personal information.
- Added local browser saving.
- Saves on this computer only for now.
- Added a warm honey-yellow theme with Gluten, Bpmf Huninn, and Google Material Symbols.
- Added an optional Rearrange mode so students can move tasks up or down and keep that order locally.

## Maybe Later

- Add a bedtime and available-time setup screen.
- Add gentle browser reminders and a completed-task state.
- Add an export for the written competition entry and video demo script.
- Move saved tasks to a real database.

## Next

- Try the main demo flow with a few real-but-non-sensitive school tasks.
- Collect student feedback on whether the plan feels realistic and encouraging.
