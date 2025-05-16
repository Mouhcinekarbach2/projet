import type { Coordinates } from "./location-service"

export type Destination = {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  isFavorite: boolean
}

export type RouteInfo = {
  distance: number // in kilometers
  duration: number // in minutes
  polyline: string // encoded polyline for the route
}

class ApiService {
  private static instance: ApiService
  private baseUrl = "https://api.example.com" // This would be a real API in production

  private constructor() {}

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService()
    }
    return ApiService.instance
  }

  // Simulate API call to search for destinations
  public async searchDestinations(query: string): Promise<Destination[]> {
    // In a real app, this would be an API call
    // For demo purposes, we'll return mock data

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const mockDestinations: Destination[] = [
      {
        id: "1",
        name: "Ouled Oujih",
        address: "Quartier Ouled Oujih, Kénitra, Maroc",
        latitude: 34.2702,
        longitude: -6.5802,
        isFavorite: false,
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
        isFavorite: false,
      },
      {
        id: "4",
        name: "Université Ibn Tofail",
        address: "Campus Universitaire, Kénitra, Maroc",
        latitude: 34.251,
        longitude: -6.5868,
        isFavorite: false,
      },
      {
        id: "5",
        name: "Quartier Mimosas",
        address: "Mimosas, Kénitra, Maroc",
        latitude: 34.255,
        longitude: -6.575,
        isFavorite: false,
      },
      {
        id: "6",
        name: "Quartier Saknia",
        address: "Saknia, Kénitra, Maroc",
        latitude: 34.273,
        longitude: -6.572,
        isFavorite: false,
      },
      {
        id: "7",
        name: "Zone Industrielle",
        address: "Zone Industrielle, Kénitra, Maroc",
        latitude: 34.28,
        longitude: -6.6,
        isFavorite: false,
      },
      {
        id: "8",
        name: "Port de Kénitra",
        address: "Port de Kénitra, Mehdia, Maroc",
        latitude: 34.259,
        longitude: -6.65,
        isFavorite: false,
      },
      {
        id: "9",
        name: "Marché Central",
        address: "Souk El Had, Centre-ville, Kénitra, Maroc",
        latitude: 34.262,
        longitude: -6.584,
        isFavorite: false,
      },
      {
        id: "10",
        name: "Hôpital Régional",
        address: "Avenue Mohammed V, Kénitra, Maroc",
        latitude: 34.264,
        longitude: -6.579,
        isFavorite: false,
      },
      {
        id: "11",
        name: "Société Générale Nafoura Kenitra",
        address: "Rond point El Harrati, Oulad Oujih, Kénitra, Maroc",
        latitude: 34.2702,
        longitude: -6.5802,
        isFavorite: false,
      },
      {
        id: "12",
        name: "Quartier Bir Rami",
        address: "Bir Rami, Kénitra, Maroc",
        latitude: 34.248,
        longitude: -6.59,
        isFavorite: false,
      },
      {
        id: "13",
        name: "Quartier Val Fleuri",
        address: "Val Fleuri, Kénitra, Maroc",
        latitude: 34.253,
        longitude: -6.578,
        isFavorite: false,
      },
      {
        id: "14",
        name: "Stade Municipal",
        address: "Avenue Mohammed V, Kénitra, Maroc",
        latitude: 34.257,
        longitude: -6.585,
        isFavorite: false,
      },
      {
        id: "15",
        name: "Plage de Mehdia",
        address: "Mehdia, Kénitra, Maroc",
        latitude: 34.259,
        longitude: -6.67,
        isFavorite: false,
      },
    ]

    // Filter destinations based on query
    return mockDestinations.filter(
      (dest) =>
        dest.name.toLowerCase().includes(query.toLowerCase()) ||
        dest.address.toLowerCase().includes(query.toLowerCase()),
    )
  }

  // Simulate API call to get route information
  public async getRouteInfo(origin: Coordinates, destination: Coordinates): Promise<RouteInfo> {
    // In a real app, this would call a routing API like Google Directions
    // For demo purposes, we'll return mock data

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 700))

    // Calculate a simple straight-line distance
    const R = 6371 // Radius of the earth in km
    const dLat = this.deg2rad(destination.latitude - origin.latitude)
    const dLon = this.deg2rad(destination.longitude - origin.longitude)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(origin.latitude)) *
        Math.cos(this.deg2rad(destination.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c // Distance in km

    // Assume average speed of 30 km/h
    const duration = Math.round((distance / 30) * 60)

    // Mock polyline (in a real app, this would be provided by the routing API)
    const polyline = "mock_polyline_data"

    return {
      distance,
      duration,
      polyline,
    }
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180)
  }

  // Simulate API call to get weather information
  public async getWeatherInfo(location: Coordinates): Promise<{ temperature: number; condition: string }> {
    // In a real app, this would call a weather API
    // For demo purposes, we'll return mock data

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 600))

    const conditions = ["sunny", "cloudy", "rainy", "windy", "stormy"]
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)]
    const randomTemperature = Math.floor(Math.random() * 30) + 5 // Random temperature between 5 and 35

    return {
      temperature: randomTemperature,
      condition: randomCondition,
    }
  }
}

export default ApiService.getInstance()
