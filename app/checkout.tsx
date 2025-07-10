import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useI18n } from "../contexts/I18nContext";
import { useAppTheme } from "../contexts/ThemeContext";
import { useUser } from "../contexts/UserContext";
import { useCart, useCheckout, useShippingAddresses } from "../hooks/useApi";
import {
    CheckoutRequest,
    getPaymentMethods,
    PaymentMethod,
    PaymentMethodInfo,
    ShippingAddress,
} from "../lib/api";

export default function CheckoutScreen() {
    const theme = useAppTheme();
    const { t } = useI18n();
    const { user, isAuthenticated } = useUser();
    const { data: cart, isLoading: cartLoading } = useCart();
    const { data: addresses, isLoading: addressesLoading } =
        useShippingAddresses();
    const checkoutMutation = useCheckout();

    const [selectedAddressId, setSelectedAddressId] = useState<string>("");
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
        PaymentMethod | ""
    >("");
    const [agreedToDataProcessing, setAgreedToDataProcessing] = useState(false);

    const paymentMethods = getPaymentMethods();

    // Calculate totals
    const subtotal =
        cart?.items.reduce(
            (sum, item) => sum + item.book.price * item.quantity,
            0
        ) || 0;

    const selectedPaymentInfo = paymentMethods.find(
        (method) => method.key === selectedPaymentMethod
    );
    const paymentFee = selectedPaymentInfo?.fee || 0;
    const total = subtotal + paymentFee;

    const formatPrice = (price: number) => {
        return `${price.toFixed(2)} CZK`;
    };

    const handleAddressSelect = (addressId: string) => {
        setSelectedAddressId(addressId);
    };

    const handlePaymentMethodSelect = (method: PaymentMethod) => {
        setSelectedPaymentMethod(method);
    };

    const handleCompleteOrder = async () => {
        // Validation
        if (!selectedAddressId) {
            Alert.alert("Error", t("checkout.errors.noAddress"));
            return;
        }

        if (!selectedPaymentMethod) {
            Alert.alert("Error", t("checkout.errors.noPayment"));
            return;
        }

        if (!agreedToDataProcessing) {
            Alert.alert("Error", t("checkout.errors.noAgreement"));
            return;
        }

        // Process checkout
        try {
            const checkoutData: CheckoutRequest = {
                shippingAddressId: selectedAddressId,
                paymentMethod: selectedPaymentMethod as PaymentMethod,
            };

            const response = await checkoutMutation.mutateAsync(checkoutData);

            if (response.success) {
                // Show success alert
                Alert.alert(
                    t("checkout.success.title"),
                    t("checkout.success.message") +
                        "\n\n" +
                        t("checkout.success.orderNumber", {
                            orderNumber: response.order.orderNumber,
                        }),
                    [
                        {
                            text: t("checkout.success.viewOrders"),
                            onPress: () => {
                                router.dismiss();
                                router.push("/(tabs)/orders");
                            },
                        },
                        {
                            text: "OK",
                            onPress: () => router.dismiss(),
                        },
                    ]
                );
            }
        } catch (error: any) {
            Alert.alert(
                "Error",
                error.message || t("checkout.errors.orderFailed")
            );
        }
    };

    const renderAddressItem = (address: ShippingAddress) => (
        <TouchableOpacity
            key={address.id}
            style={[
                styles.addressItem,
                {
                    backgroundColor: theme.colors.surface,
                    borderColor:
                        selectedAddressId === address.id
                            ? theme.colors.primary
                            : theme.colors.border,
                },
                theme.shadows.sm,
            ]}
            onPress={() => handleAddressSelect(address.id)}
        >
            <View style={styles.addressContent}>
                <View style={styles.addressHeader}>
                    <Text
                        style={[
                            styles.addressName,
                            {
                                color: theme.colors.text,
                                fontFamily: theme.typography.fontFamily.bold,
                            },
                        ]}
                    >
                        {address.firstName} {address.lastName}
                    </Text>
                    {address.isDefault && (
                        <View
                            style={[
                                styles.defaultBadge,
                                { backgroundColor: theme.colors.primary },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.defaultBadgeText,
                                    { color: theme.colors.white },
                                ]}
                            >
                                Default
                            </Text>
                        </View>
                    )}
                </View>
                <Text
                    style={[
                        styles.addressText,
                        { color: theme.colors.textSecondary },
                    ]}
                >
                    {address.street}
                </Text>
                <Text
                    style={[
                        styles.addressText,
                        { color: theme.colors.textSecondary },
                    ]}
                >
                    {address.city}, {address.postalCode}
                </Text>
                <Text
                    style={[
                        styles.addressText,
                        { color: theme.colors.textSecondary },
                    ]}
                >
                    {address.country}
                </Text>
            </View>
            <View style={styles.radioContainer}>
                <View
                    style={[
                        styles.radioButton,
                        {
                            borderColor:
                                selectedAddressId === address.id
                                    ? theme.colors.primary
                                    : theme.colors.border,
                        },
                    ]}
                >
                    {selectedAddressId === address.id && (
                        <View
                            style={[
                                styles.radioButtonInner,
                                { backgroundColor: theme.colors.primary },
                            ]}
                        />
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderPaymentMethodItem = (method: PaymentMethodInfo) => (
        <TouchableOpacity
            key={method.key}
            style={[
                styles.paymentMethodItem,
                {
                    backgroundColor: theme.colors.surface,
                    borderColor:
                        selectedPaymentMethod === method.key
                            ? theme.colors.primary
                            : theme.colors.border,
                },
                theme.shadows.sm,
            ]}
            onPress={() => handlePaymentMethodSelect(method.key)}
        >
            <View style={styles.paymentMethodContent}>
                <Text
                    style={[
                        styles.paymentMethodName,
                        {
                            color: theme.colors.text,
                            fontFamily: theme.typography.fontFamily.bold,
                        },
                    ]}
                >
                    {t(`checkout.payment.${method.key}`)}
                </Text>
                <Text
                    style={[
                        styles.paymentMethodDescription,
                        { color: theme.colors.textSecondary },
                    ]}
                >
                    {t(`checkout.payment.${method.key}Desc`)}
                </Text>
                <Text
                    style={[
                        styles.paymentMethodFee,
                        {
                            color: method.isFree
                                ? theme.colors.success
                                : theme.colors.textSecondary,
                            fontFamily: theme.typography.fontFamily.bold,
                        },
                    ]}
                >
                    {method.isFree
                        ? t(`checkout.payment.${method.key}Fee`)
                        : t(`checkout.payment.${method.key}Fee`)}
                </Text>
            </View>
            <View style={styles.radioContainer}>
                <View
                    style={[
                        styles.radioButton,
                        {
                            borderColor:
                                selectedPaymentMethod === method.key
                                    ? theme.colors.primary
                                    : theme.colors.border,
                        },
                    ]}
                >
                    {selectedPaymentMethod === method.key && (
                        <View
                            style={[
                                styles.radioButtonInner,
                                { backgroundColor: theme.colors.primary },
                            ]}
                        />
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    if (!isAuthenticated) {
        return (
            <SafeAreaView
                style={[
                    styles.container,
                    { backgroundColor: theme.colors.background },
                ]}
            >
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons
                            name="arrow-back"
                            size={24}
                            color={theme.colors.text}
                        />
                    </TouchableOpacity>
                    <Text
                        style={[
                            styles.headerTitle,
                            {
                                color: theme.colors.text,
                                fontFamily: theme.typography.fontFamily.bold,
                            },
                        ]}
                    >
                        {t("checkout.title")}
                    </Text>
                </View>
                <View style={styles.emptyContainer}>
                    <Text
                        style={[styles.emptyText, { color: theme.colors.text }]}
                    >
                        Please sign in to continue with checkout.
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    if (cartLoading || !cart || cart.items.length === 0) {
        return (
            <SafeAreaView
                style={[
                    styles.container,
                    { backgroundColor: theme.colors.background },
                ]}
            >
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons
                            name="arrow-back"
                            size={24}
                            color={theme.colors.text}
                        />
                    </TouchableOpacity>
                    <Text
                        style={[
                            styles.headerTitle,
                            {
                                color: theme.colors.text,
                                fontFamily: theme.typography.fontFamily.bold,
                            },
                        ]}
                    >
                        {t("checkout.title")}
                    </Text>
                </View>
                <View style={styles.emptyContainer}>
                    <Text
                        style={[styles.emptyText, { color: theme.colors.text }]}
                    >
                        {cartLoading
                            ? t("common.loading")
                            : t("cart.empty.title")}
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView
            style={[
                styles.container,
                { backgroundColor: theme.colors.background },
            ]}
        >
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons
                        name="arrow-back"
                        size={24}
                        color={theme.colors.text}
                    />
                </TouchableOpacity>
                <Text
                    style={[
                        styles.headerTitle,
                        {
                            color: theme.colors.text,
                            fontFamily: theme.typography.fontFamily.bold,
                        },
                    ]}
                >
                    {t("checkout.title")}
                </Text>
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Shipping Address Section */}
                <View style={styles.section}>
                    <Text
                        style={[
                            styles.sectionTitle,
                            {
                                color: theme.colors.text,
                                fontFamily: theme.typography.fontFamily.bold,
                            },
                        ]}
                    >
                        {t("checkout.shipping.title")}
                    </Text>

                    {addressesLoading ? (
                        <Text
                            style={[
                                styles.loadingText,
                                { color: theme.colors.textSecondary },
                            ]}
                        >
                            {t("common.loading")}
                        </Text>
                    ) : addresses && addresses.length > 0 ? (
                        <>
                            {addresses.map(renderAddressItem)}
                            <TouchableOpacity
                                style={[
                                    styles.addAddressButton,
                                    {
                                        backgroundColor: "transparent",
                                        borderWidth: 2,
                                        borderColor: theme.colors.primary,
                                        marginTop: 8,
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    },
                                ]}
                                onPress={() => {
                                    router.push("/add-address");
                                }}
                            >
                                <Ionicons
                                    name="add"
                                    size={20}
                                    color={theme.colors.primary}
                                    style={{ marginRight: 8 }}
                                />
                                <Text
                                    style={[
                                        styles.addAddressButtonText,
                                        { color: theme.colors.primary },
                                    ]}
                                >
                                    {t("checkout.shipping.addNewAddress")}
                                </Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <View style={styles.noAddressesContainer}>
                            <Text
                                style={[
                                    styles.noAddressesTitle,
                                    { color: theme.colors.text },
                                ]}
                            >
                                {t("checkout.shipping.noAddresses")}
                            </Text>
                            <Text
                                style={[
                                    styles.noAddressesDescription,
                                    { color: theme.colors.textSecondary },
                                ]}
                            >
                                {t("checkout.shipping.noAddressesDescription")}
                            </Text>
                            <TouchableOpacity
                                style={[
                                    styles.addAddressButton,
                                    { backgroundColor: theme.colors.primary },
                                ]}
                                onPress={() => {
                                    router.push("/add-address");
                                }}
                            >
                                <Text
                                    style={[
                                        styles.addAddressButtonText,
                                        { color: theme.colors.white },
                                    ]}
                                >
                                    {t("checkout.shipping.addNewAddress")}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Payment Method Section */}
                <View style={styles.section}>
                    <Text
                        style={[
                            styles.sectionTitle,
                            {
                                color: theme.colors.text,
                                fontFamily: theme.typography.fontFamily.bold,
                            },
                        ]}
                    >
                        {t("checkout.payment.title")}
                    </Text>

                    {paymentMethods.map(renderPaymentMethodItem)}
                </View>

                {/* Order Summary Section */}
                <View style={styles.section}>
                    <Text
                        style={[
                            styles.sectionTitle,
                            {
                                color: theme.colors.text,
                                fontFamily: theme.typography.fontFamily.bold,
                            },
                        ]}
                    >
                        {t("checkout.summary.title")}
                    </Text>

                    <View
                        style={[
                            styles.summaryContainer,
                            { backgroundColor: theme.colors.surface },
                        ]}
                    >
                        <View style={styles.summaryRow}>
                            <Text
                                style={[
                                    styles.summaryLabel,
                                    { color: theme.colors.textSecondary },
                                ]}
                            >
                                {t("checkout.summary.subtotal")}
                            </Text>
                            <Text
                                style={[
                                    styles.summaryValue,
                                    { color: theme.colors.text },
                                ]}
                            >
                                {formatPrice(subtotal)}
                            </Text>
                        </View>

                        {paymentFee > 0 && (
                            <View style={styles.summaryRow}>
                                <Text
                                    style={[
                                        styles.summaryLabel,
                                        { color: theme.colors.textSecondary },
                                    ]}
                                >
                                    {t("checkout.summary.paymentFee")}
                                </Text>
                                <Text
                                    style={[
                                        styles.summaryValue,
                                        { color: theme.colors.text },
                                    ]}
                                >
                                    {formatPrice(paymentFee)}
                                </Text>
                            </View>
                        )}

                        <View style={[styles.summaryRow, styles.totalRow]}>
                            <Text
                                style={[
                                    styles.totalLabel,
                                    {
                                        color: theme.colors.text,
                                        fontFamily:
                                            theme.typography.fontFamily.bold,
                                    },
                                ]}
                            >
                                {t("checkout.summary.total")}
                            </Text>
                            <Text
                                style={[
                                    styles.totalValue,
                                    {
                                        color: theme.colors.primary,
                                        fontFamily:
                                            theme.typography.fontFamily.bold,
                                    },
                                ]}
                            >
                                {formatPrice(total)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Data Processing Agreement */}
                <View style={styles.section}>
                    <Text
                        style={[
                            styles.sectionTitle,
                            {
                                color: theme.colors.text,
                                fontFamily: theme.typography.fontFamily.bold,
                            },
                        ]}
                    >
                        {t("checkout.agreement.title")}
                    </Text>

                    <TouchableOpacity
                        style={styles.agreementContainer}
                        onPress={() =>
                            setAgreedToDataProcessing(!agreedToDataProcessing)
                        }
                    >
                        <View
                            style={[
                                styles.checkbox,
                                {
                                    borderColor: agreedToDataProcessing
                                        ? theme.colors.primary
                                        : theme.colors.border,
                                    backgroundColor: agreedToDataProcessing
                                        ? theme.colors.primary
                                        : "transparent",
                                },
                            ]}
                        >
                            {agreedToDataProcessing && (
                                <Ionicons
                                    name="checkmark"
                                    size={16}
                                    color={theme.colors.white}
                                />
                            )}
                        </View>
                        <Text
                            style={[
                                styles.agreementText,
                                { color: theme.colors.textSecondary },
                            ]}
                        >
                            {t("checkout.agreement.text")}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Complete Order Button */}
            <View
                style={[
                    styles.footer,
                    { backgroundColor: theme.colors.surface },
                ]}
            >
                <TouchableOpacity
                    style={[
                        styles.completeOrderButton,
                        {
                            backgroundColor: theme.colors.primary,
                            opacity:
                                !selectedAddressId ||
                                !selectedPaymentMethod ||
                                !agreedToDataProcessing ||
                                checkoutMutation.isPending
                                    ? 0.6
                                    : 1,
                        },
                    ]}
                    onPress={handleCompleteOrder}
                    disabled={
                        !selectedAddressId ||
                        !selectedPaymentMethod ||
                        !agreedToDataProcessing ||
                        checkoutMutation.isPending
                    }
                >
                    <Text
                        style={[
                            styles.completeOrderButtonText,
                            {
                                color: theme.colors.white,
                                fontFamily: theme.typography.fontFamily.bold,
                            },
                        ]}
                    >
                        {checkoutMutation.isPending
                            ? t("checkout.buttons.processing")
                            : t("checkout.buttons.completeOrder")}
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
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    section: {
        marginVertical: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 12,
    },
    loadingText: {
        textAlign: "center",
        paddingVertical: 32,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
    },
    emptyText: {
        fontSize: 16,
        textAlign: "center",
    },
    addressItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        marginBottom: 8,
        borderRadius: 12,
        borderWidth: 2,
    },
    addressContent: {
        flex: 1,
    },
    addressHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 4,
    },
    addressName: {
        fontSize: 16,
        fontWeight: "600",
        flex: 1,
    },
    defaultBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    defaultBadgeText: {
        fontSize: 12,
        fontWeight: "500",
    },
    addressText: {
        fontSize: 14,
        marginBottom: 2,
    },
    noAddressesContainer: {
        alignItems: "center",
        paddingVertical: 32,
    },
    noAddressesTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 8,
    },
    noAddressesDescription: {
        fontSize: 14,
        textAlign: "center",
        marginBottom: 16,
    },
    addAddressButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    addAddressButtonText: {
        fontSize: 16,
        fontWeight: "600",
    },
    paymentMethodItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        marginBottom: 8,
        borderRadius: 12,
        borderWidth: 2,
    },
    paymentMethodContent: {
        flex: 1,
    },
    paymentMethodName: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4,
    },
    paymentMethodDescription: {
        fontSize: 14,
        marginBottom: 4,
    },
    paymentMethodFee: {
        fontSize: 14,
        fontWeight: "600",
    },
    radioContainer: {
        marginLeft: 12,
    },
    radioButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        alignItems: "center",
        justifyContent: "center",
    },
    radioButtonInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    summaryContainer: {
        padding: 16,
        borderRadius: 12,
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 14,
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: "500",
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: "#e5e7eb",
        paddingTop: 12,
        marginTop: 8,
        marginBottom: 0,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: "600",
    },
    totalValue: {
        fontSize: 18,
        fontWeight: "700",
    },
    agreementContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        paddingVertical: 8,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
        marginTop: 2,
    },
    agreementText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: "#e5e7eb",
    },
    completeOrderButton: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    completeOrderButtonText: {
        fontSize: 18,
        fontWeight: "700",
    },
});
