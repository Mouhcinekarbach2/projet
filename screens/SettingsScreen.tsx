"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Alert, Share } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"

const SettingsScreen = () => {
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
      console.log(`✅ Paramètre ${key} sauvegardé:`, value)
    } catch (error) {
      console.error(`Failed to save ${key} setting:`, error)
      Alert.alert("Erreur", `Impossible de sauvegarder le paramètre ${key}`)
    }
  }

  const toggleDarkMode = (value: boolean) => {
    setDarkMode(value)
    saveSetting("darkMode", value)
    Alert.alert("Mode sombre", value ? "Mode sombre activé" : "Mode sombre désactivé", [{ text: "OK" }])
  }

  const toggleLocationSharing = (value: boolean) => {
    setLocationSharing(value)
    saveSetting("locationSharing", value)
    Alert.alert("Partage de position", value ? "Partage de position activé" : "Partage de position désactivé", [
      { text: "OK" },
    ])
  }

  const toggleSound = (value: boolean) => {
    setSoundEnabled(value)
    saveSetting("soundEnabled", value)
    Alert.alert("Sons", value ? "Sons activés" : "Sons désactivés", [{ text: "OK" }])
  }

  const clearData = () => {
    Alert.alert(
      "Effacer les données",
      "⚠️ Êtes-vous sûr de vouloir effacer toutes les données ?\n\nCette action supprimera :\n• Historique des trajets\n• Messages du chat\n• Paramètres personnalisés\n\nCette action est irréversible.",
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
              // Afficher un indicateur de chargement
              Alert.alert("Effacement en cours...", "Veuillez patienter")

              // Effacer toutes les données
              await AsyncStorage.clear()

              // Réinitialiser les paramètres aux valeurs par défaut
              setDarkMode(false)
              setLocationSharing(true)
              setSoundEnabled(true)

              // Sauvegarder les paramètres par défaut
              await saveSetting("darkMode", false)
              await saveSetting("locationSharing", true)
              await saveSetting("soundEnabled", true)

              Alert.alert(
                "✅ Succès",
                "Toutes les données ont été effacées.\nLes paramètres ont été réinitialisés aux valeurs par défaut.",
                [{ text: "OK" }],
              )
            } catch (error) {
              console.error("Failed to clear data:", error)
              Alert.alert(
                "❌ Erreur",
                "Une erreur est survenue lors de l'effacement des données.\nVeuillez réessayer.",
                [{ text: "OK" }],
              )
            }
          },
        },
      ],
      { cancelable: true },
    )
  }

  const exportData = async () => {
    try {
      Alert.alert("Export en cours...", "Récupération des données")

      const allKeys = await AsyncStorage.getAllKeys()
      const allData: Record<string, any> = {}
      let dataCount = 0

      for (const key of allKeys) {
        const value = await AsyncStorage.getItem(key)
        if (value) {
          try {
            allData[key] = JSON.parse(value)
            dataCount++
          } catch {
            allData[key] = value
            dataCount++
          }
        }
      }

      const exportInfo = {
        exportDate: new Date().toISOString(),
        appVersion: "1.0.0",
        dataCount: dataCount,
        data: allData,
      }

      const dataString = JSON.stringify(exportInfo, null, 2)

      // Log dans la console
      console.log("📊 Données exportées:", dataString)

      // Essayer de partager les données (si disponible)
      try {
        await Share.share({
          message: `Données de l'application Suivi en Temps Réel\n\nExportées le: ${new Date().toLocaleString()}\nNombre d'éléments: ${dataCount}\n\nDonnées:\n${dataString}`,
          title: "Export des données - Suivi en Temps Réel",
        })
      } catch (shareError) {
        console.log("Partage non disponible, données affichées dans la console")
      }

      Alert.alert(
        "✅ Export réussi",
        `${dataCount} éléments exportés avec succès.\n\nLes données ont été :\n• Affichées dans la console de développement\n• Préparées pour le partage (si disponible)\n\nVous pouvez copier les données depuis la console pour les sauvegarder.`,
        [{ text: "OK" }],
      )
    } catch (error) {
      console.error("Erreur lors de l'export:", error)
      Alert.alert("❌ Erreur", "Impossible d'exporter les données.\nVérifiez les logs pour plus de détails.", [
        { text: "OK" },
      ])
    }
  }

  const showAbout = () => {
    Alert.alert(
      "📱 À propos de l'application",
      "🚗 Suivi en Temps Réel v1.0.0\n\n" +
        "Application de suivi GPS pour administrateur.\n\n" +
        "🎯 Fonctionnalités :\n" +
        "• 📍 Suivi GPS en temps réel\n" +
        "• 🗺️ Itinéraires optimisés vers KFC Kenitra\n" +
        "• 💬 Chat intégré\n" +
        "• 📊 Historique des trajets\n" +
        "• ⚙️ Paramètres personnalisables\n\n" +
        "🔧 Mode : Administrateur uniquement\n" +
        "📍 Destination fixe : KFC Kenitra\n" +
        "🌐 APIs : OSRM + GraphHopper\n\n" +
        "💻 Développé avec React Native et Expo\n" +
        "🏗️ Architecture : Services + Context API\n" +
        "💾 Stockage : AsyncStorage local",
      [{ text: "Fermer" }],
    )
  }

  const resetSettings = async () => {
    Alert.alert(
      "Réinitialiser les paramètres",
      "🔄 Voulez-vous remettre tous les paramètres aux valeurs par défaut ?\n\nCela réinitialisera :\n• Mode sombre : Désactivé\n• Partage de position : Activé\n• Sons : Activés\n\nLes autres données (trajets, chat) seront conservées.",
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: "Réinitialiser",
          onPress: async () => {
            try {
              // Réinitialiser aux valeurs par défaut
              setDarkMode(false)
              setLocationSharing(true)
              setSoundEnabled(true)

              // Sauvegarder les nouveaux paramètres
              await saveSetting("darkMode", false)
              await saveSetting("locationSharing", true)
              await saveSetting("soundEnabled", true)

              Alert.alert(
                "✅ Succès",
                "Paramètres réinitialisés aux valeurs par défaut :\n• Mode sombre : Désactivé\n• Partage de position : Activé\n• Sons : Activés",
                [{ text: "OK" }],
              )
            } catch (error) {
              console.error("Erreur lors de la réinitialisation:", error)
              Alert.alert("❌ Erreur", "Impossible de réinitialiser les paramètres.\nVeuillez réessayer.", [
                { text: "OK" },
              ])
            }
          },
        },
      ],
    )
  }

  const showDiagnostics = async () => {
    try {
      const allKeys = await AsyncStorage.getAllKeys()
      const storageSize = allKeys.length

      let totalDataSize = 0
      for (const key of allKeys) {
        const value = await AsyncStorage.getItem(key)
        if (value) {
          totalDataSize += value.length
        }
      }

      const diagnostics = {
        version: "1.0.0",
        platform: "React Native + Expo",
        storageKeys: storageSize,
        dataSize: `${(totalDataSize / 1024).toFixed(2)} KB`,
        settings: {
          darkMode,
          locationSharing,
          soundEnabled,
        },
        timestamp: new Date().toLocaleString(),
      }

      Alert.alert(
        "🔍 Diagnostics Système",
        `📱 Version : ${diagnostics.version}\n` +
          `⚙️ Plateforme : ${diagnostics.platform}\n` +
          `💾 Clés stockées : ${diagnostics.storageKeys}\n` +
          `📊 Taille des données : ${diagnostics.dataSize}\n\n` +
          `🌙 Mode sombre : ${darkMode ? "Activé" : "Désactivé"}\n` +
          `📍 Partage position : ${locationSharing ? "Activé" : "Désactivé"}\n` +
          `🔊 Sons : ${soundEnabled ? "Activés" : "Désactivés"}\n\n` +
          `🕒 Généré le : ${diagnostics.timestamp}`,
        [{ text: "Fermer" }],
      )

      console.log("🔍 Diagnostics complets:", diagnostics)
    } catch (error) {
      console.error("Erreur diagnostics:", error)
      Alert.alert("❌ Erreur", "Impossible de générer les diagnostics")
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👤 Profil</Text>
        <View style={styles.profileContainer}>
          <View style={styles.profileInfo}>
            <View style={styles.profileIconContainer}>
              <Ionicons name="car" size={24} color="#4F46E5" />
            </View>
            <View>
              <Text style={styles.profileType}>Administrateur</Text>
              <Text style={styles.profileDescription}>Suivi de l'étudiant à KFC Kenitra</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚙️ Préférences</Text>

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
        <Text style={styles.sectionTitle}>💾 Données</Text>
        <TouchableOpacity style={styles.dangerButton} onPress={clearData}>
          <Ionicons name="trash-outline" size={22} color="#EF4444" />
          <Text style={styles.dangerButtonText}>Effacer toutes les données</Text>
          <Ionicons name="chevron-forward" size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔧 Actions</Text>

        <TouchableOpacity style={styles.actionButton} onPress={exportData}>
          <Ionicons name="download-outline" size={22} color="#4F46E5" />
          <Text style={styles.actionButtonText}>Exporter les données</Text>
          <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={resetSettings}>
          <Ionicons name="refresh-outline" size={22} color="#F59E0B" />
          <Text style={styles.actionButtonText}>Réinitialiser les paramètres</Text>
          <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={showDiagnostics}>
          <Ionicons name="analytics-outline" size={22} color="#10B981" />
          <Text style={styles.actionButtonText}>Diagnostics système</Text>
          <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ℹ️ Informations</Text>

        <TouchableOpacity style={styles.actionButton} onPress={showAbout}>
          <Ionicons name="information-circle-outline" size={22} color="#10B981" />
          <Text style={styles.actionButtonText}>À propos de l'application</Text>
          <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 À propos</Text>

        <View style={styles.aboutItem}>
          <Text style={styles.aboutLabel}>Version</Text>
          <Text style={styles.aboutValue}>1.0.0</Text>
        </View>

        <View style={styles.aboutItem}>
          <Text style={styles.aboutLabel}>Mode</Text>
          <Text style={styles.aboutValue}>Administrateur</Text>
        </View>

        <View style={styles.aboutItem}>
          <Text style={styles.aboutLabel}>Destination</Text>
          <Text style={styles.aboutValue}>KFC Kenitra (fixe)</Text>
        </View>

        <View style={styles.aboutItem}>
          <Text style={styles.aboutLabel}>APIs</Text>
          <Text style={styles.aboutValue}>OSRM + GraphHopper</Text>
        </View>

        <View style={styles.aboutItem}>
          <Text style={styles.aboutLabel}>Stockage</Text>
          <Text style={styles.aboutValue}>Local (AsyncStorage)</Text>
        </View>
      </View>

      {/* Espacement en bas pour éviter que le contenu soit coupé */}
      <View style={{ height: 50 }} />
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
  profileContainer: {
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
  profileDescription: {
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
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  dangerButtonText: {
    fontSize: 16,
    color: "#EF4444",
    marginLeft: 12,
    flex: 1,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  actionButtonText: {
    fontSize: 16,
    color: "#374151",
    marginLeft: 12,
    flex: 1,
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
