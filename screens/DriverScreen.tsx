"use client"

import { useEffect, useState, useCallback } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native"
import { useUser } from "../context/UserContext"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useFocusEffect } from "@react-navigation/native"
import { locationService } from "../services"
import type { LocationSubscription } from "expo-location"

const DriverScreen = () => {
  const { driverLocation, studentLocation, updateDriverLocation, estimatedTime, currentTrip, startTrip, endTrip } =
    useUser()
  const [isTracking, setIsTracking] = useState(false)
  const [locationSubscription, setLocationSubscription] = useState<LocationSubscription | null>(null)
  const [isTripActive, setIsTripActive] = useState(false)

  useFocusEffect(
    useCallback(() => {
      checkActiveTripStatus()
    }, []),
  )

  useEffect(() => {
    return () => {
      if (locationSubscription) {
        locationSubscription.remove()
      }
    }
  }, [locationSubscription])

  const checkActiveTripStatus = async () => {
    try {
      const tripStatus = await AsyncStorage.getItem("activeTripDriver")
      if (tripStatus === "active") {
        setIsTripActive(true)
      }
    } catch (error) {
      console.error("Failed to check trip status:", error)
    }
  }

  const startTracking = async () => {
    const subscription = await locationService.startLocationTracking((location) => {
      updateDriverLocation(location)
    })

    if (subscription) {
      setLocationSubscription(subscription)
      setIsTracking(true)
    }
  }

  const stopTracking = () => {
    locationService.stopLocationTracking()
    if (locationSubscription) {
      locationSubscription.remove()
      setLocationSubscription(null)
    }
    setIsTracking(false)
  }

  const handleStartTrip = async () => {
    startTrip()
    setIsTripActive(true)
    await AsyncStorage.setItem("activeTripDriver", "active")
    if (!isTracking) {
      startTracking()
    }
  }

  const handleEndTrip = async () => {
    endTrip()
    setIsTripActive(false)
    await AsyncStorage.removeItem("activeTripDriver")
    stopTracking()
  }

  if (!driverLocation) {
    return (
      <View style={styles.container}>
        <Text>Chargement de la position...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <Image
          source={{
            uri: `https://maps.googleapis.com/maps/api/staticmap?center=${driverLocation.latitude},${driverLocation.longitude}&zoom=14&size=600x400&markers=color:blue%7C${driverLocation.latitude},${driverLocation.longitude}${studentLocation ? `&markers=color:red%7C${studentLocation.latitude},${studentLocation.longitude}` : ""}&key=YOUR_API_KEY`,
          }}
          style={styles.mapImage}
        />
        <View style={styles.mapOverlay}>
          <View style={styles.driverMarker}>
            <Ionicons name="car" size={24} color="#4F46E5" />
          </View>
          {studentLocation && (
            <View style={styles.studentMarker}>
              <Ionicons name="school" size={24} color="#EF4444" />
            </View>
          )}
        </View>
      </View>

      <View style={styles.infoPanel}>
        <Text style={styles.infoTitle}>Mode Conducteur</Text>

        {studentLocation && (
          <View style={styles.estimatedTimeContainer}>
            <Ionicons name="time-outline" size={24} color="#4F46E5" />
            <Text style={styles.estimatedTimeText}>Temps estimé: {estimatedTime} minutes</Text>
          </View>
        )}

        <View style={styles.locationInfo}>
          <Text style={styles.locationLabel}>Votre position:</Text>
          <Text style={styles.locationCoords}>
            Lat: {driverLocation.latitude.toFixed(4)}, Long: {driverLocation.longitude.toFixed(4)}
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.trackingButton, isTracking ? styles.trackingButtonActive : null]}
            onPress={isTracking ? stopTracking : startTracking}
          >
            <Text style={styles.trackingButtonText}>{isTracking ? "Arrêter le suivi" : "Démarrer le suivi"}</Text>
          </TouchableOpacity>

          {!isTripActive ? (
            <TouchableOpacity style={styles.tripButton} onPress={handleStartTrip}>
              <Text style={styles.tripButtonText}>Démarrer le trajet</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.tripButton, styles.endTripButton]} onPress={handleEndTrip}>
              <Text style={styles.tripButtonText}>Terminer le trajet</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  mapImage: {
    width: "100%",
    height: "100%",
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  driverMarker: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 5,
    borderWidth: 2,
    borderColor: "#4F46E5",
  },
  studentMarker: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 5,
    borderWidth: 2,
    borderColor: "#EF4444",
    position: "absolute",
    top: "40%",
    right: "30%",
  },
  infoPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  estimatedTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "#F3F4F6",
    padding: 10,
    borderRadius: 10,
  },
  estimatedTimeText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#4B5563",
  },
  locationInfo: {
    marginBottom: 15,
    backgroundColor: "#F3F4F6",
    padding: 10,
    borderRadius: 10,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4B5563",
    marginBottom: 5,
  },
  locationCoords: {
    fontSize: 14,
    color: "#6B7280",
  },
  trackingButton: {
    backgroundColor: "#4F46E5",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  trackingButtonActive: {
    backgroundColor: "#EF4444",
  },
  trackingButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  buttonContainer: {
    gap: 10,
  },
  tripButton: {
    backgroundColor: "#10B981",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  endTripButton: {
    backgroundColor: "#EF4444",
  },
  tripButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
})

export default DriverScreen
