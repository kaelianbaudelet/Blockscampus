export class AccessDeniedError extends Error {
  constructor(message = "Access to this resource has been denied.") {
    super(message);
    this.name = "AccessDeniedError";
  }
}
