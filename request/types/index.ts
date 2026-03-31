// ============== 请求相关类型 ==============
export interface RequestOptions {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  retryCount?: number;
  retryDelay?: number;
  needToken?: boolean;
  needAccessToken?: boolean;
  skipErrorHandler?: boolean;
}

export interface ResponseData<T = any> {
  code: number;
  data: T;
  message: string;
  success: boolean;
  timestamp?: number;
}

// ============== Token 相关类型 ==============
export interface TokenInfo {
  accessToken: string;
  refreshToken: string;
  accessTokenExpire?: number;
  refreshTokenExpire?: number;
  tokenType?: string;
}

// ============== 配置相关类型 ==============
export interface RequestConfig {
  baseURL: string;
  timeout: number;
  maxRetries: number;
  retryDelay: number;
  tokenRefreshThreshold: number;
}

// ============== 错误相关类型 ==============
export class ApiError extends Error {
  code: number;
  data?: any;
  status?: number;

  constructor(message: string, code: number = -1, data?: any, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.data = data;
    this.status = status;
  }
}

export interface ErrorResponse {
  code: number;
  message: string;
  data?: any;
}

// ============== 拦截器类型 ==============
export type RequestInterceptor = (config: RequestOptions) => RequestOptions | Promise<RequestOptions>;
export type ResponseInterceptor<T = any> = (response: ResponseData<T>) => ResponseData<T> | Promise<ResponseData<T>>;
export type ErrorInterceptor = (error: ApiError) => never | ApiError | Promise<never | ApiError>;
