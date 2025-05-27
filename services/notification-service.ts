import AsyncStorage from "@react-native-async-storage/async-storage"

export type Notification = {
  id: string
  title: string
  message: string
  timestamp: number
  read: boolean
  type: "arrival" | "message" | "system" | "location"
}

class NotificationService {
  private static instance: NotificationService

  private constructor() {
    this.loadSettings()
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  private async loadSettings() {
    try {
      // Chargement des paramètres si nécessaire
    } catch (error) {
      console.error("Failed to load notification settings:", error)
    }
  }

  public async setNotificationsEnabled(enabled: boolean) {
    try {
      await AsyncStorage.setItem("notificationsEnabled", JSON.stringify(enabled))
    } catch (error) {
      console.error("Failed to save notification settings:", error)
    }
  }

  public async isNotificationsEnabled(): Promise<boolean> {
    try {
      const enabled = await AsyncStorage.getItem("notificationsEnabled")
      return enabled !== null ? JSON.parse(enabled) : true
    } catch (error) {
      console.error("Failed to get notification settings:", error)
      return true
    }
  }

  public async getNotifications(): Promise<Notification[]> {
    try {
      const savedNotifications = await AsyncStorage.getItem("notifications")
      if (savedNotifications) {
        return JSON.parse(savedNotifications)
      }
      return []
    } catch (error) {
      console.error("Failed to get notifications:", error)
      return []
    }
  }

  public async markAsRead(id: string): Promise<void> {
    try {
      const notifications = await this.getNotifications()
      const updatedNotifications = notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      )
      await AsyncStorage.setItem("notifications", JSON.stringify(updatedNotifications))
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  public async markAllAsRead(): Promise<void> {
    try {
      const notifications = await this.getNotifications()
      const updatedNotifications = notifications.map((notification) => ({
        ...notification,
        read: true,
      }))
      await AsyncStorage.setItem("notifications", JSON.stringify(updatedNotifications))
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error)
    }
  }

  public async deleteNotification(id: string): Promise<void> {
    try {
      const notifications = await this.getNotifications()
      const updatedNotifications = notifications.filter((notification) => notification.id !== id)
      await AsyncStorage.setItem("notifications", JSON.stringify(updatedNotifications))
    } catch (error) {
      console.error("Failed to delete notification:", error)
    }
  }
}

export default NotificationService.getInstance()
