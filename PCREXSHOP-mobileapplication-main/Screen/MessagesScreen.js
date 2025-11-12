import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { useUser } from '../context/UserContext';

const BASE_URL = "http://192.168.100.45:5000/api";

const MessagesScreen = ({ navigation }) => {
  const { user, token } = useUser();
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigation.replace('SignIn_SignUp');
      return;
    }
    initChatWithAdmin();
  }, [user]);

  // ✅ Initialize chat with admin
  const initChatWithAdmin = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // 1️⃣ Fetch admin user dynamically
      const resAdmin = await axios.get(`${BASE_URL}/users?role=admin`, config);
      if (!resAdmin.data || resAdmin.data.length === 0) {
        console.error('No admin found in database');
        setLoading(false);
        return;
      }
      const adminUser = resAdmin.data[0]; // take first admin

      // 2️⃣ Check if a chat with this admin already exists
      const existingChats = await axios.get(`${BASE_URL}/chats/user/${user.id}`, config);
      let adminChat = existingChats.data.find(chat =>
        chat.participants.some(p => p._id === adminUser._id)
      );

      // 3️⃣ If not, create a new chat
      if (!adminChat) {
        const newChatRes = await axios.post(
          `${BASE_URL}/chats`,
          { receiverId: adminUser._id },
          config
        );
        adminChat = newChatRes.data;
      }

      setChat(adminChat);

      // 4️⃣ Load messages
      const messagesRes = await axios.get(`${BASE_URL}/messages/${adminChat._id}`, config);
      setMessages(messagesRes.data);
    } catch (err) {
      console.error('Chat initialization failed:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    try {
      const res = await axios.post(
        `${BASE_URL}/messages`,
        { chatId: chat._id, content: input },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages([...messages, res.data]);
      setInput('');
    } catch (err) {
      console.error('Failed to send message:', err.response?.data || err.message);
    }
  };

  if (loading) return (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>Loading chat...</Text>
    </View>
  );

  if (!chat) return (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>Unable to connect with admin.</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <FlatList
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={[
            styles.messageBubble,
            item.sender._id === user.id ? styles.myMessage : styles.theirMessage
          ]}>
            <Text style={styles.messageText}>{item.content}</Text>
          </View>
        )}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          placeholderTextColor="#999"
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Icon name="send" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#555' },
  messageBubble: { margin: 8, padding: 10, borderRadius: 10, maxWidth: '75%' },
  myMessage: { backgroundColor: '#074ec2', alignSelf: 'flex-end' },
  theirMessage: { backgroundColor: '#e9ecef', alignSelf: 'flex-start' },
  messageText: { color: '#fff' },
  inputContainer: { flexDirection: 'row', padding: 10, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#ddd' },
  textInput: { flex: 1, backgroundColor: '#f1f3f5', borderRadius: 20, paddingHorizontal: 15, fontSize: 16 },
  sendButton: { marginLeft: 8, backgroundColor: '#074ec2', borderRadius: 50, padding: 10, justifyContent: 'center', alignItems: 'center' },
});

export default MessagesScreen;
