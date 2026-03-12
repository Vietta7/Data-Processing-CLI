export class ValidationError extends Error {
  constructor(message = 'Invalid input') {
    super(message);
    this.name = 'ValidationError';
  }
}

export class OperationError extends Error {
  constructor(message = 'Operation failed') {
    super(message);
    this.name = 'OperationError';
  }
}