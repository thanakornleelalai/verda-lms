export type BadgeTier = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
export type LeaderboardScope = "WEEKLY" | "MONTHLY" | "ALL_TIME";

export interface UserPoints {
  userId: string;
  total: number;
  weeklyTotal: number;
  monthlyTotal: number;
  level: number;
  freezeTokens: number;
}

export interface PointTransaction {
  id: string;
  userId: string;
  amount: number;
  reason: string;
  createdAt: string;
}

export interface Badge {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  tier: BadgeTier;
  iconUrl?: string;
  earnedAt?: string;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  avatarUrl?: string;
  rank: number;
  xp: number;
  scope: LeaderboardScope;
}

export interface StreakRecord {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityAt?: string;
}
