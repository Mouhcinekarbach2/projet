"use client"

import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native"
import { useState, useEffect } from "react"
import { Ionicons } from "@expo/vector-icons"
import { useUser } from "../context/UserContext"
import AsyncStorage from "@react-native-async-storage/async-storage"

type TripRecord = {
  id: string
  date: string
  startTime: string
  endTime: string
  duration: number
  distance: number
  userType: string
}

const HistoryScreen = () => {
  const { userType } = useUser()
  const [tripHistory, setTripHistory] = useState<TripRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadTripHistory()
  }, [])

  const loadTripHistory = async () => {
    try {
      setIsLoading(true)
      const historyData = await AsyncStorage.getItem("tripHistory")
      if (historyData) {
        const parsedHistory = JSON.parse(historyData) as TripRecord[]
        // Filter history based on user type if needed
        setTripHistory(parsedHistory)
      }
      setIsLoading(false)
    } catch (error) {
      console.error("Failed to load trip history:", error)
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const renderTripItem = ({ item }: { item: TripRecord }) => (
    <TouchableOpacity style={styles.tripItem}>
      <View style={styles.tripHeader}>
        <Text style={styles.tripDate}>{formatDate(item.date)}</Text>
        <View style={styles.tripTypeContainer}>
          <Ionicons
            name={item.userType === "driver" ? "car" : "school"}
            size={16}
            color={item.userType === "driver" ? "#4F46E5" : "#EF4444"}
          />
          <Text style={styles.tripType}>{item.userType === "driver" ? "Conducteur" : "Étudiant"}</Text>
        </View>
      </View>

      <View style={styles.tripDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={18} color="#6B7280" />
          <Text style={styles.detailText}>
            {item.startTime} - {item.endTime}
          </Text>
        </View>

        <View style={styles.detailItem}>
          <Ionicons name="hourglass-outline" size={18} color="#6B7280" />
          <Text style={styles.detailText}>{item.duration} min</Text>
        </View>

        <View style={styles.detailItem}>
          <Ionicons name="navigate-outline" size={18} color="#6B7280" />
          <Text style={styles.detailText}>{item.distance.toFixed(1)} km</Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Chargement de l'historique...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historique des Trajets</Text>

      {tripHistory.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyText}>Aucun trajet enregistré</Text>
          <Text style={styles.emptySubtext}>
            Vos trajets apparaîtront ici une fois que vous aurez terminé un trajet.
          </Text>
        </View>
      ) : (
        <FlatList
          data={tripHistory}
          renderItem={renderTripItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#111827",
  },
  listContainer: {
    paddingBottom: 20,
  },
  tripItem: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  tripHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  tripDate: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  tripTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  tripType: {
    fontSize: 14,
    marginLeft: 4,
    color: "#4B5563",
  },
  tripDetails: {
    gap: 8,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    marginLeft: 8,
    fontSize: 15,
    color: "#4B5563",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 8,
  },
})

export default HistoryScreen
