import { Tabs } from 'expo-router';
import { FloatingTabBar } from '../../src/components/FloatingTabBar';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props: any) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="oggi" />
      <Tabs.Screen name="domani" />
      <Tabs.Screen name="acqua" />
      <Tabs.Screen name="shop" />
      <Tabs.Screen name="tu" />
    </Tabs>
  );
}
