import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { HomeOverviewData, RecordItem, statisticsApi } from '@/request/api';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const categoryLabelMap: Record<string, string> = {
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

const categoryIconMap: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  food: 'restaurant',
  transport: 'directions-car',
  shopping: 'shopping-bag',
  entertainment: 'sports-esports',
  house: 'home',
  medical: 'local-hospital',
  education: 'school',
  other_expense: 'more-horiz',
  salary: 'account-balance-wallet',
  bonus: 'card-giftcard',
  investment: 'trending-up',
  other_income: 'more-horiz',
};

const personLabelMap: Record<'husband' | 'wife', string> = {
  husband: '丈夫',
  wife: '妻子',
};

function formatAmount(amount: number) {
  amount = Number(amount);
  return `¥${amount.toFixed(2)}`;
}

function formatRecordDate(date: string) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');

  return `${month}-${day}`;
}

function getRecordCategoryLabel(category: string) {
  return categoryLabelMap[category] || category;
}

function getRecordCategoryIcon(category: string) {
  return categoryIconMap[category] || 'receipt-long';
}

function getRecordSign(type: RecordItem['type']) {
  return type === 'income' ? '+' : '-';
}

function getRecordAmountColor(type: RecordItem['type']) {
  return type === 'income' ? '#16a34a' : '#dc2626';
}

export default function HomeScreen() {
  const [overview, setOverview] = useState<HomeOverviewData>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    recentRecords: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadOverview = useCallback(async (refreshing = false) => {
    if (refreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const response = await statisticsApi.getHomeOverview({ limit: 10 });
      console.log(response, 'response');
      if (response.success) {
        setOverview({
          totalIncome: response.data.totalIncome ?? 0,
          totalExpense: response.data.totalExpense ?? 0,
          balance: response.data.balance ?? 0,
          recentRecords: response.data.recentRecords ?? [],
        });
      }
    } catch (error: any) {
      Alert.alert('加载失败', error?.message || '首页数据加载失败，请稍后重试');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2573F9" />
        <ThemedText style={styles.loadingText}>首页数据加载中...</ThemedText>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.headerContainer}>
        <View style={styles.headerTitleRow}>
          <ThemedText style={styles.title}>记账本</ThemedText>
          <TouchableOpacity
            onPress={() => loadOverview(true)}
            style={styles.refreshButton}
          >
            <MaterialIcons name="refresh" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <ThemedView style={styles.balanceContainer}>
          <ThemedText style={styles.balanceTitle}>总余额</ThemedText>
          <ThemedText style={styles.balanceAmount}>
            {formatAmount(overview.balance)}
          </ThemedText>
          <ThemedView style={styles.incomeExpenseContainer}>
            <ThemedText style={styles.incomeExpense}>
              ↗ 收入 {formatAmount(overview.totalIncome)}
            </ThemedText>
            <ThemedText style={styles.incomeExpense}>
              ↘ 支出 {formatAmount(overview.totalExpense)}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      <ScrollView
        style={styles.recentRecordsContainer}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadOverview(true)}
            tintColor="#2573F9"
          />
        }
      >
        <ThemedText style={styles.recentRecordsTitle}>最近记录</ThemedText>

        {overview.recentRecords.length === 0 && (
          <>
            <ThemedText style={styles.noRecords}>暂无记录</ThemedText>
            <ThemedText style={styles.addRecordHint}>
              点击下方“记账”开始添加
            </ThemedText>
          </>
        )}

        {overview.recentRecords.map(item => (
          <ThemedView style={styles.recordItem} key={item.id}>
            <View style={styles.recordIconBox}>
              <MaterialIcons
                name={getRecordCategoryIcon(item.category)}
                size={22}
                color="#1d4ed8"
              />
            </View>

            <ThemedView style={styles.recordContent}>
              <View style={styles.recordMainRow}>
                <ThemedText style={styles.recordLabel}>
                  {getRecordCategoryLabel(item.category)}
                </ThemedText>
                <ThemedText
                  style={[
                    styles.recordAmount,
                    { color: getRecordAmountColor(item.type) },
                  ]}
                >
                  {getRecordSign(item.type)}
                  {formatAmount(item.amount)}
                </ThemedText>
              </View>

              <View style={styles.recordMetaRow}>
                <ThemedText style={styles.recordMeta}>
                  {personLabelMap[item.person]} · {formatRecordDate(item.date)}
                </ThemedText>
                {!!item.note && (
                  <ThemedText style={styles.recordNote} numberOfLines={1}>
                    {item.note}
                  </ThemedText>
                )}
              </View>
            </ThemedView>
          </ThemedView>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
  },
  headerContainer: {
    backgroundColor: 'rgb(37, 115, 249)',
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '700',
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  balanceContainer: {
    backgroundColor: 'rgba(78, 139, 251, 0.95)',
    borderRadius: 20,
    padding: 20,
  },
  balanceTitle: {
    fontSize: 16,
    color: '#dbeafe',
    marginBottom: 10,
  },
  balanceAmount: {
    fontSize: 32,
    lineHeight: 36,
    color: '#fff',
    marginBottom: 14,
    fontWeight: '700',
  },
  incomeExpenseContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: 'transparent',
  },
  incomeExpense: {
    flex: 1,
    fontSize: 15,
    color: '#eff6ff',
  },
  recentRecordsContainer: {
    flex: 1,
    padding: 16,
  },
  recentRecordsTitle: {
    fontSize: 18,
    marginBottom: 14,
    color: '#111827',
    fontWeight: '700',
  },
  noRecords: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  addRecordHint: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
  },
  recordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  recordIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  recordContent: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  recordMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  recordLabel: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
  },
  recordAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  recordMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  recordMeta: {
    fontSize: 13,
    color: '#6b7280',
  },
  recordNote: {
    flex: 1,
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'right',
  },
});
