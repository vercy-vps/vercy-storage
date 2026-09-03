export class VercyStorageError extends Error {
  public status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'VercyStorageError';
    this.status = status;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class QuotaExceededError extends VercyStorageError {
  constructor(message: string) {
    super(message, 413);
    this.name = 'QuotaExceededError';
  }
}

export class UnauthorizedError extends VercyStorageError {
  constructor(message: string) {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

export class NotFoundError extends VercyStorageError {
  constructor(message: string) {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}
