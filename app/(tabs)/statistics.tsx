import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { ProgressBar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Statistics() {
  const screenWidth = Dimensions.get('window').width;

  const pieData = [
    {
      name: '交通',
      population: 123,
      color: '#2573F9',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    },
    {
      name: '餐饮',
      population: 12,
      color: '#FF3B30',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    },
  ];

  return (
    <SafeAreaView className="flex-1">
      <ThemedView style={styles.headerContainer}>
        <ThemedText style={styles.title}>统计分析</ThemedText>
        <View className="flex-row items-center justify-between mt-2">
          <ThemedText style={styles.dateText}>2026年03月</ThemedText>
          <TouchableOpacity>
            <MaterialIcons name="calendar-today" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </ThemedView>
      <ScrollView className="flex-1">
        <View className="flex-row p-5 rounded">
          <View className="flex-1 bg-green-400 text-white rounded-xl p-4 shadow-md mr-2">
            <Text className="text-sm text-white opacity-90">总收入</Text>
            <Text className="text-2xl text-white">¥总收入</Text>
          </View>
          <View className="flex-1 bg-red-400 text-white rounded-xl p-4 shadow-md">
            <Text className="text-sm text-white opacity-90">总支出</Text>
            <Text className="text-2xl text-white">¥总支出</Text>
          </View>
        </View>
        <View className="bg-white m-5 rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
          <Text className="text-sm text-gray-600 opacity-90">本月结余</Text>
          <Text className="text-2xl text-gray-600">¥本月结余</Text>
        </View>
        <View className="bg-white m-5 rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
          <Text className="text-sm text-gray-600 opacity-90 font-medium text-3xl mb-2">
            支出分布
          </Text>
          <View className="text-2xl text-gray-600 ">
            <View className="flex-row justify-between">
              <Text>丈夫</Text>
              <Text>¥100</Text>
            </View>
          </View>
          <ProgressBar progress={0.5} className="mb-4" />
          <View className="text-2xl text-gray-600">
            <View className="flex-row justify-between">
              <Text>妻子</Text>
              <Text>¥100</Text>
            </View>
          </View>
          <ProgressBar progress={0.5} />
        </View>

        <View className="bg-white m-5 rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
          <ThemedText className="text-lg font-medium mb-4">
            支出分类统计
          </ThemedText>
          <View className="flex items-center">
            <PieChart
              data={pieData}
              width={screenWidth - 60}
              height={200}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: 'rgb(37, 115, 249)',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  dateText: {
    fontSize: 16,
    color: '#fff',
  },
});
