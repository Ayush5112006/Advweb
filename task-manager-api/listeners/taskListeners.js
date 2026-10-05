import taskEvents, { TASK_CREATED, TASK_DELETED } from '../events.js';
const NOTIFICATION_DELAY_MS = Number(process.env.NOTIFICATION_DELAY_MS) || 2000;

const field = (task, name) =>
  task && typeof task.get === 'function' ? task.get(name) : task?.[name];

const formatActor = (context) => context?.actor?.email || context?.actor?.id || 'unassigned';

const reportEventError = (error, context = {}) => {
  const err = error instanceof Error ? error : new Error(String(error));
  if (err.eventContext) err.eventContext = context;
  else err.eventContext = context;
  taskEvents.emit('error', err);
};
taskEvents.on(TASK_CREATED, async (task, context = {}) => {
  const startedAt = Date.now();
  const startedAtIso = new Date(startedAt).toISOString();

  console.log(`[Notification] Handler started at ${startedAtIso}`);

  try {
    // Simulates a slow downstream side effect (email / push / webhook).
    await new Promise((resolve) => setTimeout(resolve, NOTIFICATION_DELAY_MS));

    const finishedAt = Date.now();
    console.log(
      `[Notification] Task "${field(task, 'title')}" created at ${startedAtIso} ` +
        `(assigned to: ${formatActor(context)})`
    );
    console.log(
      `[Notification] Handler completed at ${new Date(finishedAt).toISOString()} ` +
        `after ${finishedAt - startedAt}ms`
    );
  } catch (err) {

    reportEventError(err, { event: TASK_CREATED, taskId: String(field(task, '_id') ?? '') });
  }
});

// ─── task-deleted → deletion notification handler ─────────────────────────────
taskEvents.on(TASK_DELETED, async (task, context = {}) => {
  const startedAt = Date.now();

  try {
    
    await new Promise((resolve) => setTimeout(resolve, 100));

    console.log(
      `[Notification] Task "${field(task, 'title')}" deleted at ${new Date().toISOString()} ` +
        `(by: ${formatActor(context)}) | handler ran ${Date.now() - startedAt}ms after the API response`
    );
  } catch (err) {
    reportEventError(err, { event: TASK_DELETED, taskId: String(field(task, '_id') ?? '') });
  }
});

taskEvents.on('error', (error) => {
  console.error(`[Event Error] ${error?.message ?? error}`);
  if (error?.eventContext?.event) {
    console.error(`[Event Error] Context: ${JSON.stringify(error.eventContext)}`);
  }
});

console.log(
  `[Events] Listeners registered for '${TASK_CREATED}', '${TASK_DELETED}' and 'error' ` +
    `(notification delay: ${NOTIFICATION_DELAY_MS}ms)`
);