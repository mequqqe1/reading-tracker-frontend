import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { API } from "@/api/api";
import { useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

const handleLogin = async () => {
  try {
    const res = await API.post("/auth/login", { username, password });
    await AsyncStorage.setItem("token", res.data.access_token);
    router.push("/books");
  } catch (err: any) {
    Alert.alert("Ошибка", err.response?.data?.detail || "Ошибка входа");
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Добро пожаловать 👋</Text>

      <Text style={styles.label}>Имя пользователя</Text>
      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="Введите логин"
        placeholderTextColor="#A0A48C"
        style={styles.input}
      />

      <Text style={styles.label}>Пароль</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Введите пароль"
        placeholderTextColor="#A0A48C"
        secureTextEntry
        style={styles.input}
      />

      <Pressable style={({ pressed }) => [styles.button, pressed && styles.buttonHover]} onPress={handleLogin}>
        <Text style={styles.buttonText}>Войти</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F2ED",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
    color: "#2E2E2E",
    fontWeight: "600",
    fontFamily: "Roboto", // SF Pro заменяется Roboto
    textAlign: "center",
  },
  label: {
    fontSize: 14,
    color: "#2E2E2E",
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#E0DDD6",
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    color: "#2E2E2E",
    fontFamily: "Roboto",
  },
  button: {
    backgroundColor: "#A0A48C",
    padding: 14,
    borderRadius: 10,
    marginTop: 24,
  },
  buttonHover: {
    backgroundColor: "#8A9A5B",
  },
  buttonText: {
    textAlign: "center",
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
