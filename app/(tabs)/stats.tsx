import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from "react-native";

type Timer = { date: string; duration: number; routeType: string };

export default function Stats() {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Mode sélection
  const [selectMode, setSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  // Charger timers
  const loadTimers = async () => {
    try {
      const saved = await AsyncStorage.getItem("timers");
      const parsed: Timer[] = saved ? JSON.parse(saved) : [];

    //   const normalized = parsed.map((t) => {
    //     if (t.duration > 1000) {
    //       return { ...t, duration: Number((t.duration / 1000).toFixed(1)) };
    //     }
    //     return t;
    //   });

      setTimers(parsed.reverse());
    } catch (error) {
      console.error(error);
    }
  };

  useFocusEffect(useCallback(() => { loadTimers(); }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTimers();
    setRefreshing(false);
  };

  // formatage mm:ss
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds.toFixed(1)} s`;
    const minutes = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(1).padStart(4, "0");
    return `${minutes}:${secs}`;
  };

  // toggle sélection
  const toggleSelect = (index: number) => {
    if (selectedItems.includes(index)) {
      setSelectedItems(selectedItems.filter((i) => i !== index));
    } else {
      setSelectedItems([...selectedItems, index]);
    }
  };

  // supprimer sélection
  const deleteSelected = async () => {
    const remaining = timers.filter((_, index) => !selectedItems.includes(index));
    setTimers(remaining);
    setSelectedItems([]);
    setSelectMode(false);
    await AsyncStorage.setItem("timers", JSON.stringify(remaining.reverse()));
  };

  const count = timers.length;
  const average =
    count > 0 ? Number((timers.reduce((sum, t) => sum + t.duration, 0) / count).toFixed(1)) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Statistics</Text>
        <Pressable
          onPress={() => {
            setSelectMode(!selectMode);
            setSelectedItems([]);
          }}
          style={selectMode ? styles.cancelButton : styles.selectButton}
        >
          <Text style={styles.selectButtonText}>{selectMode ? "Cancel" : "Select"}</Text>
        </Pressable>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoText}>
          Travels: <Text style={styles.infoStrong}>{count}</Text>
        </Text>
        <Text style={styles.infoText}>
          Average: <Text style={styles.infoStrong}>{formatTime(average)}</Text>
        </Text>
      </View>

      <FlatList
        data={timers}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => {
          const isSelected = selectedItems.includes(index);
          return (
            <Pressable
              onPress={() => selectMode && toggleSelect(index)}
              style={[
                styles.card,
                selectMode && isSelected ? styles.cardSelected : {},
              ]}
            >
              <Text style={styles.duration}>{formatTime(item.duration)}</Text>
              <Text style={styles.date}>{new Date(item.date).toLocaleString()} / {item.routeType}</Text>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No timer saved.</Text>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      {selectMode && selectedItems.length > 0 && (
        <Pressable style={styles.deleteButton} onPress={deleteSelected}>
          <Text style={styles.deleteButtonText}>Delete {selectedItems.length}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff", marginTop: 40 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 40, fontWeight: "bold", marginBottom: 10 },
  selectButton: { padding: 10, backgroundColor: "#4CAF50", borderRadius: 10 },
  cancelButton: { padding: 10, backgroundColor: "#cc2626ff", borderRadius: 10 },
  selectButtonText: { color: "#fff", fontWeight: "bold" },
  infoRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  infoText: { fontSize: 20, color: "#555" },
  infoStrong: { fontWeight: "700", color: "#333" },
  card: {
    padding: 15,
    marginBottom: 12,
    backgroundColor: "#f5f2f2ff",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardSelected: { backgroundColor: "#cce5ff", borderWidth: 2, borderColor: "#3399ff" },
  duration: { fontSize: 18, fontWeight: "600", marginBottom: 4 },
  date: { fontSize: 14, color: "#666" },
  emptyText: { fontSize: 16, color: "#aaa", textAlign: "center", marginTop: 50 },
  deleteButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#E53935",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  deleteButtonText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
});
