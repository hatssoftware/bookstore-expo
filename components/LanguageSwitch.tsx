import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useI18n } from "../contexts/I18nContext";
import { useAppTheme } from "../contexts/ThemeContext";

interface LanguageSwitchProps {
    onPress: () => void;
}

export default function LanguageSwitch({ onPress }: LanguageSwitchProps) {
    const theme = useAppTheme();
    const { locale, t, changeLanguage, availableLanguages } = useI18n();
    const [modalVisible, setModalVisible] = useState(false);

    const handleLanguageChange = async (languageCode: "en" | "es" | "cs") => {
        try {
            await changeLanguage(languageCode);
            setModalVisible(false);
            onPress();
        } catch (error) {
            Alert.alert(t("common.error"), "Failed to change language");
        }
    };

    const openLanguageModal = () => {
        setModalVisible(true);
    };

    const currentLanguageName =
        availableLanguages.find((lang) => lang.code === locale)?.name ||
        "English";

    return (
        <>
            <TouchableOpacity
                style={[
                    styles.languageButton,
                    { backgroundColor: theme.colors.card },
                ]}
                onPress={openLanguageModal}
            >
                <View style={styles.languageButtonLeft}>
                    <Ionicons
                        name="language-outline"
                        size={24}
                        color={theme.colors.primary}
                        style={styles.languageIcon}
                    />
                    <View style={styles.languageText}>
                        <Text
                            style={[
                                styles.languageTitle,
                                { color: theme.colors.text },
                            ]}
                        >
                            {t("account.menu.language")}
                        </Text>
                        <Text
                            style={[
                                styles.languageSubtitle,
                                { color: theme.colors.textSecondary },
                            ]}
                        >
                            {currentLanguageName}
                        </Text>
                    </View>
                </View>
                <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={theme.colors.gray400}
                />
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View
                        style={[
                            styles.modalContent,
                            { backgroundColor: theme.colors.card },
                        ]}
                    >
                        <View style={styles.modalHeader}>
                            <Text
                                style={[
                                    styles.modalTitle,
                                    { color: theme.colors.text },
                                ]}
                            >
                                {t("account.menu.selectLanguage")}
                            </Text>
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                style={styles.closeButton}
                            >
                                <Ionicons
                                    name="close"
                                    size={24}
                                    color={theme.colors.text}
                                />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.languageList}>
                            {availableLanguages.map((language) => (
                                <TouchableOpacity
                                    key={language.code}
                                    style={[
                                        styles.languageOption,
                                        {
                                            borderBottomColor:
                                                theme.colors.border,
                                        },
                                    ]}
                                    onPress={() =>
                                        handleLanguageChange(language.code)
                                    }
                                >
                                    <Text
                                        style={[
                                            styles.languageOptionText,
                                            { color: theme.colors.text },
                                        ]}
                                    >
                                        {language.name}
                                    </Text>
                                    {locale === language.code && (
                                        <Ionicons
                                            name="checkmark"
                                            size={24}
                                            color={theme.colors.primary}
                                        />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    languageButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        marginHorizontal: 16,
        marginVertical: 4,
        borderRadius: 12,
    },
    languageButtonLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    languageIcon: {
        marginRight: 12,
    },
    languageText: {
        flex: 1,
    },
    languageTitle: {
        fontSize: 16,
        fontWeight: "500",
        marginBottom: 2,
    },
    languageSubtitle: {
        fontSize: 14,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        width: "80%",
        maxHeight: "60%",
        borderRadius: 16,
        overflow: "hidden",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "600",
    },
    closeButton: {
        padding: 4,
    },
    languageList: {
        maxHeight: 300,
    },
    languageOption: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
    },
    languageOptionText: {
        fontSize: 16,
    },
});
