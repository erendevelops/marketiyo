/**
 * The reset request must carry this exact token. It keeps a stray or replayed
 * request from wiping the workspace, since the deletion cannot be undone.
 */
export const RESET_CONFIRMATION = 'SIFIRLA';
