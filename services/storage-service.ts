import AsyncStorage from "@react-native-async-storage/async-storage"

class StorageService {
  private static instance: StorageService

  private constructor() {}

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService()
    }
    return StorageService.instance
  }

  public async storeData(key: string, value: any): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value)
      await AsyncStorage.setItem(key, jsonValue)
    } catch (error) {
      console.error(`Error storing data for key ${key}:`, error)
      throw error
    }
  }

  public async getData<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key)
      return jsonValue != null ? JSON.parse(jsonValue) : null
    } catch (error) {
      console.error(`Error retrieving data for key ${key}:`, error)
      throw error
    }
  }

  public async removeData(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing data for key ${key}:`, error)
      throw error
    }
  }

  public async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear()
    } catch (error) {
      console.error("Error clearing all data:", error)
      throw error
    }
  }

  public async getAllKeys(): Promise<string[]> {
    try {
      // Convert readonly string[] to mutable string[]
      return [...(await AsyncStorage.getAllKeys())]
    } catch (error) {
      console.error("Error getting all keys:", error)
      throw error
    }
  }

  // Specialized methods for common data types

  public async storeSettings(settings: Record<string, any>): Promise<void> {
    return this.storeData("appSettings", settings)
  }

  public async getSettings(): Promise<Record<string, any> | null> {
    return this.getData<Record<string, any>>("appSettings")
  }

  public async updateSettings(updates: Record<string, any>): Promise<Record<string, any>> {
    const currentSettings = (await this.getSettings()) || {}
    const updatedSettings = { ...currentSettings, ...updates }
    await this.storeSettings(updatedSettings)
    return updatedSettings
  }

  public async getSetting<T>(key: string, defaultValue: T): Promise<T> {
    const settings = await this.getSettings()
    return settings && settings[key] !== undefined ? settings[key] : defaultValue
  }
}

export default StorageService.getInstance()
