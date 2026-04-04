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
    return http.get<ApiResponse<UserInfo>>('/auth/me');
  },

  // 退出登录
  logout: () => {
    return http.post<ApiResponse<null>>('/auth/logout');
  },
};

// ============== 家庭配对接口 ==============
export const coupleApi = {
  // 创建家庭 - POST /api/couples/create
  create: (data: { role: 'husband' | 'wife' }) => {
    return http.post<ApiResponse<CoupleInfo>>('/couples/create', data);
  },

  // 加入家庭 - POST /api/couples/join
  join: (data: { inviteCode: string }) => {
    return http.post<ApiResponse<CoupleInfo>>('/couples/join', data);
  },

  // 获取家庭信息 - GET /api/couples/info
  getInfo: () => {
    return http.get<ApiResponse<CoupleInfo>>('/couples/info');
  },
};

// ============== 记账记录接口（对齐后端 /records） ==============
export const recordApi = {
  // 创建记账记录 - POST /api/records
  createRecord: (data: CreateRecordDTO) => {
    return http.post<ApiResponse<RecordItem>>('/records', data);
  },

  // 获取记账记录列表 - GET /api/records
  getRecordList: (params?: {
    page?: number;
    limit?: number;
    type?: 'income' | 'expense';
    person?: 'husband' | 'wife';
    start_date?: string;
    end_date?: string;
  }) => {
    return http.get<ApiResponse<PaginatedResponse<RecordItem>>>('/records', {
      params,
    });
  },

  // 获取按日期分组的记账明细 - GET /api/records/grouped-by-date
  getGroupedByDate: (params?: {
    page?: number;
    limit?: number;
    type?: 'income' | 'expense' | '';
    person?: 'husband' | 'wife';
    start_date?: string;
    end_date?: string;
  }) => {
    return http.get<ApiResponse<GroupedRecordListResponse>>(
      '/records/grouped-by-date',
      {
        params,
      }
    );
  },

  // 获取单条记录 - GET /api/records/:id
  getRecordDetail: (id: string) => {
    return http.get<ApiResponse<RecordItem>>(`/records/${id}`);
  },

  // 更新记录 - PUT /api/records/:id
  updateRecord: (id: string, data: UpdateRecordDTO) => {
    return http.put<ApiResponse<RecordItem>>(`/records/${id}`, data);
  },

  // 删除记录 - DELETE /api/records/:id
  deleteRecord: (id: string) => {
    return http.delete<ApiResponse<null>>(`/records/${id}`);
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

// ============== 统计相关接口（对齐后端文档） ==============
export const statisticsApi = {
  // 获取首页概览
  getHomeOverview: (params?: { limit?: number }) => {
    return http.get<ApiResponse<HomeOverviewData>>(
      '/statistics/home-overview',
      {
        params,
      }
    );
  },

  // 获取汇总统计
  getSummary: (params: { start_date: string; end_date: string }) => {
    return http.get<ApiResponse<SummaryStats>>('/statistics/summary', {
      params,
    });
  },

  // 按分类统计
  getByCategory: (params: { start_date: string; end_date: string }) => {
    return http.get<ApiResponse<CategoryStatisticsData>>(
      '/statistics/by-category',
      { params }
    );
  },

  // 按人员统计
  getByPerson: (params: { start_date: string; end_date: string }) => {
    return http.get<ApiResponse<PersonStatisticsData>>(
      '/statistics/by-person',
      {
        params,
      }
    );
  },

  // 按月份统计
  getByMonth: (params: { year: number }) => {
    return http.get<ApiResponse<MonthStatisticsItem[]>>(
      '/statistics/by-month',
      {
        params,
      }
    );
  },
};

// ============== 导出所有 API ==============
export const api = {
  user: userApi,
  couple: coupleApi,
  record: recordApi,
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

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: number;
}

export interface CoupleMember {
  id: string;
  name: string;
  email: string;
  role: 'husband' | 'wife';
}

export interface CoupleInfo {
  id: string;
  inviteCode: string;
  husband?: CoupleMember;
  wife?: CoupleMember;
  members?: CoupleMember[];
  createdAt?: string;
  updatedAt?: string;
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

export type RecordCategory =
  | 'food'
  | 'transport'
  | 'shopping'
  | 'entertainment'
  | 'house'
  | 'medical'
  | 'education'
  | 'other_expense'
  | 'salary'
  | 'bonus'
  | 'investment'
  | 'other_income';

export interface RecordItem {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: RecordCategory;
  person: 'husband' | 'wife';
  date: string;
  note?: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecordDTO {
  amount: number;
  type: 'income' | 'expense';
  category: RecordCategory;
  person: 'husband' | 'wife';
  date: string;
  note?: string;
}

export interface UpdateRecordDTO {
  amount?: number;
  type?: 'income' | 'expense';
  category?: RecordCategory;
  person?: 'husband' | 'wife';
  date?: string;
  note?: string;
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

export interface SummaryStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface HomeOverviewData {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  recentRecords: RecordItem[];
}

export interface GroupedRecordItem {
  date: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  records: RecordItem[];
}

export interface GroupedRecordPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GroupedRecordListResponse {
  list: GroupedRecordItem[];
  pagination: GroupedRecordPagination;
}

export interface CategoryStatisticsItem {
  category: string;
  amount: number;
}

export interface CategoryStatisticsData {
  expense: CategoryStatisticsItem[];
  income: CategoryStatisticsItem[];
}

export interface PersonStatisticsDetail {
  count: number;
  totalIncome: number;
  totalExpense: number;
}

export interface PersonStatisticsData {
  husband: PersonStatisticsDetail;
  wife: PersonStatisticsDetail;
}

export interface MonthStatisticsItem {
  month: string;
  income: number;
  expense: number;
}

export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
