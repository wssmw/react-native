import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ScrollView, StyleSheet, Text, View } from "react-native";
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
          <View className="flex-1 mr-5 bg-red-400 rounded">
            <Text>总收入</Text>
            <Text>总收入</Text>
          </View>
          <View className="flex-1 bg-blue-400 rounded">
            <Text>总支出</Text>
            <Text>总支出</Text>
          </View>
        </View>
        <View>
          <Text>收入</Text>
          <Text>收入</Text>
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
