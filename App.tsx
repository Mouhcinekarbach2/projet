"use client"

import { useState, useEffect } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import DriverScreen from "./screens/DriverScreen"
import StudentScreen from "./screens/StudentScreen"
import ChatScreen from "./screens/ChatScreen"
import HistoryScreen from "./screens/HistoryScreen"
import SettingsScreen from "./screens/SettingsScreen"
import DestinationScreen from "./screens/DestinationScreen"
import SelectUserScreen from "./screens/SelectUserScreen"
import { UserProvider } from "./context/UserContext"
import { storageService } from "./services"

const Tab = createBottomTabNavigator()

export default function App() {
  const [userType, setUserType] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user has already selected a type
    const checkUserType = async () => {
      try {
        const savedUserType = await storageService.getData<string>("userType")
        if (savedUserType) {
          setUserType(savedUserType)
        }
      } catch (error) {
        console.error("Error loading user type:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkUserType()
  }, [])

  const handleSelectUserType = async (type: string) => {
    setUserType(type)
    try {
      await storageService.storeData("userType", type)
    } catch (error) {
      console.error("Error saving user type:", error)
    }
  }

  if (isLoading) {
    // You could add a splash screen here
    return null
  }

  if (!userType) {
    return (
      <SafeAreaProvider>
        <SelectUserScreen onSelectUserType={handleSelectUserType} />
      </SafeAreaProvider>
    )
  }

  return (
    <SafeAreaProvider>
      <UserProvider initialUserType={userType}>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName: any

                if (route.name === "Carte") {
                  iconName = focused ? "map" : "map-outline"
                } else if (route.name === "Chat") {
                  iconName = focused ? "chatbubble" : "chatbubble-outline"
                } else if (route.name === "Historique") {
                  iconName = focused ? "time" : "time-outline"
                } else if (route.name === "Destinations") {
                  iconName = focused ? "navigate" : "navigate-outline"
                } else if (route.name === "Paramètres") {
                  iconName = focused ? "settings" : "settings-outline"
                }

                return <Ionicons name={iconName as any} size={size} color={color} />
              },
              tabBarActiveTintColor: "#4F46E5",
              tabBarInactiveTintColor: "gray",
              headerShown: false,
            })}
          >
            <Tab.Screen name="Carte" component={userType === "driver" ? DriverScreen : StudentScreen} />
            <Tab.Screen name="Destinations" component={DestinationScreen} />
            <Tab.Screen name="Chat" component={ChatScreen} />
            <Tab.Screen name="Historique" component={HistoryScreen} />
            <Tab.Screen name="Paramètres" component={SettingsScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </UserProvider>
    </SafeAreaProvider>
  )
}
