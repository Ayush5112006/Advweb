import { EventEmitter } from 'events';

export const TASK_CREATED = 'task-created';
export const TASK_DELETED = 'task-deleted';
export const TASK_UPDATED = 'task-updated';

class TaskEvents extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50);
  }
}

const taskEvents = new TaskEvents();

export default taskEvents;