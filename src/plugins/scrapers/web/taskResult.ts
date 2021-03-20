export enum TaskStatus {
  Success,
  Failure,
}

/**
 * Whenever a worker is processed by {@link ScraperEngine}
 * the result of its work is aggregated into this class
 */
export class TaskResult<T> {
  readonly status: TaskStatus;
  readonly data: T;

  /**
   * Create a new Task instance
   * @param data T data that is the result of a task
   * @param status the status of the task. Optional. Default {@link TaskStatus.Success}
   */
  constructor(data: T, status = TaskStatus.Success) {
    this.data = data;
    this.status = status;
  }
}

/**
 * Specialized task result for failed tasks
 */
export class FailedTask extends TaskResult<string> {
  /**
   * Create a new Failed task.
   * By default this task has a fixed {@link TaskStatus.Failure} as {@var status}
   * @param data message describing the reason of the failure
   */
  constructor(data: string) {
    super(data, TaskStatus.Failure);
  }
}
