import { supabase } from './supabase';
import { Profile } from './authService';

export interface Event {
  id: string;
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
  current_attendees: number;
  image_url?: string;
  is_online: boolean;
  meeting_link?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  creator_profile?: Profile;
  community?: {
    id: string;
    name: string;
    image_url?: string;
  };
  is_attending?: boolean;
}

export interface EventAttendee {
  id: string;
  event_id: string;
  user_id: string;
  status: 'attending' | 'maybe' | 'not_attending';
  created_at: string;
  profile?: Profile;
}

export const eventsService = {
  // Criar evento
  async createEvent(eventData: {
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
  }): Promise<Event> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('events')
      .insert({
        ...eventData,
        created_by: user.id,
      })
      .select(`
        *,
        creator_profile:profiles!events_created_by_fkey(*),
        community:communities(id, name, image_url)
      `)
      .single();

    if (error) throw error;
    return { ...data, is_attending: false };
  },

  // Obter eventos de uma comunidade
  async getCommunityEvents(communityId: string, limit = 20, offset = 0): Promise<Event[]> {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        creator_profile:profiles!events_created_by_fkey(*),
        community:communities(id, name, image_url)
      `)
      .eq('community_id', communityId)
      .gte('event_date', new Date().toISOString().split('T')[0])
      .order('event_date', { ascending: true })
      .order('event_time', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Verificar se o usuário está participando dos eventos
    if (user && data && data.length > 0) {
      const eventIds = data.map(event => event.id);
      const { data: attendances } = await supabase
        .from('event_attendees')
        .select('event_id')
        .eq('user_id', user.id)
        .eq('status', 'attending')
        .in('event_id', eventIds);

      const attendingEventIds = new Set(attendances?.map(a => a.event_id) || []);

      return data.map(event => ({
        ...event,
        is_attending: attendingEventIds.has(event.id),
      }));
    }

    return data || [];
  },

  // Obter evento específico
  async getEvent(eventId: string): Promise<Event | null> {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        creator_profile:profiles!events_created_by_fkey(*),
        community:communities(id, name, image_url)
      `)
      .eq('id', eventId)
      .single();

    if (error) return null;

    // Verificar se o usuário está participando
    if (user) {
      const { data: attendance } = await supabase
        .from('event_attendees')
        .select('status')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single();

      return {
        ...data,
        is_attending: attendance?.status === 'attending',
      };
    }

    return data;
  },

  // Participar de evento
  async attendEvent(eventId: string, status: 'attending' | 'maybe' | 'not_attending' = 'attending'): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    // Verificar se já tem RSVP
    const { data: existing } = await supabase
      .from('event_attendees')
      .select('id, status')
      .eq('event_id', eventId)
      .eq('user_id', user.id)
      .single();

    if (existing) {
      // Atualizar status existente
      const { error } = await supabase
        .from('event_attendees')
        .update({ status })
        .eq('id', existing.id);

      if (error) throw error;

      // Atualizar contador se mudou para attending ou saiu de attending
      if (existing.status !== 'attending' && status === 'attending') {
        await supabase.rpc('increment_event_attendees', { event_id: eventId });
      } else if (existing.status === 'attending' && status !== 'attending') {
        await supabase.rpc('decrement_event_attendees', { event_id: eventId });
      }
    } else {
      // Criar novo RSVP
      const { error } = await supabase
        .from('event_attendees')
        .insert({
          event_id: eventId,
          user_id: user.id,
          status,
        });

      if (error) throw error;

      // Incrementar contador se está participando
      if (status === 'attending') {
        await supabase.rpc('increment_event_attendees', { event_id: eventId });
      }
    }
  },

  // Obter participantes do evento
  async getEventAttendees(eventId: string): Promise<EventAttendee[]> {
    const { data, error } = await supabase
      .from('event_attendees')
      .select(`
        *,
        profile:profiles(*)
      `)
      .eq('event_id', eventId)
      .eq('status', 'attending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Obter eventos que o usuário está participando
  async getUserEvents(): Promise<Event[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('event_attendees')
      .select(`
        event:events(
          *,
          creator_profile:profiles!events_created_by_fkey(*),
          community:communities(id, name, image_url)
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'attending')
      .gte('event.event_date', new Date().toISOString().split('T')[0])
      .order('event.event_date', { ascending: true });

    if (error) throw error;

    return data?.map(item => ({
      ...item.event,
      is_attending: true,
    })) || [];
  },

  // Atualizar evento
  async updateEvent(eventId: string, updates: Partial<Event>): Promise<Event> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('events')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', eventId)
      .eq('created_by', user.id)
      .select(`
        *,
        creator_profile:profiles!events_created_by_fkey(*),
        community:communities(id, name, image_url)
      `)
      .single();

    if (error) throw error;
    return { ...data, is_attending: false };
  },

  // Deletar evento
  async deleteEvent(eventId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)
      .eq('created_by', user.id);

    if (error) throw error;
  },
};