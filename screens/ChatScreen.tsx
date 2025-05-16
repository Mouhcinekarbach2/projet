"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useUser } from "../context/UserContext"
import AsyncStorage from "@react-native-async-storage/async-storage"

type Message = {
  id: string
  text: string
  sender: string
  timestamp: number
}

const ChatScreen = () => {
  const { userType } = useUser()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState("")
  const flatListRef = useRef<FlatList>(null)

  useEffect(() => {
    loadMessages()

    // Add some sample messages for demo purposes
    if (!messages.length) {
      const demoMessages = [
        {
          id: "1",
          text: "Bonjour, je suis en route pour vous récupérer.",
          sender: "driver",
          timestamp: Date.now() - 3600000,
        },
        {
          id: "2",
          text: "D'accord, je vous attends devant le bâtiment principal.",
          sender: "student",
          timestamp: Date.now() - 3500000,
        },
        {
          id: "3",
          text: "Je serai là dans environ 10 minutes.",
          sender: "driver",
          timestamp: Date.now() - 3400000,
        },
      ]
      setMessages(demoMessages)
      saveMessages(demoMessages)
    }
  }, [])

  useEffect(() => {
    // Scroll to bottom when messages change
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true })
    }
  }, [messages])

  const loadMessages = async () => {
    try {
      const savedMessages = await AsyncStorage.getItem("chatMessages")
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages))
      }
    } catch (error) {
      console.error("Failed to load messages:", error)
    }
  }

  const saveMessages = async (messagesToSave: Message[]) => {
    try {
      await AsyncStorage.setItem("chatMessages", JSON.stringify(messagesToSave))
    } catch (error) {
      console.error("Failed to save messages:", error)
    }
  }

  const sendMessage = () => {
    if (inputText.trim() === "") return

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: userType,
      timestamp: Date.now(),
    }

    const updatedMessages = [...messages, newMessage]
    setMessages(updatedMessages)
    saveMessages(updatedMessages)
    setInputText("")
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const renderMessage = ({ item }: { item: Message }) => {
    const isCurrentUser = item.sender === userType
    return (
      <View style={[styles.messageContainer, isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage]}>
        <Text
          style={{
            fontSize: 16,
            color: isCurrentUser ? "white" : "#374151",
          }}
        >
          {item.text}
        </Text>
        <Text
          style={{
            fontSize: 12,
            marginTop: 4,
            alignSelf: "flex-end",
            color: isCurrentUser ? "rgba(255,255,255,0.7)" : "#6B7280",
          }}
        >
          {formatTime(item.timestamp)}
        </Text>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {userType === "driver" ? "Chat avec l'étudiant" : "Chat avec le conducteur"}
        </Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Tapez votre message..."
          placeholderTextColor="#9CA3AF"
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Ionicons name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
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
  messagesList: {
    padding: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  currentUserMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#4F46E5",
    borderBottomRightRadius: 4,
  },
  otherUserMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#E5E7EB",
    borderBottomLeftRadius: 4,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  input: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: "#1F2937",
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
})

export default ChatScreen
