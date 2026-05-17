export type Plan = 'FREE' | 'STARTER' | 'GROWTH' | 'AGENCY' | 'LIFETIME';
export type Platform = 'LINKEDIN' | 'TWITTER';
export type AccountKind = 'PERSONAL' | 'COMPANY';

export type InteractionStyle =
  | 'BOLD_CHALLENGING' | 'FRIENDLY' | 'CURIOUS' | 'PROFESSIONAL' | 'SUPPORTIVE' | 'CONTRARIAN';

export type WritingStyle =
  | 'SHARP_FLOWING' | 'CONVERSATIONAL' | 'POLISHED' | 'PUNCHY' | 'STORY_DRIVEN' | 'ANALYTICAL';

export type CommentTone =
  | 'ENERGETIC' | 'PROFESSIONAL_TONE' | 'CASUAL' | 'WITTY' | 'EMPATHETIC' | 'THOUGHTFUL';

export type CommentLength = 'SHORT' | 'MEDIUM' | 'LONG';
export type TargetType = 'KEYWORD' | 'CREATOR';

export type CommentStatus =
  | 'PENDING_REVIEW' | 'APPROVED' | 'QUEUED' | 'POSTING' | 'POSTED' | 'FAILED' | 'REJECTED' | 'FILTERED';

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  plan: Plan;
  planExpiresAt: string | null;
  maxAccounts: number;
  maxWorkflowsPerAccount: number;
  maxKeywordsPerWorkflow: number;
  maxCreatorsPerWorkflow: number;
  maxCommentsDayPerAccount: number;
  maxCommentsDayGlobal: number;
  emailVerified: boolean;
  createdAt: string;
}

export interface ConnectedAccount {
  id: string;
  platform: Platform;
  accountKind: AccountKind;
  platformUserId: string;
  platformUsername: string;
  profileUrl: string | null;
  avatarUrl: string | null;
  organizationId: string | null;
  organization: {
    id: string;
    name: string;
    logoUrl: string | null;
    vanityName: string | null;
  } | null;
  isActive: boolean;
  sessionValid: boolean;
  lastSessionCheck: string | null;
  sessionInvalidReason: string | null;
  commentsTodayCount: number;
  commentsTodayDate: string | null;
  createdAt: string;
  updatedAt: string;
  workflows: Array<{
    id: string;
    name: string;
    isActive: boolean;
    dailyLimit: number;
  }>;
}

export interface Tone {
  id: string;
  name: string;
  interactionStyle: InteractionStyle;
  writingStyle: WritingStyle;
  customPrompt: string;
  createdAt: string;
  _count?: { workflows: number };
}

export interface WorkflowKeyword {
  id: string;
  keyword: string;
  isActive: boolean;
  commentsCount: number;
}

export interface WorkflowCreator {
  id: string;
  platform: Platform;
  creatorProfileId: string;
  creatorName: string;
  creatorUsername: string | null;
  creatorAvatarUrl: string | null;
  creatorProfileUrl: string | null;
  followerCount: number | null;
  commentsCount: number;
}

export interface Workflow {
  id: string;
  name: string;
  accountId: string;
  toneId: string;
  targetType: TargetType;
  timezone: string;
  autoPost: boolean;
  language: string;
  commentTone: CommentTone;
  emojiEnabled: boolean;
  commentLength: CommentLength;
  dailyLimit: number;
  isActive: boolean;
  commentsTodayCount: number;
  commentsTodayDate: string | null;
  createdAt: string;
  account?: Pick<ConnectedAccount, 'id' | 'platform' | 'platformUsername' | 'avatarUrl' | 'accountKind'> & { commentsTodayCount?: number };
  tone?: Pick<Tone, 'id' | 'name'> & Partial<Tone>;
  keywords?: WorkflowKeyword[];
  creators?: WorkflowCreator[];
  _count?: { keywords: number; creators: number; comments: number };
}

export interface CommentRow {
  id: string;
  commentText: string;
  originalText: string | null;
  isEdited: boolean;
  status: CommentStatus;
  platform: Platform;
  platformCommentId: string | null;
  likesCount: number;
  repliesCount: number;
  viewsCount: number;
  statsLastPolledAt: string | null;
  postedAt: string | null;
  approvedAt: string | null;
  createdAt: string;
  rejectReason?: string | null;
  failureReason?: string | null;
  post: {
    authorName: string;
    authorUsername: string | null;
    postContent: string;
    postUrl: string | null;
    matchType: TargetType;
    matchValue: string;
    platform: Platform;
  };
  account: {
    id: string;
    platformUsername: string;
    platform: Platform;
    avatarUrl: string | null;
    accountKind: AccountKind;
  };
  workflow: {
    id: string;
    name: string;
  };
}

export interface AnalyticsSummary {
  commentsToday: number;
  impressionsToday: number;
  likesToday: number;
  repliesToday: number;
  followersToday: number;
}

export interface TimeseriesPoint {
  timestamp: string;
  comments: number;
  impressions: number;
  likes: number;
  followers: number;
}

export interface QuotaSnapshot {
  globalUsed: number;
  globalMax: number;
  accounts: Array<{
    accountId: string;
    platform: Platform;
    platformUsername: string;
    used: number;
    max: number;
  }>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
