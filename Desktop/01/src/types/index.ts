export type AdminRole = "super_admin" | "admin" | "moderator" | "support";

export type DashboardMetric = {
  label: string;
  value: string;
  delta: string;
};

export type FeatureEngagement = {
  label: string;
  value: string;
  percentage: number;
};

export type ChartPoint = {
  label: string;
  value: number;
};

export type LiveSignal = {
  id: string;
  title: string;
  description: string;
  status: "healthy" | "warning" | "critical";
};

export type AccessLog = {
  id: string;
  actor: string;
  action: string;
  location: string;
  device: string;
  createdAt: string;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: "active" | "review" | "suspended";
  lastAccess: string;
};

export type RevenueSnapshot = {
  mrr: string;
  donations: string;
  averageTicket: string;
  delta: string;
};

export type UserStatus = "active" | "banned" | "suspended";

export type ManagedUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  status: UserStatus;
  joinedAt: string;
  role: "member" | "moderator" | "admin";
  reportsReceived: number;
  activityScore: string;
  bio: string;
  church: string;
  lastSeen: string;
  activityHistory: string[];
};

export type PostType = "text" | "image" | "video" | "audio";

export type ManagedPost = {
  id: string;
  authorName: string;
  authorUsername: string;
  type: PostType;
  createdAt: string;
  engagement: string;
  engagementValue: number;
  reports: number;
  sensitive: boolean;
  hidden: boolean;
  title: string;
  excerpt: string;
  commentsCount: number;
  interactionsSummary: string;
};

export type ReportCategory =
  | "inappropriate_content"
  | "hate_speech"
  | "spam"
  | "fake_news"
  | "other";

export type ModerationReport = {
  id: string;
  category: ReportCategory;
  targetType: "post" | "comment" | "user";
  targetLabel: string;
  reporter: string;
  createdAt: string;
  queue: "high" | "normal" | "review";
  decisionHistory: string[];
  summary: string;
  userActionHint: string;
};

export type ModerationAction = "alert" | "hide" | "ban";

export type ModerationDetector = {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  sensitivity: "low" | "medium" | "high";
  action: ModerationAction;
};

export type ManagedCommunity = {
  id: string;
  name: string;
  category: string;
  members: number;
  growth: string;
  verified: boolean;
  featured: boolean;
  status: "active" | "suspended";
  description: string;
  leader: string;
  internalPosts: number;
  recentPosts: string[];
};

export type ManagedLive = {
  id: string;
  title: string;
  host: string;
  status: "live" | "scheduled" | "ended" | "interrupted";
  viewers: number;
  peakViewers: number;
  startedAt: string;
  category: string;
  flagged: boolean;
  history: string[];
};

export type BibleVersion = {
  id: string;
  name: string;
  abbreviation: string;
  language: string;
  status: "active" | "inactive";
  usage: string;
  favorites: string;
};
