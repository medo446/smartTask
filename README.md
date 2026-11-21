# Smart Task Manager

A small, explainable task planner for a university Quality Assurance project. It helps choose a useful next task, then gives separate views sorted by deadline, difficulty, and estimated duration.

## Run the app

```sh
npm install
npm run dev
```

Tasks save automatically in the browser's local storage. The starter list is only used when no saved list exists; use the browser devtools to clear `smart-task-manager.tasks` and restore the examples.

## Recommendation rule

The app scores each unfinished task on four factors. Each factor is converted to 0–100, multiplied by its weight, and added. The task with the highest total is recommended.

| Factor | Weight | Score rule |
| --- | ---: | --- |
| Deadline urgency | 40% | Overdue 100; due today 95; within 1 day 90; 2–3 days 75; 4–7 days 55; 8–14 days 35; later 20 |
| Manual priority | 25% | Low 34; Medium 67; High 100 |
| Difficulty | 20% | Difficulty 1–5 maps evenly to 0–100 |
| Short duration | 15% | Up to 30 min 100; up to 1 hr 85; up to 2 hr 70; up to 4 hr 55; longer 40 |

The recommendation card shows the score and explains which factor contributed most, including its points and maximum weight. Ties go to the earlier deadline, then higher manual priority, then alphabetical task name. Completed tasks are excluded from recommendations. This is a transparent weighted scoring rule, not machine learning.

## Testing

```sh
npm test
npm run dev
# In a second terminal:
npm run test:e2e
```

Jest tests the pure recommendation and sorting functions. Selenium runs a Chrome browser workflow against the local app, so Chrome must be installed and the Vite server must be running. Set `APP_URL` to test another local URL.

## Project layout

```text
src/
  App.jsx                 UI, forms, task state, and local storage
  logic/tasks.js          Recommendation score and sort functions
  styles.css              Responsive visual design
tests/unit/               Jest tests for recommendation and sorting
tests/e2e/                Selenium browser workflow
```
