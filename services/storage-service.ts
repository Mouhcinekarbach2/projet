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
      if (jsonValue === null) {
        return null
      }

      // Vérifier si la valeur est déjà un objet JSON valide
      try {
        return JSON.parse(jsonValue)
      } catch (parseError) {
        // Si ce n'est pas du JSON valide, essayer de retourner la valeur brute
        console.warn(`Failed to parse JSON for key ${key}, returning raw value:`, jsonValue)

        // Pour les chaînes simples comme "driver" ou "student", retourner directement
        if (typeof jsonValue === "string" && (jsonValue === "driver" || jsonValue === "student")) {
          return jsonValue as unknown as T
        }

        // Sinon, retourner null et nettoyer la clé corrompue
        console.warn(`Removing corrupted data for key ${key}`)
        await this.removeData(key)
        return null
      }
    } catch (error) {
      console.error(`Error retrieving data for key ${key}:`, error)
      // En cas d'erreur, essayer de nettoyer la clé corrompue
      try {
        await this.removeData(key)
      } catch (removeError) {
        console.error(`Failed to remove corrupted key ${key}:`, removeError)
      }
      return null
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

  public async cleanCorruptedData(): Promise<void> {
    try {
      const allKeys = await this.getAllKeys()

      for (const key of allKeys) {
        try {
          const value = await AsyncStorage.getItem(key)
          if (value !== null) {
            // Essayer de parser chaque valeur
            JSON.parse(value)
          }
        } catch (parseError) {
          console.warn(`Removing corrupted data for key: ${key}`)
          await this.removeData(key)
        }
      }
    } catch (error) {
      console.error("Error cleaning corrupted data:", error)
    }
  }
}

export default StorageService.getInstance()
