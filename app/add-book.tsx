import React, { useState } from "react";
import {
  View, Text, TextInput, StyleSheet, Pressable, Image, Alert
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function AddBookScreen() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [pages, setPages] = useState("");
  const [coverUri, setCoverUri] = useState<string | null>(null);
  const [fileUri, setFileUri] = useState<string | null>(null);
  const router = useRouter();

  const pickCover = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!result.canceled) {
      setCoverUri(result.assets[0].uri);
    }
  };

  const pickBookFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: ["application/epub+zip", "application/pdf"] });
    if (result.assets && result.assets[0].uri) {
      setFileUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!title || !author || !pages || !fileUri) {
      Alert.alert("Ошибка", "Заполните все поля и выберите файл");
      return;
    }

    const bookDir = `${FileSystem.documentDirectory}books/`;
    const coversDir = `${FileSystem.documentDirectory}covers/`;
    await FileSystem.makeDirectoryAsync(bookDir, { intermediates: true });
    await FileSystem.makeDirectoryAsync(coversDir, { intermediates: true });

    const filename = `${title.replace(/\s+/g, "_")}`;
    const fileExt = fileUri.split(".").pop();
    const savedBookPath = `${bookDir}${filename}.${fileExt}`;
    await FileSystem.copyAsync({ from: fileUri, to: savedBookPath });

    let savedCoverPath = null;
    if (coverUri) {
      const coverExt = coverUri.split(".").pop();
      savedCoverPath = `${coversDir}${filename}.${coverExt}`;
      await FileSystem.copyAsync({ from: coverUri, to: savedCoverPath });
    }

    const newBook = {
      title,
      author,
      totalPages: parseInt(pages),
      cover: savedCoverPath,
      file: savedBookPath,
    };

    try {
      const existing = await AsyncStorage.getItem("books");
      const books = existing ? JSON.parse(existing) : [];
      books.push(newBook);
      await AsyncStorage.setItem("books", JSON.stringify(books));
      Alert.alert("Готово", "Книга добавлена!");
      router.push("/books");
    } catch (err) {
      Alert.alert("Ошибка", "Не удалось сохранить книгу");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Название</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} />

      <Text style={styles.label}>Автор</Text>
      <TextInput style={styles.input} value={author} onChangeText={setAuthor} />

      <Text style={styles.label}>Количество страниц</Text>
      <TextInput style={styles.input} value={pages} onChangeText={setPages} keyboardType="numeric" />

      <Pressable style={styles.button} onPress={pickCover}>
        <Text style={styles.buttonText}>Выбрать обложку</Text>
      </Pressable>
      {coverUri && <Image source={{ uri: coverUri }} style={styles.image} />}

      <Pressable style={styles.button} onPress={pickBookFile}>
        <Text style={styles.buttonText}>Выбрать файл книги</Text>
      </Pressable>
      {fileUri && <Text style={styles.filename}>{fileUri.split("/").pop()}</Text>}

      <Pressable style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.buttonText}>Сохранить</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F2ED", padding: 16 },
  label: { fontSize: 14, color: "#2E2E2E", marginTop: 12 },
  input: {
    backgroundColor: "#E0DDD6",
    padding: 10,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 8,
  },
  button: {
    backgroundColor: "#A0A48C",
    padding: 12,
    borderRadius: 10,
    marginTop: 16,
  },
  saveButton: {
    backgroundColor: "#8A9A5B",
    padding: 14,
    borderRadius: 10,
    marginTop: 24,
  },
  buttonText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "bold",
  },
  image: {
    width: 100,
    height: 140,
    marginTop: 10,
    borderRadius: 10,
  },
  filename: {
    marginTop: 10,
    color: "#5E5E5E",
  },
});
