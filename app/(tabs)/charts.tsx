import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";

type Timer = { date: string; duration: number; routeType: "Forest" | "Road" };

export default function Charts() {
    const [timers, setTimers] = useState<Timer[]>([]);
    
    // Charger timers
    const loadTimers = async () => {
        try {
            const saved = await AsyncStorage.getItem("timers");
            const parsed: Timer[] = saved ? JSON.parse(saved) : [];

            setTimers(parsed.reverse());
            } catch (error) {
            console.error(error);
        }
    };

    useFocusEffect(useCallback(() => { loadTimers(); }, []));

    function getAverage(times: number[]) {
        if (times.length === 0) return 0;
        return times.reduce((a, b) => a + b, 0) / times.length;
    }

    const routeForest = timers.filter(r => r.routeType === "Forest").map(r => r.duration);
    const routeRoad = timers.filter(r => r.routeType === "Road").map(r => r.duration);

    const avgForest = getAverage(routeForest);
    const avgRoad = getAverage(routeRoad);
    const avgGlobal = getAverage([...routeForest, ...routeRoad]);

    const avgLine = (value: number) => [
        { index: 0, duration: value },
        { index: timers.length, duration: value },
    ];

    const data = timers.map((t, i) => ({ ...t, index: i + 1 }));

    const screenWidth = Dimensions.get("window").width;

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Charts of travels</Text>
            <LineChart width={screenWidth - 30} height={300} data={data} style={styles.chart}>
                <CartesianGrid strokeDasharray="3 3"/>
                <Line type="monotone" dataKey="duration" data={data.filter(d => d.routeType === "Forest")} stroke="#8884d8" name="Forest route"/>
                <Line type="monotone" dataKey="duration" data={data.filter(d => d.routeType === "Road")} stroke="#82ca9d" name="Road route"/>
                <XAxis dataKey="index" />
                <YAxis/>
                <Tooltip/>
                <Legend/>
                <Line type="monotone" dataKey="duration" dot={false} data={avgLine(avgForest)} stroke="blue" strokeDasharray="5 5" name="Average Forest"/>
                <Line type="monotone" dataKey="duration" dot={false} data={avgLine(avgRoad)} stroke="green" strokeDasharray="5 5" name="Average Road"/>
                <Line type="monotone" dataKey="duration" dot={false} data={avgLine(avgGlobal)} stroke="red" strokeDasharray="5 5" name="Global average" />
            </LineChart>
            <View style={styles.averages}>
                <Text style={[styles.avgText, { color: "blue" }]}>
                    Forest : {avgForest.toFixed(1)}
                </Text>
                <Text style={[styles.avgText, { color: "green" }]}>
                    Road : {avgRoad.toFixed(1)}
                </Text>
                <Text style={[styles.avgText, { color: "red" }]}>
                    Global : {avgGlobal.toFixed(1)}
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: "center",
    backgroundColor: "#fff",
    flexGrow: 1,
    marginTop: 40,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 15,
  },
  chart: {
    marginVertical: 10,
    marginHorizontal: 5
  },
  averages: {
    marginTop: 16,
    width: "100%",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 12,
    elevation: 2,
  },
  avgText: {
    fontSize: 18,
    fontWeight: "500",
    marginVertical: 4,
    textAlign: "center",
  },
});