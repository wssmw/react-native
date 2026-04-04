import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/context/auth-context';
import { recordApi, RecordCategory } from '@/request/api';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { zodResolver } from '@hookform/resolvers/zod';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

const addRecordSchema = z.object({
  type: z.enum(['expense', 'income']),
  amount: z
    .string()
    .min(1, '请输入金额')
    .refine(value => Number(value) > 0, '金额必须大于 0')
    .refine(value => /^\d+(\.\d{1,2})?$/.test(value), '金额最多保留两位小数'),
  category: z.string().min(1, '请选择分类'),
  person: z.enum(['husband', 'wife']),
  date: z.date(),
  note: z.string().optional(),
});

type AddRecordForm = z.infer<typeof addRecordSchema>;

const expenseCategories = [
  { id: 'food', name: '餐饮', icon: 'restaurant' },
  { id: 'transport', name: '交通', icon: 'directions-car' },
  { id: 'shopping', name: '购物', icon: 'shopping-bag' },
  { id: 'entertainment', name: '娱乐', icon: 'sports-esports' },
  { id: 'house', name: '住房', icon: 'home' },
  { id: 'medical', name: '医疗', icon: 'local-hospital' },
  { id: 'education', name: '教育', icon: 'school' },
  { id: 'other_expense', name: '其他', icon: 'more-horiz' },
] as const;

const incomeCategories = [
  { id: 'salary', name: '工资', icon: 'account-balance-wallet' },
  { id: 'bonus', name: '奖金', icon: 'card-giftcard' },
  { id: 'investment', name: '投资', icon: 'trending-up' },
  { id: 'other_income', name: '其他', icon: 'more-horiz' },
] as const;

export default function AddRecord() {
  const router = useRouter();
  const { user } = useAuth();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AddRecordForm>({
    resolver: zodResolver(addRecordSchema),
    defaultValues: {
      type: 'expense',
      amount: '',
      category: 'food',
      person: user?.role || 'husband',
      date: new Date(),
      note: '',
    },
  });

  const selectedType = watch('type');
  const selectedCategory = watch('category');
  const selectedPerson = watch('person');
  const dateObj = watch('date');

  const currentCategories = useMemo(() => {
    return selectedType === 'expense' ? expenseCategories : incomeCategories;
  }, [selectedType]);

  useEffect(() => {
    const exists = currentCategories.some(item => item.id === selectedCategory);
    if (!exists) {
      setValue('category', currentCategories[0].id, { shouldValidate: true });
    }
  }, [currentCategories, selectedCategory, setValue]);

  useEffect(() => {
    if (user?.role) {
      setValue('person', user.role, { shouldValidate: true });
    }
  }, [user?.role, setValue]);

  const displayDate = useMemo(() => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  }, [dateObj]);

  const handleDateChange = (_event: unknown, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setValue('date', selectedDate, { shouldValidate: true });
    }
  };

  const handleAmountChange = (value: string) => {
    const normalized = value.replace(/[^\d.]/g, '');
    const parts = normalized.split('.');

    if (parts.length > 2) {
      return;
    }

    if (parts[1] && parts[1].length > 2) {
      return;
    }

    setValue('amount', normalized, { shouldValidate: true });
  };

  const onSubmit = async (data: AddRecordForm) => {
    const apiDate = data.date.toISOString().slice(0, 10);

    try {
      const response = await recordApi.createRecord({
        amount: Number(data.amount),
        type: data.type,
        category: data.category as RecordCategory,
        person: data.person,
        date: apiDate,
        note: data.note?.trim() || undefined,
      });
      console.log('response', response);
      if (response.success) {
        Alert.alert('成功', '记账保存成功', [
          {
            text: '确定',
            onPress: () => router.replace('/(tabs)'),
          },
        ]);
      }
    } catch (error: any) {
      Alert.alert('保存失败', error?.message || '请稍后重试');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="flex-row items-center justify-between bg-blue-600 px-4 py-3">
        <TouchableOpacity className="p-1" onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text className=" flex-1 text-xl font-bold text-center text-white">
          添加记录
        </Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-5">
        <View className="flex-row mb-6 rounded-lg overflow-hidden">
          <TouchableOpacity
            className={`flex-1 py-3 items-center ${selectedType === 'expense' ? 'bg-red-500' : 'bg-gray-300'}`}
            onPress={() =>
              setValue('type', 'expense', { shouldValidate: true })
            }
          >
            <ThemedText
              className={`text-base ${selectedType === 'expense' ? 'text-white font-bold' : 'text-gray-700'}`}
            >
              支出
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 items-center ${selectedType === 'income' ? 'bg-green-500' : 'bg-gray-300'}`}
            onPress={() => setValue('type', 'income', { shouldValidate: true })}
          >
            <ThemedText
              className={`text-base ${selectedType === 'income' ? 'text-white font-bold' : 'text-gray-700'}`}
            >
              收入
            </ThemedText>
          </TouchableOpacity>
        </View>

        <View className="mb-5">
          <ThemedText className="text-sm text-gray-600 mb-2">金额</ThemedText>
          <Controller
            control={control}
            name="amount"
            render={({ field: { value } }) => (
              <View className="flex-row items-center border border-gray-300 bg-white rounded-lg px-4 py-3">
                <Text className="text-2xl text-gray-800 mr-2">¥</Text>
                <TextInput
                  className="flex-1 text-2xl text-gray-800"
                  value={value}
                  onChangeText={handleAmountChange}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            )}
          />
          {errors.amount && (
            <ThemedText className="text-xs text-red-500 mt-1">
              {errors.amount.message}
            </ThemedText>
          )}
        </View>

        <View className="mb-5">
          <ThemedText className="text-sm text-gray-600 mb-2">分类</ThemedText>
          <View className="flex-row flex-wrap justify-between">
            {currentCategories.map(category => (
              <TouchableOpacity
                key={category.id}
                className={`w-[22%] items-center justify-center border rounded-lg p-3 mb-4 ${selectedCategory === category.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                onPress={() =>
                  setValue('category', category.id, { shouldValidate: true })
                }
              >
                <MaterialIcons
                  name={category.icon as keyof typeof MaterialIcons.glyphMap}
                  size={28}
                  color={selectedCategory === category.id ? '#2573F9' : '#888'}
                />
                <ThemedText
                  className={`text-xs mt-1 ${selectedCategory === category.id ? 'text-blue-600 font-bold' : 'text-gray-600'}`}
                >
                  {category.name}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
          {errors.category && (
            <ThemedText className="text-xs text-red-500 -mt-2">
              {errors.category.message}
            </ThemedText>
          )}
        </View>

        <View className="mb-5">
          <ThemedText className="text-sm text-gray-600 mb-2">记录人</ThemedText>
          <View className="flex-row gap-4">
            <TouchableOpacity
              className={`flex-1 flex-row items-center justify-center border rounded-lg py-3 ${selectedPerson === 'husband' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
              onPress={() =>
                setValue('person', 'husband', { shouldValidate: true })
              }
            >
              <ThemedText className="text-lg mr-2">👨</ThemedText>
              <ThemedText
                className={`text-base ${selectedPerson === 'husband' ? 'text-blue-600 font-bold' : 'text-gray-800'}`}
              >
                丈夫
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 flex-row items-center justify-center border rounded-lg py-3 ${selectedPerson === 'wife' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
              onPress={() =>
                setValue('person', 'wife', { shouldValidate: true })
              }
            >
              <ThemedText className="text-lg mr-2">👩</ThemedText>
              <ThemedText
                className={`text-base ${selectedPerson === 'wife' ? 'text-blue-600 font-bold' : 'text-gray-800'}`}
              >
                妻子
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        <View className="mb-5">
          <ThemedText className="text-sm text-gray-600 mb-2">日期</ThemedText>
          <TouchableOpacity
            className="flex-row items-center justify-between border border-gray-300 bg-white rounded-lg px-4 py-3"
            onPress={() => setShowDatePicker(true)}
          >
            <ThemedText className="text-base text-gray-800">
              {displayDate}
            </ThemedText>
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
          <ThemedText className="text-sm text-gray-600 mb-2">
            备注 (可选)
          </ThemedText>
          <Controller
            control={control}
            name="note"
            render={({ field: { onChange, value } }) => (
              <TextInput
                className="border border-gray-300 bg-white rounded-lg px-4 py-3 h-24 text-gray-800"
                value={value}
                onChangeText={onChange}
                placeholder="记录一些备注信息..."
                placeholderTextColor="#888"
                multiline
                textAlignVertical="top"
              />
            )}
          />
        </View>

        <TouchableOpacity
          className={`rounded-lg py-4 items-center mb-10 ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600'}`}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          <ThemedText className="text-base font-bold text-white">
            {isSubmitting ? '保存中...' : '保存记录'}
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
