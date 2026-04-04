import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/context/auth-context';
import { tokenManager, userApi } from '@/request';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {
  Button,
  Card,
  HelperText,
  MD3DarkTheme,
  MD3LightTheme,
  Provider as PaperProvider,
  RadioButton,
  Text,
  TextInput,
} from 'react-native-paper';
import { z } from 'zod';

const registerSchema = z
  .object({
    email: z.string().email('请输入有效的邮箱地址'),
    password: z.string().min(6, '密码至少需要 6 个字符'),
    confirmPassword: z.string().min(6, '请确认密码'),
    name: z.string().min(2, '昵称至少需要 2 个字符'),
    role: z.enum(['husband', 'wife'], '请选择角色'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const router = useRouter();
  const { login } = useAuth();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? MD3DarkTheme : MD3LightTheme;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      role: 'husband',
    },
  });

  const role = watch('role');

  const onSubmit = async (data: RegisterForm) => {
    try {
      console.log('开始注册:', data.email);

      const response = await userApi.register({
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role,
      });

      console.log('注册响应:', response);

      if (response.success && response.data) {
        await tokenManager.saveLoginTokens({
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
          user: response.data.user,
        });

        login({
          ...response.data.user,
          coupleId: response.data.user.coupleId,
          avatar: response.data.user.avatar,
          createdAt: response.data.user.createdAt || new Date().toISOString(),
          updatedAt: response.data.user.updatedAt || new Date().toISOString(),
        });

        console.log('注册成功，Token 已保存');

        Alert.alert('注册成功', `欢迎加入，${data.name}！`, [
          {
            text: '确定',
            onPress: () => {
              router.replace('/(tabs)');
            },
          },
        ]);
      } else {
        Alert.alert('注册失败', response.message || '注册失败，请稍后重试');
      }
    } catch (error: any) {
      console.error('注册失败:', error);
      Alert.alert('注册失败', error.message || '网络错误，请稍后重试');
    }
  };

  return (
    <PaperProvider theme={theme}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Card style={styles.card} elevation={4}>
            <Card.Content>
              <Text variant="headlineMedium" style={styles.title}>
                创建账号
              </Text>
              <Text variant="bodyMedium" style={styles.subtitle}>
                开启你们的记账之旅
              </Text>

              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <TextInput
                      label="昵称"
                      mode="outlined"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      style={styles.input}
                      error={!!errors.name}
                    />
                    {errors.name && (
                      <HelperText type="error">
                        {errors.name.message}
                      </HelperText>
                    )}
                  </>
                )}
              />

              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <TextInput
                      label="邮箱"
                      mode="outlined"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      style={styles.input}
                      error={!!errors.email}
                    />
                    {errors.email && (
                      <HelperText type="error">
                        {errors.email.message}
                      </HelperText>
                    )}
                  </>
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <TextInput
                      label="密码"
                      mode="outlined"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      secureTextEntry
                      style={styles.input}
                      error={!!errors.password}
                    />
                    {errors.password && (
                      <HelperText type="error">
                        {errors.password.message}
                      </HelperText>
                    )}
                  </>
                )}
              />

              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <TextInput
                      label="确认密码"
                      mode="outlined"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      secureTextEntry
                      style={styles.input}
                      error={!!errors.confirmPassword}
                    />
                    {errors.confirmPassword && (
                      <HelperText type="error">
                        {errors.confirmPassword.message}
                      </HelperText>
                    )}
                  </>
                )}
              />

              <Controller
                control={control}
                name="role"
                render={({ field: { onChange } }) => (
                  <>
                    <Text variant="bodyMedium" style={styles.roleLabel}>
                      选择你的角色
                    </Text>
                    <RadioButton.Group
                      onValueChange={value => {
                        setValue('role', value as 'husband' | 'wife');
                        onChange(value);
                      }}
                      value={role}
                    >
                      <RadioButton.Item label="丈夫" value="husband" />
                      <RadioButton.Item label="妻子" value="wife" />
                    </RadioButton.Group>
                    {errors.role && (
                      <HelperText type="error">
                        {errors.role.message}
                      </HelperText>
                    )}
                  </>
                )}
              />

              <Button
                mode="contained"
                onPress={handleSubmit(onSubmit)}
                loading={isSubmitting}
                disabled={isSubmitting}
                style={styles.button}
              >
                注册
              </Button>

              <Button
                mode="outlined"
                onPress={() => router.back()}
                style={styles.button}
              >
                返回登录
              </Button>
            </Card.Content>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    borderRadius: 12,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  input: {
    marginBottom: 8,
  },
  roleLabel: {
    marginTop: 8,
    marginBottom: 4,
  },
  button: {
    marginTop: 8,
  },
});
