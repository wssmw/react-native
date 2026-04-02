import { useRouter } from 'expo-router';
import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/context/auth-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      // 未登录，跳转到登录页
      router.replace('/login');
    }
  }, [isLoggedIn, isLoading]);

  // 加载期间不显示任何内容
  if (isLoading) {
    return null;
  }

  // 未登录不显示 tabs
  if (!isLoggedIn) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '首页',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="detail"
        options={{
          title: '明细',
          tabBarIcon: ({ color }) => (
            <MaterialIcons color={color} size={28} name={'menu'} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: '记账',
          tabBarIcon: ({ color }) => (
            <MaterialIcons color={color} size={28} name={'add'} />
          ),
        }}
      />
      <Tabs.Screen
        name="statistics"
        options={{
          title: '统计',
          tabBarIcon: ({ color }) => (
            <MaterialIcons color={color} size={28} name={'bar-chart'} />
          ),
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: '我的',
          tabBarIcon: ({ color }) => (
            <MaterialIcons color={color} size={28} name={'person'} />
          ),
        }}
      />
    </Tabs>
  );
}
