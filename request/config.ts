import { http } from './core/http';
import { tokenManager } from './core/token-manager';
import { ApiError } from './types';

// ============== 初始化配置 ==============
export interface RequestInitConfig {
  baseURL: string;
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
  onRequestError?: (error: ApiError) => void;
  onResponseError?: (error: ApiError) => void;
  onTokenExpired?: () => void;
}

// ============== 初始化请求 ==============
export function initRequest(config: RequestInitConfig): void {
  http.setConfig({
    baseURL: config.baseURL,
    timeout: config.timeout,
    maxRetries: config.maxRetries,
    retryDelay: config.retryDelay,
  });

  http.useErrorInterceptor((error) => {
    if (error.code === 401 || error.message?.includes('登录')) {
      config.onTokenExpired?.();
    }

    if (config.onResponseError) {
      config.onResponseError(error);
    }

    throw error;
  });

  console.log('请求模块已初始化，BaseURL:', config.baseURL);
}

// ============== 导出 ==============
export { http, tokenManager };
export * from './api';
export * from './types';
