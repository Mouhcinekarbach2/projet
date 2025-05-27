"use client"
import { NavigationContainer } from "@react-navigation/native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import DriverScreen from "./screens/DriverScreen"
import ChatScreen from "./screens/ChatScreen"
import HistoryScreen from "./screens/HistoryScreen"
import SettingsScreen from "./screens/SettingsScreen"
import { UserProvider } from "./context/UserContext"

const Tab = createBottomTabNavigator()

export default function App() {
  return (
    <SafeAreaProvider>
      <UserProvider initialUserType="driver">
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
            <Tab.Screen name="Carte" component={DriverScreen} />
            <Tab.Screen name="Chat" component={ChatScreen} />
            <Tab.Screen name="Historique" component={HistoryScreen} />
            <Tab.Screen name="Paramètres" component={SettingsScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </UserProvider>
    </SafeAreaProvider>
  )
}
