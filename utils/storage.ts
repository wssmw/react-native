/**
 * 存储工具类
 * 
 * 提供统一的加密存储接口，使用 Expo SecureStore
 * 所有数据都会以加密形式存储在系统安全区域
 * 
 * @example
 * // 普通存储
 * await storage.set('token', 'xxx');
 * const token = await storage.get('token');
 * 
 * // 带过期时间的存储
 * await storage.set('code', '123456', 5 * 60 * 1000);
 * const code = await storage.get('code');
 */

import * as SecureStore from 'expo-secure-store';

// ============== 类型定义 ==============
export interface ExpiringData<T> {
  data: T;
  expireAt: number;
}

// ============== 核心存储类 ==============
export class Storage {
  /**
   * 保存数据
   * @param key 键名
   * @param value 值（会自动序列化为 JSON 字符串）
   * @param ttlMilliseconds 可选，过期时间（毫秒）
   */
  async set<T>(key: string, value: T, ttlMilliseconds?: number): Promise<void> {
    try {
      let dataToStore: any = value;

      // 如果设置了过期时间，包装成过期数据
      if (ttlMilliseconds) {
        dataToStore = {
          data: value,
          expireAt: Date.now() + ttlMilliseconds,
        } as ExpiringData<T>;
      }

      const stringValue =
        typeof dataToStore === 'string' ? dataToStore : JSON.stringify(dataToStore);
      await SecureStore.setItemAsync(key, stringValue);
    } catch (error) {
      console.error('Storage set error:', error);
      throw error;
    }
  }

  /**
   * 获取数据
   * @param key 键名
   * @returns 解析后的数据，如果过期则返回 null
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await SecureStore.getItemAsync(key);
      if (!value) return null;

      let parsed: any;
      try {
        parsed = JSON.parse(value);
      } catch {
        return value as T;
      }

      // 检查是否是过期数据格式
      if (this.isExpiringData(parsed)) {
        if (Date.now() > parsed.expireAt) {
          // 已过期，删除并返回 null
          await this.remove(key);
          return null;
        }
        return parsed.data as T;
      }

      return parsed as T;
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  }

  /**
   * 删除数据
   * @param key 键名
   */
  async remove(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Storage remove error:', error);
      throw error;
    }
  }

  /**
   * 检查键是否存在
   */
  async has(key: string): Promise<boolean> {
    try {
      const value = await SecureStore.getItemAsync(key);
      return value !== null;
    } catch (error) {
      console.error('Storage has error:', error);
      return false;
    }
  }

  /**
   * 批量保存数据
   * @param keyValuePairs 键值对数组，第三个参数可选过期时间
   */
  async multiSet(
    keyValuePairs: [string, any, number?][]
  ): Promise<void> {
    try {
      await Promise.all(
        keyValuePairs.map(([key, value, ttl]) => this.set(key, value, ttl))
      );
    } catch (error) {
      console.error('Storage multiSet error:', error);
      throw error;
    }
  }

  /**
   * 批量获取数据
   * @param keys 键名数组
   */
  async multiGet<T>(keys: string[]): Promise<Map<string, T>> {
    try {
      const result = new Map<string, T>();
      await Promise.all(
        keys.map(async (key) => {
          const value = await this.get<T>(key);
          if (value !== null) {
            result.set(key, value);
          }
        })
      );
      return result;
    } catch (error) {
      console.error('Storage multiGet error:', error);
      return new Map();
    }
  }

  /**
   * 批量删除数据
   * @param keys 键名数组
   */
  async multiRemove(keys: string[]): Promise<void> {
    try {
      await Promise.all(keys.map((key) => this.remove(key)));
    } catch (error) {
      console.error('Storage multiRemove error:', error);
      throw error;
    }
  }

  /**
   * 判断是否是过期数据格式
   */
  private isExpiringData(data: any): data is ExpiringData<any> {
    return (
      data &&
      typeof data === 'object' &&
      'data' in data &&
      'expireAt' in data &&
      typeof data.expireAt === 'number'
    );
  }
}

// ============== 导出单例 ==============
export const storage = new Storage();

// ============== 默认导出 ==============
export default storage;
