import { QueryProvider } from "@/contexts/QueryProvider";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Stack } from "expo-router";

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
