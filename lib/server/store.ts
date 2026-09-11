import 'server-only';
import { defaultWorkspaceRoot } from '@/lib/workspace/paths';
import { createStore, type Store } from '@/lib/workspace/store';

let store: Store | null = null;

/** One store per process, rooted at the user's workspace directory. */
export function getStore(): Store {
  if (!store) store = createStore(defaultWorkspaceRoot());
  return store;
}
