import { ApiErrorBoundary } from "@/components/ApiErrorBoundary";
import { useI18n } from "@/contexts/I18nContext";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useAppTheme } from "../../contexts/ThemeContext";
import {
    useCart,
    useCheckout,
    useClearCart,
    useRemoveFromCart,
    useSession,
    useUpdateCartItem,
} from "../../hooks/useApi";
import { CartItem } from "../../lib/api";

export default function CartScreen() {
    const theme = useAppTheme();
    const { t } = useI18n();
    const { data: session } = useSession();
    const { data: cart, isLoading, error } = useCart();

    // Mutations
    const updateCartItemMutation = useUpdateCartItem();
    const removeFromCartMutation = useRemoveFromCart();
    const clearCartMutation = useClearCart();
    const checkoutMutation = useCheckout();

    const formatPrice = (price: number) => {
        return `${price.toFixed(2)} CZK`;
    };

    const getTotalPrice = () => {
        if (!cart?.items) return 0;
        return cart.items.reduce(
            (total, item) => total + item.book.price * item.quantity,
            0
        );
    };

    const getTotalItems = () => {
        if (!cart?.items) return 0;
        return cart.items.reduce((total, item) => total + item.quantity, 0);
    };

    const handleQuantityChange = (cartItem: CartItem, newQuantity: number) => {
        if (newQuantity === 0) {
            handleRemoveItem(cartItem);
            return;
        }

        updateCartItemMutation.mutate({
            cartItemId: cartItem.id,
            data: { quantity: newQuantity },
        });
    };

    const handleRemoveItem = (cartItem: CartItem) => {
        Alert.alert(
            t("cart.alerts.removeItem"),
            t("cart.alerts.removeItemMessage", { title: cartItem.book.title }),
            [
                { text: t("common.cancel"), style: "cancel" },
                {
                    text: t("cart.alerts.remove"),
                    style: "destructive",
                    onPress: () => {
                        removeFromCartMutation.mutate(cartItem.id);
                    },
                },
            ]
        );
    };

    const handleClearCart = () => {
        Alert.alert(
            t("cart.alerts.clearCart"),
            t("cart.alerts.clearCartMessage"),
            [
                { text: t("common.cancel"), style: "cancel" },
                {
                    text: t("cart.alerts.clear"),
                    style: "destructive",
                    onPress: () => {
                        clearCartMutation.mutate();
                    },
                },
            ]
        );
    };

    const handleCheckout = () => {
        // For now, just log. In a real app, this would navigate to checkout flow
        console.log("Navigate to checkout");
    };

    const renderCartItem = (item: CartItem) => (
        <View
            key={item.id}
            style={[styles.cartItem, { backgroundColor: theme.colors.card }]}
        >
            <Image
                source={{ uri: item.book.imageURL }}
                style={styles.bookImage}
                resizeMode="cover"
            />

            <View style={styles.itemDetails}>
                <Text
                    style={[styles.bookTitle, { color: theme.colors.text }]}
                    numberOfLines={2}
                >
                    {item.book.title}
                </Text>
                <Text
                    style={[
                        styles.bookAuthor,
                        { color: theme.colors.textSecondary },
                    ]}
                    numberOfLines={1}
                >
                    {item.book.authors?.map((author) => author.name).join(", ")}
                </Text>
                <Text
                    style={[styles.bookPrice, { color: theme.colors.primary }]}
                >
                    {formatPrice(item.book.price)}
                </Text>
            </View>

            <View style={styles.quantityContainer}>
                <View style={styles.quantityControls}>
                    <TouchableOpacity
                        style={[
                            styles.quantityButton,
                            { backgroundColor: theme.colors.gray200 },
                        ]}
                        onPress={() =>
                            handleQuantityChange(item, item.quantity - 1)
                        }
                    >
                        <Ionicons
                            name="remove"
                            size={16}
                            color={theme.colors.text}
                        />
                    </TouchableOpacity>

                    <Text
                        style={[styles.quantity, { color: theme.colors.text }]}
                    >
                        {item.quantity}
                    </Text>

                    <TouchableOpacity
                        style={[
                            styles.quantityButton,
                            { backgroundColor: theme.colors.gray200 },
                        ]}
                        onPress={() =>
                            handleQuantityChange(item, item.quantity + 1)
                        }
                    >
                        <Ionicons
                            name="add"
                            size={16}
                            color={theme.colors.text}
                        />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveItem(item)}
                >
                    <Ionicons
                        name="trash-outline"
                        size={20}
                        color={theme.colors.error}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );

    // Show sign in prompt for non-authenticated users
    if (!session?.user) {
        return (
            <View
                style={[
                    styles.container,
                    { backgroundColor: theme.colors.background },
                ]}
            >
                <View style={styles.emptyStateContainer}>
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
                            console.log("Navigate to sign in");
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
                        Loading cart...
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
                        Failed to load cart
                    </Text>
                    <Text
                        style={[
                            styles.errorText,
                            { color: theme.colors.textSecondary },
                        ]}
                    >
                        There was an error loading your cart. Please try again.
                    </Text>
                </View>
            </View>
        );
    }

    // Show empty cart
    if (!cart?.items || cart.items.length === 0) {
        return (
            <View
                style={[
                    styles.container,
                    { backgroundColor: theme.colors.background },
                ]}
            >
                <View style={styles.emptyStateContainer}>
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
                            {t("cart.empty.exploreButton")}
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
                        styles.itemCount,
                        { color: theme.colors.textSecondary },
                    ]}
                >
                    {getTotalItems()} {getTotalItems() === 1 ? "item" : "items"}
                </Text>
                <TouchableOpacity onPress={handleClearCart}>
                    <Text
                        style={[
                            styles.clearButton,
                            { color: theme.colors.error },
                        ]}
                    >
                        Clear Cart
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.cartList}
                showsVerticalScrollIndicator={false}
            >
                {cart.items.map(renderCartItem)}
            </ScrollView>

            <View
                style={[
                    styles.footer,
                    {
                        backgroundColor: theme.colors.card,
                        borderTopColor: theme.colors.border,
                    },
                ]}
            >
                <View style={styles.totalContainer}>
                    <Text
                        style={[
                            styles.totalLabel,
                            { color: theme.colors.textSecondary },
                        ]}
                    >
                        Total:
                    </Text>
                    <Text
                        style={[
                            styles.totalPrice,
                            { color: theme.colors.text },
                        ]}
                    >
                        {formatPrice(getTotalPrice())}
                    </Text>
                </View>

                <TouchableOpacity
                    style={[
                        styles.checkoutButton,
                        { backgroundColor: theme.colors.primary },
                    ]}
                    onPress={handleCheckout}
                >
                    <Text
                        style={[
                            styles.checkoutButtonText,
                            { color: theme.colors.white },
                        ]}
                    >
                        Proceed to Checkout
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
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
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },
    itemCount: {
        fontSize: 14,
        fontWeight: "500",
    },
    clearButton: {
        fontSize: 14,
        fontWeight: "600",
    },
    cartList: {
        flex: 1,
        padding: 16,
    },
    cartItem: {
        flexDirection: "row",
        padding: 12,
        marginBottom: 12,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    bookImage: {
        width: 60,
        height: 80,
        borderRadius: 6,
    },
    itemDetails: {
        flex: 1,
        marginLeft: 12,
        justifyContent: "space-between",
    },
    bookTitle: {
        fontSize: 16,
        fontWeight: "600",
        lineHeight: 20,
    },
    bookAuthor: {
        fontSize: 14,
        marginTop: 4,
    },
    bookPrice: {
        fontSize: 16,
        fontWeight: "700",
        marginTop: 4,
    },
    quantityContainer: {
        alignItems: "center",
        justifyContent: "space-between",
    },
    quantityControls: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    quantityButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    quantity: {
        fontSize: 16,
        fontWeight: "600",
        marginHorizontal: 12,
        minWidth: 24,
        textAlign: "center",
    },
    removeButton: {
        padding: 8,
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
    },
    totalContainer: {
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
        borderRadius: 8,
        alignItems: "center",
    },
    checkoutButtonText: {
        fontSize: 18,
        fontWeight: "600",
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
});
