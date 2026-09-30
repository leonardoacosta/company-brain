// Vitest runs outside workerd; these base classes let package modules load in Node tests.
export class RpcTarget {}
export class DurableObject {}
export class WorkerEntrypoint {}
export class WorkflowEntrypoint {}
export const env = {}
