import { Stack } from "expo-router";
import { QueryProvider } from "../contexts/QueryProvider";
import { ThemeProvider } from "../contexts/ThemeContext";

export default function RootLayout() {
    return (
        <ThemeProvider>
            <QueryProvider>
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen
                        name="(tabs)"
                        options={{ headerShown: false }}
                    />
                </Stack>
            </QueryProvider>
        </ThemeProvider>
    );
}
