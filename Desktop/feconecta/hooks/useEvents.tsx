import { useState, useCallback } from 'react';
import { eventsService, Event, EventAttendee } from '../services/eventsService';

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [userEvents, setUserEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);

  const loadCommunityEvents = useCallback(async (communityId: string) => {
    setLoading(true);
    try {
      const communityEvents = await eventsService.getCommunityEvents(communityId);
      setEvents(communityEvents);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUserEvents = useCallback(async () => {
    setLoading(true);
    try {
      const myEvents = await eventsService.getUserEvents();
      setUserEvents(myEvents);
    } catch (error) {
      console.error('Erro ao carregar meus eventos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createEvent = useCallback(async (eventData: {
    community_id: string;
    title: string;
    description: string;
    event_date: string;
    event_time: string;
    location?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    max_attendees?: number;
    image_url?: string;
    is_online: boolean;
    meeting_link?: string;
  }) => {
    try {
      const newEvent = await eventsService.createEvent(eventData);
      setEvents(prev => [newEvent, ...prev]);
      return newEvent;
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      throw error;
    }
  }, []);

  const attendEvent = useCallback(async (eventId: string, status: 'attending' | 'maybe' | 'not_attending' = 'attending') => {
    try {
      await eventsService.attendEvent(eventId, status);
      
      // Atualizar estado local
      setEvents(prev => 
        prev.map(event => 
          event.id === eventId 
            ? { 
                ...event, 
                is_attending: status === 'attending',
                current_attendees: status === 'attending' 
                  ? event.current_attendees + (event.is_attending ? 0 : 1)
                  : event.current_attendees - (event.is_attending ? 1 : 0)
              }
            : event
        )
      );
      
      // Recarregar eventos do usuário
      loadUserEvents();
    } catch (error) {
      console.error('Erro ao participar do evento:', error);
      throw error;
    }
  }, [loadUserEvents]);

  const getEventAttendees = useCallback(async (eventId: string) => {
    try {
      return await eventsService.getEventAttendees(eventId);
    } catch (error) {
      console.error('Erro ao carregar participantes:', error);
      return [];
    }
  }, []);

  const updateEvent = useCallback(async (eventId: string, updates: Partial<Event>) => {
    try {
      const updatedEvent = await eventsService.updateEvent(eventId, updates);
      setEvents(prev => 
        prev.map(event => 
          event.id === eventId ? updatedEvent : event
        )
      );
      return updatedEvent;
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      throw error;
    }
  }, []);

  const deleteEvent = useCallback(async (eventId: string) => {
    try {
      await eventsService.deleteEvent(eventId);
      setEvents(prev => prev.filter(event => event.id !== eventId));
      setUserEvents(prev => prev.filter(event => event.id !== eventId));
    } catch (error) {
      console.error('Erro ao deletar evento:', error);
      throw error;
    }
  }, []);

  return {
    events,
    userEvents,
    loading,
    loadCommunityEvents,
    loadUserEvents,
    createEvent,
    attendEvent,
    getEventAttendees,
    updateEvent,
    deleteEvent,
  };
}