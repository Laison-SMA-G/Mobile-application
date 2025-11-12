// screens/ChatScreen.js
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  TextInput,
  Button,
  FlatList,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { io } from "socket.io-client";
import { useUser } from "../context/UserContext";

const BASE_URL = "http://192.168.100.45:5000"; // Your backend URL

export default function ChatScreen({ route }) {
  const { chatId } = route.params;
  const { user } = useUser(); // logged-in user
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const socketRef = useRef(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    if (!chatId || !user?.id) return;

    const socket = io(BASE_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🟢 Connected to chat socket");
      socket.emit("joinChat", { chatId });
    });

    socket.on("chatHistory", (history) => {
      setMessages(history);
    });

    socket.on("message", ({ message }) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Disconnected from socket");
    });

    return () => {
      socket.disconnect();
    };
  }, [chatId, user]);

  const sendMessage = () => {
    if (!text.trim() || !user?.id) return;

    socketRef.current.emit("sendMessage", {
      chatId,
      sender: user.id,
      content: text,
    });

    setText("");
  };

  const renderMessage = ({ item }) => {
    const isMe = item.sender === user.id;
    return (
      <View
        style={[
          styles.messageContainer,
          isMe ? styles.myMessage : styles.otherMessage,
        ]}
      >
        <Text style={styles.messageText}>{item.content}</Text>
        <Text style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleTimeString()}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderMessage}
        contentContainerStyle={{ padding: 10 }}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        onLayout={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />
      <View style={styles.inputRow}>
        <TextInput
          value={text}
          onChangeText={setText}
          style={styles.input}
          placeholder="Type your message..."
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f8f8" },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    marginRight: 10,
    padding: 8,
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  messageContainer: {
    maxWidth: "70%",
    padding: 8,
    borderRadius: 10,
    marginVertical: 5,
  },
  myMessage: {
    backgroundColor: "#074ec2",
    alignSelf: "flex-end",
    borderTopRightRadius: 0,
  },
  otherMessage: {
    backgroundColor: "#e1e1e1",
    alignSelf: "flex-start",
    borderTopLeftRadius: 0,
  },
  messageText: { color: "#fff" },
  timestamp: {
    fontSize: 10,
    color: "#eee",
    marginTop: 2,
    alignSelf: "flex-end",
  },
});
