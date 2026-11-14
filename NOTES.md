# PlanBee notes

## How to run it

1. Open Terminal in this folder.
2. Run `python3 server.py`.
3. Open http://127.0.0.1:8000 in a browser.

The AI model is `gpt-5.6-luna`. The server reads the OpenAI key from `.env`; the browser never receives it.

After each save point, push it to GitHub.

## Done in Version 1

- Added a sleep-friendly homework planner that starts empty so students enter their own tasks.
- Tasks can be added with a due date and importance, then sorted in the planner.
- Added an AI planning action plus a chatbox for questions about prioritizing, breaking down work, and handling an overloaded list.
- The chatbox opens as a pop-up from the main screen.
- Added the safety note not to enter personal information.
- Added local browser saving.
- Saves on this computer only for now.
- Added a warm honey-yellow theme with Gluten, Bpmf Huninn, and Google Material Symbols.
- Added an optional Rearrange mode so students can move tasks up or down and keep that order locally.
- The current API key is being rejected by OpenAI, so replace the key in `.env` locally before using the chat.

## Maybe Later

- Add a preferred evening schedule and available-time setup screen.
- Add gentle browser reminders and a completed-task state.
- Add an export for the written competition entry and video demo script.
- Move saved tasks to a real database.

## Next

- Try the main demo flow with a few real-but-non-sensitive school tasks.
- Collect student feedback on whether the plan feels realistic and encouraging.
