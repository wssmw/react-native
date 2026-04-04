import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GroupedRecordItem, RecordItem, recordApi } from '@/request/api';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useCallback, useEffect, useMemo, useState } from 'react';
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

type DetailTab = '全部' | 'income' | 'expense';

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
  const value = Number(amount) || 0;
  return `¥${value.toFixed(2)}`;
}

function formatGroupDate(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatRecordTime(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  const hours = String(parsed.getHours()).padStart(2, '0');
  const minutes = String(parsed.getMinutes()).padStart(2, '0');

  return `${hours}:${minutes}`;
}

function getRecordCategoryLabel(category: string) {
  return categoryLabelMap[category] || category;
}

function getRecordCategoryIcon(category: string) {
  return categoryIconMap[category] || 'receipt-long';
}

function getRecordAmountColor(type: RecordItem['type']) {
  return type === 'income' ? '#16a34a' : '#dc2626';
}

function getRecordSign(type: RecordItem['type']) {
  return type === 'income' ? '+' : '-';
}

export default function DetailScreen() {
  const [selectedTab, setSelectedTab] = useState<DetailTab>('全部');
  const [groupedData, setGroupedData] = useState<GroupedRecordItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadGroupedRecords = useCallback(
    async (refreshing = false) => {
      if (refreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const response = await recordApi.getGroupedByDate({
          page: 1,
          limit: 50,
          type: selectedTab === '全部' ? '' : selectedTab,
        });

        if (response.success) {
          setGroupedData(response.data.list ?? []);
        }
      } catch (error: any) {
        Alert.alert(
          '加载失败',
          error?.message || '明细数据加载失败，请稍后重试'
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [selectedTab]
  );

  useEffect(() => {
    loadGroupedRecords();
  }, [loadGroupedRecords]);

  const summaryText = useMemo(() => {
    if (selectedTab === 'income') return '当前展示收入记录';
    if (selectedTab === 'expense') return '当前展示支出记录';
    return '当前展示全部记录';
  }, [selectedTab]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2573F9" />
        <ThemedText style={styles.loadingText}>明细加载中...</ThemedText>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.headerContainer}>
        <View style={styles.headerTitleRow}>
          <ThemedText style={styles.title}>账单明细</ThemedText>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={() => loadGroupedRecords(true)}
          >
            <MaterialIcons name="refresh" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <ThemedView style={styles.tabContainer}>
          {(['全部', 'income', 'expense'] as DetailTab[]).map(tab => (
            <TouchableOpacity
              key={tab}
              style={styles.tabButton}
              onPress={() => setSelectedTab(tab)}
            >
              <ThemedText
                style={[styles.tab, selectedTab === tab && styles.activeTab]}
              >
                {tab === '全部' ? '全部' : tab === 'income' ? '收入' : '支出'}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ThemedView>

        <ThemedText style={styles.headerHint}>{summaryText}</ThemedText>
      </ThemedView>

      <ScrollView
        style={styles.recentRecordsContainer}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadGroupedRecords(true)}
            tintColor="#2573F9"
          />
        }
      >
        {groupedData.length === 0 && (
          <>
            <ThemedText style={styles.noRecords}>暂无记录</ThemedText>
            <ThemedText style={styles.addRecordHint}>
              点击下方“记账”开始添加
            </ThemedText>
          </>
        )}

        {groupedData.map(group => (
          <View key={group.date} style={styles.recordGroup}>
            <View style={styles.recordItemTitle}>
              <View>
                <ThemedText style={styles.groupDateText}>
                  {formatGroupDate(group.date)}
                </ThemedText>
                <ThemedText style={styles.groupBalanceText}>
                  结余 {formatAmount(group.balance)}
                </ThemedText>
              </View>
              <View style={styles.groupTotals}>
                <ThemedText style={styles.groupIncomeText}>
                  收入 {formatAmount(group.totalIncome)}
                </ThemedText>
                <ThemedText style={styles.groupExpenseText}>
                  支出 {formatAmount(group.totalExpense)}
                </ThemedText>
              </View>
            </View>

            {group.records.map(record => (
              <ThemedView style={styles.secRecordItem} key={record.id}>
                <View style={styles.recordIconBox}>
                  <MaterialIcons
                    name={getRecordCategoryIcon(record.category)}
                    size={22}
                    color="#1d4ed8"
                  />
                </View>

                <ThemedView style={styles.recordContent}>
                  <View style={styles.recordMainRow}>
                    <ThemedText style={styles.recordLabel}>
                      {getRecordCategoryLabel(record.category)}
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.recordAmount,
                        { color: getRecordAmountColor(record.type) },
                      ]}
                    >
                      {getRecordSign(record.type)}
                      {formatAmount(record.amount)}
                    </ThemedText>
                  </View>

                  <View style={styles.recordMetaRow}>
                    <ThemedText style={styles.recordMeta}>
                      {personLabelMap[record.person]} ·{' '}
                      {formatRecordTime(record.createdAt)}
                    </ThemedText>
                    {!!record.note && (
                      <ThemedText style={styles.recordNote} numberOfLines={1}>
                        {record.note}
                      </ThemedText>
                    )}
                  </View>
                </ThemedView>
              </ThemedView>
            ))}
          </View>
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
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderRadius: 20,
    marginBottom: 12,
    padding: 3,
    backgroundColor: 'rgba(77, 138, 252, 1)',
  },
  tabButton: {
    flex: 1,
  },
  tab: {
    textAlign: 'center',
    paddingVertical: 10,
    borderRadius: 20,
    color: '#fff',
    fontWeight: '500',
  },
  activeTab: {
    backgroundColor: '#fff',
    color: '#111827',
    fontWeight: '700',
  },
  headerHint: {
    color: '#dbeafe',
    fontSize: 13,
  },
  recentRecordsContainer: {
    flex: 1,
    padding: 16,
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
  recordGroup: {
    marginBottom: 18,
  },
  recordItemTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  groupDateText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  groupBalanceText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  groupTotals: {
    alignItems: 'flex-end',
  },
  groupIncomeText: {
    fontSize: 12,
    color: '#16a34a',
    marginBottom: 2,
  },
  groupExpenseText: {
    fontSize: 12,
    color: '#dc2626',
  },
  secRecordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
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
