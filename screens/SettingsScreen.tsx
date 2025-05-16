"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useUser } from "../context/UserContext"

const SettingsScreen = () => {
  const { userType, setUserType } = useUser()
  const [darkMode, setDarkMode] = useState(false)
  const [locationSharing, setLocationSharing] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const darkModeSetting = await AsyncStorage.getItem("darkMode")
      if (darkModeSetting !== null) {
        setDarkMode(JSON.parse(darkModeSetting))
      }

      const locationSharingSetting = await AsyncStorage.getItem("locationSharing")
      if (locationSharingSetting !== null) {
        setLocationSharing(JSON.parse(locationSharingSetting))
      }

      const soundEnabledSetting = await AsyncStorage.getItem("soundEnabled")
      if (soundEnabledSetting !== null) {
        setSoundEnabled(JSON.parse(soundEnabledSetting))
      }
    } catch (error) {
      console.error("Failed to load settings:", error)
    }
  }

  const saveSetting = async (key: string, value: boolean) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Failed to save ${key} setting:`, error)
    }
  }

  const toggleDarkMode = (value: boolean) => {
    setDarkMode(value)
    saveSetting("darkMode", value)
  }

  const toggleLocationSharing = (value: boolean) => {
    setLocationSharing(value)
    saveSetting("locationSharing", value)
  }

  const toggleSound = (value: boolean) => {
    setSoundEnabled(value)
    saveSetting("soundEnabled", value)
  }

  const changeUserType = () => {
    Alert.alert(
      "Changer de profil",
      "Êtes-vous sûr de vouloir changer de profil ?",
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: "Confirmer",
          onPress: () => {
            const newUserType = userType === "driver" ? "student" : "driver"
            setUserType(newUserType)
          },
        },
      ],
      { cancelable: true },
    )
  }

  const clearData = () => {
    Alert.alert(
      "Effacer les données",
      "Êtes-vous sûr de vouloir effacer toutes les données ? Cette action est irréversible.",
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: "Effacer",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.clear()
              Alert.alert("Succès", "Toutes les données ont été effacées.")
              loadSettings()
            } catch (error) {
              console.error("Failed to clear data:", error)
              Alert.alert("Erreur", "Une erreur est survenue lors de l'effacement des données.")
            }
          },
        },
      ],
      { cancelable: true },
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profil</Text>
        <TouchableOpacity style={styles.profileButton} onPress={changeUserType}>
          <View style={styles.profileInfo}>
            <View style={styles.profileIconContainer}>
              <Ionicons
                name={userType === "driver" ? "car" : "school"}
                size={24}
                color={userType === "driver" ? "#4F46E5" : "#EF4444"}
              />
            </View>
            <View>
              <Text style={styles.profileType}>{userType === "driver" ? "Conducteur" : "Étudiant"}</Text>
              <Text style={styles.profileAction}>Appuyez pour changer de profil</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Préférences</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="moon-outline" size={22} color="#4B5563" />
            <Text style={styles.settingText}>Mode sombre</Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={toggleDarkMode}
            trackColor={{ false: "#D1D5DB", true: "#C7D2FE" }}
            thumbColor={darkMode ? "#4F46E5" : "#9CA3AF"}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="location-outline" size={22} color="#4B5563" />
            <Text style={styles.settingText}>Partage de position</Text>
          </View>
          <Switch
            value={locationSharing}
            onValueChange={toggleLocationSharing}
            trackColor={{ false: "#D1D5DB", true: "#C7D2FE" }}
            thumbColor={locationSharing ? "#4F46E5" : "#9CA3AF"}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="volume-medium-outline" size={22} color="#4B5563" />
            <Text style={styles.settingText}>Sons</Text>
          </View>
          <Switch
            value={soundEnabled}
            onValueChange={toggleSound}
            trackColor={{ false: "#D1D5DB", true: "#C7D2FE" }}
            thumbColor={soundEnabled ? "#4F46E5" : "#9CA3AF"}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Données</Text>
        <TouchableOpacity style={styles.dangerButton} onPress={clearData}>
          <Ionicons name="trash-outline" size={22} color="#EF4444" />
          <Text style={styles.dangerButtonText}>Effacer toutes les données</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>À propos</Text>
        <View style={styles.aboutItem}>
          <Text style={styles.aboutLabel}>Version</Text>
          <Text style={styles.aboutValue}>1.0.0</Text>
        </View>
        <View style={styles.aboutItem}>
          <Text style={styles.aboutLabel}>Développé par</Text>
          <Text style={styles.aboutValue}>Votre Nom</Text>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  section: {
    backgroundColor: "white",
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: 16,
  },
  profileButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  profileType: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  profileAction: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingText: {
    fontSize: 16,
    color: "#374151",
    marginLeft: 12,
  },
  dangerButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  dangerButtonText: {
    fontSize: 16,
    color: "#EF4444",
    marginLeft: 12,
  },
  aboutItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  aboutLabel: {
    fontSize: 16,
    color: "#374151",
  },
  aboutValue: {
    fontSize: 16,
    color: "#6B7280",
  },
})

export default SettingsScreen
