import {
  ApiError,
  ErrorInterceptor,
  RequestConfig,
  RequestInterceptor,
  RequestOptions,
  ResponseData,
  ResponseInterceptor,
} from '../types';
import { tokenManager } from './token-manager';

// ============== 默认配置 ==============
const DEFAULT_CONFIG: RequestConfig = {
  baseURL: 'http://115.190.241.111:8082/api',
  timeout: 30000,
  maxRetries: 3,
  retryDelay: 1000,
  tokenRefreshThreshold: 5 * 60 * 1000,
};

// ============== HTTP 请求类 ==============
export class Request {
  private config: RequestConfig;
  private abortControllers: Map<string, AbortController> = new Map();
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor(config?: Partial<RequestConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ============== 拦截器管理 ==============
  useRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  useResponseInterceptor<T>(interceptor: ResponseInterceptor<T>): void {
    this.responseInterceptors.push(interceptor as ResponseInterceptor);
  }

  useErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.errorInterceptors.push(interceptor);
  }

  // ============== 核心请求方法 ==============
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    console.log('开始请求:', endpoint, options);
    const requestId = this.generateRequestId();
    const abortController = new AbortController();
    this.abortControllers.set(requestId, abortController);

    const config: RequestOptions = {
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      retryCount: this.config.maxRetries,
      retryDelay: this.config.retryDelay,
      needToken: true,
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const finalConfig = await this.executeRequestInterceptors(config);

      const response = await this.executeRequest<T>(
        endpoint,
        finalConfig,
        abortController.signal,
        requestId
      );
      console.log('原始响应:', response);
      const processedResponse =
        await this.executeResponseInterceptors(response);

      this.abortControllers.delete(requestId);

      if (!processedResponse.success) {
        throw new ApiError(
          processedResponse.message,
          processedResponse.code,
          processedResponse.data
        );
      }

      return processedResponse.data as T;
    } catch (error) {
      const apiError = this.handleError(error);
      throw apiError;
    }
  }

  // ============== 执行请求 ==============
  private async executeRequest<T>(
    endpoint: string,
    config: RequestOptions,
    signal: AbortSignal,
    requestId: string,
    retryCount = 0
  ): Promise<ResponseData<T>> {
    try {
      console.log('开始执行请求:', endpoint, config);
      const url = this.buildUrl(endpoint, config.baseURL!, config.params);
      console.log('请求 URL:', url);

      if (config.needToken) {
        await this.ensureValidToken();
      }

      const headers = await this.buildHeaders(config);

      const timeoutId = this.setupTimeout(signal, config.timeout!, requestId);

      const response = await fetch(url, {
        method: config.method || 'GET',
        headers,
        body: config.data ? JSON.stringify(config.data) : undefined,
        signal,
      });
      console.log('原始响应:', response);
      clearTimeout(timeoutId);

      const responseData = await this.parseResponse<T>(response);

      if (this.shouldTokenRefresh(responseData)) {
        await this.handleTokenRefresh();
        if (config.needToken && retryCount < (config.retryCount || 0)) {
          return this.retryRequest(endpoint, config, requestId, retryCount);
        }
      }

      return responseData;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new ApiError('请求已取消', -1);
      }

      if (this.shouldRetry(error, retryCount, config.retryCount || 0)) {
        return this.retryRequest(endpoint, config, requestId, retryCount);
      }

      throw error;
    }
  }

  // ============== 重试机制 ==============
  private async retryRequest<T>(
    endpoint: string,
    config: RequestOptions,
    requestId: string,
    retryCount: number
  ): Promise<ResponseData<T>> {
    const delay = this.getRetryDelay(config.retryDelay!, retryCount);
    await this.sleep(delay);

    const abortController = new AbortController();
    this.abortControllers.set(requestId, abortController);

    return this.executeRequest<T>(
      endpoint,
      config,
      abortController.signal,
      requestId,
      retryCount + 1
    );
  }

  private shouldRetry(
    error: any,
    currentRetry: number,
    maxRetries: number
  ): boolean {
    if (currentRetry >= maxRetries) return false;

    if (error instanceof ApiError) {
      const retryCodes = [408, 425, 429, 500, 502, 503, 504];
      return retryCodes.includes(error.status || error.code);
    }

    return (
      error.message?.includes('network') || error.message?.includes('timeout')
    );
  }

  private getRetryDelay(baseDelay: number, retryCount: number): number {
    return baseDelay * Math.pow(2, retryCount);
  }

  // ============== Token 管理 ==============
  private async ensureValidToken(): Promise<void> {
    const tokens = await tokenManager.getTokens();

    if (!tokens?.accessToken) {
      throw new ApiError('未登录，请先登录', 401);
    }

    if (tokenManager.isAccessTokenExpired()) {
      await this.handleTokenRefresh();
    }
  }

  private async handleTokenRefresh(): Promise<void> {
    if (this.isRefreshing) {
      return new Promise(resolve => {
        this.refreshSubscribers.push(async (token: string) => {
          resolve();
        });
      });
    }

    this.isRefreshing = true;

    try {
      await tokenManager.refreshToken();
      this.notifyRefreshSubscribers();
    } catch (error) {
      this.notifyRefreshError();
      throw error;
    } finally {
      this.isRefreshing = false;
      this.refreshSubscribers = [];
    }
  }

  private notifyRefreshSubscribers(): void {
    this.refreshSubscribers.forEach(callback => callback(''));
  }

  private notifyRefreshError(): void {
    this.refreshSubscribers.forEach(callback => callback(''));
  }

  private shouldTokenRefresh(response: ResponseData): boolean {
    return response.code === 401 || response.code === 403;
  }

  // ============== 辅助方法 ==============
  private async executeRequestInterceptors(
    config: RequestOptions
  ): Promise<RequestOptions> {
    let currentConfig = config;
    for (const interceptor of this.requestInterceptors) {
      currentConfig = await interceptor(currentConfig);
    }
    return currentConfig;
  }

  private async executeResponseInterceptors<T>(
    response: ResponseData<T>
  ): Promise<ResponseData<T>> {
    let currentResponse = response;
    for (const interceptor of this.responseInterceptors) {
      currentResponse = await interceptor(currentResponse);
    }
    return currentResponse;
  }

  private handleError(error: any): ApiError {
    let apiError: ApiError;

    if (error instanceof ApiError) {
      apiError = error;
    } else if (error.message?.includes('timeout')) {
      apiError = new ApiError('请求超时，请检查网络连接', -2, null, 408);
    } else if (
      error.message?.includes('network') ||
      error.message?.includes('fetch')
    ) {
      apiError = new ApiError('网络错误，请检查网络连接', -3, null, 0);
    } else {
      apiError = new ApiError(
        error.message || '请求失败',
        error.code || -1,
        error.data,
        error.status
      );
    }

    for (const interceptor of this.errorInterceptors) {
      try {
        const result = interceptor(apiError);
        if (result instanceof ApiError) {
          apiError = result;
        }
      } catch (e) {
        throw e;
      }
    }

    return apiError;
  }

  private async buildHeaders(
    config: RequestOptions
  ): Promise<Record<string, string>> {
    const headers = { ...config.headers };

    if (config.needToken) {
      const tokens = await tokenManager.getTokens();
      if (tokens?.accessToken) {
        headers['Authorization'] =
          `${tokens.tokenType || 'Bearer'} ${tokens.accessToken}`;
      }
    }

    return headers;
  }

  private buildUrl(
    endpoint: string,
    baseURL: string,
    params?: Record<string, any>
  ): string {
    let url = `${baseURL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;

    if (params && Object.keys(params).length > 0) {
      const queryString = new URLSearchParams(params).toString();
      url += `?${queryString}`;
    }

    return url;
  }

  private async parseResponse<T>(response: Response): Promise<ResponseData<T>> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || '请求失败',
        errorData.code || response.status,
        errorData.data,
        response.status
      );
    }

    return response.json();
  }

  private setupTimeout(
    signal: AbortSignal,
    timeout: number,
    requestId: string
  ): NodeJS.Timeout {
    const timeoutId = setTimeout(() => {
      if (!signal.aborted) {
        this.abortControllers.get(requestId)?.abort();
      }
    }, timeout);

    return timeoutId;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ============== 请求管理 ==============
  cancelRequest(requestId: string): void {
    const controller = this.abortControllers.get(requestId);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(requestId);
    }
  }

  cancelAllRequests(): void {
    this.abortControllers.forEach(controller => controller.abort());
    this.abortControllers.clear();
  }

  // ============== 配置管理 ==============
  setBaseURL(baseURL: string): void {
    this.config.baseURL = baseURL;
  }

  setConfig(config: Partial<RequestConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // ============== 便捷请求方法 ==============
  async get<T>(
    endpoint: string,
    options?: Omit<RequestOptions, 'method'>
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(
    endpoint: string,
    data?: any,
    options?: Omit<RequestOptions, 'method' | 'data'>
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST', data });
  }

  async put<T>(
    endpoint: string,
    data?: any,
    options?: Omit<RequestOptions, 'method' | 'data'>
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', data });
  }

  async patch<T>(
    endpoint: string,
    data?: any,
    options?: Omit<RequestOptions, 'method' | 'data'>
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', data });
  }

  async delete<T>(
    endpoint: string,
    options?: Omit<RequestOptions, 'method'>
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  // ============== Token 管理代理 ==============
  async setToken(tokens: {
    accessToken: string;
    refreshToken: string;
  }): Promise<void> {
    await tokenManager.setTokens(tokens);
  }

  async clearToken(): Promise<void> {
    await tokenManager.clearTokens();
  }

  async getToken(): Promise<{
    accessToken: string;
    refreshToken: string;
  } | null> {
    return await tokenManager.getTokens();
  }
}

// ============== 导出实例 ==============
const http = new Request();

export { http };

