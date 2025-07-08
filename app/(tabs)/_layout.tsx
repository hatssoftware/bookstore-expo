import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Text, View } from "react-native";
import { useAppTheme } from "../../contexts/ThemeContext";
import { useCart } from "../../hooks/useApi";

function TabBarIcon(props: {
    name: React.ComponentProps<typeof Ionicons>["name"];
    focused: boolean;
    color: string;
}) {
    const theme = useAppTheme();

    return (
        <View
            style={{
                alignItems: "center",
                justifyContent: "center",
                width: 28,
                height: 28,
            }}
        >
            <Ionicons
                size={props.focused ? 24 : 22}
                name={props.name}
                color={props.focused ? theme.colors.accent : props.color}
                style={{
                    marginBottom: -2,
                }}
            />
        </View>
    );
}

function TabBarBadge({ count }: { count: number }) {
    const theme = useAppTheme();

    if (count === 0) return null;

    return (
        <View
            style={{
                position: "absolute",
                right: -6,
                top: -2,
                backgroundColor: theme.colors.accent,
                borderRadius: 10,
                minWidth: 20,
                height: 20,
                justifyContent: "center",
                alignItems: "center",
                paddingHorizontal: 6,
            }}
        >
            <Text
                style={{
                    color: theme.colors.white,
                    fontSize: 11,
                    fontFamily: theme.typography.fontFamily.bold,
                    textAlign: "center",
                }}
            >
                {count > 99 ? "99+" : count.toString()}
            </Text>
        </View>
    );
}

export default function TabLayout() {
    const theme = useAppTheme();
    const { data: cart } = useCart();
    const cartItemCount =
        cart?.items?.reduce(
            (sum: number, item: any) => sum + item.quantity,
            0
        ) || 0;

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: theme.colors.accent,
                tabBarInactiveTintColor: theme.colors.textLight,
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: theme.colors.surface,
                    height: 78,
                    paddingTop: 8,
                    paddingHorizontal: 8,
                    width: "90%",
                    shadowColor: theme.colors.black,
                    shadowOffset: { width: 0, height: 16 },
                    shadowOpacity: 0.2,
                    shadowRadius: 24,
                    borderRadius: 96,
                    position: "absolute",
                    bottom: 20,
                    left: "50%",
                    marginLeft: "5%",
                    elevation: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontFamily: theme.typography.fontFamily.medium,
                    marginTop: 4,
                    textAlign: "center",
                },
                tabBarItemStyle: {
                    paddingTop: 4,
                    borderRadius: 12,
                    marginHorizontal: 2,
                },
                tabBarIconStyle: {
                    marginBottom: 0,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon
                            name={focused ? "home" : "home-outline"}
                            color={color}
                            focused={focused}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="favorites"
                options={{
                    title: "Favorites",
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon
                            name={focused ? "heart" : "heart-outline"}
                            color={color}
                            focused={focused}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="cart"
                options={{
                    title: "Cart",
                    tabBarIcon: ({ color, focused }) => (
                        <View style={{ position: "relative" }}>
                            <TabBarIcon
                                name={focused ? "bag" : "bag-outline"}
                                color={color}
                                focused={focused}
                            />
                            <TabBarBadge count={cartItemCount} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="orders"
                options={{
                    title: "Orders",
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon
                            name={focused ? "receipt" : "receipt-outline"}
                            color={color}
                            focused={focused}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="account"
                options={{
                    title: "Account",
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon
                            name={focused ? "person" : "person-outline"}
                            color={color}
                            focused={focused}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}
