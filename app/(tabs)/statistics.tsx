import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { ProgressBar } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
export default function Statistics() {
  return (
    <SafeAreaView>
      <ThemedView style={styles.headerContainer}>
        <ThemedText style={styles.title}>统计分析</ThemedText>
        <ThemedView style={styles.balanceContainer}></ThemedView>
      </ThemedView>
      <ScrollView>
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
            <Text className="text-sm text-gray-600 opacity-90 font-medium text-3xl mb-2">支出分布</Text>
            <View className="text-2xl text-gray-600 ">
              <View className="flex-row justify-between">
                <Text>丈夫</Text>
                <Text>¥100</Text>
              </View>
            </View>
            <ProgressBar progress={0.5}  className="mb-4" />
            <View className="text-2xl text-gray-600">
              <View className="flex-row justify-between">
                <Text>妻子</Text>
                <Text>¥100</Text>
              </View>
            </View>
            <ProgressBar progress={0.5} />
          </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: "rgb(37, 115, 249)",
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 24,
    color: "#fff",
    marginBottom: 20,
  },
});
