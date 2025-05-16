import * as Location from "expo-location"
import { Platform } from "react-native"
import type { LocationSubscription } from "expo-location"

export type Coordinates = {
  latitude: number
  longitude: number
}

class LocationService {
  private static instance: LocationService
  private locationSubscription: LocationSubscription | null = null

  private constructor() {}

  public static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService()
    }
    return LocationService.instance
  }

  public async requestPermissions(): Promise<boolean> {
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync()

      if (foregroundStatus !== "granted") {
        console.log("Permission to access location was denied")
        return false
      }

      // Request background permissions on Android
      if (Platform.OS === "android") {
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync()
        if (backgroundStatus !== "granted") {
          console.log("Permission to access location in background was denied")
          // We still return true because foreground is granted
        }
      }

      return true
    } catch (error) {
      console.error("Error requesting location permissions:", error)
      return false
    }
  }

  public async getCurrentPosition(): Promise<Coordinates | null> {
    try {
      const permissionGranted = await this.requestPermissions()
      if (!permissionGranted) return null

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      })

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }
    } catch (error) {
      console.error("Error getting current position:", error)
      return null
    }
  }

  public async startLocationTracking(callback: (location: Coordinates) => void): Promise<LocationSubscription | null> {
    try {
      const permissionGranted = await this.requestPermissions()
      if (!permissionGranted) return null

      // Stop any existing subscription
      if (this.locationSubscription) {
        this.locationSubscription.remove()
      }

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 10, // minimum distance (in meters) between updates
          timeInterval: 5000, // minimum time (in ms) between updates
        },
        (location) => {
          const newLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }
          callback(newLocation)
        },
      )

      this.locationSubscription = subscription
      return subscription
    } catch (error) {
      console.error("Error starting location tracking:", error)
      return null
    }
  }

  public stopLocationTracking(): void {
    if (this.locationSubscription) {
      this.locationSubscription.remove()
      this.locationSubscription = null
    }
  }

  public calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1)
    const dLon = this.deg2rad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c // Distance in km
    return distance
  }

  public calculateEstimatedTime(
    from: Coordinates | null,
    to: Coordinates | null,
    averageSpeed = 30, // km/h
  ): number | null {
    if (!from || !to) return null

    const distance = this.calculateDistance(from.latitude, from.longitude, to.latitude, to.longitude)

    // Calculate time in minutes based on average speed
    const timeInMinutes = Math.round((distance / averageSpeed) * 60)
    return timeInMinutes
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180)
  }
}

export default LocationService.getInstance()
