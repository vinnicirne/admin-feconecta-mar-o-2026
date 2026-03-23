"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export function useFeatures() {
  const supabase = useMemo(() => createClient(), []);
  const [features, setFeatures] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchFeatures = useCallback(async () => {
    try {
      const { data } = await supabase.from('app_features').select('name, is_enabled');
      if (data) {
        const enabled = new Set<string>(
          data.filter((f: any) => f.is_enabled).map((f: any) => f.name)
        );
        setFeatures(enabled);
      }
    } catch (err) {
      console.error("Error fetching features:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchFeatures();
    
    // Suporte a realtime para features (opcional, mas bom pra admin)
    const channel = supabase.channel('features-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_features' }, fetchFeatures)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchFeatures]);

  const isEnabled = (name: string) => {
    // Novas features do perfil em transição de dashboard
    const newProfileFeatures = [
      'profile_edit_email', 
      'profile_edit_username', 
      'profile_edit_church', 
      'profile_advanced_social'
    ];
    if (newProfileFeatures.includes(name) && features.size > 0 && !features.has(name)) return true;
    return features.has(name);
  };

  return { isEnabled, loading, features };
}
