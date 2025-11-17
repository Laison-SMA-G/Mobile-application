import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  Modal
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import { useUser } from '../context/UserContext';

// ✅ Toast component
const Toast = ({ message, isVisible, onHide }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onHide, 1500);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onHide]);

  if (!isVisible) return null;
  return (
    <Modal transparent animationType="fade" visible={isVisible}>
      <View style={styles.toastOverlay}>
        <View style={styles.toastContainer}>
          <Text style={styles.toastText}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
};

const EditProfile = ({ navigation }) => {
  const { user, loading, updateUserProfile } = useUser();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || null);

  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setProfileImage(user.profileImage || null);
    }
  }, [user]);

  // ✅ Image picker (returns URI)
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setToastMessage('Please grant gallery permission.');
      setShowToast(true);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: false, // we use URI directly
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setProfileImage(uri);
    }
  };

  // ✅ Save profile changes
  const handleSaveChanges = async () => {
    if (!fullName.trim() || !email.trim()) {
      setToastMessage('Full name and email are required.');
      setShowToast(true);
      return;
    }

    const result = await updateUserProfile({
      userId: user._id,
      fullName,
      email,
      phone,
      profileImage, // pass URI for backend
    });

    if (result.success) {
      setToastMessage('Profile updated successfully!');
      setShowToast(true);
      setTimeout(() => navigation.goBack(), 1500);
    } else {
      setToastMessage(result.message || 'Failed to update profile.');
      setShowToast(true);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#074ec2" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#074ec2" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileImageContainer}>
          <TouchableOpacity onPress={pickImage}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Icon name="account-circle-outline" size={100} color="#B0B0B0" />
              </View>
            )}
            <View style={styles.cameraIconContainer}>
              <Icon name="camera-plus-outline" size={22} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your full name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholder="Enter your email"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="Enter your phone number"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>

      <Toast
        message={toastMessage}
        isVisible={showToast}
        onHide={() => setShowToast(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { flexGrow: 1, paddingBottom: 30 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#074ec2'
  },
  headerTitle: { color: '#fff', fontSize: 20, fontFamily: 'Rubik-SemiBold' },
  profileImageContainer: { alignItems: 'center', marginVertical: 30 },
  profileImage: { width: 140, height: 140, borderRadius: 70 },
  avatarPlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#074ec2',
    borderRadius: 25,
    padding: 8
  },
  formSection: { paddingHorizontal: 25 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 15, fontFamily: 'Rubik-Medium', color: '#555', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16
  },
  saveButton: {
    backgroundColor: '#074ec2',
    marginHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center'
  },
  saveButtonText: { color: '#fff', fontSize: 17, fontFamily: 'Rubik-SemiBold' },
  toastOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)'
  },
  toastContainer: { backgroundColor: '#4BB543', padding: 15, borderRadius: 10 },
  toastText: { color: '#fff', fontSize: 14 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 10, color: '#555' },
});

export default EditProfile;
