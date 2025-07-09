import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import LanguageSwitch from "../../components/LanguageSwitch";
import { useI18n } from "../../contexts/I18nContext";
import { useAppTheme } from "../../contexts/ThemeContext";
import { useUser } from "../../contexts/UserContext";
import { useShippingAddresses } from "../../hooks/useApi";

interface MenuItemProps {
    icon: string;
    title: string;
    subtitle?: string;
    onPress: () => void;
    rightIcon?: string;
    rightText?: string;
    iconColor?: string;
}

function MenuItem({
    icon,
    title,
    subtitle,
    onPress,
    rightIcon = "chevron-forward",
    rightText,
    iconColor,
}: MenuItemProps) {
    const theme = useAppTheme();

    return (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={styles.menuItemLeft}>
                <View
                    style={[
                        styles.menuItemIcon,
                        { backgroundColor: theme.colors.gray100 },
                    ]}
                >
                    <Ionicons
                        name={icon as any}
                        size={20}
                        color={iconColor || theme.colors.text}
                    />
                </View>
                <View style={styles.menuItemContent}>
                    <Text
                        style={[
                            styles.menuItemTitle,
                            {
                                color: theme.colors.text,
                                fontFamily: theme.typography.fontFamily.medium,
                            },
                        ]}
                    >
                        {title}
                    </Text>
                    {subtitle && (
                        <Text
                            style={[
                                styles.menuItemSubtitle,
                                {
                                    color: theme.colors.textSecondary,
                                    fontFamily:
                                        theme.typography.fontFamily.regular,
                                },
                            ]}
                        >
                            {subtitle}
                        </Text>
                    )}
                </View>
            </View>
            <View style={styles.menuItemRight}>
                {rightText && (
                    <Text
                        style={[
                            styles.menuItemRightText,
                            {
                                color: theme.colors.textSecondary,
                                fontFamily: theme.typography.fontFamily.regular,
                            },
                        ]}
                    >
                        {rightText}
                    </Text>
                )}
                <Ionicons
                    name={rightIcon as any}
                    size={16}
                    color={theme.colors.textLight}
                />
            </View>
        </TouchableOpacity>
    );
}

export default function AccountScreen() {
    const theme = useAppTheme();
    const { t } = useI18n();
    const { user, isAuthenticated, logout, isLoading } = useUser();
    const { data: addresses } = useShippingAddresses();

    const handleLogout = () => {
        Alert.alert(
            t("account.alerts.signOutTitle"),
            t("account.alerts.signOutMessage"),
            [
                { text: t("account.alerts.cancel"), style: "cancel" },
                {
                    text: t("account.menu.signOut"),
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await logout();
                        } catch (error) {
                            console.log("Logout error:", error);
                        }
                    },
                },
            ]
        );
    };

    // Show sign in prompt for non-authenticated users
    if (!isAuthenticated && !isLoading) {
        return (
            <ScrollView
                style={[
                    styles.container,
                    { backgroundColor: theme.colors.background },
                ]}
            >
                <View style={styles.signInContainer}>
                    <Ionicons
                        name="person-circle-outline"
                        size={80}
                        color={theme.colors.gray300}
                        style={styles.signInIcon}
                    />
                    <Text
                        style={[
                            styles.signInTitle,
                            { color: theme.colors.text },
                        ]}
                    >
                        {t("account.signIn.title")}
                    </Text>
                    <Text
                        style={[
                            styles.signInText,
                            { color: theme.colors.textSecondary },
                        ]}
                    >
                        {t("account.signIn.description")}
                    </Text>

                    <View style={styles.signInButtons}>
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
                                {t("account.signIn.signInButton")}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.registerButton,
                                { borderColor: theme.colors.primary },
                            ]}
                            onPress={() => {
                                router.push("/auth/register");
                            }}
                        >
                            <Text
                                style={[
                                    styles.registerButtonText,
                                    { color: theme.colors.primary },
                                ]}
                            >
                                {t("account.signIn.createAccountButton")}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Guest options */}
                <View style={styles.menuContainer}>
                    <Text
                        style={[
                            styles.menuSection,
                            { color: theme.colors.textSecondary },
                        ]}
                    >
                        {t("account.sections.support")}
                    </Text>

                    <MenuItem
                        icon="help-circle-outline"
                        title={t("account.menu.help")}
                        subtitle={t("account.subtitles.helpSupport")}
                        onPress={() => console.log("Navigate to help")}
                    />

                    <MenuItem
                        icon="star-outline"
                        title="Rate the App"
                        subtitle={t("account.subtitles.rateApp")}
                        onPress={() => console.log("Open app store")}
                    />
                </View>

                {/* Legal Menu */}
                <View style={styles.menuContainer}>
                    <Text
                        style={[
                            styles.menuSection,
                            { color: theme.colors.textSecondary },
                        ]}
                    >
                        {t("account.sections.legal")}
                    </Text>

                    <MenuItem
                        icon="document-text-outline"
                        title={t("account.menu.terms")}
                        onPress={() => console.log("Navigate to terms")}
                    />

                    <MenuItem
                        icon="shield-checkmark-outline"
                        title={t("account.menu.privacy")}
                        onPress={() => console.log("Navigate to privacy")}
                    />
                </View>

                {/* Language */}
                <View style={styles.menuContainer}>
                    <Text
                        style={[
                            styles.menuSection,
                            { color: theme.colors.textSecondary },
                        ]}
                    >
                        {t("account.menu.language")}
                    </Text>
                    <LanguageSwitch onPress={() => {}} />
                </View>
            </ScrollView>
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
                <View style={styles.signInContainer}>
                    <Text
                        style={[
                            styles.signInText,
                            { color: theme.colors.textSecondary },
                        ]}
                    >
                        Loading...
                    </Text>
                </View>
            </View>
        );
    }

    // Authenticated user view
    return (
        <ScrollView
            style={[
                styles.container,
                { backgroundColor: theme.colors.background },
            ]}
        >
            {/* User Profile Header */}
            <View style={styles.profileHeader}>
                <View style={styles.profileInfo}>
                    <View
                        style={[
                            styles.profileAvatar,
                            { backgroundColor: theme.colors.primary },
                        ]}
                    >
                        <Text
                            style={[
                                styles.profileAvatarText,
                                {
                                    color: theme.colors.white,
                                    fontFamily:
                                        theme.typography.fontFamily.bold,
                                },
                            ]}
                        >
                            {user?.name?.charAt(0).toUpperCase() || "U"}
                        </Text>
                    </View>
                    <View style={styles.profileDetails}>
                        <Text
                            style={[
                                styles.profileName,
                                {
                                    color: theme.colors.text,
                                    fontFamily:
                                        theme.typography.fontFamily.bold,
                                },
                            ]}
                        >
                            {user?.name || "User"}
                        </Text>
                        <Text
                            style={[
                                styles.profileEmail,
                                {
                                    color: theme.colors.textSecondary,
                                    fontFamily:
                                        theme.typography.fontFamily.regular,
                                },
                            ]}
                        >
                            {user?.email}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Account Menu */}
            <View style={styles.menuContainer}>
                <MenuItem
                    icon="person-outline"
                    title={t("account.menu.profile")}
                    onPress={() => console.log("Navigate to profile")}
                />

                <MenuItem
                    icon="receipt-outline"
                    title={t("account.menu.orders")}
                    onPress={() => console.log("Navigate to orders")}
                />

                <MenuItem
                    icon="heart-outline"
                    title={t("account.menu.favorites")}
                    onPress={() => console.log("Navigate to favorites")}
                />

                <MenuItem
                    icon="card-outline"
                    title={t("account.menu.paymentMethods")}
                    subtitle={t("account.subtitles.paymentOptions")}
                    onPress={() => console.log("Navigate to payment methods")}
                />

                <MenuItem
                    icon="location-outline"
                    title={t("account.menu.shippingAddresses")}
                    subtitle={t("account.subtitles.addAddress")}
                    rightText={addresses?.length?.toString()}
                    onPress={() =>
                        console.log("Navigate to shipping addresses")
                    }
                />
            </View>

            {/* Preferences Menu */}
            <View style={styles.menuContainer}>
                <MenuItem
                    icon="book-outline"
                    title="Reading Preferences"
                    subtitle={t("account.subtitles.readingPreferences")}
                    onPress={() => console.log("Navigate to preferences")}
                />

                <MenuItem
                    icon="notifications-outline"
                    title={t("account.menu.notifications")}
                    subtitle={t("account.subtitles.orderUpdates")}
                    onPress={() => console.log("Navigate to notifications")}
                />
            </View>

            {/* Language */}
            <View style={styles.menuContainer}>
                <Text
                    style={[
                        styles.menuSection,
                        { color: theme.colors.textSecondary },
                    ]}
                >
                    {t("account.menu.language")}
                </Text>
                <LanguageSwitch onPress={() => {}} />
            </View>

            {/* Support Menu */}
            <View style={styles.menuContainer}>
                <Text
                    style={[
                        styles.menuSection,
                        { color: theme.colors.textSecondary },
                    ]}
                >
                    {t("account.sections.support")}
                </Text>

                <MenuItem
                    icon="help-circle-outline"
                    title={t("account.menu.help")}
                    subtitle={t("account.subtitles.helpSupport")}
                    onPress={() => console.log("Navigate to help")}
                />

                <MenuItem
                    icon="star-outline"
                    title="Rate the App"
                    subtitle={t("account.subtitles.rateApp")}
                    onPress={() => console.log("Open app store")}
                />
            </View>

            {/* Legal Menu */}
            <View style={styles.menuContainer}>
                <Text
                    style={[
                        styles.menuSection,
                        { color: theme.colors.textSecondary },
                    ]}
                >
                    {t("account.sections.legal")}
                </Text>

                <MenuItem
                    icon="document-text-outline"
                    title={t("account.menu.terms")}
                    onPress={() => console.log("Navigate to terms")}
                />

                <MenuItem
                    icon="shield-checkmark-outline"
                    title={t("account.menu.privacy")}
                    onPress={() => console.log("Navigate to privacy")}
                />
            </View>

            {/* Sign Out */}
            <View style={styles.menuContainer}>
                <MenuItem
                    icon="log-out-outline"
                    title={t("account.menu.signOut")}
                    onPress={handleLogout}
                    iconColor={theme.colors.error}
                    rightIcon="log-out-outline"
                />
            </View>

            {/* Version */}
            <View style={styles.versionContainer}>
                <Text
                    style={[
                        styles.versionText,
                        { color: theme.colors.textLight },
                    ]}
                >
                    {t("account.menu.version")} 1.0.0
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 30,
    },
    signInContainer: {
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
        paddingVertical: 32,
    },
    signInIcon: {
        marginBottom: 24,
    },
    signInTitle: {
        fontSize: 24,
        fontWeight: "600",
        textAlign: "center",
        marginBottom: 8,
    },
    signInText: {
        fontSize: 16,
        textAlign: "center",
        lineHeight: 24,
        marginBottom: 32,
    },
    signInButtons: {
        gap: 16,
        width: "100%",
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
    registerButton: {
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        borderWidth: 2,
        alignItems: "center",
    },
    registerButtonText: {
        fontSize: 16,
        fontWeight: "600",
    },
    menuContainer: {
        marginBottom: 24,
        paddingHorizontal: 20,
    },
    menuSection: {
        fontSize: 14,
        fontWeight: "600",
        textTransform: "uppercase",
        marginBottom: 16,
        letterSpacing: 0.5,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(0, 0, 0, 0.05)",
    },
    menuItemLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    menuItemIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
    },
    menuItemContent: {
        flex: 1,
    },
    menuItemTitle: {
        fontSize: 16,
        marginBottom: 2,
    },
    menuItemSubtitle: {
        fontSize: 14,
    },
    menuItemRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    menuItemRightText: {
        fontSize: 14,
    },
    profileHeader: {
        padding: 20,
        marginBottom: 8,
    },
    profileInfo: {
        flexDirection: "row",
        alignItems: "center",
    },
    profileAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
    },
    profileAvatarText: {
        fontSize: 24,
        fontWeight: "bold",
    },
    profileDetails: {
        flex: 1,
    },
    profileName: {
        fontSize: 20,
        fontWeight: "bold",
    },
    profileEmail: {
        fontSize: 16,
    },
    versionContainer: {
        alignItems: "center",
        paddingVertical: 32,
    },
    versionText: {
        fontSize: 12,
    },
});
