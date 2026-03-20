import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { postsService, Post as DBPost, DailyMessage } from '../services/postsService';

interface PostsContextType {
  posts: DBPost[];
  dailyMessage: DailyMessage | null;
  loading: boolean;
  toggleFaith: (postId: string) => Promise<void>;
  addPost: (content: string, type?: DBPost['type']) => Promise<void>;
  refreshFeed: () => Promise<void>;
  loadMorePosts: () => Promise<void>;
  hasMorePosts: boolean;
}

export const PostsContext = createContext<PostsContextType | undefined>(undefined);

export function PostsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<DBPost[]>([]);
  const [dailyMessage, setDailyMessage] = useState<DailyMessage | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [offset, setOffset] = useState(0);

  const POSTS_PER_PAGE = 10;

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    if (user) {
      loadInitialData();
    } else {
      setPosts([]);
      setDailyMessage(null);
    }
  }, [user]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [postsData, dailyMsg] = await Promise.all([
        postsService.getFeedPosts(POSTS_PER_PAGE, 0),
        postsService.getDailyMessage()
      ]);
      
      setPosts(postsData);
      setDailyMessage(dailyMsg);
      setOffset(POSTS_PER_PAGE);
      setHasMorePosts(postsData.length === POSTS_PER_PAGE);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFaith = async (postId: string) => {
    try {
      const result = await postsService.toggleFaith(postId);
      
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              has_faithed: result.faithed,
              faith_count: result.count
            };
          }
          return post;
        })
      );
    } catch (error) {
      console.error('Erro ao curtir post:', error);
    }
  };

  const addPost = async (content: string, type: DBPost['type'] = 'text') => {
    try {
      const newPost = await postsService.createPost(content, type);
      setPosts(prevPosts => [newPost, ...prevPosts]);
    } catch (error) {
      console.error('Erro ao criar post:', error);
      throw error;
    }
  };

  const refreshFeed = async () => {
    setLoading(true);
    try {
      const postsData = await postsService.getFeedPosts(POSTS_PER_PAGE, 0);
      setPosts(postsData);
      setOffset(POSTS_PER_PAGE);
      setHasMorePosts(postsData.length === POSTS_PER_PAGE);
    } catch (error) {
      console.error('Erro ao atualizar feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMorePosts = async () => {
    if (!hasMorePosts || loading) return;

    try {
      const morePosts = await postsService.getFeedPosts(POSTS_PER_PAGE, offset);
      
      if (morePosts.length > 0) {
        setPosts(prevPosts => [...prevPosts, ...morePosts]);
        setOffset(prevOffset => prevOffset + POSTS_PER_PAGE);
        setHasMorePosts(morePosts.length === POSTS_PER_PAGE);
      } else {
        setHasMorePosts(false);
      }
    } catch (error) {
      console.error('Erro ao carregar mais posts:', error);
    }
  };

  return (
    <PostsContext.Provider value={{ 
      posts, 
      dailyMessage, 
      loading,
      toggleFaith, 
      addPost, 
      refreshFeed,
      loadMorePosts,
      hasMorePosts
    }}>
      {children}
    </PostsContext.Provider>
  );
}