import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  CategoryStatisticsData,
  CategoryStatisticsItem,
  PersonStatisticsData,
  statisticsApi,
  SummaryStats,
} from '@/request/api';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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

const categoryNameMap: Record<string, string> = {
  food: '餐饮',
  transport: '交通',
  shopping: '购物',
  entertainment: '娱乐',
  house: '住房',
  medical: '医疗',
  education: '教育',
  other_expense: '其他支出',
  salary: '工资',
  bonus: '奖金',
  investment: '投资',
  other_income: '其他收入',
};

const pieColors = ['#2573F9', '#FF6B6B', '#F59E0B', '#10B981', '#8B5CF6'];

function getMonthRange(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();

  const startDate = new Date(year, month, 1).toISOString().slice(0, 10);
  const endDate = new Date(year, month + 1, 0).toISOString().slice(0, 10);

  return { startDate, endDate };
}

function formatAmount(value: number) {
  return `¥${value.toFixed(2)}`;
}

export default function Statistics() {
  const screenWidth = Dimensions.get('window').width;
  const [currentDate] = useState(new Date());

  const [summary, setSummary] = useState<SummaryStats>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
  });
  const [personStats, setPersonStats] = useState<PersonStatisticsData>({
    husband: { count: 0, totalIncome: 0, totalExpense: 0 },
    wife: { count: 0, totalIncome: 0, totalExpense: 0 },
  });
  const [categoryStats, setCategoryStats] = useState<CategoryStatisticsData>({
    expense: [],
    income: [],
  });
  const [loading, setLoading] = useState(true);

  const { startDate, endDate } = useMemo(
    () => getMonthRange(currentDate),
    [currentDate]
  );

  const loadStatistics = useCallback(async () => {
    setLoading(true);
    try {
      const [summaryRes, personRes, categoryRes] = await Promise.all([
        statisticsApi.getSummary({
          start_date: startDate,
          end_date: endDate,
        }),
        statisticsApi.getByPerson({
          start_date: startDate,
          end_date: endDate,
        }),
        statisticsApi.getByCategory({
          start_date: startDate,
          end_date: endDate,
        }),
      ]);
      console.log('summaryRes', summaryRes);
      console.log('personRes', personRes);
      console.log('categoryRes', categoryRes);
      if (summaryRes.success) {
        setSummary(summaryRes.data);
      }
      if (personRes.success) {
        setPersonStats(personRes.data);
      }
      if (categoryRes.success) {
        setCategoryStats(categoryRes.data);
      }
    } catch {
      setSummary({ totalIncome: 0, totalExpense: 0, balance: 0 });
      setPersonStats({
        husband: { count: 0, totalIncome: 0, totalExpense: 0 },
        wife: { count: 0, totalIncome: 0, totalExpense: 0 },
      });
      setCategoryStats({ expense: [], income: [] });
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  const husbandExpense = personStats.husband?.totalExpense || 0;
  const wifeExpense = personStats.wife?.totalExpense || 0;
  const totalPersonExpense = husbandExpense + wifeExpense;

  const husbandProgress =
    totalPersonExpense > 0 ? husbandExpense / totalPersonExpense : 0;
  const wifeProgress =
    totalPersonExpense > 0 ? wifeExpense / totalPersonExpense : 0;

  const pieData = (categoryStats.expense || [])
    .slice(0, 5)
    .map((item: CategoryStatisticsItem, index: number) => ({
      name: categoryNameMap[item.category] || item.category,
      population: item.totalAmount,
      color: pieColors[index % pieColors.length],
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    }));
  console.log('pieData', pieData);
  const monthText = `${currentDate.getFullYear()}年${String(
    currentDate.getMonth() + 1
  ).padStart(2, '0')}月`;

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2573F9" />
        <ThemedText className="mt-2 text-gray-500">
          统计数据加载中...
        </ThemedText>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <ThemedView style={styles.headerContainer}>
        <ThemedText style={styles.title}>统计分析</ThemedText>
        <View className="flex-row items-center justify-between mt-2">
          <ThemedText style={styles.dateText}>{monthText}</ThemedText>
          <TouchableOpacity onPress={loadStatistics}>
            <MaterialIcons name="refresh" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </ThemedView>
      <ScrollView className="flex-1">
        <View className="flex-row p-5 rounded">
          <View className="flex-1 bg-green-400 text-white rounded-xl p-4 shadow-md mr-2">
            <Text className="text-sm text-white opacity-90">总收入</Text>
            <Text className="text-2xl text-white">
              {formatAmount(summary.totalIncome)}
            </Text>
          </View>
          <View className="flex-1 bg-red-400 text-white rounded-xl p-4 shadow-md">
            <Text className="text-sm text-white opacity-90">总支出</Text>
            <Text className="text-2xl text-white">
              {formatAmount(summary.totalExpense)}
            </Text>
          </View>
        </View>
        <View className="bg-white m-5 rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
          <Text className="text-sm text-gray-600 opacity-90">本月结余</Text>
          <Text className="text-2xl text-gray-600">
            {formatAmount(summary.balance)}
          </Text>
        </View>
        <View className="bg-white m-5 rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
          <Text className="text-sm text-gray-600 opacity-90 font-medium text-3xl mb-2">
            支出分布
          </Text>
          <View className="text-2xl text-gray-600 ">
            <View className="flex-row justify-between">
              <Text>丈夫</Text>
              <Text>{formatAmount(husbandExpense)}</Text>
            </View>
          </View>
          <ProgressBar progress={husbandProgress} className="mb-4" />
          <View className="text-2xl text-gray-600">
            <View className="flex-row justify-between">
              <Text>妻子</Text>
              <Text>{formatAmount(wifeExpense)}</Text>
            </View>
          </View>
          <ProgressBar progress={wifeProgress} />
        </View>

        <View className="bg-white m-5 rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
          <ThemedText className="text-lg font-medium mb-4">
            支出分类统计
          </ThemedText>
          {pieData.length > 0 ? (
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
          ) : (
            <ThemedText className="text-gray-500">
              当前月份暂无分类数据
            </ThemedText>
          )}
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
