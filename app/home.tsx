import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

interface Book {
  title: string;
  author: string;
  totalPages: number;
  cover: string | null;
  file: string;
}

interface Progress {
  pagesRead: number;
  totalPages: number;
  progress: number;
  updatedAt: string;
}

export default function HomeScreen() {
  const [books, setBooks] = useState<Book[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, Progress>>({});
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const raw = await AsyncStorage.getItem("books");
      const parsed = raw ? JSON.parse(raw) : [];
      setBooks(parsed);

      const map: Record<string, Progress> = {};
      for (const book of parsed) {
        const prog = await AsyncStorage.getItem(`progress:${book.title}`);
        if (prog) map[book.title] = JSON.parse(prog);
      }
      setProgressMap(map);
    };
    load();
  }, []);

  const updateProgress = (book: Book) => {
    Alert.prompt(
      "Прогресс чтения",
      `Сколько страниц ты прочитал?`,
      async (value) => {
        const pagesRead = parseInt(value || "0");
        const progress = Math.min((pagesRead / book.totalPages) * 100, 100);

        const record = {
          pagesRead,
          totalPages: book.totalPages,
          progress,
          updatedAt: new Date().toISOString(),
        };

        await AsyncStorage.setItem(`progress:${book.title}`, JSON.stringify(record));
        setProgressMap({ ...progressMap, [book.title]: record });
        Alert.alert("✅ Прогресс обновлён");
      },
      "plain-text",
      progressMap[book.title]?.pagesRead?.toString() || ""
    );
  };

  const renderItem = ({ item }: { item: Book }) => {
    const progress = progressMap[item.title]?.pagesRead || 0;

    return (
      <View style={styles.bookCard}>
        {item.cover && <Image source={{ uri: item.cover }} style={styles.cover} />}
        <View style={{ flex: 1 }}>
          <Text style={styles.bookTitle}>{item.title}</Text>
          <Text style={styles.author}>{item.author}</Text>
          <Text style={styles.progressText}>
            {progress} / {item.totalPages} стр.
          </Text>
          <Pressable style={styles.progressBtn} onPress={() => updateProgress(item)}>
            <Text style={styles.progressBtnText}>Добавить прогресс</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Привет, Алексей</Text>
      <Text style={styles.subheader}>Сейчас читаешь</Text>

      <FlatList
        data={books.slice(0, 2)} // только 2 верхние книги
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.title}_${index}`}
      />

      <Text style={styles.subheader}>Читаешь по плану</Text>
      <FlatList
        data={books.slice(2)} // остальные
        renderItem={renderItem}
        keyExtractor={(item) => item.title + "_plan"}
      />

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
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2E2E2E",
    marginBottom: 12,
  },
  subheader: {
    fontSize: 16,
    fontWeight: "600",
    color: "#5E5E5E",
    marginTop: 20,
    marginBottom: 8,
  },
  bookCard: {
    flexDirection: "row",
    backgroundColor: "#E0DDD6",
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    alignItems: "center",
  },
  cover: {
    width: 60,
    height: 90,
    marginRight: 12,
    borderRadius: 6,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2E2E2E",
  },
  author: {
    fontSize: 14,
    color: "#5E5E5E",
  },
  progressText: {
    fontSize: 13,
    color: "#8A9A5B",
    marginVertical: 4,
  },
  progressBtn: {
    backgroundColor: "#A0A48C",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignSelf: "flex-start",
  },
  progressBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },
  addButton: {
    marginTop: 16,
    backgroundColor: "#A0A48C",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
