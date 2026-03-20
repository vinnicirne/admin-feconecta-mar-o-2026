import { useState, useCallback } from 'react';
import { userService, SearchUser } from '../services/userService';
import { communitiesService, Community } from '../services/communitiesService';
import { useAuth } from './useAuth';

export function useSearch() {
  const { user } = useAuth();
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(false);

  const searchUsers = useCallback(async (query: string) => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    setLoading(true);
    try {
      const results = await userService.searchUsers(query);
      setUsers(results);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchCommunities = useCallback(async (query: string) => {
    if (!query.trim()) {
      setCommunities([]);
      return;
    }

    setLoading(true);
    try {
      const results = await communitiesService.searchCommunities(query);
      setCommunities(results);
    } catch (error) {
      console.error('Erro ao buscar comunidades:', error);
      setCommunities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchAll = useCallback(async (query: string) => {
    if (!query.trim()) {
      setUsers([]);
      setCommunities([]);
      return;
    }

    setLoading(true);
    try {
      const [userResults, communityResults] = await Promise.all([
        userService.searchUsers(query),
        communitiesService.searchCommunities(query),
      ]);
      
      setUsers(userResults);
      setCommunities(communityResults);
    } catch (error) {
      console.error('Erro ao realizar busca:', error);
      setUsers([]);
      setCommunities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getSuggestedUsers = useCallback(async () => {
    // Só carregar sugestões se usuário estiver autenticado
    if (!user) {
      setUsers([]);
      return;
    }

    setLoading(true);
    try {
      const suggestions = await userService.getSuggestedUsers();
      setUsers(suggestions);
    } catch (error) {
      console.error('Erro ao carregar sugestões:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const clearResults = useCallback(() => {
    setUsers([]);
    setCommunities([]);
  }, []);

  return {
    users,
    communities,
    loading,
    searchUsers,
    searchCommunities,
    searchAll,
    getSuggestedUsers,
    clearResults,
  };
}