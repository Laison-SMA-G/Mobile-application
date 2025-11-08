// screens/MessagesScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function MessagesScreen() {
  const [chats, setChats] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchChats = async () => {
  try {
    const res = await fetch(`http://192.168.100.45:5000/api/users/chats/${userId}`);
    
    if (!res.ok) {
      console.error("Server returned", res.status, await res.text());
      return;
    }

    const data = await res.json();
    setChats(data);
  } catch (err) {
    console.error("Failed to fetch chats:", err);
  }
};

    fetchChats();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() =>
        navigation.navigate('Chat', {
          chatId: item._id,
          userId: 'yourUserIdHere', // replace with logged-in userId
        })
      }
    >
      <Text style={styles.chatTitle}>
        Chat with {item.participants.find((p) => p !== 'yourUserIdHere')}
      </Text>
      <Text style={styles.lastMessage}>
        {item.messages?.length ? item.messages[item.messages.length - 1].text : 'No messages yet'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#FAFAFA' },
  chatItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
  },
  chatTitle: { fontSize: 16, fontWeight: 'bold' },
  lastMessage: { fontSize: 14, color: '#666', marginTop: 4 },
});
