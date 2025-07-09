import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useApiStatus } from "../contexts/ApiStatusContext";
import { useI18n } from "../contexts/I18nContext";
import { useAppTheme } from "../contexts/ThemeContext";

interface ApiErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    showRetry?: boolean;
    minimalUI?: boolean;
}

export function ApiErrorBoundary({
    children,
    fallback,
    showRetry = true,
    minimalUI = false,
}: ApiErrorBoundaryProps) {
    const { isApiAvailable, apiError, retryConnection } = useApiStatus();
    const theme = useAppTheme();
    const { t } = useI18n();

    // If API is available, render children normally
    if (isApiAvailable) {
        return <>{children}</>;
    }

    // If custom fallback is provided, use it
    if (fallback) {
        return <>{fallback}</>;
    }

    // Default error UI
    if (minimalUI) {
        return (
            <View
                style={[
                    styles.minimalContainer,
                    { backgroundColor: theme.colors.surface },
                ]}
            >
                <View style={styles.minimalContent}>
                    <Ionicons
                        name="cloud-offline-outline"
                        size={24}
                        color={theme.colors.textSecondary}
                    />
                    <Text
                        style={[
                            styles.minimalText,
                            {
                                color: theme.colors.textSecondary,
                                fontFamily: theme.typography.fontFamily.medium,
                            },
                        ]}
                    >
                        {t("api.error.offline")}
                    </Text>
                    {showRetry && (
                        <TouchableOpacity
                            style={[
                                styles.minimalRetryButton,
                                { borderColor: theme.colors.primary },
                            ]}
                            onPress={retryConnection}
                        >
                            <Ionicons
                                name="refresh"
                                size={16}
                                color={theme.colors.primary}
                            />
                        </TouchableOpacity>
                    )}
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
            <View style={styles.content}>
                <View
                    style={[
                        styles.iconContainer,
                        { backgroundColor: theme.colors.surface },
                    ]}
                >
                    <Ionicons
                        name="cloud-offline"
                        size={64}
                        color={theme.colors.textLight}
                    />
                </View>

                <Text
                    style={[
                        styles.title,
                        {
                            color: theme.colors.text,
                            fontFamily: theme.typography.fontFamily.bold,
                        },
                    ]}
                >
                    {t("api.error.title")}
                </Text>

                <Text
                    style={[
                        styles.message,
                        {
                            color: theme.colors.textSecondary,
                            fontFamily: theme.typography.fontFamily.regular,
                        },
                    ]}
                >
                    {apiError || t("api.error.defaultMessage")}
                </Text>

                <Text
                    style={[
                        styles.explanation,
                        {
                            color: theme.colors.textLight,
                            fontFamily: theme.typography.fontFamily.regular,
                        },
                    ]}
                >
                    {t("api.error.explanation")}
                </Text>

                {showRetry && (
                    <TouchableOpacity
                        style={[
                            styles.retryButton,
                            { backgroundColor: theme.colors.primary },
                        ]}
                        onPress={retryConnection}
                    >
                        <Ionicons
                            name="refresh"
                            size={20}
                            color={theme.colors.white}
                            style={styles.retryIcon}
                        />
                        <Text
                            style={[
                                styles.retryText,
                                {
                                    color: theme.colors.white,
                                    fontFamily:
                                        theme.typography.fontFamily.semibold,
                                },
                            ]}
                        >
                            {t("api.error.retryButton")}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
    },
    content: {
        alignItems: "center",
        maxWidth: 300,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        textAlign: "center",
        marginBottom: 12,
    },
    message: {
        fontSize: 16,
        textAlign: "center",
        lineHeight: 24,
        marginBottom: 16,
    },
    explanation: {
        fontSize: 14,
        textAlign: "center",
        lineHeight: 20,
        marginBottom: 32,
    },
    retryButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    retryIcon: {
        marginRight: 8,
    },
    retryText: {
        fontSize: 16,
    },

    // Minimal UI styles
    minimalContainer: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginHorizontal: 16,
        marginVertical: 8,
    },
    minimalContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    minimalText: {
        fontSize: 14,
        marginLeft: 8,
        marginRight: 12,
    },
    minimalRetryButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});
