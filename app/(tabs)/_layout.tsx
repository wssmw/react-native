import { useRouter } from 'expo-router';
import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/context/auth-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const tabBarStyle = {
  position: 'absolute' as const,
  marginLeft: 16,
  marginRight: 16,
  bottom: 16,
  height: 70,
  paddingTop: 9,
  paddingBottom: 8,
  borderTopWidth: 0,
  borderRadius: 24,
  backgroundColor: '#f8fbff',
  shadowColor: '#0f172a',
  shadowOpacity: 0.12,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 8 },
  elevation: 12,
};

const tabItemStyle = {
  paddingVertical: 3,
};

const tabLabelStyle = {
  fontSize: 10,
  fontWeight: '600' as const,
  marginTop: 1,
};

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();
  const theme = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.replace('/login');
    }
  }, [isLoggedIn, isLoading, router]);

  if (isLoading) {
    return null;
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tint,
        tabBarInactiveTintColor: '#94a3b8',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: true,
        tabBarLabelStyle: tabLabelStyle,
        tabBarStyle,
        tabBarItemStyle: tabItemStyle,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '首页',
          tabBarIcon: ({ color, focused }) => (
            <View className="min-h-6 items-center justify-center">
              <IconSymbol
                size={23}
                name="house.fill"
                color={focused ? color : '#64748b'}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="detail"
        options={{
          title: '明细',
          tabBarIcon: ({ color, focused }) => (
            <View className="min-h-6 items-center justify-center">
              <MaterialIcons
                color={focused ? color : '#64748b'}
                size={23}
                name="receipt-long"
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: '记账',
          tabBarButton: props => {
            const { onPress, accessibilityState } = props;
            const focused = accessibilityState?.selected;

            return (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={onPress}
                className="mt-[-22px] flex-1 items-center justify-start"
              >
                <View
                  className={`h-[58px] w-[58px] items-center justify-center rounded-full border-4 border-[#f8fbff] shadow-sm ${focused ? 'bg-blue-700' : 'bg-blue-600'}`}
                  style={{
                    shadowColor: '#1d4ed8',
                    shadowOpacity: 0.3,
                    shadowRadius: 10,
                    shadowOffset: { width: 0, height: 7 },
                    elevation: 9,
                    transform: focused ? [{ scale: 1.03 }] : undefined,
                  }}
                >
                  <MaterialIcons name="add" size={26} color="#fff" />
                </View>
                <Text
                  className={`mt-[3px] text-[10px] font-bold ${focused ? 'text-blue-700' : 'text-slate-600'}`}
                >
                  记账
                </Text>
              </TouchableOpacity>
            );
          },
        }}
      />
      <Tabs.Screen
        name="statistics"
        options={{
          title: '统计',
          tabBarIcon: ({ color, focused }) => (
            <View className="min-h-6 items-center justify-center">
              <MaterialIcons
                color={focused ? color : '#64748b'}
                size={23}
                name="bar-chart"
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: '我的',
          tabBarIcon: ({ color, focused }) => (
            <View className="min-h-6 items-center justify-center">
              <MaterialIcons
                color={focused ? color : '#64748b'}
                size={23}
                name="person"
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
