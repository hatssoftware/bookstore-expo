import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useI18n } from "../../contexts/I18nContext";
import { useAppTheme } from "../../contexts/ThemeContext";
import { useUser } from "../../contexts/UserContext";
import {
    useCart,
    useClearCart,
    useRemoveFromCart,
    useShippingAddresses,
    useUpdateCartItem,
} from "../../hooks/useApi";
import { CartItem } from "../../lib/api";

export default function CartScreen() {
    const theme = useAppTheme();
    const { t } = useI18n();
    const { user, isAuthenticated } = useUser();
    const { data: cart, isLoading: cartLoading, error } = useCart();
    const { data: addresses } = useShippingAddresses();
    const updateCartItemMutation = useUpdateCartItem();
    const removeFromCartMutation = useRemoveFromCart();
    const clearCartMutation = useClearCart();

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("cs-CZ", {
            style: "currency",
            currency: "CZK",
        }).format(price);
    };

    const handleUpdateQuantity = (cartItem: CartItem, newQuantity: number) => {
        if (newQuantity <= 0) {
            handleRemoveItem(cartItem);
            return;
        }

        updateCartItemMutation.mutate({
            cartItemId: cartItem.id,
            data: { quantity: newQuantity },
        });
    };

    const handleRemoveItem = (cartItem: CartItem) => {
        removeFromCartMutation.mutate(cartItem.id);
    };

    const handleClearCart = () => {
        clearCartMutation.mutate();
    };

    const handleContinueToCheckout = () => {
        if (!cart || cart.items.length === 0) return;
        router.push("/checkout");
    };

    const renderCartItem = ({ item }: { item: CartItem }) => (
        <View
            style={[
                styles.cartItem,
                { backgroundColor: theme.colors.surface },
                theme.shadows.sm,
            ]}
        >
            <Image
                source={{ uri: item.book.imageURL }}
                style={styles.bookImage}
                resizeMode="cover"
            />
            <View style={styles.itemDetails}>
                <Text
                    style={[
                        styles.bookTitle,
                        {
                            color: theme.colors.text,
                            fontFamily: theme.typography.fontFamily.bold,
                        },
                    ]}
                    numberOfLines={2}
                >
                    {item.book.title}
                </Text>
                <Text
                    style={[
                        styles.bookAuthor,
                        {
                            color: theme.colors.textSecondary,
                            fontFamily: theme.typography.fontFamily.regular,
                        },
                    ]}
                >
                    {item.book.authors
                        ?.map((author) => author.name)
                        .join(", ") || ""}
                </Text>
                <Text
                    style={[
                        styles.bookPrice,
                        {
                            color: theme.colors.primary,
                            fontFamily: theme.typography.fontFamily.bold,
                        },
                    ]}
                >
                    {formatPrice(item.book.price)}
                </Text>
            </View>
            <View style={styles.quantityControls}>
                <TouchableOpacity
                    style={[
                        styles.quantityButton,
                        { backgroundColor: theme.colors.gray100 },
                    ]}
                    onPress={() =>
                        handleUpdateQuantity(item, item.quantity - 1)
                    }
                >
                    <Ionicons
                        name="remove"
                        size={16}
                        color={theme.colors.text}
                    />
                </TouchableOpacity>
                <Text
                    style={[
                        styles.quantityText,
                        {
                            color: theme.colors.text,
                            fontFamily: theme.typography.fontFamily.medium,
                        },
                    ]}
                >
                    {item.quantity}
                </Text>
                <TouchableOpacity
                    style={[
                        styles.quantityButton,
                        { backgroundColor: theme.colors.gray100 },
                    ]}
                    onPress={() =>
                        handleUpdateQuantity(item, item.quantity + 1)
                    }
                >
                    <Ionicons name="add" size={16} color={theme.colors.text} />
                </TouchableOpacity>
            </View>
        </View>
    );

    // Show sign in prompt for non-authenticated users
    if (!isAuthenticated) {
        return (
            <SafeAreaView
                style={[
                    styles.container,
                    { backgroundColor: theme.colors.background },
                ]}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text
                        style={[
                            styles.headerTitle,
                            {
                                color: theme.colors.text,
                                fontFamily: theme.typography.fontFamily.bold,
                            },
                        ]}
                    >
                        {t("cart.title")}
                    </Text>
                </View>

                <View style={styles.emptyContainer}>
                    <Ionicons
                        name="bag-outline"
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
                        {t("cart.signIn.title")}
                    </Text>
                    <Text
                        style={[
                            styles.emptyText,
                            { color: theme.colors.textSecondary },
                        ]}
                    >
                        {t("cart.signIn.description")}
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
                            {t("cart.signIn.signInButton")}
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // Show loading state
    if (cartLoading) {
        return (
            <View
                style={[
                    styles.container,
                    { backgroundColor: theme.colors.background },
                ]}
            >
                <View style={styles.emptyContainer}>
                    <Text
                        style={[
                            styles.emptyText,
                            { color: theme.colors.textSecondary },
                        ]}
                    >
                        Loading cart...
                    </Text>
                </View>
            </View>
        );
    }

    // Show empty cart state
    if (!cart || !cart.items || cart.items.length === 0) {
        return (
            <SafeAreaView
                style={[
                    styles.container,
                    { backgroundColor: theme.colors.background },
                ]}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text
                        style={[
                            styles.headerTitle,
                            {
                                color: theme.colors.text,
                                fontFamily: theme.typography.fontFamily.bold,
                            },
                        ]}
                    >
                        {t("cart.title")}
                    </Text>
                </View>

                <View style={styles.emptyContainer}>
                    <Ionicons
                        name="bag-outline"
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
                        {t("cart.empty.title")}
                    </Text>
                    <Text
                        style={[
                            styles.emptyText,
                            { color: theme.colors.textSecondary },
                        ]}
                    >
                        {t("cart.empty.description")}
                    </Text>

                    <TouchableOpacity
                        style={[
                            styles.signInButton,
                            { backgroundColor: theme.colors.primary },
                        ]}
                        onPress={() => {
                            router.push("/(tabs)");
                        }}
                    >
                        <Text
                            style={[
                                styles.signInButtonText,
                                { color: theme.colors.white },
                            ]}
                        >
                            {t("cart.empty.browseButton")}
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const totalPrice = cart.items.reduce(
        (sum, item) => sum + item.book.price * item.quantity,
        0
    );

    return (
        <SafeAreaView
            style={[
                styles.container,
                { backgroundColor: theme.colors.background },
            ]}
        >
            {/* Header */}
            <View style={styles.header}>
                <Text
                    style={[
                        styles.headerTitle,
                        {
                            color: theme.colors.text,
                            fontFamily: theme.typography.fontFamily.bold,
                        },
                    ]}
                >
                    {t("cart.title")}
                </Text>
                <Text
                    style={[
                        styles.itemCount,
                        {
                            color: theme.colors.textSecondary,
                            fontFamily: theme.typography.fontFamily.regular,
                        },
                    ]}
                >
                    {cart.items.length} {t("cart.items")}
                </Text>
            </View>

            <ScrollView
                style={styles.cartList}
                showsVerticalScrollIndicator={false}
            >
                {cart.items.map((item) => (
                    <View key={item.id}>{renderCartItem({ item })}</View>
                ))}
            </ScrollView>

            {/* Cart Summary */}
            <View
                style={[
                    styles.cartSummary,
                    { backgroundColor: theme.colors.surface },
                ]}
            >
                <View style={styles.totalRow}>
                    <Text
                        style={[
                            styles.totalLabel,
                            {
                                color: theme.colors.text,
                                fontFamily: theme.typography.fontFamily.bold,
                            },
                        ]}
                    >
                        {t("cart.total")}
                    </Text>
                    <Text
                        style={[
                            styles.totalPrice,
                            {
                                color: theme.colors.primary,
                                fontFamily: theme.typography.fontFamily.bold,
                            },
                        ]}
                    >
                        {formatPrice(totalPrice)}
                    </Text>
                </View>

                <TouchableOpacity
                    style={[
                        styles.checkoutButton,
                        { backgroundColor: theme.colors.primary },
                    ]}
                    onPress={handleContinueToCheckout}
                >
                    <Text
                        style={[
                            styles.checkoutButtonText,
                            {
                                color: theme.colors.white,
                                fontFamily: theme.typography.fontFamily.bold,
                            },
                        ]}
                    >
                        {t("cart.continueToCheckout")}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },
    headerTitle: {
        fontSize: 24,
    },
    itemCount: {
        fontSize: 14,
        fontWeight: "600",
    },
    cartList: {
        flex: 1,
        paddingHorizontal: 20,
    },
    cartItem: {
        flexDirection: "row",
        padding: 16,
        marginVertical: 8,
        borderRadius: 12,
    },
    bookImage: {
        width: 60,
        height: 80,
        borderRadius: 8,
        marginRight: 16,
    },
    itemDetails: {
        flex: 1,
        justifyContent: "space-between",
    },
    bookTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4,
    },
    bookAuthor: {
        fontSize: 14,
        marginBottom: 8,
    },
    bookPrice: {
        fontSize: 16,
        fontWeight: "700",
    },
    quantityControls: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    quantityButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    quantityText: {
        fontSize: 16,
        fontWeight: "600",
        minWidth: 24,
        textAlign: "center",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
    },
    emptyIcon: {
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: "600",
        textAlign: "center",
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 16,
        textAlign: "center",
        lineHeight: 24,
        marginBottom: 32,
    },
    signInButton: {
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        alignItems: "center",
    },
    signInButtonText: {
        fontSize: 16,
        fontWeight: "600",
    },
    cartSummary: {
        padding: 16,
        paddingBottom: 80,
        borderTopWidth: 1,
        borderTopColor: "#e5e7eb",
    },
    totalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: "500",
    },
    totalPrice: {
        fontSize: 24,
        fontWeight: "700",
    },
    checkoutButton: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    checkoutButtonText: {
        fontSize: 18,
        fontWeight: "700",
    },
});
