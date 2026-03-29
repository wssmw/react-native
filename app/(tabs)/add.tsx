import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AddRecord() {
  const [selectedType, setSelectedType] = useState("expense");
  const [amount, setAmount] = useState("0.00");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedPerson, setSelectedPerson] = useState("丈夫");
  const [date, setDate] = useState("2026/03/29");
  const [dateObj, setDateObj] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [remark, setRemark] = useState("");

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDateObj(selectedDate);
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      setDate(`${year}/${month}/${day}`);
    }
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const expenseCategories = [
    { id: "food", name: "餐饮", icon: "restaurant" },
    { id: "transport", name: "交通", icon: "directions-car" },
    { id: "shopping", name: "购物", icon: "shopping-bag" },
    { id: "entertainment", name: "娱乐", icon: "sports-esports" },
    { id: "housing", name: "住房", icon: "home" },
    { id: "medical", name: "医疗", icon: "local-hospital" },
    { id: "education", name: "教育", icon: "school" },
    { id: "other", name: "其他", icon: "more-horiz" },
  ];

  const incomeCategories = [
    { id: "salary", name: "工资", icon: "account-balance-wallet" },
    { id: "bonus", name: "奖金", icon: "card-giftcard" },
    { id: "investment", name: "投资", icon: "trending-up" },
    { id: "other_income", name: "其他", icon: "more-horiz" },
  ];

  const currentCategories = selectedType === "expense" ? expenseCategories : incomeCategories;

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="flex-row items-center justify-between bg-blue-600 px-4 py-3">
        <TouchableOpacity className="p-1">
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text className=" flex-1 text-xl font-bold text-center text-white">添加记录</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-5">
        <View className="flex-row mb-6 rounded-lg overflow-hidden">
          <TouchableOpacity
            className={`flex-1 py-3 items-center ${selectedType === "expense" ? "bg-red-500" : "bg-gray-300"}`}
            onPress={() => setSelectedType("expense")}
          >
            <ThemedText className={`text-base ${selectedType === "expense" ? "text-white font-bold" : "text-gray-700"}`}>
              支出
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 items-center ${selectedType === "income" ? "bg-green-500" : "bg-gray-300"}`}
            onPress={() => setSelectedType("income")}
          >
            <ThemedText className={`text-base ${selectedType === "income" ? "text-white font-bold" : "text-gray-700"}`}>
              收入
            </ThemedText>
          </TouchableOpacity>
        </View>

        <View className="mb-5">
          <ThemedText className="text-sm text-gray-600 mb-2">金额</ThemedText>
          <View className="flex-row items-center border border-gray-300 bg-white rounded-lg px-4 py-3">
            <Text className="text-2xl text-gray-800 mr-2">¥</Text>
            <TextInput
              className="flex-1 text-2xl text-gray-800"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <View className="mb-5">
          <ThemedText className="text-sm text-gray-600 mb-2">分类</ThemedText>
          <View className="flex-row flex-wrap justify-between">
            {currentCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                className={`w-[22%] items-center justify-center border rounded-lg p-3 mb-4 ${selectedCategory === category.id ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
                onPress={() => setSelectedCategory(category.id)}
              >
                <MaterialIcons
                  name={category.icon as any}
                  size={28}
                  color={selectedCategory === category.id ? "#2573F9" : "#888"}
                />
                <ThemedText className={`text-xs mt-1 ${selectedCategory === category.id ? "text-blue-600 font-bold" : "text-gray-600"}`}>
                  {category.name}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="mb-5">
          <ThemedText className="text-sm text-gray-600 mb-2">记录人</ThemedText>
          <View className="flex-row gap-4">
            <TouchableOpacity
              className={`flex-1 flex-row items-center justify-center border rounded-lg py-3 ${selectedPerson === "丈夫" ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
              onPress={() => setSelectedPerson("丈夫")}
            >
              <ThemedText className="text-lg mr-2">👨</ThemedText>
              <ThemedText className={`text-base ${selectedPerson === "丈夫" ? "text-blue-600 font-bold" : "text-gray-800"}`}>
                丈夫
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 flex-row items-center justify-center border rounded-lg py-3 ${selectedPerson === "妻子" ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
              onPress={() => setSelectedPerson("妻子")}
            >
              <ThemedText className="text-lg mr-2">👩</ThemedText>
              <ThemedText className={`text-base ${selectedPerson === "妻子" ? "text-blue-600 font-bold" : "text-gray-800"}`}>
                妻子
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        <View className="mb-5">
          <ThemedText className="text-sm text-gray-600 mb-2">日期</ThemedText>
          <TouchableOpacity 
            className="flex-row items-center justify-between border border-gray-300 bg-white rounded-lg px-4 py-3"
            onPress={showDatepicker}
          >
            <ThemedText className="text-base text-gray-800">{date}</ThemedText>
            <MaterialIcons name="calendar-today" size={20} color="#888" />
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={dateObj}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
          />
        )}

        <View className="mb-5">
          <ThemedText className="text-sm text-gray-600 mb-2">备注 (可选)</ThemedText>
          <TextInput
            className="border border-gray-300 bg-white rounded-lg px-4 py-3 h-24 text-gray-800"
            value={remark}
            onChangeText={setRemark}
            placeholder="记录一些备注信息..."
            placeholderTextColor="#888"
            multiline
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity className="bg-blue-600 rounded-lg py-4 items-center mb-10">
          <ThemedText className="text-base font-bold text-white">保存记录</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}