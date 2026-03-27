import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function HomeScreen() {
  const [data, setData] = useState([
    {
      type: "expense",
      label: "餐饮",
      time: "2023-12-12",
      remark: "123",
      role: "1",
      amount: "12",
    },
  ]);
  console.log("data", data);
  return (
    <SafeAreaView style={{ display: "flex", flex: 1 }}>
      <ThemedView style={styles.headerContainer}>
        <ThemedText style={styles.title}>记账本</ThemedText>
        <ThemedView style={styles.balanceContainer}>
          <ThemedText style={styles.balanceTitle}>总余额</ThemedText>
          <ThemedText style={styles.balanceAmount}>¥0.00</ThemedText>
          <ThemedView style={styles.incomeExpenseContainer}>
            <ThemedText style={styles.incomeExpense}>↗ 收入 ¥0.00</ThemedText>
            <ThemedText style={styles.incomeExpense}>↘ 支出 ¥0.00</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
      <ScrollView style={styles.recentRecordsContainer}>
        <ThemedText style={styles.recentRecordsTitle}>最近记录</ThemedText>
        {data.length === 0 && (
          <>
            <ThemedText style={styles.noRecords}>暂无记录</ThemedText>
            <ThemedText style={styles.addRecordHint}>
              点击下方"记账"开始添加
            </ThemedText>
          </>
        )}
        {data.map((item, index) => (
          <ThemedView style={styles.recordItem} key={index}>
            <ThemedView>
              <ThemedText>123</ThemedText>
            </ThemedView>
            <ThemedView style={{ flex: 1, marginLeft: 20 }}>
              <ThemedText>{item.label}</ThemedText>
              <ThemedText>
                {item.role === "1" ? "男" : "女"}.{item.time}
              </ThemedText>
              <ThemedText>{item.remark}</ThemedText>
            </ThemedView>
            <ThemedView>
              <ThemedText
                style={{ color: item.type === "income" ? "green" : "red" }}
              >
                {item.type === "income" ? "+" : "-"}${item.amount}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: "rgb(37, 115, 249)",
    padding: 20,
    borderRadius: 20,
  },
  title: {
    fontSize: 24,
    color: "#fff",
    marginBottom: 20,
  },
  balanceContainer: {
    backgroundColor: "rgba(78, 139, 251)",
    borderRadius: 20,
    padding: 20,
  },
  balanceTitle: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 10,
  },
  balanceAmount: {
    fontSize: 32,
    color: "#fff",
    marginBottom: 10,
  },
  incomeExpenseContainer: {
    backgroundColor: "rgba(78, 139, 251)",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  incomeExpense: {
    fontSize: 16,
    color: "#fff",
  },
  recentRecordsContainer: {
    flex: 1,
    padding: 20,
    overflow: "scroll",
  },
  recentRecordsTitle: {
    fontSize: 18,
    marginBottom: 10,
    color: "#000",
  },
  noRecords: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginTop: 20,
  },
  addRecordHint: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginTop: 10,
  },
  recordItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
});
