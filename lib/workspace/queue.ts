/** Serialises async work so two writers never interleave a read-modify-write. */
export function createQueue() {
  let tail: Promise<unknown> = Promise.resolve();

  return function enqueue<T>(job: () => Promise<T>): Promise<T> {
    const run = tail.then(job, job);
    tail = run.catch(() => undefined);
    return run;
  };
}
