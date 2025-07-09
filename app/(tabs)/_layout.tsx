import { Ionicons } from "@expo/vector-icons";
import { Tabs, usePathname, useRouter } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { useI18n } from "../../contexts/I18nContext";
import { useAppTheme } from "../../contexts/ThemeContext";
import { useCart } from "../../hooks/useApi";

interface AnimatedTabButtonProps {
    name: string;
    icon: React.ComponentProps<typeof Ionicons>["name"];
    activeIcon: React.ComponentProps<typeof Ionicons>["name"];
    isActive: boolean;
    onPress: () => void;
    badge?: number;
}

function AnimatedTabButton(props: AnimatedTabButtonProps) {
    const { name, icon, activeIcon, isActive, onPress, badge } = props;

    const safeName = typeof name === "string" ? name : "";
    const safeBadge = typeof badge === "number" ? badge : undefined;

    return (
        <Pressable
            onPress={onPress}
            style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 8,
            }}
        >
            <Ionicons
                name={isActive ? activeIcon : icon}
                size={24}
                color={isActive ? "#007AFF" : "#666"}
            />
            <Text
                style={{
                    fontSize: 12,
                    color: isActive ? "#007AFF" : "#666",
                    marginTop: 4,
                }}
            >
                {safeName}
            </Text>
        </Pressable>
    );
}

function CustomTabBar() {
    const theme = useAppTheme();
    const { t } = useI18n();
    const router = useRouter();
    const pathname = usePathname();
    const { data: cart } = useCart();

    const cartItemCount =
        cart?.items?.reduce(
            (sum: number, item: any) => sum + item.quantity,
            0
        ) || 0;

    const tabs = [
        {
            name: String(t("tabs.home") || "Home"),
            route: "/" as const,
            icon: "home-outline" as const,
            activeIcon: "home" as const,
        },
        {
            name: String(t("tabs.favorites") || "Favorites"),
            route: "/favorites" as const,
            icon: "heart-outline" as const,
            activeIcon: "heart" as const,
        },
        {
            name: String(t("tabs.cart") || "Cart"),
            route: "/cart" as const,
            icon: "cart-outline" as const,
            activeIcon: "cart" as const,
            badge: cartItemCount,
        },
        {
            name: String(t("tabs.orders") || "Orders"),
            route: "/orders" as const,
            icon: "receipt-outline" as const,
            activeIcon: "receipt" as const,
        },
        {
            name: String(t("tabs.account") || "Account"),
            route: "/account" as const,
            icon: "person-outline" as const,
            activeIcon: "person" as const,
        },
    ];

    return (
        <View
            style={{
                position: "absolute",
                bottom: 20,
                left: "50%",
                marginLeft: "-45%",
                width: "90%",
                height: 78,
                backgroundColor: theme.colors.surface,
                borderRadius: 96,
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 8,
                shadowColor: theme.colors.black,
                shadowOffset: { width: 0, height: 16 },
                shadowOpacity: 0.2,
                shadowRadius: 24,
                elevation: 8,
            }}
        >
            {tabs.map((tab) => (
                <AnimatedTabButton
                    key={tab.route}
                    name={tab.name}
                    icon={tab.icon}
                    activeIcon={tab.activeIcon}
                    isActive={pathname === tab.route}
                    onPress={() => router.push(tab.route)}
                    badge={tab.badge}
                />
            ))}
        </View>
    );
}

export default function TabLayout() {
    return (
        <>
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: { display: "none" }, // Hide the default tab bar
                    animation: "fade",
                }}
            >
                <Tabs.Screen name="index" />
                <Tabs.Screen name="favorites" />
                <Tabs.Screen name="cart" />
                <Tabs.Screen name="orders" />
                <Tabs.Screen name="account" />
            </Tabs>
            <CustomTabBar />
        </>
    );
}
