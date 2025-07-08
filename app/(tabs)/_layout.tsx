import { useAppTheme } from "@/contexts/ThemeContext";
import { useCart } from "@/hooks/useApi";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabLayout() {
    const theme = useAppTheme();
    const { data: cart } = useCart();

    // Calculate total items in cart for badge
    const cartItemCount =
        cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.gray500,
                tabBarStyle: {
                    backgroundColor: theme.colors.white,
                    borderTopColor: theme.colors.border,
                    borderTopWidth: 1,
                    paddingTop: 8,
                    paddingBottom: 8,
                    height: 88,
                },
                tabBarLabelStyle: {
                    fontSize: theme.typography.fontSize.xs,
                    fontWeight: theme.typography.fontWeight.medium,
                    marginTop: 4,
                },
                headerStyle: {
                    backgroundColor: theme.colors.white,
                    borderBottomColor: theme.colors.border,
                    borderBottomWidth: 1,
                },
                headerTitleStyle: {
                    fontSize: theme.typography.fontSize.lg,
                    fontWeight: theme.typography.fontWeight.bold,
                    color: theme.colors.text,
                },
                headerTintColor: theme.colors.primary,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    headerTitle: "Bookstore",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons
                            name="home-outline"
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="favorites"
                options={{
                    title: "Favorites",
                    headerTitle: "My Favorites",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons
                            name="heart-outline"
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="cart"
                options={{
                    title: "Cart",
                    headerTitle: "Shopping Cart",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons
                            name="bag-outline"
                            size={size}
                            color={color}
                        />
                    ),
                    tabBarBadge:
                        cartItemCount > 0
                            ? cartItemCount.toString()
                            : undefined,
                    tabBarBadgeStyle: {
                        backgroundColor: theme.colors.secondary,
                        color: theme.colors.white,
                        fontSize: theme.typography.fontSize.xs,
                        fontWeight: theme.typography.fontWeight.bold,
                    },
                }}
            />
            <Tabs.Screen
                name="orders"
                options={{
                    title: "Orders",
                    headerTitle: "My Orders",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons
                            name="receipt-outline"
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="account"
                options={{
                    title: "Account",
                    headerTitle: "My Account",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons
                            name="person-outline"
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}
