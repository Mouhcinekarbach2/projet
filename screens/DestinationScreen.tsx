"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useUser } from "../context/UserContext"
import { apiService, storageService } from "../services"
import type { Destination } from "../services"

const DestinationScreen = () => {
  const { userType } = useUser()
  const [searchQuery, setSearchQuery] = useState("")
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [favoriteDestinations, setFavoriteDestinations] = useState<Destination[]>([])
  const [recentDestinations, setRecentDestinations] = useState<Destination[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<Destination[]>([])

  useEffect(() => {
    loadDestinations()

    // Add Kenitra destinations for demo
    if (!destinations.length) {
      const kenitaDestinations = [
        {
          id: "1",
          name: "Ouled Oujih",
          address: "Quartier Ouled Oujih, Kénitra, Maroc",
          latitude: 34.2702,
          longitude: -6.5802,
          isFavorite: true,
        },
        {
          id: "2",
          name: "Centre-ville de Kénitra",
          address: "Centre-ville, Kénitra, Maroc",
          latitude: 34.261,
          longitude: -6.583,
          isFavorite: false,
        },
        {
          id: "3",
          name: "Gare de Kénitra",
          address: "Avenue Mohammed V, Kénitra, Maroc",
          latitude: 34.2587,
          longitude: -6.58,
          isFavorite: true,
        },
        {
          id: "11",
          name: "Société Générale Nafoura Kenitra",
          address: "Rond point El Harrati, Oulad Oujih, Kénitra, Maroc",
          latitude: 34.2702,
          longitude: -6.5802,
          isFavorite: true,
        },
        {
          id: "12",
          name: "Quartier Bir Rami",
          address: "Bir Rami, Kénitra, Maroc",
          latitude: 34.248,
          longitude: -6.59,
          isFavorite: false,
        },
      ]
      setDestinations(kenitaDestinations)
      setFavoriteDestinations(kenitaDestinations.filter((dest) => dest.isFavorite))
      setRecentDestinations([kenitaDestinations[0], kenitaDestinations[3]])
      saveDestinations(kenitaDestinations)
    }
  }, [])

  const loadDestinations = async () => {
    try {
      const savedDestinations = await storageService.getData<Destination[]>("destinations")
      if (savedDestinations && savedDestinations.length > 0) {
        setDestinations(savedDestinations)
        setFavoriteDestinations(savedDestinations.filter((dest) => dest.isFavorite))

        const savedRecent = await storageService.getData<Destination[]>("recentDestinations")
        if (savedRecent && savedRecent.length > 0) {
          setRecentDestinations(savedRecent)
        }
      }
    } catch (error) {
      console.error("Failed to load destinations:", error)
    }
  }

  const saveDestinations = async (destinationsToSave: Destination[]) => {
    try {
      await storageService.storeData("destinations", destinationsToSave)
    } catch (error) {
      console.error("Failed to save destinations:", error)
    }
  }

  const saveRecentDestinations = async (recentToSave: Destination[]) => {
    try {
      await storageService.storeData("recentDestinations", recentToSave)
    } catch (error) {
      console.error("Failed to save recent destinations:", error)
    }
  }

  const handleSearch = async (text: string) => {
    setSearchQuery(text)
    if (text.length > 2) {
      setIsLoading(true)
      try {
        // Use the API service to search for destinations
        const results = await apiService.searchDestinations(text)

        // Merge with favorite status from local destinations
        const mergedResults = results.map((result) => {
          const existingDest = destinations.find((d) => d.id === result.id)
          return existingDest ? { ...result, isFavorite: existingDest.isFavorite } : result
        })

        setSearchResults(mergedResults)
      } catch (error) {
        console.error("Error searching destinations:", error)
        // Fallback to local filtering
        const results = destinations.filter(
          (dest) =>
            dest.name.toLowerCase().includes(text.toLowerCase()) ||
            dest.address.toLowerCase().includes(text.toLowerCase()),
        )
        setSearchResults(results)
      } finally {
        setIsLoading(false)
      }
    } else {
      setSearchResults([])
    }
  }

  const toggleFavorite = (id: string) => {
    const updatedDestinations = destinations.map((dest) =>
      dest.id === id ? { ...dest, isFavorite: !dest.isFavorite } : dest,
    )
    setDestinations(updatedDestinations)
    setFavoriteDestinations(updatedDestinations.filter((dest) => dest.isFavorite))
    saveDestinations(updatedDestinations)

    // Also update search results if they're displayed
    if (searchResults.length > 0) {
      const updatedSearchResults = searchResults.map((dest) =>
        dest.id === id ? { ...dest, isFavorite: !dest.isFavorite } : dest,
      )
      setSearchResults(updatedSearchResults)
    }
  }

  const addToRecent = (destination: Destination) => {
    // Check if already in recents
    const existingIndex = recentDestinations.findIndex((dest) => dest.id === destination.id)
    let newRecents = [...recentDestinations]

    if (existingIndex !== -1) {
      // Remove from current position
      newRecents.splice(existingIndex, 1)
    }

    // Add to the beginning
    newRecents = [destination, ...newRecents]

    // Keep only the last 5 recent destinations
    if (newRecents.length > 5) {
      newRecents = newRecents.slice(0, 5)
    }

    setRecentDestinations(newRecents)
    saveRecentDestinations(newRecents)
  }

  const selectDestination = (destination: Destination) => {
    // Here you would typically navigate to the map with this destination
    addToRecent(destination)
    // For demo purposes, just log the selection
    console.log("Selected destination:", destination)
    setSearchQuery("")
    setSearchResults([])
  }

  const renderDestinationItem = ({ item }: { item: Destination }) => (
    <TouchableOpacity style={styles.destinationItem} onPress={() => selectDestination(item)}>
      <View style={styles.destinationInfo}>
        <Text style={styles.destinationName}>{item.name}</Text>
        <Text style={styles.destinationAddress}>{item.address}</Text>
      </View>
      <TouchableOpacity style={styles.favoriteButton} onPress={() => toggleFavorite(item.id)}>
        <Ionicons
          name={item.isFavorite ? "star" : "star-outline"}
          size={24}
          color={item.isFavorite ? "#F59E0B" : "#9CA3AF"}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  )

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Destinations</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une destination..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      ) : searchQuery.length > 0 ? (
        <FlatList
          data={searchResults}
          renderItem={renderDestinationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Aucun résultat trouvé</Text>
            </View>
          }
        />
      ) : (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Favoris</Text>
          </View>
          <FlatList
            data={favoriteDestinations}
            renderItem={renderDestinationItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Aucun favori</Text>
              </View>
            }
          />

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Récents</Text>
          </View>
          <FlatList
            data={recentDestinations}
            renderItem={renderDestinationItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Aucune destination récente</Text>
              </View>
            }
          />
        </>
      )}
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
  },
  searchContainer: {
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: "#1F2937",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    padding: 16,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: "#F9FAFB",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4B5563",
  },
  destinationItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  destinationInfo: {
    flex: 1,
  },
  destinationName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  destinationAddress: {
    fontSize: 14,
    color: "#6B7280",
  },
  favoriteButton: {
    padding: 8,
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#9CA3AF",
  },
})

export default DestinationScreen
