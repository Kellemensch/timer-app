import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type TimerEntry = { date: string; duration: number };

export default function Index() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0); // en ms
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startTimer = () => {
    setRunning(true);
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        setElapsed(Date.now() - startTimeRef.current);
      }
    }, 100);
  };

  const stopTimer = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRunning(false);

    const durationSec = Number(((Date.now() - (startTimeRef.current ?? Date.now())) / 1000).toFixed(1));
    setElapsed(0);

    try {
      const existing = await AsyncStorage.getItem("timers");
      const timers: TimerEntry[] = existing ? JSON.parse(existing) : [];
      timers.push({ date: new Date().toISOString(), duration: durationSec });
      await AsyncStorage.setItem("timers", JSON.stringify(timers));
    } catch (e) {
      console.error("Erreur stockage:", e);
    }
  };

  function formatTime(seconds: number) {
  if (seconds < 60) {
    return `${seconds.toFixed(1)} s`;
  } else {
    const minutes = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(1).padStart(4, "0");
    return `${minutes}:${secs}`;
  }
}


  return (
    <View style={styles.container}>
      <Text style={styles.timerText}>{formatTime(elapsed / 1000)}</Text>

      <Pressable
        onPress={running ? stopTimer : startTimer}
        style={[styles.button, { backgroundColor: running ? "#E53935" : "#4CAF50" }]}
      >
        <Text style={styles.buttonText}>{running ? "Stop" : "Start"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  timerText: { fontSize: 64, fontWeight: "bold", marginBottom: 30 },
  button: {
    paddingVertical: 30,
    paddingHorizontal: 50,
    borderRadius: 20,
    elevation: 2,
  },
  buttonText: { fontSize: 25, color: "white", fontWeight: "bold" },
});
