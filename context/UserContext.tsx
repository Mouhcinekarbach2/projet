"use client"

import { useEffect } from "react"
import { createContext, useState, useContext, type ReactNode } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { locationService } from "../services"
import type { Coordinates } from "../services"

type Trip = {
  id: string
  date: string
  startTime: string
  endTime: string
  duration: number
  distance: number
  startLocation: Coordinates
  endLocation: Coordinates
  userType: string
}

type UserContextType = {
  userType: string
  currentLocation: Coordinates | null
  updateLocation: (location: Coordinates) => void
  driverLocation: Coordinates | null
  studentLocation: Coordinates | null
  updateDriverLocation: (location: Coordinates) => void
  updateStudentLocation: (location: Coordinates) => void
  estimatedTime: number | null
  updateEstimatedTime: (time: number) => void
  currentTrip: Trip | null
  startTrip: () => void
  endTrip: () => void
  tripHistory: Trip[]
}

// Position fixe de l'étudiant - KFC Kenitra (coordonnées précises)
const KFC_KENITRA_LOCATION: Coordinates = {
  latitude: 34.263,
  longitude: -6.581,
}

const defaultContext: UserContextType = {
  userType: "driver",
  currentLocation: null,
  updateLocation: () => {},
  driverLocation: null,
  studentLocation: null,
  updateDriverLocation: () => {},
  updateStudentLocation: () => {},
  estimatedTime: null,
  updateEstimatedTime: () => {},
  currentTrip: null,
  startTrip: () => {},
  endTrip: () => {},
  tripHistory: [],
}

const UserContext = createContext<UserContextType>(defaultContext)

export const useUser = () => useContext(UserContext)

type UserProviderProps = {
  children: ReactNode
  initialUserType: string
}

export const UserProvider = ({ children, initialUserType }: UserProviderProps) => {
  // Toujours en mode "driver" (administrateur)
  const [userType] = useState("driver")
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null)
  const [driverLocation, setDriverLocation] = useState<Coordinates | null>({
    // Position initiale - Centre-ville de Kenitra
    latitude: 34.261,
    longitude: -6.583,
  })
  // Position fixe de l'étudiant à KFC Kenitra (ne change jamais)
  const [studentLocation] = useState<Coordinates | null>(KFC_KENITRA_LOCATION)
  const [estimatedTime, setEstimatedTime] = useState<number | null>(10)
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null)
  const [tripHistory, setTripHistory] = useState<Trip[]>([])

  useEffect(() => {
    ;(async () => {
      const location = await locationService.getCurrentPosition()
      if (location) {
        setCurrentLocation(location)
        setDriverLocation(location)
      }
    })()

    // Load trip history from AsyncStorage
    loadTripHistory()
  }, [])

  const loadTripHistory = async () => {
    try {
      const historyData = await AsyncStorage.getItem("tripHistory")
      if (historyData) {
        setTripHistory(JSON.parse(historyData))
      }
    } catch (error) {
      console.error("Failed to load trip history:", error)
    }
  }

  const saveTripHistory = async (trips: Trip[]) => {
    try {
      await AsyncStorage.setItem("tripHistory", JSON.stringify(trips))
    } catch (error) {
      console.error("Failed to save trip history:", error)
    }
  }

  const updateLocation = (location: Coordinates) => {
    setCurrentLocation(location)
  }

  const updateDriverLocation = (location: Coordinates) => {
    setDriverLocation(location)
    calculateEstimatedTime(location, studentLocation)
  }

  const updateStudentLocation = (location: Coordinates) => {
    // Ne rien faire - la position de l'étudiant reste fixe à KFC Kenitra
    console.log("La position de l'étudiant est fixe à KFC Kenitra et ne peut pas être mise à jour")
  }

  const calculateEstimatedTime = (from: Coordinates | null, to: Coordinates | null) => {
    if (!from || !to) return

    const timeInMinutes = locationService.calculateEstimatedTime(from, to, 25) // Vitesse moyenne de 25 km/h en ville
    if (timeInMinutes) {
      setEstimatedTime(timeInMinutes)
    }
  }

  const updateEstimatedTime = (time: number) => {
    setEstimatedTime(time)
  }

  const startTrip = () => {
    if (currentLocation) {
      const now = new Date()
      const newTrip: Trip = {
        id: Date.now().toString(),
        date: now.toISOString().split("T")[0],
        startTime: now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        endTime: "",
        duration: 0,
        distance: 0,
        startLocation: currentLocation,
        endLocation: currentLocation, // Will be updated when trip ends
        userType: userType,
      }
      setCurrentTrip(newTrip)
    }
  }

  const endTrip = () => {
    if (currentTrip && currentLocation) {
      const now = new Date()
      const startTime = new Date(
        `${currentTrip.date}T${currentTrip.startTime.split(":")[0]}:${currentTrip.startTime.split(":")[1]}`,
      )
      const endTime = now
      const durationInMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))

      const distance = locationService.calculateDistance(
        currentTrip.startLocation.latitude,
        currentTrip.startLocation.longitude,
        currentLocation.latitude,
        currentLocation.longitude,
      )

      const completedTrip: Trip = {
        ...currentTrip,
        endTime: now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        duration: durationInMinutes,
        distance: distance,
        endLocation: currentLocation,
      }

      const updatedHistory = [...tripHistory, completedTrip]
      setTripHistory(updatedHistory)
      saveTripHistory(updatedHistory)
      setCurrentTrip(null)
    }
  }

  return (
    <UserContext.Provider
      value={{
        userType,
        currentLocation,
        updateLocation,
        driverLocation,
        studentLocation,
        updateDriverLocation,
        updateStudentLocation,
        estimatedTime,
        updateEstimatedTime,
        currentTrip,
        startTrip,
        endTrip,
        tripHistory,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}
