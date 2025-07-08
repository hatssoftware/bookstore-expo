import { Ionicons } from "@expo/vector-icons";
import { Tabs, usePathname, useRouter } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import { useI18n } from "../../contexts/I18nContext";
import { useAppTheme } from "../../contexts/ThemeContext";
import { useCart } from "../../hooks/useApi";

function AnimatedTabButton({
    name,
    icon,
    activeIcon,
    isActive,
    onPress,
    badge,
}: {
    name: string;
    icon: React.ComponentProps<typeof Ionicons>["name"];
    activeIcon: React.ComponentProps<typeof Ionicons>["name"];
    isActive: boolean;
    onPress: () => void;
    badge?: number;
}) {
    const theme = useAppTheme();
    const scale = useSharedValue(1);
    const opacity = useSharedValue(isActive ? 1 : 0.6);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
            opacity: opacity.value,
        };
    });

    const badgeScale = useSharedValue(badge && badge > 0 ? 1 : 0);
    const badgeAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: badgeScale.value }],
        };
    });

    React.useEffect(() => {
        if (isActive) {
            scale.value = withSpring(1.2, {
                damping: 12,
                stiffness: 150,
            });
            opacity.value = withTiming(1, { duration: 200 });
        } else {
            scale.value = withSpring(1, {
                damping: 15,
                stiffness: 200,
            });
            opacity.value = withTiming(0.6, { duration: 200 });
        }
    }, [isActive]);

    React.useEffect(() => {
        if (badge && badge > 0) {
            badgeScale.value = withSpring(1, {
                damping: 15,
                stiffness: 200,
            });
        } else {
            badgeScale.value = withSpring(0, {
                damping: 15,
                stiffness: 200,
            });
        }
    }, [badge]);

    const handlePressIn = () => {
        scale.value = withSpring(0.9, {
            damping: 20,
            stiffness: 300,
        });
    };

    const handlePressOut = () => {
        if (isActive) {
            scale.value = withSpring(1.2, {
                damping: 12,
                stiffness: 150,
            });
        } else {
            scale.value = withSpring(1, {
                damping: 15,
                stiffness: 200,
            });
        }
    };

    return (
        <Pressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 8,
            }}
        >
            <View style={{ position: "relative" }}>
                <Animated.View
                    style={[
                        {
                            alignItems: "center",
                            justifyContent: "center",
                            width: 40,
                            height: 40,
                        },
                        animatedStyle,
                    ]}
                >
                    <Ionicons
                        name={isActive ? activeIcon : icon}
                        size={24}
                        color={
                            isActive
                                ? theme.colors.accent
                                : theme.colors.textLight
                        }
                    />
                </Animated.View>

                {badge && badge > 0 && (
                    <Animated.View
                        style={[
                            {
                                position: "absolute",
                                right: -8,
                                top: -4,
                                backgroundColor: theme.colors.accent,
                                borderRadius: 12,
                                minWidth: 22,
                                height: 22,
                                justifyContent: "center",
                                alignItems: "center",
                                paddingHorizontal: 6,
                                borderWidth: 2,
                                borderColor: theme.colors.surface,
                            },
                            badgeAnimatedStyle,
                        ]}
                    >
                        <Text
                            style={{
                                color: theme.colors.white,
                                fontSize: 10,
                                fontFamily: theme.typography.fontFamily.bold,
                                textAlign: "center",
                            }}
                        >
                            {badge > 99 ? "99+" : badge.toString()}
                        </Text>
                    </Animated.View>
                )}
            </View>

            <Text
                style={{
                    fontSize: 12,
                    fontFamily: theme.typography.fontFamily.medium,
                    marginTop: 4,
                    textAlign: "center",
                    color: isActive
                        ? theme.colors.accent
                        : theme.colors.textLight,
                }}
            >
                {name}
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
            name: t("tabs.home"),
            route: "/" as const,
            icon: "home-outline" as const,
            activeIcon: "home" as const,
        },
        {
            name: t("tabs.favorites"),
            route: "/favorites" as const,
            icon: "heart-outline" as const,
            activeIcon: "heart" as const,
        },
        {
            name: t("tabs.cart"),
            route: "/cart" as const,
            icon: "cart-outline" as const,
            activeIcon: "cart" as const,
            badge: cartItemCount,
        },
        {
            name: t("tabs.orders"),
            route: "/orders" as const,
            icon: "receipt-outline" as const,
            activeIcon: "receipt" as const,
        },
        {
            name: t("tabs.account"),
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
