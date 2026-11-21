const PRIORITY_SCORE = { Low: 34, Medium: 67, High: 100 };

function deadlineScore(deadline, now) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const due = new Date(`${deadline}T00:00:00`);
  const days = Math.ceil((due - today) / 86_400_000);
  if (days < 0) return 100;
  if (days === 0) return 95;
  if (days <= 1) return 90;
  if (days <= 3) return 75;
  if (days <= 7) return 55;
  if (days <= 14) return 35;
  return 20;
}

function durationScore(minutes) {
  if (minutes <= 30) return 100;
  if (minutes <= 60) return 85;
  if (minutes <= 120) return 70;
  if (minutes <= 240) return 55;
  return 40;
}

function describeReason(factor, value) {
  if (factor === 'deadline') return value === 100 ? 'its deadline has passed' : value >= 95 ? 'its deadline is today' : value >= 90 ? 'its deadline is tomorrow' : value >= 75 ? 'its deadline is within three days' : value >= 55 ? 'its deadline is within a week' : value >= 35 ? 'its deadline is within two weeks' : 'its deadline is more than two weeks away';
  if (factor === 'priority') return value >= 100 ? 'you marked it High priority' : value >= 67 ? 'you marked it Medium priority' : 'you marked it Low priority';
  if (factor === 'difficulty') return value >= 80 ? 'its high difficulty earns extra points' : value >= 40 ? 'its difficulty adds some points' : 'its low difficulty adds fewer points';
  return value >= 85 ? 'its short duration earns a quick task bonus' : value >= 55 ? 'its duration earns a moderate quick task bonus' : 'its longer duration earns a smaller quick task bonus';
}

/** Transparent weighted decision rule. Scores are deterministic for a given date. */
export function scoreTask(task, now = new Date()) {
  const factors = {
    deadline: deadlineScore(task.deadline, now),
    priority: PRIORITY_SCORE[task.priority] ?? PRIORITY_SCORE.Medium,
    difficulty: Math.max(0, Math.min(100, ((Number(task.difficulty) - 1) / 4) * 100)),
    duration: durationScore(Number(task.duration))
  };
  const weights = { deadline: 0.4, priority: 0.25, difficulty: 0.2, duration: 0.15 };
  const score = Object.entries(weights).reduce((sum, [key, weight]) => sum + factors[key] * weight, 0);
  const strongest = Object.entries(weights)
    .map(([key, weight]) => ({ key, contribution: factors[key] * weight, value: factors[key] }))
    .sort((a, b) => b.contribution - a.contribution)[0];
  return {
    score: Math.round(score),
    factors,
    reason: `Recommended because ${describeReason(strongest.key, strongest.value)}; this factor contributes ${Math.round(strongest.contribution)}/${Math.round(weights[strongest.key] * 100)} points. Overall score: ${Math.round(score)}/100.`
  };
}

export function getRecommendedTask(tasks, now = new Date()) {
  return tasks
    .filter((task) => !task.completed)
    .map((task) => ({ ...task, recommendation: scoreTask(task, now) }))
    .sort((a, b) => b.recommendation.score - a.recommendation.score || a.deadline.localeCompare(b.deadline) || (PRIORITY_SCORE[b.priority] ?? 0) - (PRIORITY_SCORE[a.priority] ?? 0) || a.name.localeCompare(b.name))[0] ?? null;
}

export function sortTasks(tasks, mode) {
  const result = [...tasks];
  if (mode === 'deadline') result.sort((a, b) => a.deadline.localeCompare(b.deadline));
  if (mode === 'difficulty') result.sort((a, b) => Number(b.difficulty) - Number(a.difficulty));
  if (mode === 'duration') result.sort((a, b) => Number(a.duration) - Number(b.duration));
  return result;
}

export function formatDuration(minutes) {
  const value = Number(minutes);
  if (value < 60) return `${value} min`;
  const hours = Math.floor(value / 60);
  const remainder = value % 60;
  return remainder ? `${hours} hr ${remainder} min` : `${hours} hr`;
}
