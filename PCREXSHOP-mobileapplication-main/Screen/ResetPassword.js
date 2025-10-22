import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from "react-native";
import axios from "axios";

// Replace with your local IP or production API
const API_URL = "http://192.168.100.45:5000/api/users";

const ResetPassword = ({ navigation, route }) => {
  const token = route?.params?.token; // token passed from email link if any

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Request password reset (email)
  const requestPasswordReset = async () => {
    if (!email) {
      setMessage("Please enter your email.");
      return;
    }

    try {
      setLoading(true);
      const resp = await axios.post(`${API_URL}/forgot-password`, { email });
      const resetLink = resp.data.resetLink;
      setMessage(
        resetLink
          ? `Dev link: ${resetLink}`
          : "Check your email for the reset link."
      );
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to request reset.");
    } finally {
      setLoading(false);
    }
  };

  // Perform password reset (using token)
  const performPasswordReset = async () => {
    if (!newPassword || !confirmPassword) {
      setMessage("Please fill in all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${API_URL}/reset-password/${token}`, {
        password: newPassword,
      });
      setMessage("Password has been reset successfully!");
      // Navigate to login screen after reset
      navigation.navigate("SignIn_SignUp");
    } catch (err) {
      setMessage(err.response?.data?.message || "Password reset failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden />
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Text style={styles.title}>Reset Password</Text>

        {!token ? (
          <>
            <Text style={styles.label}>Enter your email:</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.button}
              onPress={requestPasswordReset}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Sending..." : "Send Reset Link"}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.label}>Enter new password:</Text>
            <TextInput
              style={styles.input}
              placeholder="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
            <Text style={styles.label}>Confirm new password:</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
            <TouchableOpacity
              style={styles.button}
              onPress={performPasswordReset}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Resetting..." : "Reset Password"}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {message ? <Text style={styles.message}>{message}</Text> : null}

        {!token && (
          <TouchableOpacity
            onPress={() => navigation.navigate("SignIn_SignUp")}
            style={{ marginTop: 20 }}
          >
            <Text style={styles.linkText}>Back to Sign In</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ResetPassword;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollView: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#074ec2",
    marginBottom: 30,
    textAlign: "center",
  },
  label: { fontSize: 16, marginBottom: 8, color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#074ec2",
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  message: {
    marginTop: 15,
    textAlign: "center",
    color: "#074ec2",
    fontSize: 14,
  },
  linkText: {
    color: "#074ec2",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
  },
});
