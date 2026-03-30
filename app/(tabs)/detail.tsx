import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function HomeScreen() {
  const [data, setData] = useState([
    {
      date: '2023-12-12',
      total: 10,
      secData: [
        {
          type: 'expense',
          label: '餐饮',
          time: '2023-12-12',
          remark: '123',
          role: '1',
          amount: '12',
        },
        {
          type: 'expense',
          label: '餐饮',
          time: '2023-12-12',
          remark: '123',
          role: '1',
          amount: '12',
        },
      ],
    },
    {
      date: '2023-12-12',
      total: 10,
      secData: [
        {
          type: 'expense',
          label: '餐饮',
          time: '2023-12-12',
          remark: '123',
          role: '1',
          amount: '12',
        },
        {
          type: 'expense',
          label: '餐饮',
          time: '2023-12-12',
          remark: '123',
          role: '1',
          amount: '12',
        },
      ],
    },
    {
      date: '2023-12-12',
      total: 10,
      secData: [
        {
          type: 'expense',
          label: '餐饮',
          time: '2023-12-12',
          remark: '123',
          role: '1',
          amount: '12',
        },
        {
          type: 'expense',
          label: '餐饮',
          time: '2023-12-12',
          remark: '123',
          role: '1',
          amount: '12',
        },
      ],
    },
  ]);
  const [selectedTab, setSelectedTab] = useState('全部');

  const filteredData = data.filter(item => {
    if (selectedTab === '全部') return true;
    return item.type === selectedTab.toLowerCase();
  });
  console.log('data', data);
  return (
    <SafeAreaView style={{ display: 'flex', flex: 1 }}>
      <ThemedView style={styles.headerContainer}>
        <ThemedText style={styles.title}>账单明细</ThemedText>
        <ThemedView style={styles.tabContainer}>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => setSelectedTab('全部')}
          >
            <ThemedText
              style={[styles.tab, selectedTab === '全部' && styles.activeTab]}
            >
              全部
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => setSelectedTab('income')}
          >
            <ThemedText
              style={[styles.tab, selectedTab === 'income' && styles.activeTab]}
            >
              收入
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => setSelectedTab('expense')}
          >
            <ThemedText
              style={[
                styles.tab,
                selectedTab === 'expense' && styles.activeTab,
              ]}
            >
              支出
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
      <ScrollView style={styles.recentRecordsContainer}>
        {data.length === 0 && (
          <>
            <ThemedText style={styles.noRecords}>暂无记录</ThemedText>
            <ThemedText style={styles.addRecordHint}>
              点击下方"记账"开始添加
            </ThemedText>
          </>
        )}
        {data.map((item, index) => (
          <View key={index} style={styles.recordItem}>
            <View style={styles.recordItemTitle}>
              <Text>{item.date}</Text>
              <Text>${item.total}</Text>
            </View>
            {item.secData.map((secItem, secIndex) => (
              <ThemedView style={styles.secRecordItem} key={secIndex}>
                <ThemedView>
                  <ThemedText>123</ThemedText>
                </ThemedView>
                <ThemedView style={{ flex: 1, marginLeft: 20 }}>
                  <ThemedText>{secItem.label}</ThemedText>
                  <ThemedText>
                    {secItem.role === '1' ? '男' : '女'}.{secItem.time}
                  </ThemedText>
                  <ThemedText>{secItem.remark}</ThemedText>
                </ThemedView>
                <ThemedView>
                  <ThemedText
                    style={{
                      color: secItem.type === 'income' ? 'green' : 'red',
                    }}
                  >
                    {secItem.type === 'income' ? '+' : '-'}${secItem.amount}
                  </ThemedText>
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
  headerContainer: {
    backgroundColor: 'rgb(37, 115, 249)',
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 20,
  },
  balanceContainer: {
    backgroundColor: 'rgba(78, 139, 251)',
    borderRadius: 20,
    padding: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderRadius: 20,
    marginBottom: 20,
    padding: 3,
    backgroundColor: 'rgba(77, 138, 252)',
  },
  tab: {
    textAlign: 'center',
    padding: 10,
    borderRadius: 20,
    color: '#fff',
  },
  activeTab: {
    backgroundColor: '#fff',
    color: 'black',
  },
  recentRecordsContainer: {
    flex: 1,
    padding: 20,
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
    borderRadius: 10,
    marginBottom: 10,
  },
  recordItemTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  secRecordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
});
