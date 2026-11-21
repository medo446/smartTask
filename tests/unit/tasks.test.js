import { getRecommendedTask, scoreTask, sortTasks } from '../../src/logic/tasks';

const now = new Date(2026, 10, 4, 12);
const task = (overrides = {}) => ({ id: '1', name: 'Task', description: '', difficulty: 3, duration: 60, deadline: '2026-11-20', priority: 'Medium', completed: false, ...overrides });

describe('scoreTask', () => {
  test('weights deadline, manual priority, difficulty, and duration into a stable score', () => {
    const result = scoreTask(task({ deadline: '2026-11-04', difficulty: 5, duration: 30, priority: 'High' }), now);
    expect(result.score).toBe(98);
    expect(result.factors).toEqual({ deadline: 95, priority: 100, difficulty: 100, duration: 100 });
    expect(result.reason).toMatch(/deadline is today/);
  });

  test('treats overdue deadlines as urgent and explains the result', () => {
    const result = scoreTask(task({ deadline: '2026-11-03' }), now);
    expect(result.factors.deadline).toBe(100);
    expect(result.reason).toContain('deadline has passed');
  });
});

describe('getRecommendedTask', () => {
  test('ignores completed tasks and returns null when none are actionable', () => {
    expect(getRecommendedTask([task({ completed: true })], now)).toBeNull();
  });

  test('selects the highest scoring task and provides its explanation', () => {
    const chosen = getRecommendedTask([
      task({ id: 'later', name: 'Later', deadline: '2026-12-20', priority: 'Low', difficulty: 1, duration: 300 }),
      task({ id: 'urgent', name: 'Urgent', deadline: '2026-11-04', priority: 'High', difficulty: 5, duration: 45 })
    ], now);
    expect(chosen.id).toBe('urgent');
    expect(chosen.recommendation.reason).toContain('Recommended because');
  });
});

describe('sortTasks', () => {
  const tasks = [task({ id: 'a', deadline: '2026-11-10', difficulty: 2, duration: 90 }), task({ id: 'b', deadline: '2026-11-05', difficulty: 5, duration: 20 })];
  test('sorts deadlines ascending, difficulty descending, and duration ascending', () => {
    expect(sortTasks(tasks, 'deadline').map((item) => item.id)).toEqual(['b', 'a']);
    expect(sortTasks(tasks, 'difficulty').map((item) => item.id)).toEqual(['b', 'a']);
    expect(sortTasks(tasks, 'duration').map((item) => item.id)).toEqual(['b', 'a']);
  });
});
