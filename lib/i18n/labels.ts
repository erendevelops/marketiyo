import type { Dictionary } from './tr';
import type {
  AdNetwork,
  CampaignObjective,
  FunnelStage,
  SearchIntent,
  IdeaStatus,
  Platform,
  RejectionReason,
} from '@/lib/schema';

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


export function adNetworkLabel(dict: Dictionary, network: AdNetwork): string {
  const map: Record<AdNetwork, string> = {
    meta: dict.networkMeta,
    'google-search': dict.networkGoogleSearch,
    tiktok: dict.networkTiktok,
  };
  return map[network];
}

export function campaignObjectiveLabel(dict: Dictionary, objective: CampaignObjective): string {
  const map: Record<CampaignObjective, string> = {
    awareness: dict.objectiveAwareness,
    traffic: dict.objectiveTraffic,
    leads: dict.objectiveLeads,
    sales: dict.objectiveSales,
    'app-installs': dict.objectiveAppInstalls,
  };
  return map[objective];
}

export function searchIntentLabel(dict: Dictionary, intent: SearchIntent): string {
  const map: Record<SearchIntent, string> = {
    informational: dict.intentInformational,
    commercial: dict.intentCommercial,
    transactional: dict.intentTransactional,
    navigational: dict.intentNavigational,
  };
  return map[intent];
}

export function funnelStageLabel(dict: Dictionary, stage: FunnelStage): string {
  const map: Record<FunnelStage, string> = {
    awareness: dict.stageAwareness,
    consideration: dict.stageConsideration,
    decision: dict.stageDecision,
  };
  return map[stage];
}
