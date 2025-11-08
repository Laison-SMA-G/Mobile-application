// screens/ChatScreen.js
import React, { useEffect, useState, useRef } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet, Platform } from 'react-native';
import { io } from 'socket.io-client';

export default function ChatScreen({ route }) {
  const { chatId, userId } = route.params;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io('http://192.168.100.45:3000', {
      transports: ['websocket'], // important for web compatibility
      auth: { token: '85eb114f28eddf49b4d8e857363c508eb53493a721a9adf2192c86293fc9dacf26e7e9f7c738bf1bddfea16239eac9ef948513ff610d0fe00a8c9865cb928248' }, // replace with your token
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to socket:', socket.id);
      socket.emit('joinChat', { chatId });
    });

    socket.on('chatHistory', ({ messages: chatMessages }) => setMessages(chatMessages || []));
    socket.on('message', ({ message }) => setMessages((prev) => [...prev, message]));

    return () => socket.disconnect();
  }, [chatId]);

  const sendMessage = () => {
    if (!text.trim()) return;
    socketRef.current.emit('sendMessage', { chatId, text });
    setText('');
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item, i) => item._id || i.toString()}
        renderItem={({ item }) => (
          <View style={styles.messageItem}>
            <Text style={{ fontWeight: item.senderId === userId ? 'bold' : 'normal' }}>
              {item.senderRole}: {item.text}
            </Text>
          </View>
        )}
      />
      <View style={styles.inputContainer}>
        <TextInput
          value={text}
          onChangeText={setText}
          style={styles.input}
          placeholder="Type a message..."
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: '#FAFAFA' },
  messageItem: { paddingVertical: 6 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginRight: 8,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
});
