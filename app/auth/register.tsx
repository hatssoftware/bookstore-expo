import { useI18n } from "@/contexts/I18nContext";
import { useAppTheme } from "@/contexts/ThemeContext";
import { useRegister, useRegisterAlternative } from "@/hooks/useApi";
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
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    gender?: string;
    age?: string;
    agreedToDataProcessing: boolean;
}

interface FormErrors {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    age?: string;
    terms?: string;
    general?: string;
}

const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
    { value: "prefer_not_to_say", label: "Prefer not to say" },
];

export default function RegisterScreen() {
    const theme = useAppTheme();
    const { t } = useI18n();
    const registerMutation = useRegister();
    const registerAlternativeMutation = useRegisterAlternative();

    const [formData, setFormData] = useState<FormData>({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        gender: "",
        age: "",
        agreedToDataProcessing: false,
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showGenderPicker, setShowGenderPicker] = useState(false);

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = t("auth.errors.nameRequired");
        }

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

        // Confirm password validation
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = t("auth.errors.passwordsDoNotMatch");
        }

        // Age validation (if provided)
        if (
            formData.age &&
            (isNaN(Number(formData.age)) ||
                Number(formData.age) < 1 ||
                Number(formData.age) > 150)
        ) {
            newErrors.age = "Please enter a valid age";
        }

        // Terms agreement validation
        if (!formData.agreedToDataProcessing) {
            newErrors.terms = t("auth.errors.termsRequired");
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (
        field: keyof FormData,
        value: string | boolean
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear errors when user starts typing
        if (errors[field as keyof FormErrors]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
        if (errors.general) {
            setErrors((prev) => ({ ...prev, general: undefined }));
        }
    };

    const handleRegister = async () => {
        if (!validateForm()) return;

        const baseRegistrationData = {
            name: formData.name.trim(),
            email: formData.email.trim(),
            password: formData.password,
            agreedToDataProcessing: formData.agreedToDataProcessing,
            ...(formData.gender && { gender: formData.gender }),
            ...(formData.age && { age: Number(formData.age) }),
        };

        try {
            console.log(
                "Attempting registration with /auth/register endpoint:",
                baseRegistrationData
            );
            await registerMutation.mutateAsync(baseRegistrationData);

            Alert.alert("Success", t("auth.success.accountCreated"), [
                {
                    text: "OK",
                    onPress: () => router.push("/auth/login"),
                },
            ]);
        } catch (error: any) {
            console.log("First registration attempt failed:", error);
            console.log("Error status:", error.status);
            console.log("Error message:", error.message);

            // If first method fails with 400, try alternative endpoint
            if (error.status === 400) {
                try {
                    const alternativeRegistrationData = {
                        ...baseRegistrationData,
                        referralSource: "app", // Add default referral source
                    };

                    console.log(
                        "Trying alternative registration with /register endpoint:",
                        alternativeRegistrationData
                    );
                    await registerAlternativeMutation.mutateAsync(
                        alternativeRegistrationData
                    );

                    Alert.alert("Success", t("auth.success.accountCreated"), [
                        {
                            text: "OK",
                            onPress: () => router.push("/auth/login"),
                        },
                    ]);
                    return;
                } catch (alternativeError: any) {
                    console.log(
                        "Alternative registration also failed:",
                        alternativeError
                    );
                    console.log(
                        "Alternative error status:",
                        alternativeError.status
                    );
                    console.log(
                        "Alternative error message:",
                        alternativeError.message
                    );
                }
            }

            // Handle errors
            let errorMessage = t("auth.errors.unknownError");

            if (error.status === 400) {
                if (error.message?.includes("email")) {
                    errorMessage = t("auth.errors.emailAlreadyExists");
                } else {
                    // For debugging, show the actual error message if it's a 400
                    errorMessage =
                        error.message ||
                        "Registration failed - missing required fields";
                }
            } else if (error.isApiUnavailable) {
                errorMessage = t("auth.errors.networkError");
            }

            setErrors({ general: errorMessage });
        }
    };

    const isLoading =
        registerMutation.isPending || registerAlternativeMutation.isPending;

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
                                {t("auth.register.title")}
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
                                {t("auth.register.subtitle")}
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

                            {/* Name Input */}
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
                                    {t("auth.register.nameLabel")}
                                </Text>
                                <TextInput
                                    style={[
                                        styles.input,
                                        {
                                            backgroundColor:
                                                theme.colors.surface,
                                            borderColor: errors.name
                                                ? theme.colors.error
                                                : theme.colors.border,
                                            color: theme.colors.text,
                                            fontFamily:
                                                theme.typography.fontFamily
                                                    .regular,
                                        },
                                    ]}
                                    placeholder={t(
                                        "auth.register.namePlaceholder"
                                    )}
                                    placeholderTextColor={
                                        theme.colors.textLight
                                    }
                                    value={formData.name}
                                    onChangeText={(text) =>
                                        handleInputChange("name", text)
                                    }
                                    autoCapitalize="words"
                                    autoCorrect={false}
                                    editable={!isLoading}
                                />
                                {errors.name && (
                                    <Text
                                        style={[
                                            styles.fieldError,
                                            { color: theme.colors.error },
                                        ]}
                                    >
                                        {errors.name}
                                    </Text>
                                )}
                            </View>

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
                                    {t("auth.register.emailLabel")}
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
                                        "auth.register.emailPlaceholder"
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
                                    {t("auth.register.passwordLabel")}
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
                                            "auth.register.passwordPlaceholder"
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

                            {/* Confirm Password Input */}
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
                                    {t("auth.register.confirmPasswordLabel")}
                                </Text>
                                <View style={styles.passwordInputContainer}>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            styles.passwordInput,
                                            {
                                                backgroundColor:
                                                    theme.colors.surface,
                                                borderColor:
                                                    errors.confirmPassword
                                                        ? theme.colors.error
                                                        : theme.colors.border,
                                                color: theme.colors.text,
                                                fontFamily:
                                                    theme.typography.fontFamily
                                                        .regular,
                                            },
                                        ]}
                                        placeholder={t(
                                            "auth.register.confirmPasswordPlaceholder"
                                        )}
                                        placeholderTextColor={
                                            theme.colors.textLight
                                        }
                                        value={formData.confirmPassword}
                                        onChangeText={(text) =>
                                            handleInputChange(
                                                "confirmPassword",
                                                text
                                            )
                                        }
                                        secureTextEntry={!showConfirmPassword}
                                        editable={!isLoading}
                                    />
                                    <TouchableOpacity
                                        style={styles.passwordToggle}
                                        onPress={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword
                                            )
                                        }
                                        disabled={isLoading}
                                    >
                                        <Ionicons
                                            name={
                                                showConfirmPassword
                                                    ? "eye-off"
                                                    : "eye"
                                            }
                                            size={20}
                                            color={theme.colors.textLight}
                                        />
                                    </TouchableOpacity>
                                </View>
                                {errors.confirmPassword && (
                                    <Text
                                        style={[
                                            styles.fieldError,
                                            { color: theme.colors.error },
                                        ]}
                                    >
                                        {errors.confirmPassword}
                                    </Text>
                                )}
                            </View>

                            {/* Gender Input (Optional) */}
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
                                    {t("auth.register.genderLabel")}
                                </Text>
                                <TouchableOpacity
                                    style={[
                                        styles.input,
                                        styles.pickerInput,
                                        {
                                            backgroundColor:
                                                theme.colors.surface,
                                            borderColor: theme.colors.border,
                                        },
                                    ]}
                                    onPress={() =>
                                        setShowGenderPicker(!showGenderPicker)
                                    }
                                    disabled={isLoading}
                                >
                                    <Text
                                        style={[
                                            styles.pickerText,
                                            {
                                                color: formData.gender
                                                    ? theme.colors.text
                                                    : theme.colors.textLight,
                                                fontFamily:
                                                    theme.typography.fontFamily
                                                        .regular,
                                            },
                                        ]}
                                    >
                                        {formData.gender
                                            ? genderOptions.find(
                                                  (option) =>
                                                      option.value ===
                                                      formData.gender
                                              )?.label
                                            : t(
                                                  "auth.register.genderPlaceholder"
                                              )}
                                    </Text>
                                    <Ionicons
                                        name={
                                            showGenderPicker
                                                ? "chevron-up"
                                                : "chevron-down"
                                        }
                                        size={20}
                                        color={theme.colors.textLight}
                                    />
                                </TouchableOpacity>

                                {/* Gender Options */}
                                {showGenderPicker && (
                                    <View
                                        style={[
                                            styles.pickerOptions,
                                            {
                                                backgroundColor:
                                                    theme.colors.surface,
                                                borderColor:
                                                    theme.colors.border,
                                            },
                                        ]}
                                    >
                                        {genderOptions.map((option) => (
                                            <TouchableOpacity
                                                key={option.value}
                                                style={[
                                                    styles.pickerOption,
                                                    {
                                                        backgroundColor:
                                                            formData.gender ===
                                                            option.value
                                                                ? theme.colors
                                                                      .primary +
                                                                  "10"
                                                                : "transparent",
                                                    },
                                                ]}
                                                onPress={() => {
                                                    handleInputChange(
                                                        "gender",
                                                        option.value
                                                    );
                                                    setShowGenderPicker(false);
                                                }}
                                            >
                                                <Text
                                                    style={[
                                                        styles.pickerOptionText,
                                                        {
                                                            color: theme.colors
                                                                .text,
                                                            fontFamily:
                                                                theme.typography
                                                                    .fontFamily
                                                                    .regular,
                                                        },
                                                    ]}
                                                >
                                                    {option.label}
                                                </Text>
                                                {formData.gender ===
                                                    option.value && (
                                                    <Ionicons
                                                        name="checkmark"
                                                        size={20}
                                                        color={
                                                            theme.colors.primary
                                                        }
                                                    />
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>

                            {/* Age Input (Optional) */}
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
                                    {t("auth.register.ageLabel")}
                                </Text>
                                <TextInput
                                    style={[
                                        styles.input,
                                        {
                                            backgroundColor:
                                                theme.colors.surface,
                                            borderColor: errors.age
                                                ? theme.colors.error
                                                : theme.colors.border,
                                            color: theme.colors.text,
                                            fontFamily:
                                                theme.typography.fontFamily
                                                    .regular,
                                        },
                                    ]}
                                    placeholder={t(
                                        "auth.register.agePlaceholder"
                                    )}
                                    placeholderTextColor={
                                        theme.colors.textLight
                                    }
                                    value={formData.age}
                                    onChangeText={(text) =>
                                        handleInputChange("age", text)
                                    }
                                    keyboardType="numeric"
                                    editable={!isLoading}
                                />
                                {errors.age && (
                                    <Text
                                        style={[
                                            styles.fieldError,
                                            { color: theme.colors.error },
                                        ]}
                                    >
                                        {errors.age}
                                    </Text>
                                )}
                            </View>

                            {/* Terms Agreement */}
                            <View style={styles.inputGroup}>
                                <TouchableOpacity
                                    style={styles.checkboxContainer}
                                    onPress={() =>
                                        handleInputChange(
                                            "agreedToDataProcessing",
                                            !formData.agreedToDataProcessing
                                        )
                                    }
                                    disabled={isLoading}
                                >
                                    <View
                                        style={[
                                            styles.checkbox,
                                            {
                                                backgroundColor:
                                                    formData.agreedToDataProcessing
                                                        ? theme.colors.primary
                                                        : theme.colors.surface,
                                                borderColor: errors.terms
                                                    ? theme.colors.error
                                                    : formData.agreedToDataProcessing
                                                    ? theme.colors.primary
                                                    : theme.colors.border,
                                            },
                                        ]}
                                    >
                                        {formData.agreedToDataProcessing && (
                                            <Ionicons
                                                name="checkmark"
                                                size={16}
                                                color={theme.colors.white}
                                            />
                                        )}
                                    </View>
                                    <Text
                                        style={[
                                            styles.checkboxText,
                                            {
                                                color: theme.colors.text,
                                                fontFamily:
                                                    theme.typography.fontFamily
                                                        .regular,
                                            },
                                        ]}
                                    >
                                        {t("auth.register.agreeToTerms")}
                                    </Text>
                                </TouchableOpacity>
                                {errors.terms && (
                                    <Text
                                        style={[
                                            styles.fieldError,
                                            { color: theme.colors.error },
                                        ]}
                                    >
                                        {errors.terms}
                                    </Text>
                                )}
                            </View>

                            {/* Create Account Button */}
                            <TouchableOpacity
                                style={[
                                    styles.submitButton,
                                    {
                                        backgroundColor: theme.colors.primary,
                                        opacity: isLoading ? 0.7 : 1,
                                    },
                                ]}
                                onPress={handleRegister}
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
                                        ? t("auth.register.creatingAccount")
                                        : t(
                                              "auth.register.createAccountButton"
                                          )}
                                </Text>
                            </TouchableOpacity>

                            {/* Sign In Link */}
                            <TouchableOpacity
                                style={styles.signInLink}
                                onPress={() => router.push("/auth/login")}
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
                                    {t("auth.register.signInLink")}
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
    pickerInput: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    pickerText: {
        fontSize: 16,
    },
    pickerOptions: {
        borderWidth: 1,
        borderRadius: 12,
        marginTop: 4,
    },
    pickerOption: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(0,0,0,0.05)",
    },
    pickerOptionText: {
        fontSize: 16,
    },
    checkboxContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderRadius: 4,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 2,
    },
    checkboxText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
    },
    fieldError: {
        fontSize: 14,
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
    signInLink: {
        alignItems: "center",
        marginTop: 8,
    },
});
