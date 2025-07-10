import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useI18n } from "@/contexts/I18nContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAddShippingAddress } from "@/hooks/useApi";

interface AddressForm {
    firstName: string;
    lastName: string;
    company?: string;
    country: string;
    state?: string;
    city: string;
    street: string;
    postalCode: string;
    phoneNumber?: string;
    isDefault: boolean;
}

export default function AddAddressScreen() {
    const { t } = useI18n();
    const { theme } = useTheme();
    const [isDefault, setIsDefault] = useState(false);

    const addAddressMutation = useAddShippingAddress();

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<AddressForm>({
        defaultValues: {
            firstName: "",
            lastName: "",
            company: "",
            country: "",
            state: "",
            city: "",
            street: "",
            postalCode: "",
            phoneNumber: "",
            isDefault: false,
        },
    });

    const onSubmit = async (data: AddressForm) => {
        try {
            const addressData = {
                ...data,
                isDefault,
            };

            await addAddressMutation.mutateAsync(addressData);

            Alert.alert(
                t("addAddress.success.title"),
                t("addAddress.success.message"),
                [
                    {
                        text: "OK",
                        onPress: () => router.back(),
                    },
                ]
            );
        } catch (error) {
            console.error("Failed to add address:", error);
            Alert.alert(
                t("addAddress.error.title"),
                t("addAddress.error.message")
            );
        }
    };

    const handleCancel = () => {
        router.back();
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        header: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
        },
        headerTitle: {
            fontSize: 18,
            fontWeight: "600",
            color: theme.colors.text,
            flex: 1,
            textAlign: "center",
        },
        headerButton: {
            padding: 8,
        },
        scrollContainer: {
            flexGrow: 1,
        },
        content: {
            padding: 16,
        },
        formGroup: {
            marginBottom: 16,
        },
        label: {
            fontSize: 16,
            fontWeight: "500",
            color: theme.colors.text,
            marginBottom: 8,
        },
        input: {
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 12,
            fontSize: 16,
            color: theme.colors.text,
            backgroundColor: theme.colors.background,
        },
        inputError: {
            borderColor: "#e74c3c",
        },
        errorText: {
            color: "#e74c3c",
            fontSize: 14,
            marginTop: 4,
        },
        checkboxContainer: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 24,
        },
        checkbox: {
            width: 20,
            height: 20,
            borderWidth: 2,
            borderColor: theme.colors.primary,
            borderRadius: 4,
            marginRight: 12,
            alignItems: "center",
            justifyContent: "center",
        },
        checkboxChecked: {
            backgroundColor: theme.colors.primary,
        },
        checkboxText: {
            fontSize: 16,
            color: theme.colors.text,
            flex: 1,
        },
        saveButton: {
            backgroundColor: theme.colors.primary,
            paddingVertical: 16,
            borderRadius: 8,
            alignItems: "center",
            marginBottom: 16,
        },
        saveButtonText: {
            color: "#fff",
            fontSize: 16,
            fontWeight: "600",
        },
        saveButtonDisabled: {
            backgroundColor: theme.colors.textSecondary,
        },
    });

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={handleCancel}
                        style={styles.headerButton}
                    >
                        <Ionicons
                            name="close"
                            size={24}
                            color={theme.colors.text}
                        />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>
                        {t("addAddress.title")}
                    </Text>
                    <View style={styles.headerButton} />
                </View>

                <ScrollView
                    style={styles.scrollContainer}
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            {t("addAddress.form.firstName")}
                        </Text>
                        <Controller
                            control={control}
                            name="firstName"
                            rules={{
                                required: t(
                                    "addAddress.validation.firstNameRequired"
                                ),
                            }}
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    style={[
                                        styles.input,
                                        errors.firstName && styles.inputError,
                                    ]}
                                    value={value}
                                    onChangeText={onChange}
                                    placeholder={t(
                                        "addAddress.form.firstNamePlaceholder"
                                    )}
                                    placeholderTextColor={
                                        theme.colors.textSecondary
                                    }
                                />
                            )}
                        />
                        {errors.firstName && (
                            <Text style={styles.errorText}>
                                {errors.firstName.message}
                            </Text>
                        )}
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            {t("addAddress.form.lastName")}
                        </Text>
                        <Controller
                            control={control}
                            name="lastName"
                            rules={{
                                required: t(
                                    "addAddress.validation.lastNameRequired"
                                ),
                            }}
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    style={[
                                        styles.input,
                                        errors.lastName && styles.inputError,
                                    ]}
                                    value={value}
                                    onChangeText={onChange}
                                    placeholder={t(
                                        "addAddress.form.lastNamePlaceholder"
                                    )}
                                    placeholderTextColor={
                                        theme.colors.textSecondary
                                    }
                                />
                            )}
                        />
                        {errors.lastName && (
                            <Text style={styles.errorText}>
                                {errors.lastName.message}
                            </Text>
                        )}
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            {t("addAddress.form.company")}
                        </Text>
                        <Controller
                            control={control}
                            name="company"
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    style={styles.input}
                                    value={value}
                                    onChangeText={onChange}
                                    placeholder={t(
                                        "addAddress.form.companyPlaceholder"
                                    )}
                                    placeholderTextColor={
                                        theme.colors.textSecondary
                                    }
                                />
                            )}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            {t("addAddress.form.country")}
                        </Text>
                        <Controller
                            control={control}
                            name="country"
                            rules={{
                                required: t(
                                    "addAddress.validation.countryRequired"
                                ),
                            }}
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    style={[
                                        styles.input,
                                        errors.country && styles.inputError,
                                    ]}
                                    value={value}
                                    onChangeText={onChange}
                                    placeholder={t(
                                        "addAddress.form.countryPlaceholder"
                                    )}
                                    placeholderTextColor={
                                        theme.colors.textSecondary
                                    }
                                />
                            )}
                        />
                        {errors.country && (
                            <Text style={styles.errorText}>
                                {errors.country.message}
                            </Text>
                        )}
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            {t("addAddress.form.state")}
                        </Text>
                        <Controller
                            control={control}
                            name="state"
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    style={styles.input}
                                    value={value}
                                    onChangeText={onChange}
                                    placeholder={t(
                                        "addAddress.form.statePlaceholder"
                                    )}
                                    placeholderTextColor={
                                        theme.colors.textSecondary
                                    }
                                />
                            )}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            {t("addAddress.form.city")}
                        </Text>
                        <Controller
                            control={control}
                            name="city"
                            rules={{
                                required: t(
                                    "addAddress.validation.cityRequired"
                                ),
                            }}
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    style={[
                                        styles.input,
                                        errors.city && styles.inputError,
                                    ]}
                                    value={value}
                                    onChangeText={onChange}
                                    placeholder={t(
                                        "addAddress.form.cityPlaceholder"
                                    )}
                                    placeholderTextColor={
                                        theme.colors.textSecondary
                                    }
                                />
                            )}
                        />
                        {errors.city && (
                            <Text style={styles.errorText}>
                                {errors.city.message}
                            </Text>
                        )}
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            {t("addAddress.form.street")}
                        </Text>
                        <Controller
                            control={control}
                            name="street"
                            rules={{
                                required: t(
                                    "addAddress.validation.streetRequired"
                                ),
                            }}
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    style={[
                                        styles.input,
                                        errors.street && styles.inputError,
                                    ]}
                                    value={value}
                                    onChangeText={onChange}
                                    placeholder={t(
                                        "addAddress.form.streetPlaceholder"
                                    )}
                                    placeholderTextColor={
                                        theme.colors.textSecondary
                                    }
                                />
                            )}
                        />
                        {errors.street && (
                            <Text style={styles.errorText}>
                                {errors.street.message}
                            </Text>
                        )}
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            {t("addAddress.form.postalCode")}
                        </Text>
                        <Controller
                            control={control}
                            name="postalCode"
                            rules={{
                                required: t(
                                    "addAddress.validation.postalCodeRequired"
                                ),
                            }}
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    style={[
                                        styles.input,
                                        errors.postalCode && styles.inputError,
                                    ]}
                                    value={value}
                                    onChangeText={onChange}
                                    placeholder={t(
                                        "addAddress.form.postalCodePlaceholder"
                                    )}
                                    placeholderTextColor={
                                        theme.colors.textSecondary
                                    }
                                />
                            )}
                        />
                        {errors.postalCode && (
                            <Text style={styles.errorText}>
                                {errors.postalCode.message}
                            </Text>
                        )}
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            {t("addAddress.form.phoneNumber")}
                        </Text>
                        <Controller
                            control={control}
                            name="phoneNumber"
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    style={styles.input}
                                    value={value}
                                    onChangeText={onChange}
                                    placeholder={t(
                                        "addAddress.form.phoneNumberPlaceholder"
                                    )}
                                    placeholderTextColor={
                                        theme.colors.textSecondary
                                    }
                                    keyboardType="phone-pad"
                                />
                            )}
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.checkboxContainer}
                        onPress={() => setIsDefault(!isDefault)}
                    >
                        <View
                            style={[
                                styles.checkbox,
                                isDefault && styles.checkboxChecked,
                            ]}
                        >
                            {isDefault && (
                                <Ionicons
                                    name="checkmark"
                                    size={14}
                                    color="#fff"
                                />
                            )}
                        </View>
                        <Text style={styles.checkboxText}>
                            {t("addAddress.form.setAsDefault")}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.saveButton,
                            addAddressMutation.isPending &&
                                styles.saveButtonDisabled,
                        ]}
                        onPress={handleSubmit(onSubmit)}
                        disabled={addAddressMutation.isPending}
                    >
                        <Text style={styles.saveButtonText}>
                            {addAddressMutation.isPending
                                ? t("addAddress.buttons.saving")
                                : t("addAddress.buttons.save")}
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
