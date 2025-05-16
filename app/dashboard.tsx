import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { VictoryBar, VictoryChart, VictoryPie } from "victory-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Book {
  title: string;
  author: string;
  totalPages: number;
  file: string;
  cover: string | null;
}

interface Progress {
  pagesRead: number;
  totalPages: number;
  progress: number;
  updatedAt: string;
}

export default function DashboardScreen() {
  const [books, setBooks] = useState<Book[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, Progress>>({});
  const [weeklyStats, setWeeklyStats] = useState<Record<string, number>>({});

  useEffect(() => {
    const load = async () => {
      const raw = await AsyncStorage.getItem("books");
      const parsed: Book[] = raw ? JSON.parse(raw) : [];
      setBooks(parsed);

      const map: Record<string, Progress> = {};
      const week: Record<string, number> = {
        Пн: 0,
        Вт: 0,
        Ср: 0,
        Чт: 0,
        Пт: 0,
        Сб: 0,
        Вс: 0,
      };

      for (const book of parsed) {
        const progRaw = await AsyncStorage.getItem(`progress:${book.title}`);
        if (progRaw) {
          const prog = JSON.parse(progRaw);
          map[book.title] = prog;

          const day = new Date(prog.updatedAt).getDay(); // 0 (Sun) – 6
          const days = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
          const label = days[day];
          week[label] += prog.pagesRead;
        }
      }

      setProgressMap(map);
      setWeeklyStats(week);
    };

    load();
  }, []);

  const pieData = Object.entries(progressMap)
    .sort((a, b) => b[1].totalPages - a[1].totalPages)
    .slice(0, 3)
    .map(([title, val]) => ({
      x: title,
      y: val.totalPages,
    }));

  const barData = Object.entries(weeklyStats).map(([day, value]) => ({
    x: day,
    y: value,
  }));

  const totalPages = Object.values(progressMap).reduce((acc, p) => acc + p.pagesRead, 0);
  const totalBooks = books.length;
  const avgPagesPerDay = Math.round(totalPages / 7 || 0);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📊 Моя статистика</Text>

      <Text style={styles.sub}>Прочитано за неделю</Text>
      {Platform.OS !== "web" ? (
        <VictoryChart domainPadding={20}>
          <VictoryBar data={barData} style={{ data: { fill: "#8A9A5B" } }} />
        </VictoryChart>
      ) : (
        <Text style={styles.disabled}>Графики доступны только на телефоне</Text>
      )}

      <Text style={styles.sub}>Топ-3 книг по длине</Text>
      {Platform.OS !== "web" ? (
        <VictoryPie data={pieData} colorScale={["#A0A48C", "#8A9A5B", "#5E5E5E"]} />
      ) : null}

      <Text style={styles.stat}>Всего книг: {totalBooks}</Text>
      <Text style={styles.stat}>Среднее чтение: {avgPagesPerDay} стр/день</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#F5F2ED" },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E2E2E",
    marginBottom: 16,
  },
  sub: {
    fontSize: 14,
    fontWeight: "600",
    color: "#5E5E5E",
    marginBottom: 8,
    marginTop: 20,
  },
  stat: {
    fontSize: 14,
    color: "#2E2E2E",
    marginTop: 8,
  },
  disabled: {
    color: "#A0A48C",
    fontSize: 12,
    marginBottom: 12,
  },
});
