import { http } from '../core/http';

// ============== 用户相关接口 ==============
export const userApi = {
  // 登录 - POST /api/auth/login
  login: (data: { email: string; password: string }) => {
    return http.post<LoginResponse>('/auth/login', data, {
      needToken: false, // 登录接口不需要 token
    });
  },

  // 注册 - POST /api/auth/register
  register: (data: {
    email: string;
    password: string;
    name: string;
    role: 'husband' | 'wife';
  }) => {
    return http.post<RegisterResponse>('/auth/register', data, {
      needToken: false, // 注册接口不需要 token
    });
  },

  // 获取当前用户信息 - GET /api/auth/me
  getMe: () => {
    return http.get<UserInfo>('/auth/me');
  },

  // 退出登录
  logout: () => {
    return http.post('/auth/logout');
  },
};

// ============== 记账相关接口 ==============
export const accountApi = {
  // 获取账单列表
  getAccountList: (params?: {
    page?: number;
    pageSize?: number;
    startDate?: string;
    endDate?: string;
    type?: 'income' | 'expense';
    categoryId?: string;
  }) => {
    return http.get<PaginatedResponse<Account>>('/accounts', { params });
  },

  // 获取账单详情
  getAccountDetail: (id: string) => {
    return http.get<Account>(`/accounts/${id}`);
  },

  // 创建账单
  createAccount: (data: CreateAccountDTO) => {
    return http.post<Account>('/accounts', data);
  },

  // 更新账单
  updateAccount: (id: string, data: UpdateAccountDTO) => {
    return http.put<Account>(`/accounts/${id}`, data);
  },

  // 删除账单
  deleteAccount: (id: string) => {
    return http.delete(`/accounts/${id}`);
  },

  // 批量删除账单
  batchDeleteAccounts: (ids: string[]) => {
    return http.post('/accounts/batch-delete', { ids });
  },
};

// ============== 分类相关接口 ==============
export const categoryApi = {
  // 获取分类列表
  getCategoryList: (params?: { type?: 'income' | 'expense' }) => {
    return http.get<Category[]>('/categories', { params });
  },

  // 创建分类
  createCategory: (data: CreateCategoryDTO) => {
    return http.post<Category>('/categories', data);
  },

  // 更新分类
  updateCategory: (id: string, data: UpdateCategoryDTO) => {
    return http.put<Category>(`/categories/${id}`, data);
  },

  // 删除分类
  deleteCategory: (id: string) => {
    return http.delete(`/categories/${id}`);
  },
};

// ============== 统计相关接口 ==============
export const statisticsApi = {
  // 获取月度统计
  getMonthlyStats: (params: { year: number; month: number }) => {
    return http.get<MonthlyStats>('/statistics/monthly', { params });
  },

  // 获取年度统计
  getYearlyStats: (params: { year: number }) => {
    return http.get<YearlyStats>('/statistics/yearly', { params });
  },

  // 获取分类统计
  getCategoryStats: (params: { startDate: string; endDate: string }) => {
    return http.get<CategoryStats>('/statistics/category', { params });
  },

  // 获取趋势统计
  getTrendStats: (params: {
    startDate: string;
    endDate: string;
    type?: 'day' | 'week' | 'month';
  }) => {
    return http.get<TrendStats>('/statistics/trend', { params });
  },
};

// ============== 导出所有 API ==============
export const api = {
  user: userApi,
  account: accountApi,
  category: categoryApi,
  statistics: statisticsApi,
};

// ============== 类型定义 ==============
// 根据后端 API 文档的响应格式
export interface LoginResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      name: string;
      role: 'husband' | 'wife';
      coupleId?: string;
      createdAt: string;
      updatedAt: string;
    };
  };
  message: string;
  timestamp: number;
}

export interface RegisterResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
      role: 'husband' | 'wife';
    };
    accessToken: string;
    refreshToken: string;
  };
  message: string;
  timestamp: number;
}

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: 'husband' | 'wife';
  coupleId?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  categoryId: string;
  categoryName?: string;
  description: string;
  date: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccountDTO {
  amount: number;
  type: 'income' | 'expense';
  categoryId: string;
  description?: string;
  date?: string;
}

export interface UpdateAccountDTO {
  amount?: number;
  categoryId?: string;
  description?: string;
  date?: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  type: 'income' | 'expense';
  userId?: string;
  isDefault: boolean;
  createdAt: string;
}

export interface CreateCategoryDTO {
  name: string;
  icon?: string;
  type: 'income' | 'expense';
}

export interface UpdateCategoryDTO {
  name?: string;
  icon?: string;
}

export interface MonthlyStats {
  year: number;
  month: number;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  dailyAverage: number;
  categoryStats: CategoryStatItem[];
}

export interface YearlyStats {
  year: number;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  monthlyStats: MonthlyStatItem[];
}

export interface CategoryStats {
  categoryStats: CategoryStatItem[];
  totalAmount: number;
}

export interface TrendStats {
  labels: string[];
  income: number[];
  expense: number[];
  balance: number[];
}

export interface CategoryStatItem {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
  icon?: string;
}

export interface MonthlyStatItem {
  month: number;
  income: number;
  expense: number;
  balance: number;
}

export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
