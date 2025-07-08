import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useAppTheme } from "../../contexts/ThemeContext";
import {
    useLogout,
    useSession,
    useShippingAddresses,
} from "../../hooks/useApi";

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
        <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: theme.colors.card }]}
            onPress={onPress}
        >
            <View style={styles.menuItemLeft}>
                <Ionicons
                    name={icon as any}
                    size={24}
                    color={iconColor || theme.colors.primary}
                    style={styles.menuItemIcon}
                />
                <View style={styles.menuItemText}>
                    <Text
                        style={[
                            styles.menuItemTitle,
                            { color: theme.colors.text },
                        ]}
                    >
                        {title}
                    </Text>
                    {subtitle && (
                        <Text
                            style={[
                                styles.menuItemSubtitle,
                                { color: theme.colors.textSecondary },
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
                            { color: theme.colors.textSecondary },
                        ]}
                    >
                        {rightText}
                    </Text>
                )}
                <Ionicons
                    name={rightIcon as any}
                    size={20}
                    color={theme.colors.gray400}
                />
            </View>
        </TouchableOpacity>
    );
}

export default function AccountScreen() {
    const theme = useAppTheme();
    const { data: session } = useSession();
    const { data: addresses } = useShippingAddresses();
    const logoutMutation = useLogout();

    const handleLogout = () => {
        Alert.alert("Sign Out", "Are you sure you want to sign out?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Sign Out",
                style: "destructive",
                onPress: () => {
                    logoutMutation.mutate();
                },
            },
        ]);
    };

    // Show sign in prompt for non-authenticated users
    if (!session?.user) {
        return (
            <View
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
                        Sign in to your account
                    </Text>
                    <Text
                        style={[
                            styles.signInText,
                            { color: theme.colors.textSecondary },
                        ]}
                    >
                        Access your profile, orders, favorites, and personalized
                        recommendations.
                    </Text>

                    <View style={styles.signInButtons}>
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
                                Sign In
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.registerButton,
                                { borderColor: theme.colors.primary },
                            ]}
                            onPress={() => {
                                console.log("Navigate to register");
                            }}
                        >
                            <Text
                                style={[
                                    styles.registerButtonText,
                                    { color: theme.colors.primary },
                                ]}
                            >
                                Create Account
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Guest options */}
                <View style={styles.guestMenu}>
                    <Text
                        style={[
                            styles.menuSection,
                            { color: theme.colors.textSecondary },
                        ]}
                    >
                        Browse
                    </Text>

                    <MenuItem
                        icon="help-circle-outline"
                        title="Help & Support"
                        onPress={() => console.log("Navigate to help")}
                    />

                    <MenuItem
                        icon="document-text-outline"
                        title="Terms & Conditions"
                        onPress={() => console.log("Navigate to terms")}
                    />

                    <MenuItem
                        icon="shield-checkmark-outline"
                        title="Privacy Policy"
                        onPress={() => console.log("Navigate to privacy")}
                    />
                </View>
            </View>
        );
    }

    const defaultAddress = addresses?.find((addr) => addr.isDefault);

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: theme.colors.background },
            ]}
        >
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* User Profile Section */}
                <View
                    style={[
                        styles.profileSection,
                        { backgroundColor: theme.colors.card },
                    ]}
                >
                    <View style={styles.profileInfo}>
                        <View
                            style={[
                                styles.avatar,
                                { backgroundColor: theme.colors.primary },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.avatarText,
                                    { color: theme.colors.white },
                                ]}
                            >
                                {session.user.name.charAt(0).toUpperCase()}
                            </Text>
                        </View>

                        <View style={styles.userInfo}>
                            <Text
                                style={[
                                    styles.userName,
                                    { color: theme.colors.text },
                                ]}
                            >
                                {session.user.name}
                            </Text>
                            <Text
                                style={[
                                    styles.userEmail,
                                    { color: theme.colors.textSecondary },
                                ]}
                            >
                                {session.user.email}
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.editProfileButton,
                            { borderColor: theme.colors.primary },
                        ]}
                        onPress={() => console.log("Navigate to edit profile")}
                    >
                        <Text
                            style={[
                                styles.editProfileText,
                                { color: theme.colors.primary },
                            ]}
                        >
                            Edit Profile
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Account Menu */}
                <View style={styles.menuContainer}>
                    <Text
                        style={[
                            styles.menuSection,
                            { color: theme.colors.textSecondary },
                        ]}
                    >
                        Account
                    </Text>

                    <MenuItem
                        icon="location-outline"
                        title="Shipping Addresses"
                        subtitle={
                            defaultAddress
                                ? `${defaultAddress.street}, ${defaultAddress.city}`
                                : "Add address"
                        }
                        onPress={() => console.log("Navigate to addresses")}
                        rightText={addresses?.length?.toString()}
                    />

                    <MenuItem
                        icon="card-outline"
                        title="Payment Methods"
                        subtitle="Manage payment options"
                        onPress={() =>
                            console.log("Navigate to payment methods")
                        }
                    />

                    <MenuItem
                        icon="heart-outline"
                        title="Preferences"
                        subtitle="Reading preferences and recommendations"
                        onPress={() => console.log("Navigate to preferences")}
                    />

                    <MenuItem
                        icon="notifications-outline"
                        title="Notifications"
                        subtitle="Order updates and promotions"
                        onPress={() => console.log("Navigate to notifications")}
                    />
                </View>

                {/* Support Menu */}
                <View style={styles.menuContainer}>
                    <Text
                        style={[
                            styles.menuSection,
                            { color: theme.colors.textSecondary },
                        ]}
                    >
                        Support
                    </Text>

                    <MenuItem
                        icon="help-circle-outline"
                        title="Help & Support"
                        subtitle="FAQ and contact support"
                        onPress={() => console.log("Navigate to help")}
                    />

                    <MenuItem
                        icon="star-outline"
                        title="Rate the App"
                        subtitle="Share your feedback"
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
                        Legal
                    </Text>

                    <MenuItem
                        icon="document-text-outline"
                        title="Terms & Conditions"
                        onPress={() => console.log("Navigate to terms")}
                    />

                    <MenuItem
                        icon="shield-checkmark-outline"
                        title="Privacy Policy"
                        onPress={() => console.log("Navigate to privacy")}
                    />
                </View>

                {/* Sign Out */}
                <View style={styles.menuContainer}>
                    <MenuItem
                        icon="log-out-outline"
                        title="Sign Out"
                        onPress={handleLogout}
                        rightIcon="exit-outline"
                        iconColor={theme.colors.error}
                    />
                </View>

                {/* App Version */}
                <View style={styles.versionContainer}>
                    <Text
                        style={[
                            styles.versionText,
                            { color: theme.colors.textLight },
                        ]}
                    >
                        Version 1.0.0
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    signInContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
    },
    signInIcon: {
        marginBottom: 20,
    },
    signInTitle: {
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 8,
        textAlign: "center",
    },
    signInText: {
        fontSize: 16,
        textAlign: "center",
        lineHeight: 24,
        marginBottom: 32,
    },
    signInButtons: {
        width: "100%",
        gap: 12,
    },
    signInButton: {
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: "center",
    },
    signInButtonText: {
        fontSize: 16,
        fontWeight: "600",
    },
    registerButton: {
        paddingVertical: 16,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: "center",
    },
    registerButtonText: {
        fontSize: 16,
        fontWeight: "600",
    },
    guestMenu: {
        padding: 16,
    },
    profileSection: {
        padding: 20,
        marginBottom: 8,
    },
    profileInfo: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
    },
    avatarText: {
        fontSize: 24,
        fontWeight: "700",
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 16,
    },
    editProfileButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        borderWidth: 1,
        alignSelf: "flex-start",
    },
    editProfileText: {
        fontSize: 14,
        fontWeight: "600",
    },
    menuContainer: {
        marginBottom: 8,
    },
    menuSection: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 8,
        marginTop: 16,
        marginHorizontal: 16,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 1,
        borderRadius: 8,
    },
    menuItemLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    menuItemIcon: {
        marginRight: 16,
    },
    menuItemText: {
        flex: 1,
    },
    menuItemTitle: {
        fontSize: 16,
        fontWeight: "500",
        marginBottom: 2,
    },
    menuItemSubtitle: {
        fontSize: 14,
        lineHeight: 18,
    },
    menuItemRight: {
        flexDirection: "row",
        alignItems: "center",
    },
    menuItemRightText: {
        fontSize: 14,
        marginRight: 8,
    },
    versionContainer: {
        alignItems: "center",
        paddingVertical: 20,
    },
    versionText: {
        fontSize: 14,
    },
});
