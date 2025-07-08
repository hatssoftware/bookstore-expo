import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Animated,
    Easing,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useAppTheme } from "../contexts/ThemeContext";

interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    autoFocus?: boolean;
}

export function SearchBar({
    value,
    onChangeText,
    placeholder = "Search...",
    autoFocus = false,
}: SearchBarProps) {
    const theme = useAppTheme();
    const [isFocused, setIsFocused] = useState(false);
    const [scaleAnim] = useState(new Animated.Value(1));
    const [borderColorAnim] = useState(new Animated.Value(0));

    const handleFocus = () => {
        setIsFocused(true);
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1.02,
                useNativeDriver: true,
                tension: 300,
                friction: 8,
            }),
            Animated.timing(borderColorAnim, {
                toValue: 1,
                duration: 200,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false,
            }),
        ]).start();
    };

    const handleBlur = () => {
        setIsFocused(false);
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
                tension: 300,
                friction: 8,
            }),
            Animated.timing(borderColorAnim, {
                toValue: 0,
                duration: 200,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false,
            }),
        ]).start();
    };

    const handleClear = () => {
        onChangeText("");
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
                tension: 300,
                friction: 8,
            }),
        ]).start();
    };

    const animatedBorderColor = borderColorAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [theme.colors.border, theme.colors.borderFocus],
    });

    const animatedBackgroundColor = borderColorAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [theme.colors.backgroundSecondary, theme.colors.surface],
    });

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    backgroundColor: animatedBackgroundColor,
                    borderColor: animatedBorderColor,
                    transform: [{ scale: scaleAnim }],
                },
                theme.shadows.sm,
            ]}
        >
            <View style={styles.searchIconContainer}>
                <Ionicons
                    name="search"
                    size={20}
                    color={
                        isFocused
                            ? theme.colors.borderFocus
                            : theme.colors.textLight
                    }
                />
            </View>

            <TextInput
                style={[
                    styles.input,
                    {
                        color: theme.colors.text,
                        fontFamily: theme.typography.fontFamily.regular,
                        fontSize: theme.typography.fontSize.base,
                    },
                ]}
                value={value}
                onChangeText={onChangeText}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder={placeholder}
                placeholderTextColor={theme.colors.textLight}
                autoFocus={autoFocus}
                autoCapitalize="none"
                autoCorrect={false}
                clearButtonMode="never" // We'll use our custom clear button
                returnKeyType="search"
                selectTextOnFocus
            />

            {value.length > 0 && (
                <TouchableOpacity
                    style={styles.clearButton}
                    onPress={handleClear}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <View
                        style={[
                            styles.clearButtonBackground,
                            { backgroundColor: theme.colors.textLight },
                        ]}
                    >
                        <Ionicons
                            name="close"
                            size={14}
                            color={theme.colors.surface}
                        />
                    </View>
                </TouchableOpacity>
            )}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 2,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 4,
        minHeight: 52,
    },
    searchIconContainer: {
        marginRight: 12,
        width: 20,
        height: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
        lineHeight: 20,
    },
    clearButton: {
        marginLeft: 8,
        padding: 4,
    },
    clearButtonBackground: {
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
    },
});
