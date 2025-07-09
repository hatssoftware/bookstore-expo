import { useI18n } from "@/contexts/I18nContext";
import { useAppTheme } from "@/contexts/ThemeContext";
import { useUser } from "@/contexts/UserContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface FormData {
    email: string;
    password: string;
}

interface FormErrors {
    email?: string;
    password?: string;
    general?: string;
}

export default function LoginScreen() {
    const theme = useAppTheme();
    const { t } = useI18n();
    const { login, isLoading: userLoading } = useUser();

    const [formData, setFormData] = useState<FormData>({
        email: "",
        password: "",
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        // Email validation
        if (!formData.email.trim()) {
            newErrors.email = t("auth.errors.invalidEmail");
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = t("auth.errors.invalidEmail");
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = t("auth.errors.passwordTooShort");
        } else if (formData.password.length < 6) {
            newErrors.password = t("auth.errors.passwordTooShort");
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear errors when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
        if (errors.general) {
            setErrors((prev) => ({ ...prev, general: undefined }));
        }
    };

    const handleLogin = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            console.log("LoginScreen: Starting login attempt...");
            console.log("LoginScreen: Form data:", {
                email: formData.email.trim(),
                passwordLength: formData.password.length,
            });

            console.log("LoginScreen: Calling UserContext.login...");
            await login(formData.email.trim(), formData.password);

            console.log("LoginScreen: Login successful, showing success alert");
            Alert.alert("Success", t("auth.success.loginSuccessful"), [
                {
                    text: "OK",
                    onPress: () => {
                        console.log(
                            "LoginScreen: Success alert dismissed, navigating back"
                        );
                        router.back();
                    },
                },
            ]);
        } catch (error: any) {
            console.log("LoginScreen: Login failed, handling error...");
            console.log("LoginScreen: Error object:", error);
            console.log("LoginScreen: Error type:", typeof error);
            console.log(
                "LoginScreen: Error instanceof Error:",
                error instanceof Error
            );
            console.log("LoginScreen: Error status:", error.status);
            console.log("LoginScreen: Error message:", error.message);
            console.log(
                "LoginScreen: Error isApiUnavailable:",
                error.isApiUnavailable
            );
            console.log(
                "LoginScreen: Full error details:",
                JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
            );

            let errorMessage = t("auth.errors.unknownError");

            if (error.status === 401 || error.status === 400) {
                console.log("LoginScreen: Setting invalid credentials error");
                errorMessage = t("auth.errors.invalidCredentials");
            } else if (error.isApiUnavailable) {
                console.log("LoginScreen: Setting network error");
                errorMessage = t("auth.errors.networkError");
            } else {
                console.log(
                    "LoginScreen: Using actual error message for debugging"
                );
                // Show actual error message for debugging
                errorMessage = error.message || t("auth.errors.unknownError");
            }

            console.log("LoginScreen: Final error message:", errorMessage);
            setErrors({ general: errorMessage });
        } finally {
            setIsSubmitting(false);
            console.log("LoginScreen: Login process finished");
        }
    };

    const isLoading = userLoading || isSubmitting;

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: theme.colors.background },
            ]}
        >
            <StatusBar
                barStyle="dark-content"
                backgroundColor={theme.colors.background}
            />

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={[
                            styles.backButton,
                            { backgroundColor: theme.colors.surface },
                        ]}
                        onPress={() => router.back()}
                        disabled={isLoading}
                    >
                        <Ionicons
                            name="arrow-back"
                            size={24}
                            color={theme.colors.text}
                        />
                    </TouchableOpacity>
                </View>

                <KeyboardAvoidingView
                    style={styles.keyboardAvoidingView}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                >
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Title Section */}
                        <View style={styles.titleSection}>
                            <Text
                                style={[
                                    styles.title,
                                    {
                                        color: theme.colors.text,
                                        fontFamily:
                                            theme.typography.fontFamily.bold,
                                    },
                                ]}
                            >
                                {t("auth.login.title")}
                            </Text>
                            <Text
                                style={[
                                    styles.subtitle,
                                    {
                                        color: theme.colors.textSecondary,
                                        fontFamily:
                                            theme.typography.fontFamily.regular,
                                    },
                                ]}
                            >
                                {t("auth.login.subtitle")}
                            </Text>
                        </View>

                        {/* Form */}
                        <View style={styles.form}>
                            {/* General Error */}
                            {errors.general && (
                                <View
                                    style={[
                                        styles.errorContainer,
                                        {
                                            backgroundColor:
                                                theme.colors.error + "15",
                                            borderColor: theme.colors.error,
                                        },
                                    ]}
                                >
                                    <Ionicons
                                        name="alert-circle"
                                        size={20}
                                        color={theme.colors.error}
                                    />
                                    <Text
                                        style={[
                                            styles.errorText,
                                            { color: theme.colors.error },
                                        ]}
                                    >
                                        {errors.general}
                                    </Text>
                                </View>
                            )}

                            {/* Email Input */}
                            <View style={styles.inputGroup}>
                                <Text
                                    style={[
                                        styles.label,
                                        {
                                            color: theme.colors.text,
                                            fontFamily:
                                                theme.typography.fontFamily
                                                    .medium,
                                        },
                                    ]}
                                >
                                    {t("auth.login.emailLabel")}
                                </Text>
                                <TextInput
                                    style={[
                                        styles.input,
                                        {
                                            backgroundColor:
                                                theme.colors.surface,
                                            borderColor: errors.email
                                                ? theme.colors.error
                                                : theme.colors.border,
                                            color: theme.colors.text,
                                            fontFamily:
                                                theme.typography.fontFamily
                                                    .regular,
                                        },
                                    ]}
                                    placeholder={t(
                                        "auth.login.emailPlaceholder"
                                    )}
                                    placeholderTextColor={
                                        theme.colors.textLight
                                    }
                                    value={formData.email}
                                    onChangeText={(text) =>
                                        handleInputChange("email", text)
                                    }
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    editable={!isLoading}
                                />
                                {errors.email && (
                                    <Text
                                        style={[
                                            styles.fieldError,
                                            { color: theme.colors.error },
                                        ]}
                                    >
                                        {errors.email}
                                    </Text>
                                )}
                            </View>

                            {/* Password Input */}
                            <View style={styles.inputGroup}>
                                <Text
                                    style={[
                                        styles.label,
                                        {
                                            color: theme.colors.text,
                                            fontFamily:
                                                theme.typography.fontFamily
                                                    .medium,
                                        },
                                    ]}
                                >
                                    {t("auth.login.passwordLabel")}
                                </Text>
                                <View style={styles.passwordInputContainer}>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            styles.passwordInput,
                                            {
                                                backgroundColor:
                                                    theme.colors.surface,
                                                borderColor: errors.password
                                                    ? theme.colors.error
                                                    : theme.colors.border,
                                                color: theme.colors.text,
                                                fontFamily:
                                                    theme.typography.fontFamily
                                                        .regular,
                                            },
                                        ]}
                                        placeholder={t(
                                            "auth.login.passwordPlaceholder"
                                        )}
                                        placeholderTextColor={
                                            theme.colors.textLight
                                        }
                                        value={formData.password}
                                        onChangeText={(text) =>
                                            handleInputChange("password", text)
                                        }
                                        secureTextEntry={!showPassword}
                                        editable={!isLoading}
                                    />
                                    <TouchableOpacity
                                        style={styles.passwordToggle}
                                        onPress={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        disabled={isLoading}
                                    >
                                        <Ionicons
                                            name={
                                                showPassword ? "eye-off" : "eye"
                                            }
                                            size={20}
                                            color={theme.colors.textLight}
                                        />
                                    </TouchableOpacity>
                                </View>
                                {errors.password && (
                                    <Text
                                        style={[
                                            styles.fieldError,
                                            { color: theme.colors.error },
                                        ]}
                                    >
                                        {errors.password}
                                    </Text>
                                )}
                            </View>

                            {/* Forgot Password Link */}
                            <TouchableOpacity
                                style={styles.forgotPasswordLink}
                                disabled={isLoading}
                            >
                                <Text
                                    style={[
                                        styles.linkText,
                                        {
                                            color: theme.colors.secondary,
                                            fontFamily:
                                                theme.typography.fontFamily
                                                    .medium,
                                        },
                                    ]}
                                >
                                    {t("auth.login.forgotPasswordLink")}
                                </Text>
                            </TouchableOpacity>

                            {/* Sign In Button */}
                            <TouchableOpacity
                                style={[
                                    styles.submitButton,
                                    {
                                        backgroundColor: theme.colors.primary,
                                        opacity: isLoading ? 0.7 : 1,
                                    },
                                ]}
                                onPress={handleLogin}
                                disabled={isLoading}
                            >
                                <Text
                                    style={[
                                        styles.submitButtonText,
                                        {
                                            color: theme.colors.white,
                                            fontFamily:
                                                theme.typography.fontFamily
                                                    .semibold,
                                        },
                                    ]}
                                >
                                    {isLoading
                                        ? t("auth.login.signingIn")
                                        : t("auth.login.signInButton")}
                                </Text>
                            </TouchableOpacity>

                            {/* Create Account Link */}
                            <TouchableOpacity
                                style={styles.createAccountLink}
                                onPress={() => router.replace("/auth/register")}
                                disabled={isLoading}
                            >
                                <Text
                                    style={[
                                        styles.linkText,
                                        {
                                            color: theme.colors.secondary,
                                            fontFamily:
                                                theme.typography.fontFamily
                                                    .medium,
                                        },
                                    ]}
                                >
                                    {t("auth.login.createAccountLink")}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    titleSection: {
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        lineHeight: 24,
    },
    form: {
        gap: 24,
    },
    errorContainer: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        gap: 12,
    },
    errorText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 16,
    },
    input: {
        height: 56,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
    },
    passwordInputContainer: {
        position: "relative",
    },
    passwordInput: {
        paddingRight: 52,
    },
    passwordToggle: {
        position: "absolute",
        right: 16,
        top: 18,
    },
    fieldError: {
        fontSize: 14,
    },
    forgotPasswordLink: {
        alignSelf: "flex-end",
    },
    linkText: {
        fontSize: 14,
    },
    submitButton: {
        height: 56,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 8,
    },
    submitButtonText: {
        fontSize: 16,
    },
    createAccountLink: {
        alignItems: "center",
        marginTop: 8,
    },
});
