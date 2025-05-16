import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useFocusEffect } from "expo-router";

interface Book {
  title: string;
  author: string;
  totalPages: number;
  cover: string | null;
  file: string;
}

export default function BooksScreen() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadBooks = async () => {
    try {
      setLoading(true);
      const data = await AsyncStorage.getItem("books");
      if (data) {
        setBooks(JSON.parse(data));
      } else {
        setBooks([]);
      }
    } catch (err) {
      console.error("Ошибка при загрузке книг:", err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadBooks();
    }, [])
  );

  const renderItem = ({ item }: { item: Book }) => (
    <Pressable
      style={styles.card}
      onPress={() =>
        router.push({ pathname: "/reader", params: { file: item.file } })
      }
    >
      {item.cover && (
        <Image source={{ uri: item.cover }} style={styles.cover} />
      )}
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.author}>{item.author}</Text>
        <Text style={styles.pages}>📖 {item.totalPages} стр.</Text>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>📚 Мои книги</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#8A9A5B" />
      ) : (
        <FlatList
          data={books}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${item.title}_${index}`}
        />
      )}

      <Pressable
        style={styles.addButton}
        onPress={() => router.push("/add-book")}
      >
        <Text style={styles.addButtonText}>➕ Добавить книгу</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F2ED", padding: 16 },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#2E2E2E",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#E0DDD6",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  cover: {
    width: 50,
    height: 70,
    marginRight: 12,
    borderRadius: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2E2E2E",
  },
  author: {
    fontSize: 14,
    color: "#5E5E5E",
  },
  pages: {
    fontSize: 12,
    color: "#8A9A5B",
    marginTop: 4,
  },
  addButton: {
    backgroundColor: "#A0A48C",
    padding: 14,
    borderRadius: 10,
    marginTop: 16,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
