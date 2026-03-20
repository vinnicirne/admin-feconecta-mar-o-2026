export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  bio?: string;
  profileImage?: string;
  coverImage?: string;
  isVerified: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isPrivate: boolean;
  socialLinks?: {
    whatsapp?: string;
    instagram?: string;
    website?: string;
  };
  createdAt: Date;
}

export interface Post {
  id: string;
  userId: string;
  user: User;
  content: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'bible_verse';
  mediaUrl?: string;
  bibleVerse?: {
    book: string;
    chapter: number;
    verse: string;
    version: string;
    text: string;
  };
  faithCount: number; // likes chamados de "Fé"
  commentsCount: number;
  sharesCount: number;
  hasFaithed: boolean; // se o usuário atual curtiu
  createdAt: Date;
}

export interface Comment {
  id: string;
  userId: string;
  user: User;
  postId: string;
  content: string;
  faithCount: number;
  hasFaithed: boolean;
  createdAt: Date;
}