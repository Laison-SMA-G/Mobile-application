import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  SafeAreaView,
  Modal,
  Pressable // Import Pressable for modal overlay
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useUser, BASE_URL } from "../context/UserContext"; // Import BASE_URL from context for consistency
import axios from 'axios';

SplashScreen.preventAutoHideAsync();

const SignIn_SignUp = ({ navigation }) => {
  const [fontsLoaded] = useFonts({
    'Rubik-Regular': require('../assets/fonts/Rubik/static/Rubik-Regular.ttf'),
    'Rubik-Bold': require('../assets/fonts/Rubik/static/Rubik-Bold.ttf'),
    'Rubik-Medium': require('../assets/fonts/Rubik/static/Rubik-Medium.ttf'),
    'Rubik-SemiBold': require('../assets/fonts/Rubik/static/Rubik-SemiBold.ttf'),
  });

  // Use signIn, signUp, and updateUserProfile directly from the context
  const { signIn, signUp } = useUser(); // No need for updateUserProfile in SignIn_SignUp directly

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState(""); // This is for signup
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isAlertModalVisible, setAlertModalVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: "", message: "", isSuccess: false }); // Added isSuccess

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  const showAlert = (title, message, isSuccess = false) => { // Added isSuccess parameter
    setAlertConfig({ title, message, isSuccess });
    setAlertModalVisible(true);
    // You might want to clear the alert message after it disappears, or when the user closes it.
    // For automatic closing, you can use:
    setTimeout(() => setAlertModalVisible(false), 2000);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFullName("");
    setAlertModalVisible(false); // Clear any existing alerts
  };

  const handleSignUp = async () => {
    if (!email || !password || !fullName) {
      showAlert("Sign Up Error", "Please fill in all required fields.");
      return;
    }
    if (password !== confirmPassword) {
      showAlert("Sign Up Error", "Passwords do not match.");
      return;
    }
    if (password.length < 6) { // Basic password strength check
        showAlert("Sign Up Error", "Password must be at least 6 characters long.");
        return;
    }

    try {
      const result = await signUp(fullName, email, password);
      if (result.success) {
        showAlert("Sign Up Successful", `Welcome, ${result.user.fullName}!`, true); // Pass true for success
        setTimeout(() => navigation.replace("HomeScreen"), 800);
      } else {
        showAlert("Sign Up Error", result.message);
      }
    } catch (error) {
      console.log(error);
      showAlert("Sign Up Error", "An unexpected error occurred during sign up.");
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert("Login Error", "Please enter both email and password.");
      return;
    }

    try {
      const result = await signIn(email, password);
      if (result.success) {
        showAlert("Login Successful", `Welcome back, ${result.user.fullName}!`, true); // Pass true for success
        setTimeout(() => navigation.replace("HomeScreen"), 800);
      } else {
        showAlert("Login Error", result.message);
      }
    } catch (error) {
      console.log("Login Error (unexpected):", error);
      showAlert("Login Error", "An unexpected error occurred during login.");
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      showAlert("Missing Email", "Please enter your email first to reset your password.");
      return;
    }

    try {
      // Use the global BASE_URL directly since it's imported
      await axios.post(`${BASE_URL}/users/forgot-password`, { email });
      showAlert("Reset Email Sent", "Check your email for the password reset link.", true); // Success
    } catch (err) {
      console.error("Forgot password error:", err.response?.data || err);
      showAlert("Error", err.response?.data?.message || "Failed to request password reset. Please try again.");
    }
  };

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent} keyboardShouldPersistTaps="handled">
        <View style={styles.innerContainer}>
          <Image source={require('../assets/PCREXBIGLOGOMOBILE.png')} style={styles.brandImage} resizeMode="contain" />
          <Text style={styles.welcomeText}>{isLogin ? "Welcome Back!" : "Create an Account"}</Text>

          <View style={styles.formWrapper}>
            {!isLogin && (
              <View style={styles.inputGroup}>
                <Icon name="account-outline" size={20} color="#888" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                  placeholderTextColor="#888"
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Icon name="email-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#888"
              />
            </View>

            <View style={styles.inputGroup}>
              <Icon name="lock-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor="#888"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.passwordToggle}>
                <Icon name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={22} color="#888" />
              </TouchableOpacity>
            </View>

            {!isLogin && (
              <View style={styles.inputGroup}>
                <Icon name="lock-outline" size={20} color="#888" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  placeholderTextColor="#888"
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.passwordToggle}>
                  <Icon name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'} size={22} color="#888" />
                </TouchableOpacity>
              </View>
            )}

            {isLogin && (
              <TouchableOpacity style={styles.forgotPasswordContainer} onPress={handleForgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.button}
              onPress={isLogin ? handleLogin : handleSignUp}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>{isLogin ? 'Sign In' : 'Sign Up'}</Text>
            </TouchableOpacity>

            <View style={styles.togglerContainer}>
              <Text style={styles.togglerText}>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
              </Text>
              <TouchableOpacity onPress={toggleMode}>
                <Text style={styles.togglerLink}>{isLogin ? 'Sign Up' : 'Sign In'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Alert Modal */}
      <Modal animationType="fade" transparent visible={isAlertModalVisible} onRequestClose={() => setAlertModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setAlertModalVisible(false)}>
          <Pressable style={[styles.alertModalContainer, { backgroundColor: alertConfig.isSuccess ? '#4BB543' : '#E31C25' }]}>
            <Icon
              name={alertConfig.isSuccess ? 'check-circle-outline' : 'alert-circle-outline'}
              size={30}
              color="#FFF"
              style={{ marginBottom: 10 }}
            />
            <Text style={styles.alertModalTitle}>{alertConfig.title}</Text>
            <Text style={styles.alertModalMessage}>{alertConfig.message}</Text>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

// === Styles ===
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  scrollViewContent: { flexGrow: 1, justifyContent: 'center', paddingVertical: 20 },
  innerContainer: { alignItems: 'center', paddingHorizontal: 25 },
  brandImage: { width: '55%', height: 90, marginBottom: 20 },
  welcomeText: { fontSize: 24, fontFamily: 'Rubik-SemiBold', color: '#1C1C1C', marginBottom: 30 },
  formWrapper: { width: '100%', alignItems: 'center', maxWidth: 400 }, // Added maxWidth for larger screens
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 15,
    marginBottom: 15,
    paddingHorizontal: 12,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 12, fontSize: 15, fontFamily: 'Rubik-Regular', color: '#333' },
  passwordToggle: { padding: 5 }, // Added padding to make it easier to tap
  forgotPasswordContainer: { width: '100%', alignItems: 'flex-end', marginBottom: 15 },
  forgotPasswordText: { color: '#074ec2', fontSize: 14, fontFamily: 'Rubik-Medium' },
  button: {
    backgroundColor: '#074ec2',
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    width: '100%',
    marginTop: 5,
    shadowColor: "#000", // Add shadow for better appearance
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  buttonText: { fontSize: 16, fontFamily: 'Rubik-Bold', color: '#FFF' },
  togglerContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 30 },
  togglerText: { fontSize: 14, fontFamily: 'Rubik-Regular', color: '#555' },
  togglerLink: { fontSize: 14, fontFamily: 'Rubik-Bold', color: '#074ec2', marginLeft: 5 },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Darker overlay
  },
  alertModalContainer: {
    width: '85%',
    borderRadius: 15, // More rounded corners
    paddingVertical: 25,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  alertModalTitle: { fontSize: 18, fontFamily: 'Rubik-Bold', color: '#FFF', marginBottom: 5, textAlign: 'center' },
  alertModalMessage: { fontSize: 15, fontFamily: 'Rubik-Regular', color: '#FAFAFA', textAlign: 'center', lineHeight: 22 },
});

export default SignIn_SignUp;