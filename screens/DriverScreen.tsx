"use client"

import { Ionicons } from "@expo/vector-icons"
import { useFocusEffect } from "@react-navigation/native"
import type { LocationSubscription } from "expo-location"
import { useCallback, useEffect, useRef, useState } from "react"
import { Dimensions, StyleSheet, Text, View } from "react-native"
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps"
import { useUser } from "../context/UserContext"
import type { Coordinates } from "../services"
import { apiService, locationService } from "../services"

const { width, height } = Dimensions.get("window")

const DriverScreen = () => {
  const { driverLocation, studentLocation, updateDriverLocation, estimatedTime, updateEstimatedTime } = useUser()
  const [locationSubscription, setLocationSubscription] = useState<LocationSubscription | null>(null)
  const [routeCoordinates, setRouteCoordinates] = useState<Coordinates[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const mapRef = useRef<MapView>(null)

  // Démarrer automatiquement le suivi de position au chargement
  useEffect(() => {
    startTracking()

    return () => {
      if (locationSubscription) {
        locationSubscription.remove()
      }
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      if (driverLocation && studentLocation) {
        fetchRoute()
      }
    }, [driverLocation, studentLocation]),
  )

  const startTracking = async () => {
    const subscription = await locationService.startLocationTracking((location) => {
      updateDriverLocation(location)
    })

    if (subscription) {
      setLocationSubscription(subscription)
    }
  }

  const fetchRoute = async () => {
    if (!driverLocation || !studentLocation) return

    try {
      setIsLoading(true)

      // Obtenir un itinéraire réel à partir de l'API OSRM
      const routeInfo = await apiService.getRouteDirections(driverLocation, studentLocation)

      // Mettre à jour les coordonnées de l'itinéraire
      setRouteCoordinates(routeInfo.coordinates)

      // Mettre à jour le temps estimé
      updateEstimatedTime(routeInfo.duration)

      // Ajuster la vue de la carte pour montrer l'itinéraire complet
      if (mapRef.current && routeInfo.coordinates.length > 0) {
        mapRef.current.fitToCoordinates(routeInfo.coordinates, {
          edgePadding: { top: 50, right: 50, bottom: 200, left: 50 },
          animated: true,
        })
      }
    } catch (error) {
      console.error("Error fetching route:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!driverLocation) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Chargement de la position...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: driverLocation.latitude,
          longitude: driverLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation
        showsMyLocationButton
        showsCompass
        showsScale
      >
        <Marker
          coordinate={{
            latitude: driverLocation.latitude,
            longitude: driverLocation.longitude,
          }}
          title="Votre position (Administrateur)"
          description="Vous êtes ici"
        >
          <View style={[styles.markerContainer, { borderColor: "#4F46E5" }]}>
            <Ionicons name="car" size={24} color="#4F46E5" />
          </View>
        </Marker>

        {studentLocation && (
          <Marker
            coordinate={{
              latitude: studentLocation.latitude,
              longitude: studentLocation.longitude,
            }}
            title="Ahmed karim"
            description="Position de l'étudiant"
          >
            <View style={[styles.markerContainer, { borderColor: "#EF4444" }]}>
              <Ionicons name="flag" size={20} color="#EF4444" />
            </View>
          </Marker>
        )}

        {routeCoordinates.length > 0 && (
          <Polyline coordinates={routeCoordinates} strokeWidth={4} strokeColor="#4F46E5" />
        )}
      </MapView>

      <View style={styles.infoPanel}>
        {studentLocation && (
          <View style={styles.estimatedTimeContainer}>
            <Ionicons name="time-outline" size={24} color="#4F46E5" />
            <Text style={styles.estimatedTimeText}>
              {isLoading ? "Calcul en cours..." : `Temps estimé: ${estimatedTime} minutes`}
            </Text>
          </View>
        )}

        <View style={styles.statusContainer}>
          <View style={styles.statusItem}>
            <Ionicons name="location" size={16} color="#10B981" />
            <Text style={styles.statusText}>Position GPS active</Text>
          </View>
          <View style={styles.statusItem}>
            <Ionicons name="navigate" size={16} color="#10B981" />
            <Text style={styles.statusText}>Itinéraire en temps réel</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  markerContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 5,
    borderWidth: 2,
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
    marginBottom: 15,
    color: "#333",
    textAlign: "center",
  },
  estimatedTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  estimatedTimeText: {
    marginLeft: 10,
    fontSize: 18,
    color: "#4B5563",
    fontWeight: "600",
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    marginLeft: 5,
    fontSize: 12,
    color: "#10B981",
  },
})

export default DriverScreen
