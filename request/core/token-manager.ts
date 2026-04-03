import { storage } from '@/utils/storage';
import { TokenInfo } from '../types';

// ============== 存储键名 ==============
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const TOKEN_INFO_KEY = 'token_info';

// ============== Token 管理器 ==============
class TokenManager {
  private static instance: TokenManager;
  private tokens: TokenInfo | null = null;
  private refreshPromise: Promise<void> | null = null;

  private constructor() {
    this.loadTokens();
  }

  static getInstance(): TokenManager {
    if (!this.instance) {
      this.instance = new TokenManager();
    }
    return this.instance;
  }

  // ============== Token 加载与存储 ==============
  private async loadTokens(): Promise<void> {
    try {
      const accessToken = await storage.get<string>(ACCESS_TOKEN_KEY);
      const refreshToken = await storage.get<string>(REFRESH_TOKEN_KEY);
      const tokenInfo = await storage.get<{
        accessTokenExpire?: number;
        refreshTokenExpire?: number;
        tokenType?: string;
      }>(TOKEN_INFO_KEY);

      if (accessToken && tokenInfo) {
        this.tokens = {
          accessToken,
          refreshToken: refreshToken || '',
          ...tokenInfo,
        };
      }
    } catch (error) {
      console.error('加载 Token 失败:', error);
      this.tokens = null;
    }
  }

  async getTokens(): Promise<TokenInfo | null> {
    if (!this.tokens) {
      await this.loadTokens();
    }
    return this.tokens;
  }

  async setTokens(tokens: TokenInfo): Promise<void> {
    try {
      this.tokens = tokens;

      await storage.set(ACCESS_TOKEN_KEY, tokens.accessToken);
      await storage.set(REFRESH_TOKEN_KEY, tokens.refreshToken);

      const tokenInfo = {
        accessTokenExpire: tokens.accessTokenExpire,
        refreshTokenExpire: tokens.refreshTokenExpire,
        tokenType: tokens.tokenType,
      };
      await storage.set(TOKEN_INFO_KEY, tokenInfo);

      console.log('Token 已保存');
    } catch (error) {
      console.error('保存 Token 失败:', error);
      throw error;
    }
  }

  async clearTokens(): Promise<void> {
    try {
      this.tokens = null;
      await storage.remove(ACCESS_TOKEN_KEY);
      await storage.remove(REFRESH_TOKEN_KEY);
      await storage.remove(TOKEN_INFO_KEY);
      console.log('Token 已清除');
    } catch (error) {
      console.error('清除 Token 失败:', error);
      throw error;
    }
  }

  // ============== Token 验证 ==============
  // 保存登录返回的 token（用于首次登录）
  async saveLoginTokens(loginResponse: {
    accessToken: string;
    refreshToken: string;
    user?: unknown;
  }): Promise<void> {
    const newTokens: TokenInfo = {
      accessToken: loginResponse.accessToken,
      refreshToken: loginResponse.refreshToken,
      accessTokenExpire: this.calculateExpireTime(15 * 60), // 15 分钟
      refreshTokenExpire: this.calculateExpireTime(7 * 24 * 60 * 60), // 7 天
      tokenType: 'Bearer',
    };

    await this.setTokens(newTokens);
    console.log('登录 Token 已保存');
  }

  isAccessTokenExpired(): boolean {
    if (!this.tokens?.accessTokenExpire) {
      return false;
    }

    const now = Date.now();
    const expireTime = this.tokens.accessTokenExpire;

    return now >= expireTime;
  }

  isRefreshTokenExpired(): boolean {
    if (!this.tokens?.refreshTokenExpire) {
      return false;
    }

    const now = Date.now();
    const expireTime = this.tokens.refreshTokenExpire;

    return now >= expireTime;
  }

  willAccessTokenExpire(threshold: number = 5 * 60 * 1000): boolean {
    if (!this.tokens?.accessTokenExpire) {
      return false;
    }

    const now = Date.now();
    const expireTime = this.tokens.accessTokenExpire;

    return expireTime - now <= threshold;
  }

  // ============== Token 刷新 ==============
  async refreshToken(): Promise<void> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const tokens = await this.getTokens();

        if (!tokens?.refreshToken) {
          throw new Error('没有刷新令牌');
        }

        if (this.isRefreshTokenExpired()) {
          await this.clearTokens();
          throw new Error('刷新令牌已过期，请重新登录');
        }

        const response = await fetch(
          `${this.getBaseURL()}/auth/refresh-access-token`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              refreshToken: tokens.refreshToken,
            }),
          }
        );

        if (!response.ok) {
          await this.clearTokens();
          throw new Error('刷新令牌失败');
        }

        const data = await response.json();

        if (data.success && data.data) {
          const newTokens: TokenInfo = {
            accessToken: data.data.accessToken,
            refreshToken: data.data.refreshToken || tokens.refreshToken,
            accessTokenExpire: this.calculateExpireTime(15 * 60),
            refreshTokenExpire: this.calculateExpireTime(7 * 24 * 60 * 60),
            tokenType: 'Bearer',
          };

          await this.setTokens(newTokens);
          console.log('Token 已刷新');
        } else {
          throw new Error(data.message || '刷新令牌失败');
        }
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  // 计算过期时间戳
  private calculateExpireTime(seconds: number): number {
    return Date.now() + seconds * 1000;
  }

  // ============== 辅助方法 ==============
  private getBaseURL(): string {
    return 'http://115.190.241.111:8082/api';
  }

  getAccessToken(): string | null {
    return this.tokens?.accessToken || null;
  }

  getRefreshToken(): string | null {
    return this.tokens?.refreshToken || null;
  }
}

// ============== 导出单例 ==============
export const tokenManager = TokenManager.getInstance();
