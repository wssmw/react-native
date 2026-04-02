import { ScrollView, Text, View, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'expo-router';
import { userApi } from '@/request/api';

export default function Home() {
  const { logout: logoutAuth } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert(
      '退出登录',
      '确定要退出登录吗？',
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '确定',
          onPress: async () => {
            try {
              // 调用后端退出接口（如果有需要）
              try {
                await userApi.logout();
              } catch (error) {
                console.log('后端退出接口调用失败，但继续清除本地 token');
              }
              
              // 清除本地 token
              await logoutAuth();
              
              // 跳转到登录页
              router.replace('/login');
            } catch (error) {
              console.error('退出登录失败:', error);
              Alert.alert('提示', '退出失败，请重试');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView>
      <ThemedView className="bg-blue-600 py-5 px-4">
        <ThemedText className="text-2xl font-bold text-white">我的</ThemedText>
      </ThemedView>
      <ScrollView className="bg-gray-100">
        <View className="bg-blue-600 mx-4 mt-4 rounded-xl p-4">
          <View className="flex-row items-center">
            <ThemedText className="text-3xl mr-3">👨</ThemedText>
            <View>
              <ThemedText className="text-white font-bold">WSS</ThemedText>
              <ThemedText className="text-white text-sm">丈夫</ThemedText>
            </View>
          </View>
        </View>

        <View className="bg-white mx-4 mt-4 rounded-xl p-4 shadow-sm">
          <View className="flex-row items-center mb-3">
            <ThemedText className="text-lg mr-2">👥</ThemedText>
            <ThemedText className="text-base font-medium">家庭配对</ThemedText>
          </View>
          <ThemedText className="text-sm text-gray-500 mb-4">
            您还未配对，请创建或加入家庭
          </ThemedText>
          <TouchableOpacity className="bg-pink-500 rounded-lg py-3 items-center">
            <ThemedText className="text-white font-medium">立即配对</ThemedText>
          </TouchableOpacity>
        </View>

        <View className="bg-white mx-4 mt-4 rounded-xl p-4 shadow-sm">
          <View className="flex-row items-center mb-3">
            <ThemedText className="text-lg mr-2">👤</ThemedText>
            <ThemedText className="text-base font-medium">账号信息</ThemedText>
          </View>
          <View className="border-b border-gray-200 py-3">
            <View className="flex-row justify-between">
              <ThemedText className="text-sm text-gray-500">用户ID</ThemedText>
              <ThemedText className="text-sm">177475616816</ThemedText>
            </View>
          </View>
          <View className="border-b border-gray-200 py-3">
            <View className="flex-row justify-between">
              <ThemedText className="text-sm text-gray-500">角色</ThemedText>
              <ThemedText className="text-sm">丈夫</ThemedText>
            </View>
          </View>
          <View className="py-3">
            <View className="flex-row justify-between">
              <ThemedText className="text-sm text-gray-500">家庭ID</ThemedText>
              <ThemedText className="text-sm">未配对</ThemedText>
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
