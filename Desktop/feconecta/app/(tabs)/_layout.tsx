import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
        }}
      />
      <Tabs.Screen
        name="bible"
        options={{
          title: 'Bíblia',
        }}
      />
      <Tabs.Screen
        name="videos"
        options={{
          title: 'Vídeos',
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: 'Notas',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
        }}
      />
    </Tabs>
  );
}