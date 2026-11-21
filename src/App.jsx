import { useEffect, useMemo, useState } from 'react';
import { formatDuration, getRecommendedTask, sortTasks } from './logic/tasks.js';

const initialTasks = [
  { id: 'sample-1', name: 'Finish software testing report', description: 'Write up the test plan, results, and recommendations for the QA mini project.', difficulty: 4, duration: 120, deadline: '2026-11-07', priority: 'High', completed: false },
  { id: 'sample-2', name: 'Review lecture notes', description: 'Go over this week’s software quality assurance notes.', difficulty: 2, duration: 45, deadline: '2026-11-10', priority: 'Medium', completed: false },
  { id: 'sample-3', name: 'Prepare presentation slides', description: 'Turn the project findings into a short presentation for class.', difficulty: 3, duration: 90, deadline: '2026-11-14', priority: 'High', completed: false }
];
const tabs = [
  { id: 'recommended', label: 'Recommended', icon: '✦' },
  { id: 'deadline', label: 'Deadline', icon: '◷' },
  { id: 'difficulty', label: 'Difficulty', icon: '◇' },
  { id: 'duration', label: 'Duration', icon: '◴' }
];

function readTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem('smart-task-manager.tasks') || 'null');
    return Array.isArray(saved) ? saved : initialTasks;
  } catch { return initialTasks; }
}
function dateLabel(date) {
  const parsed = new Date(`${date}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? date : new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(parsed);
}
function isOverdue(date) {
  return new Date(`${date}T00:00:00`) < new Date(new Date().setHours(0, 0, 0, 0));
}

function TaskForm({ editing, onSave, onCancel }) {
  const [form, setForm] = useState(() => editing || { name: '', description: '', difficulty: 3, duration: 60, deadline: '', priority: 'Medium' });
  const change = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  function submit(event) {
    event.preventDefault();
    onSave({ ...form, name: form.name.trim(), duration: Number(form.duration), difficulty: Number(form.difficulty) });
  }
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onCancel()}>
    <form className="task-form" onSubmit={submit} aria-label={editing ? 'Edit task form' : 'Add task form'}>
      <div className="form-heading"><div><span className="eyebrow">TASK DETAILS</span><h2>{editing ? 'Edit task' : 'Add a task'}</h2></div><button type="button" className="icon-button" aria-label="Close form" onClick={onCancel}>×</button></div>
      <label>Task name<input name="name" value={form.name} onChange={change} placeholder="e.g. Finish project report" required maxLength="100" autoFocus /></label>
      <label>Description <span className="optional">Optional</span><textarea name="description" value={form.description} onChange={change} placeholder="Add a few details…" rows="3" maxLength="500" /></label>
      <div className="form-grid">
        <label>Difficulty <span className="optional">{form.difficulty} / 5</span><input name="difficulty" type="range" min="1" max="5" value={form.difficulty} onChange={change} /><span className="range-labels"><span>Easy</span><span>Hard</span></span></label>
        <label>Estimated time<select name="duration" value={form.duration} onChange={change}><option value="15">15 minutes</option><option value="30">30 minutes</option><option value="45">45 minutes</option><option value="60">1 hour</option><option value="90">1 hr 30 min</option><option value="120">2 hours</option><option value="180">3 hours</option><option value="240">4 hours</option><option value="360">6 hours</option><option value="480">8 hours</option></select></label>
        <label>Deadline<input name="deadline" type="date" value={form.deadline} onChange={change} required /></label>
        <label>Manual priority<select name="priority" value={form.priority} onChange={change}><option>Low</option><option>Medium</option><option>High</option></select></label>
      </div>
      <div className="form-actions"><button type="button" className="button secondary" onClick={onCancel}>Cancel</button><button type="submit" className="button primary">{editing ? 'Save changes' : 'Add task'}</button></div>
    </form>
  </div>;
}

function TaskCard({ task, featured = false, onEdit, onDelete, onToggle }) {
  return <article className={`task-card${featured ? ' featured-task' : ''}${task.completed ? ' completed-task' : ''}`} data-task-id={task.id}>
    <button className={`check-button${task.completed ? ' checked' : ''}`} onClick={() => onToggle(task.id)} aria-label={task.completed ? `Mark ${task.name} incomplete` : `Mark ${task.name} complete`}>{task.completed ? '✓' : ''}</button>
    <div className="task-content">
      <div className="task-title-row"><h3>{task.name}</h3><span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span></div>
      {task.description && <p className="task-description">{task.description}</p>}
      <div className="task-meta"><span className={isOverdue(task.deadline) && !task.completed ? 'overdue' : ''}><span className="meta-icon">◷</span> {dateLabel(task.deadline)}{isOverdue(task.deadline) && !task.completed ? ' · overdue' : ''}</span><span><span className="meta-icon">◴</span> {formatDuration(task.duration)}</span><span><span className="meta-icon">◇</span> Difficulty {task.difficulty}/5</span></div>
      {featured && task.recommendation && <div className="recommendation-reason"><span className="sparkle">✦</span><span>{task.recommendation.reason}</span><b>{task.recommendation.score}</b></div>}
    </div>
    <div className="task-actions"><button className="icon-button" aria-label={`Edit ${task.name}`} onClick={() => onEdit(task)}>✎</button><button className="icon-button delete-action" aria-label={`Delete ${task.name}`} onClick={() => onDelete(task.id)}>⌫</button></div>
  </article>;
}

export default function App() {
  const [tasks, setTasks] = useState(readTasks);
  const [activeTab, setActiveTab] = useState('recommended');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [showCompleted, setShowCompleted] = useState(false);
  useEffect(() => { localStorage.setItem('smart-task-manager.tasks', JSON.stringify(tasks)); }, [tasks]);

  const visible = useMemo(() => tasks.filter((task) => {
    const matches = `${task.name} ${task.description}`.toLowerCase().includes(search.trim().toLowerCase());
    return matches && (showCompleted || !task.completed);
  }), [tasks, search, showCompleted]);
  const recommendation = useMemo(() => getRecommendedTask(visible), [visible]);
  const ordered = useMemo(() => sortTasks(visible, activeTab), [visible, activeTab]);
  const openAdd = () => setModal({ type: 'add' });
  function saveTask(value) {
    if (modal.type === 'edit') setTasks((items) => items.map((task) => task.id === modal.task.id ? { ...task, ...value } : task));
    else setTasks((items) => [{ ...value, id: crypto.randomUUID(), completed: false }, ...items]);
    setModal(null);
  }
  function deleteTask(id) {
    const target = tasks.find((task) => task.id === id);
    if (target && window.confirm(`Delete “${target.name}”?`)) setTasks((items) => items.filter((task) => task.id !== id));
  }
  function toggleTask(id) { setTasks((items) => items.map((task) => task.id === id ? { ...task, completed: !task.completed } : task)); }

  return <div className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="#top" aria-label="Smart Task Manager home"><span className="brand-mark">s<span>✳</span></span><span>smart<span className="brand-light">task</span></span></a>
      <div className="side-label">WORKSPACE</div>
      <nav className="side-nav" aria-label="Task views">{tabs.map((tab) => <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={activeTab === tab.id ? 'active' : ''}><span className="nav-icon">{tab.icon}</span>{tab.label}{tab.id === 'recommended' && <span className="nav-dot" />}</button>)}</nav>
      <div className="sidebar-bottom"><div className="focus-card"><span className="focus-spark">✦</span><p>Make room for<br /><strong>what matters.</strong></p><span className="focus-caption">One good next step at a time.</span></div><div className="profile"><div className="avatar">ST</div><div><strong>My workspace</strong><small>Personal planner</small></div><span className="profile-dots">···</span></div></div>
    </aside>

    <main className="main-content" id="top">
      <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> Tasks <span>/</span> <strong>{tabs.find((tab) => tab.id === activeTab)?.label}</strong></div><div className="topbar-right"><span className="today-label">{new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date())}</span><span className="top-avatar">S</span></div></header>
      <section className="page-wrap">
        <div className="page-heading"><div><div className="eyebrow">YOUR PERSONAL WORKSPACE</div><h1>{activeTab === 'recommended' ? 'Good things, one at a time.' : `${tabs.find((tab) => tab.id === activeTab)?.label} view`}</h1><p>{activeTab === 'recommended' ? 'A little clarity on what deserves your attention next.' : 'A clearer view of everything on your list.'}</p></div><button className="button primary add-task" onClick={openAdd}><span>＋</span> Add a task</button></div>
        <div className="toolbar"><div className="tabs" role="tablist" aria-label="Sort tasks">{tabs.map((tab) => <button role="tab" aria-selected={activeTab === tab.id} key={tab.id} className={activeTab === tab.id ? 'selected' : ''} onClick={() => setActiveTab(tab.id)}><span>{tab.icon}</span>{tab.label}</button>)}</div><label className="search-box"><span>⌕</span><input aria-label="Search tasks" placeholder="Search tasks..." value={search} onChange={(event) => setSearch(event.target.value)} /><kbd>⌘ K</kbd></label></div>
        <div className="content-topline"><span>{visible.length} {visible.length === 1 ? 'task' : 'tasks'} {search ? 'found' : 'in your list'}</span><label className="completed-toggle"><input type="checkbox" checked={showCompleted} onChange={(event) => setShowCompleted(event.target.checked)} /> Show completed</label></div>
        {activeTab === 'recommended' && !search && recommendation && <section className="recommendation-panel"><div className="recommendation-header"><div className="recommend-icon">✦</div><div><span className="eyebrow">YOUR NEXT BEST STEP</span><h2>Start here</h2></div><span className="score-label">TOP MATCH <strong>{recommendation.recommendation.score}<small>/100</small></strong></span></div><TaskCard task={recommendation} featured onEdit={(task) => setModal({ type: 'edit', task })} onDelete={deleteTask} onToggle={toggleTask} /></section>}
        <section className="task-list-section"><div className="list-heading"><h2>{activeTab === 'recommended' ? (search ? 'Search results' : 'Coming up next') : `Tasks by ${activeTab}`}</h2>{activeTab === 'recommended' && !search && <span>Sorted by what needs you most</span>}</div>
          {ordered.length === 0 ? <div className="empty-state"><div>✳</div><h3>{search ? 'No tasks found' : 'A clear slate.'}</h3><p>{search ? 'Try another search, or add a new task.' : 'Add a task and we’ll help you pick a good place to start.'}</p>{!search && <button className="button secondary" onClick={openAdd}>＋ Add your first task</button>}</div> : <div className="task-list">{ordered.filter((task) => !(activeTab === 'recommended' && !search && task.id === recommendation?.id)).map((task) => <TaskCard key={task.id} task={task} onEdit={(item) => setModal({ type: 'edit', task: item })} onDelete={deleteTask} onToggle={toggleTask} />)}</div>}
        </section>
        <footer className="page-footer"><span>Thoughtfully prioritized for you <span className="footer-spark">✦</span></span><span>Changes save automatically</span></footer>
      </section>
    </main>
    {modal && <TaskForm editing={modal.type === 'edit' ? modal.task : null} onSave={saveTask} onCancel={() => setModal(null)} />}
  </div>;
}
