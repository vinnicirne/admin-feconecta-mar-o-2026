import { useState, useEffect, useCallback } from 'react';
import { storiesService, Story } from '../services/storiesService';

export function useStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(false);

  const loadStories = useCallback(async () => {
    setLoading(true);
    try {
      const feedStories = await storiesService.getFeedStories();
      setStories(feedStories);
    } catch (error) {
      console.error('Erro ao carregar stories:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createStory = useCallback(async (storyData: {
    media_url: string;
    media_type: 'image' | 'video';
    text_overlay?: string;
    text_color?: string;
    text_position?: 'top' | 'center' | 'bottom';
    mentions?: string[];
  }) => {
    try {
      const newStory = await storiesService.createStory(storyData);
      setStories(prev => [newStory, ...prev]);
      return newStory;
    } catch (error) {
      console.error('Erro ao criar story:', error);
      throw error;
    }
  }, []);

  const viewStory = useCallback(async (storyId: string) => {
    try {
      await storiesService.viewStory(storyId);
      setStories(prev => 
        prev.map(story => 
          story.id === storyId 
            ? { ...story, has_viewed: true, views_count: story.views_count + 1 }
            : story
        )
      );
    } catch (error) {
      console.error('Erro ao visualizar story:', error);
    }
  }, []);

  const deleteStory = useCallback(async (storyId: string) => {
    try {
      await storiesService.deleteStory(storyId);
      setStories(prev => prev.filter(story => story.id !== storyId));
    } catch (error) {
      console.error('Erro ao deletar story:', error);
      throw error;
    }
  }, []);

  const getUserStories = useCallback(async (userId: string) => {
    try {
      return await storiesService.getUserStories(userId);
    } catch (error) {
      console.error('Erro ao buscar stories do usuário:', error);
      return [];
    }
  }, []);

  useEffect(() => {
    loadStories();
  }, [loadStories]);

  return {
    stories,
    loading,
    loadStories,
    createStory,
    viewStory,
    deleteStory,
    getUserStories,
  };
}