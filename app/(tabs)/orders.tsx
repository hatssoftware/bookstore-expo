import { ApiErrorBoundary } from "@/components/ApiErrorBoundary";
import { useI18n } from "@/contexts/I18nContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useAppTheme } from "../../contexts/ThemeContext";
import { useUser } from "../../contexts/UserContext";
import { useOrders } from "../../hooks/useApi";
import { Order } from "../../lib/api";

export default function OrdersScreen() {
    const theme = useAppTheme();
    const { t } = useI18n();
    const { user, isAuthenticated } = useUser();
    const { data: orders, isLoading, refetch, error } = useOrders();

    const formatPrice = (price: number | string) => {
        const numPrice = typeof price === "string" ? parseFloat(price) : price;
        return `${numPrice.toFixed(2)} CZK`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "completed":
                return theme.colors.success;
            case "pending":
                return theme.colors.warning;
            case "processing":
                return theme.colors.info;
            case "cancelled":
                return theme.colors.error;
            default:
                return theme.colors.textSecondary;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case "completed":
                return "checkmark-circle";
            case "pending":
                return "time";
            case "processing":
                return "hourglass";
            case "cancelled":
                return "close-circle";
            default:
                return "help-circle";
        }
    };

    const renderOrder = (order: Order) => (
        <View
            key={order.id}
            style={[styles.orderCard, { backgroundColor: theme.colors.card }]}
        >
            <View style={styles.orderHeader}>
                <View style={styles.orderInfo}>
                    <Text
                        style={[
                            styles.orderNumber,
                            { color: theme.colors.text },
                        ]}
                    >
                        {order.orderNumber}
                    </Text>
                    <Text
                        style={[
                            styles.orderDate,
                            { color: theme.colors.textSecondary },
                        ]}
                    >
                        {formatDate(order.date)}
                    </Text>
                </View>

                <View
                    style={[
                        styles.statusContainer,
                        {
                            backgroundColor:
                                getStatusColor(order.status) + "20",
                        },
                    ]}
                >
                    <Ionicons
                        name={getStatusIcon(order.status) as any}
                        size={16}
                        color={getStatusColor(order.status)}
                    />
                    <Text
                        style={[
                            styles.statusText,
                            { color: getStatusColor(order.status) },
                        ]}
                    >
                        {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                    </Text>
                </View>
            </View>

            <View style={styles.orderFooter}>
                <Text
                    style={[styles.orderPrice, { color: theme.colors.primary }]}
                >
                    {formatPrice(order.totalPrice)}
                </Text>

               
            </View>
        </View>
    );

    // Show sign in prompt for non-authenticated users
    if (!isAuthenticated || !user) {
        return (
            <View
                style={[
                    styles.container,
                    { backgroundColor: theme.colors.background },
                ]}
            >
                <View style={styles.emptyStateContainer}>
                    <Ionicons
                        name="receipt-outline"
                        size={64}
                        color={theme.colors.gray300}
                        style={styles.emptyIcon}
                    />
                    <Text
                        style={[
                            styles.emptyTitle,
                            { color: theme.colors.text },
                        ]}
                    >
                        {t("orders.signIn.title")}
                    </Text>
                    <Text
                        style={[
                            styles.emptyText,
                            { color: theme.colors.textSecondary },
                        ]}
                    >
                        {t("orders.signIn.description")}
                    </Text>
                    <TouchableOpacity
                        style={[
                            styles.signInButton,
                            { backgroundColor: theme.colors.primary },
                        ]}
                        onPress={() => {
                            router.push("/auth/login");
                        }}
                    >
                        <Text
                            style={[
                                styles.signInButtonText,
                                { color: theme.colors.white },
                            ]}
                        >
                            {t("orders.signIn.signInButton")}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // Show loading state
    if (isLoading) {
        return (
            <View
                style={[
                    styles.container,
                    { backgroundColor: theme.colors.background },
                ]}
            >
                <View style={styles.loadingContainer}>
                    <Text
                        style={[
                            styles.loadingText,
                            { color: theme.colors.textSecondary },
                        ]}
                    >
                        {t("orders.loading")}
                    </Text>
                </View>
            </View>
        );
    }

    // Show error state
    if (error) {
        // Check if this is an API unavailability error
        if ((error as any)?.isApiUnavailable) {
            return (
                <ApiErrorBoundary>
                    <></>
                </ApiErrorBoundary>
            );
        }

        return (
            <View
                style={[
                    styles.container,
                    { backgroundColor: theme.colors.background },
                ]}
            >
                <View style={styles.errorContainer}>
                    <Ionicons
                        name="alert-circle-outline"
                        size={64}
                        color={theme.colors.error}
                        style={styles.emptyIcon}
                    />
                    <Text
                        style={[
                            styles.errorTitle,
                            { color: theme.colors.error },
                        ]}
                    >
                        Failed to load orders
                    </Text>
                    <Text
                        style={[
                            styles.errorText,
                            { color: theme.colors.textSecondary },
                        ]}
                    >
                        There was an error loading your orders. Please try
                        again.
                    </Text>
                    <TouchableOpacity
                        style={[
                            styles.retryButton,
                            { backgroundColor: theme.colors.primary },
                        ]}
                        onPress={() => refetch()}
                    >
                        <Text
                            style={[
                                styles.retryButtonText,
                                { color: theme.colors.white },
                            ]}
                        >
                            Try Again
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // Show empty state
    if (!orders || orders.length === 0) {
        return (
            <View
                style={[
                    styles.container,
                    { backgroundColor: theme.colors.background },
                ]}
            >
                <View style={styles.emptyStateContainer}>
                    <Ionicons
                        name="receipt-outline"
                        size={64}
                        color={theme.colors.gray300}
                        style={styles.emptyIcon}
                    />
                    <Text
                        style={[
                            styles.emptyTitle,
                            { color: theme.colors.text },
                        ]}
                    >
                        {t("orders.empty.title")}
                    </Text>
                    <Text
                        style={[
                            styles.emptyText,
                            { color: theme.colors.textSecondary },
                        ]}
                    >
                        {t("orders.empty.description")}
                    </Text>
                    <TouchableOpacity
                        style={[
                            styles.exploreButton,
                            { backgroundColor: theme.colors.primary },
                        ]}
                        onPress={() => {
                            // Navigate to home tab
                            console.log("Navigate to home tab");
                        }}
                    >
                        <Text
                            style={[
                                styles.exploreButtonText,
                                { color: theme.colors.white },
                            ]}
                        >
                            {t("orders.empty.startShoppingButton")}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: theme.colors.background },
            ]}
        >
            <View style={styles.header}>
                <Text
                    style={[
                        styles.orderCount,
                        { color: theme.colors.textSecondary },
                    ]}
                >
                    {orders.length} {orders.length === 1 ? "order" : "orders"}
                </Text>
            </View>

            <ScrollView
                style={styles.ordersList}
                refreshControl={
                    <RefreshControl
                        refreshing={isLoading}
                        onRefresh={refetch}
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                {orders.map(renderOrder)}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },
    orderCount: {
        fontSize: 14,
        fontWeight: "500",
    },
    ordersList: {
        flex: 1,
        padding: 16,
    },
    orderCard: {
        padding: 16,
        marginBottom: 12,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    orderHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    orderInfo: {
        flex: 1,
    },
    orderNumber: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4,
    },
    orderDate: {
        fontSize: 14,
    },
    statusContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: "600",
        marginLeft: 4,
    },
    orderFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    orderPrice: {
        fontSize: 18,
        fontWeight: "700",
    },
    emptyStateContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
    },
    emptyIcon: {
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 8,
        textAlign: "center",
    },
    emptyText: {
        fontSize: 16,
        textAlign: "center",
        lineHeight: 24,
        marginBottom: 24,
    },
    signInButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    signInButtonText: {
        fontSize: 16,
        fontWeight: "600",
    },
    exploreButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    exploreButtonText: {
        fontSize: 16,
        fontWeight: "600",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 8,
        textAlign: "center",
    },
    errorText: {
        fontSize: 16,
        textAlign: "center",
        lineHeight: 24,
        marginBottom: 24,
    },
    retryButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        fontSize: 16,
        fontWeight: "600",
    },
});
