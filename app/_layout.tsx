import { ApiStatusProvider } from "@/contexts/ApiStatusContext";
import { I18nProvider } from "@/contexts/I18nContext";
import { QueryProvider } from "@/contexts/QueryProvider";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

// Prevent the splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [loaded, error] = useFonts({
        "Geist-Thin": require("../assets/fonts/Geist-Thin.ttf"),
        "Geist-ExtraLight": require("../assets/fonts/Geist-ExtraLight.ttf"),
        "Geist-Light": require("../assets/fonts/Geist-Light.ttf"),
        "Geist-Regular": require("../assets/fonts/Geist-Regular.ttf"),
        "Geist-Medium": require("../assets/fonts/Geist-Medium.ttf"),
        "Geist-SemiBold": require("../assets/fonts/Geist-SemiBold.ttf"),
        "Geist-Bold": require("../assets/fonts/Geist-Bold.ttf"),
        "Geist-ExtraBold": require("../assets/fonts/Geist-ExtraBold.ttf"),
        "Geist-Black": require("../assets/fonts/Geist-Black.ttf"),
    });

    useEffect(() => {
        if (loaded || error) {
            SplashScreen.hideAsync();
        }
    }, [loaded, error]);

    if (!loaded && !error) {
        return null;
    }

    return (
        <I18nProvider>
            <ThemeProvider>
                <ApiStatusProvider>
                    <QueryProvider>
                        <Stack screenOptions={{ headerShown: false }}>
                            <Stack.Screen
                                name="(tabs)"
                                options={{ headerShown: false }}
                            />
                            <Stack.Screen
                                name="book/[id]"
                                options={{
                                    headerShown: false,
                                    presentation: "modal",
                                }}
                            />
                        </Stack>
                    </QueryProvider>
                </ApiStatusProvider>
            </ThemeProvider>
        </I18nProvider>
    );
}
