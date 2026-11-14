# PlanBee notes

## How to run it

1. Open Terminal in this folder.
2. Run `python3 server.py`.
3. Open http://127.0.0.1:8000 in a browser.

The AI model is `gpt-5.6-luna`. The server reads the OpenAI key from `.env`; the browser never receives it.

After each save point, push it to GitHub.

## Done in Version 1

- Added the main flow: enter assignments, then ask the AI for a short nightly schedule that stays before midnight.
- Added required due dates and sorting by importance first, then due date.
- Added a small made-up sample list for demonstrating the app; students can remove or replace those tasks.
- Added a pop-up AI chatbox for short, safe planning questions.
- Added the safety reminder not to enter names or other personal information.
- Added browser localStorage saving in `public/storage.js`.
- Added a session fallback so the planner still works when a local preview blocks browser storage.
- Saves on this computer only for now.
- Kept the OpenAI key on the server in `.env` and the API request in `ai_client.py`.
- Added a warm honey-yellow design with Google Fonts and Material Symbols.
- The local AI endpoint is wired and shows a friendly error, but live AI testing is waiting for a working key in `.env`.

## Maybe Later

- The user can see a reminder not to type personal information.
- The user can set their bedtime so the plan never goes past it.
- The user can edit how long they think each task will take.
- The user can check off finished tasks and watch the plan update.
- The user can see when the AI suggests asking a teacher for an extension.
- The user can get a quick time management tip for their busiest day.
- The user can set a phone-free time before bed in their plan.
- The user can print or save their weekly planner.

## Next

- Try the main demo flow with a few real-but-non-sensitive school tasks.
- Collect student feedback on whether the plan feels realistic and encouraging.
