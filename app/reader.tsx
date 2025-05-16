import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { WebView } from "react-native-webview";
import { useLocalSearchParams } from "expo-router";
import * as FileSystem from "expo-file-system";

export default function ReaderScreen() {
  const { file } = useLocalSearchParams<{ file: string }>();
  const [uri, setUri] = useState<string | null>(null);
  const [type, setType] = useState<"epub" | "pdf" | null>(null);

  useEffect(() => {
    if (!file) return;

    const ext = file.split(".").pop()?.toLowerCase();
    if (ext === "epub") setType("epub");
    else if (ext === "pdf") setType("pdf");
    else setType(null);

    if (Platform.OS === "android") {
      FileSystem.getContentUriAsync(file).then((uri) => setUri(uri));
    } else {
      setUri(file);
    }
  }, [file]);

  if (!file || !type) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Файл не найден или тип не поддерживается</Text>
      </View>
    );
  }

  if (Platform.OS === "web") {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Чтение доступно только на мобильном устройстве</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {type === "epub" && (
        <WebView
          originWhitelist={["*"]}
          source={{
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <script src="https://cdn.jsdelivr.net/npm/epubjs/dist/epub.min.js"></script>
                <style>html, body { margin: 0; padding: 0; height: 100%; }</style>
              </head>
              <body>
                <div id="viewer" style="height:100%;"></div>
                <script>
                  const book = ePub("${file}");
                  const rendition = book.renderTo("viewer", { width: "100%", height: "100%" });
                  rendition.display();
                </script>
              </body>
              </html>
            `,
          }}
          style={{ flex: 1 }}
        />
      )}

      {type === "pdf" && uri && (
        <WebView
          originWhitelist={["*"]}
          source={{ uri }}
          style={{ flex: 1 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F2ED" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  error: { fontSize: 16, color: "#8A9A5B", textAlign: "center" },
});
