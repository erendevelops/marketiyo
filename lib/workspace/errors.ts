export class WorkspaceCorruptError extends Error {
  constructor(
    readonly filePath: string,
    readonly detail: string,
  ) {
    super(`Workspace file is unreadable: ${filePath}. ${detail}`);
    this.name = 'WorkspaceCorruptError';
  }
}
