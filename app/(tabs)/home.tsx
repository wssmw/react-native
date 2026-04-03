import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/auth-context';
import {
  coupleApi,
  CoupleInfo,
  CoupleMember,
  UserInfo,
  userApi,
} from '@/request/api';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const roleTextMap: Record<'husband' | 'wife', string> = {
  husband: '丈夫',
  wife: '妻子',
};

export default function Home() {
  const { logout: logoutAuth } = useAuth();
  const router = useRouter();

  const [user, setUser] = useState<UserInfo | null>(null);
  const [coupleInfo, setCoupleInfo] = useState<CoupleInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState('');

  const members = useMemo(() => {
    if (!coupleInfo) return [];

    if (coupleInfo.members && coupleInfo.members.length > 0) {
      return coupleInfo.members;
    }

    const list: CoupleMember[] = [];
    if (coupleInfo.husband) list.push(coupleInfo.husband);
    if (coupleInfo.wife) list.push(coupleInfo.wife);
    return list;
  }, [coupleInfo]);

  useEffect(() => {
    loadPageData();
  }, []);

  const loadPageData = async () => {
    setIsLoading(true);
    try {
      const meResponse = await userApi.getMe();
      if (meResponse.success) {
        setUser(meResponse.data);
      }

      try {
        const coupleResponse = await coupleApi.getInfo();
        if (coupleResponse.success) {
          setCoupleInfo(coupleResponse.data);
        }
      } catch (error: any) {
        setCoupleInfo(null);
      }
    } catch (error: any) {
      Alert.alert('提示', error?.message || '加载信息失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCouple = async () => {
    if (!user) return;

    setIsActionLoading(true);
    try {
      const response = await coupleApi.create({ role: user.role });
      if (response.success) {
        setCoupleInfo(response.data);
        Alert.alert('成功', '家庭创建成功，请将邀请码发给另一半');
      }
    } catch (error: any) {
      Alert.alert('创建失败', error?.message || '请稍后重试');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleJoinCouple = async () => {
    const code = inviteCode.trim().toUpperCase();
    if (!code) {
      Alert.alert('提示', '请输入邀请码');
      return;
    }

    setIsActionLoading(true);
    try {
      const response = await coupleApi.join({ inviteCode: code });
      if (response.success) {
        setCoupleInfo(response.data);
        setInviteCode('');
        Alert.alert('成功', '加入家庭成功');
      }
    } catch (error: any) {
      Alert.alert('加入失败', error?.message || '邀请码无效或家庭已满');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCopyInviteCode = async () => {
    const code = coupleInfo?.inviteCode?.trim();
    if (!code) {
      Alert.alert('提示', '当前没有可复制的邀请码');
      return;
    }

    await Clipboard.setStringAsync(code);
    Alert.alert('已复制', `邀请码 ${code} 已复制到剪贴板`);
  };

  const handleLogout = async () => {
    Alert.alert('退出登录', '确定要退出登录吗？', [
      {
        text: '取消',
        style: 'cancel',
      },
      {
        text: '确定',
        onPress: async () => {
          try {
            try {
              await userApi.logout();
            } catch (error) {
              console.log('后端退出接口调用失败，但继续清除本地 token');
            }

            await logoutAuth();
            router.replace('/login');
          } catch (error) {
            Alert.alert('提示', '退出失败，请重试');
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-100">
        <ActivityIndicator size="large" color="#2573F9" />
        <ThemedText className="mt-3 text-gray-500">加载中...</ThemedText>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="bg-blue-600 py-5 px-4">
        <ThemedText className="text-2xl font-bold text-white">我的</ThemedText>
      </ThemedView>

      <ScrollView className="bg-gray-100">
        <View className="bg-blue-600 mx-4 mt-4 rounded-xl p-4">
          <View className="flex-row items-center">
            <ThemedText className="text-3xl mr-3">
              {user?.role === 'wife' ? '👩' : '👨'}
            </ThemedText>
            <View>
              <ThemedText className="text-white font-bold">
                {user?.name || '未命名用户'}
              </ThemedText>
              <ThemedText className="text-white text-sm">
                {user?.role ? roleTextMap[user.role] : '--'}
              </ThemedText>
            </View>
          </View>
        </View>

        <View className="bg-white mx-4 mt-4 rounded-xl p-4 shadow-sm">
          <View className="flex-row items-center mb-3">
            <ThemedText className="text-lg mr-2">👥</ThemedText>
            <ThemedText className="text-base font-medium">家庭配对</ThemedText>
          </View>

          {coupleInfo ? (
            <>
              <View className="bg-blue-50 rounded-lg px-3 py-2 mb-3">
                <ThemedText className="text-sm text-blue-600">邀请码</ThemedText>
                <View className="flex-row items-center justify-between mt-1">
                  <ThemedText className="text-xl font-bold text-blue-700">
                    {coupleInfo.inviteCode || '--'}
                  </ThemedText>
                  <TouchableOpacity
                    className="bg-blue-600 rounded-md px-3 py-1"
                    onPress={handleCopyInviteCode}
                  >
                    <ThemedText className="text-white text-xs">复制</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>

              <ThemedText className="text-sm text-gray-500 mb-2">家庭成员</ThemedText>
              {members.length > 0 ? (
                members.map(member => (
                  <View
                    key={member.id}
                    className="flex-row items-center justify-between border border-gray-200 rounded-lg px-3 py-2 mb-2"
                  >
                    <ThemedText className="text-sm text-gray-800">
                      {member.name}
                    </ThemedText>
                    <ThemedText className="text-sm text-gray-500">
                      {roleTextMap[member.role]}
                    </ThemedText>
                  </View>
                ))
              ) : (
                <ThemedText className="text-sm text-gray-500">
                  暂无成员信息
                </ThemedText>
              )}
            </>
          ) : (
            <>
              <ThemedText className="text-sm text-gray-500 mb-4">
                您还未配对，请创建家庭或输入邀请码加入
              </ThemedText>

              <TouchableOpacity
                className="bg-pink-500 rounded-lg py-3 items-center mb-3"
                onPress={handleCreateCouple}
                disabled={isActionLoading}
              >
                <ThemedText className="text-white font-medium">
                  {isActionLoading ? '处理中...' : '创建家庭'}
                </ThemedText>
              </TouchableOpacity>

              <TextInput
                className="border border-gray-300 bg-white rounded-lg px-3 py-3 mb-3"
                placeholder="输入邀请码，如 ABC123"
                value={inviteCode}
                onChangeText={setInviteCode}
                autoCapitalize="characters"
              />

              <TouchableOpacity
                className="bg-blue-600 rounded-lg py-3 items-center"
                onPress={handleJoinCouple}
                disabled={isActionLoading}
              >
                <ThemedText className="text-white font-medium">
                  {isActionLoading ? '处理中...' : '加入家庭'}
                </ThemedText>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View className="bg-white mx-4 mt-4 rounded-xl p-4 shadow-sm">
          <View className="flex-row items-center mb-3">
            <ThemedText className="text-lg mr-2">👤</ThemedText>
            <ThemedText className="text-base font-medium">账号信息</ThemedText>
          </View>

          <View className="border-b border-gray-200 py-3">
            <View className="flex-row justify-between">
              <ThemedText className="text-sm text-gray-500">用户ID</ThemedText>
              <ThemedText className="text-sm">{user?.id || '--'}</ThemedText>
            </View>
          </View>

          <View className="border-b border-gray-200 py-3">
            <View className="flex-row justify-between">
              <ThemedText className="text-sm text-gray-500">角色</ThemedText>
              <ThemedText className="text-sm">
                {user?.role ? roleTextMap[user.role] : '--'}
              </ThemedText>
            </View>
          </View>

          <View className="py-3">
            <View className="flex-row justify-between">
              <ThemedText className="text-sm text-gray-500">家庭ID</ThemedText>
              <ThemedText className="text-sm">{coupleInfo?.id || '未配对'}</ThemedText>
            </View>
          </View>
        </View>

        <TouchableOpacity
          className="mx-4 mt-6 border border-red-500 rounded-lg py-3 items-center"
          onPress={handleLogout}
        >
          <ThemedText className="text-red-500 font-medium">退出登录</ThemedText>
        </TouchableOpacity>

        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
