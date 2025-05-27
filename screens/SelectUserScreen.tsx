import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

type SelectUserScreenProps = {
  onSelectUserType: (type: string) => void
}

const SelectUserScreen = ({ onSelectUserType }: SelectUserScreenProps) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Bienvenue</Text>
        <Text style={styles.subtitle}>Choisissez votre profil</Text>

        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.option} onPress={() => onSelectUserType("driver")}>
            <View style={styles.iconContainer}>
              <Image source={{ uri: "https://cdn-icons-png.flaticon.com/512/3774/3774278.png" }} style={styles.icon} />
            </View>
            <Text style={styles.optionText}>Administrateur</Text>
            <Text style={styles.optionDescription}>Suivre la position de l'étudiant</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={() => onSelectUserType("student")}>
            <View style={styles.iconContainer}>
              <Image source={{ uri: "https://cdn-icons-png.flaticon.com/512/2302/2302834.png" }} style={styles.icon} />
            </View>
            <Text style={styles.optionText}>Utilisateur</Text>
            <Text style={styles.optionDescription}>Voir l'itinéraire vers l'étudiant</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            L'étudiant est situé à KFC Kenitra. L'application affichera toujours l'itinéraire vers cette destination.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 40,
    color: "#666",
  },
  optionsContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 30,
  },
  option: {
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "45%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  icon: {
    width: 50,
    height: 50,
  },
  optionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  optionDescription: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  infoContainer: {
    backgroundColor: "#E3F2FD",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  infoText: {
    fontSize: 14,
    color: "#1976D2",
    textAlign: "center",
    lineHeight: 20,
  },
})

export default SelectUserScreen
