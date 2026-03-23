-- Script corrigido para sincronizar as funcionalidades da Sala de Guerra com o Dashboard de Controle
-- Utiliza os nomes de colunas corretos da tabela 'app_features' (name e label)

INSERT INTO public.app_features (name, label, is_enabled)
VALUES 
    ('war_room_presence', 'Sala de Guerra: Notificações de Presença', true),
    ('war_room_reactions', 'Sala de Guerra: Reações Flutuantes (🙏)', true),
    ('war_room_speaking_indicator', 'Sala de Guerra: Destaque de Orador', true)
ON CONFLICT (name) DO UPDATE 
SET label = EXCLUDED.label;
