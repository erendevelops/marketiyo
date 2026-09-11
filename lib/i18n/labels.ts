import type { Dictionary } from './tr';
import type { IdeaStatus, Platform, RejectionReason, SlotStatus } from '@/lib/schema';

/**
 * Enum values are stored in English in the workspace files. These map them to
 * whatever the interface language is, so no raw identifier ever reaches a screen.
 */

export function platformLabel(dict: Dictionary, platform: Platform): string {
  const map: Record<Platform, string> = {
    'short-video': dict.platformShortVideo,
    x: dict.platformX,
    linkedin: dict.platformLinkedin,
    'instagram-static': dict.platformInstagram,
  };
  return map[platform];
}

export function ideaStatusLabel(dict: Dictionary, status: IdeaStatus): string {
  const map: Record<IdeaStatus, string> = {
    new: dict.statusNew,
    kept: dict.statusKept,
    rejected: dict.statusRejected,
    expanded: dict.statusExpanded,
    scheduled: dict.statusScheduled,
  };
  return map[status];
}

export function rejectionReasonLabel(dict: Dictionary, reason: RejectionReason): string {
  const map: Record<RejectionReason, string> = {
    'off-brand': dict.reasonOffBrand,
    'too-generic': dict.reasonTooGeneric,
    'already-done': dict.reasonAlreadyDone,
    'wrong-audience': dict.reasonWrongAudience,
    'weak-hook': dict.reasonWeakHook,
    other: dict.reasonOther,
  };
  return map[reason];
}

export function slotStatusLabel(dict: Dictionary, status: SlotStatus): string {
  const map: Record<SlotStatus, string> = {
    planned: dict.slotPlanned,
    ready: dict.slotReady,
    posted: dict.slotPosted,
    skipped: dict.slotSkipped,
  };
  return map[status];
}
