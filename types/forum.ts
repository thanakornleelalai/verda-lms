export interface Thread {
  id: string;
  courseId: string;
  lessonId?: string;
  userId: string;
  user: { name: string; avatarUrl?: string };
  title: string;
  isPinned: boolean;
  postCount: number;
  lastActivityAt: string;
  createdAt: string;
}

export interface Post {
  id: string;
  threadId: string;
  parentId?: string;
  replies: Post[];
  userId: string;
  user: { name: string; avatarUrl?: string; role: string };
  content: Record<string, unknown>;
  isAnswer: boolean;
  voteCount: number;
  userVote?: 1 | -1 | null;
  deletedAt?: string;
  createdAt: string;
}

export interface PostVote {
  postId: string;
  userId: string;
  direction: 1 | -1;
}
