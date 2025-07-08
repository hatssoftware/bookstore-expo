import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "../contexts/ThemeContext";

interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    onSearch?: () => void;
    placeholder?: string;
    autoFocus?: boolean;
}

export function SearchBar({
    value,
    onChangeText,
    onSearch,
    placeholder = "Search books...",
    autoFocus = false,
}: SearchBarProps) {
    const theme = useAppTheme();

    const handleClear = () => {
        onChangeText("");
    };

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: theme.colors.backgroundSecondary },
            ]}
        >
            <View
                style={[
                    styles.searchContainer,
                    {
                        backgroundColor: theme.colors.white,
                        borderColor: theme.colors.border,
                    },
                ]}
            >
                <Ionicons
                    name="search"
                    size={20}
                    color={theme.colors.gray400}
                    style={styles.searchIcon}
                />

                <TextInput
                    style={[
                        styles.input,
                        {
                            color: theme.colors.text,
                            fontSize: theme.typography.fontSize.base,
                        },
                    ]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={theme.colors.gray400}
                    autoFocus={autoFocus}
                    returnKeyType="search"
                    onSubmitEditing={onSearch}
                />

                {value.length > 0 && (
                    <TouchableOpacity
                        onPress={handleClear}
                        style={styles.clearButton}
                    >
                        <Ionicons
                            name="close-circle"
                            size={20}
                            color={theme.colors.gray400}
                        />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
    },
    searchIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        height: "100%",
    },
    clearButton: {
        marginLeft: 8,
    },
});
