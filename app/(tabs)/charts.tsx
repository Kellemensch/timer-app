import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { LineChart } from "react-native-chart-kit";

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

    useEffect(() => {
        loadTimers();
    }, []);

    useFocusEffect(
        useCallback(() => {
        loadTimers();
    }, [])
    );

    function getAverage(times: number[]) {
        if (times.length === 0) return 0;
        return times.reduce((a, b) => a + b, 0) / times.length;
    }

    const routeForest = timers.filter(r => r.routeType === "Forest").map(r => r.duration);
    const routeRoad = timers.filter(r => r.routeType === "Road").map(r => r.duration);

    const avgForest = getAverage(routeForest);
    const avgRoad = getAverage(routeRoad);
    const avgGlobal = getAverage([...routeForest, ...routeRoad]);

    const screenWidth = Dimensions.get("window").width;

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Charts of travels</Text>
            <LineChart
                data={{
                labels: timers.map((_, i) => (i + 1).toString()),
                datasets: [
                {
                data: routeForest.length ? routeForest : [0],
                color: () => "rgba(136, 132, 216, 1)",
                strokeWidth: 2,
                },
                {
                data: routeRoad.length ? routeRoad : [0],
                color: () => "rgba(130, 202, 157, 1)",
                strokeWidth: 2,
                },
                {
                data: Array(timers.length).fill(avgForest),
                color: () => "blue",
                strokeWidth: 1,
                },
                {
                data: Array(timers.length).fill(avgRoad),
                color: () => "green",
                strokeWidth: 1,
                },
                {
                data: Array(timers.length).fill(avgGlobal),
                color: () => "red",
                strokeWidth: 1,
                },
                ],
                legend: ["Forest route", "Road route", "Avg Forest", "Avg Road", "Avg Global"],
                }}
                width={screenWidth - 30}
                height={300}
                chartConfig={{
                backgroundColor: "#fff",
                backgroundGradientFrom: "#f9f9f9",
                backgroundGradientTo: "#f9f9f9",
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: { borderRadius: 16 },
                propsForDots: {
                r: "3",
                strokeWidth: "1",
                stroke: "#fff",
                },
                }}
                bezier
                style={styles.chart}
            />

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
        borderRadius: 12,
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
