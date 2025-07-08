import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
    Image,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useAppTheme } from "../contexts/ThemeContext";
import { Book } from "../lib/api";

interface BookCardProps {
    book: Book;
    onFavoritePress?: () => void;
    isFavorite?: boolean;
    variant?: "default" | "compact" | "featured";
}

export function BookCard({
    book,
    onFavoritePress,
    isFavorite = false,
    variant = "default",
}: BookCardProps) {
    const theme = useAppTheme();

    const formatPrice = (price: string) => {
        return `${Number(price).toFixed(0)} CZK`;
    };

    const getRating = () => {
        return (
            book.combinedRating ||
            book.bookStockRating ||
            book.criticRating ||
            0
        );
    };

    const getRatingCount = () => {
        return book.combinedRatingCount || book.bookStockRatingCount || 0;
    };

    const handlePress = () => {
        router.push(`/book/${book.id}` as any);
    };

    const renderCompactCard = () => (
        <Pressable
            style={({ pressed }) => [
                styles.compactContainer,
                {
                    backgroundColor: theme.colors.card,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                },
                theme.shadows.sm,
            ]}
            onPress={handlePress}
        >
            <View style={styles.compactImageContainer}>
                <Image
                    source={{ uri: book.imageURL }}
                    style={styles.compactImage}
                    resizeMode="cover"
                />
                <View
                    style={[
                        styles.priceTag,
                        { backgroundColor: theme.colors.primary },
                    ]}
                >
                    <Text
                        style={[
                            styles.priceTagText,
                            {
                                color: theme.colors.white,
                                fontFamily: theme.typography.fontFamily.medium,
                            },
                        ]}
                    >
                        {formatPrice(book.price)}
                    </Text>
                </View>
            </View>
            <View style={styles.compactContent}>
                <Text
                    style={[
                        styles.compactTitle,
                        {
                            color: theme.colors.text,
                            fontFamily: theme.typography.fontFamily.semibold,
                            fontSize: theme.typography.fontSize.sm,
                        },
                    ]}
                    numberOfLines={2}
                >
                    {book.title}
                </Text>

                <Text
                    style={[
                        styles.compactAuthor,
                        {
                            color: theme.colors.textSecondary,
                            fontFamily: theme.typography.fontFamily.regular,
                            fontSize: theme.typography.fontSize.xs,
                        },
                    ]}
                    numberOfLines={1}
                >
                    {book.authors?.map((author) => author.name).join(", ") ||
                        "Unknown"}
                </Text>

                {getRating() > 0 && (
                    <View style={styles.compactRating}>
                        <Ionicons
                            name="star"
                            size={12}
                            color={theme.colors.accent}
                        />
                        <Text
                            style={[
                                styles.compactRatingText,
                                {
                                    color: theme.colors.textSecondary,
                                    fontFamily:
                                        theme.typography.fontFamily.medium,
                                    fontSize: theme.typography.fontSize.xs,
                                },
                            ]}
                        >
                            {getRating().toFixed(1)}
                        </Text>
                    </View>
                )}
            </View>
        </Pressable>
    );

    const renderFeaturedCard = () => (
        <Pressable
            style={({ pressed }) => [
                styles.featuredContainer,
                {
                    backgroundColor: theme.colors.card,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                },
                theme.shadows.md,
            ]}
            onPress={handlePress}
        >
            <View style={styles.featuredImageContainer}>
                <Image
                    source={{ uri: book.imageURL }}
                    style={styles.featuredImage}
                    resizeMode="cover"
                />
                <View style={styles.featuredOverlay}>
                    <View
                        style={[
                            styles.featuredPriceTag,
                            { backgroundColor: theme.colors.accent },
                        ]}
                    >
                        <Text
                            style={[
                                styles.featuredPriceText,
                                {
                                    color: theme.colors.white,
                                    fontFamily:
                                        theme.typography.fontFamily.bold,
                                },
                            ]}
                        >
                            {formatPrice(book.price)}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.featuredContent}>
                <View style={styles.featuredHeader}>
                    <View style={styles.featuredTitleContainer}>
                        <Text
                            style={[
                                styles.featuredTitle,
                                {
                                    color: theme.colors.text,
                                    fontFamily:
                                        theme.typography.fontFamily.bold,
                                    fontSize: theme.typography.fontSize.xl,
                                },
                            ]}
                            numberOfLines={2}
                        >
                            {book.title}
                        </Text>
                        <Text
                            style={[
                                styles.featuredAuthor,
                                {
                                    color: theme.colors.textSecondary,
                                    fontFamily:
                                        theme.typography.fontFamily.medium,
                                    fontSize: theme.typography.fontSize.base,
                                },
                            ]}
                            numberOfLines={1}
                        >
                            {book.authors
                                ?.map((author) => author.name)
                                .join(", ") || "Unknown Author"}
                        </Text>
                    </View>

                    {onFavoritePress && (
                        <TouchableOpacity
                            style={[
                                styles.featuredFavoriteButton,
                                {
                                    backgroundColor:
                                        theme.colors.backgroundSecondary,
                                },
                            ]}
                            onPress={onFavoritePress}
                        >
                            <Ionicons
                                name={isFavorite ? "heart" : "heart-outline"}
                                size={24}
                                color={
                                    isFavorite
                                        ? theme.colors.accent
                                        : theme.colors.textLight
                                }
                            />
                        </TouchableOpacity>
                    )}
                </View>

                {book.genres && book.genres.length > 0 && (
                    <View style={styles.featuredGenres}>
                        {book.genres.slice(0, 2).map((genre, index) => (
                            <View
                                key={genre.id || index}
                                style={[
                                    styles.genreTag,
                                    {
                                        backgroundColor:
                                            theme.colors.backgroundSecondary,
                                    },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.genreTagText,
                                        {
                                            color: theme.colors.textSecondary,
                                            fontFamily:
                                                theme.typography.fontFamily
                                                    .medium,
                                            fontSize:
                                                theme.typography.fontSize.xs,
                                        },
                                    ]}
                                >
                                    {genre.name}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {getRating() > 0 && (
                    <View style={styles.featuredRating}>
                        <View style={styles.starsContainer}>
                            {[...Array(5)].map((_, i) => (
                                <Ionicons
                                    key={i}
                                    name={
                                        i < Math.floor(getRating())
                                            ? "star"
                                            : "star-outline"
                                    }
                                    size={16}
                                    color={theme.colors.accent}
                                />
                            ))}
                        </View>
                        <Text
                            style={[
                                styles.featuredRatingText,
                                {
                                    color: theme.colors.textSecondary,
                                    fontFamily:
                                        theme.typography.fontFamily.medium,
                                    fontSize: theme.typography.fontSize.sm,
                                },
                            ]}
                        >
                            {getRating().toFixed(1)} ({getRatingCount()})
                        </Text>
                    </View>
                )}
            </View>
        </Pressable>
    );

    if (variant === "compact") {
        return renderCompactCard();
    }

    if (variant === "featured") {
        return renderFeaturedCard();
    }

    // Default card
    return (
        <Pressable
            style={({ pressed }) => [
                styles.container,
                {
                    backgroundColor: theme.colors.card,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                },
                theme.shadows.sm,
            ]}
            onPress={handlePress}
        >
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: book.imageURL }}
                    style={styles.image}
                    resizeMode="cover"
                />
            </View>

            <View style={styles.content}>
                <View style={styles.header}>
                    <Text
                        style={[
                            styles.title,
                            {
                                color: theme.colors.text,
                                fontFamily:
                                    theme.typography.fontFamily.semibold,
                                fontSize: theme.typography.fontSize.base,
                            },
                        ]}
                        numberOfLines={2}
                    >
                        {book.title}
                    </Text>

                    <Text
                        style={[
                            styles.author,
                            {
                                color: theme.colors.textSecondary,
                                fontFamily: theme.typography.fontFamily.regular,
                                fontSize: theme.typography.fontSize.sm,
                            },
                        ]}
                        numberOfLines={1}
                    >
                        {book.authors
                            ?.map((author) => author.name)
                            .join(", ") || "Unknown"}
                    </Text>
                </View>

                {getRating() > 0 && (
                    <View style={styles.ratingContainer}>
                        <Ionicons
                            name="star"
                            size={14}
                            color={theme.colors.accent}
                        />
                        <Text
                            style={[
                                styles.rating,
                                {
                                    color: theme.colors.textSecondary,
                                    fontFamily:
                                        theme.typography.fontFamily.medium,
                                    fontSize: theme.typography.fontSize.sm,
                                },
                            ]}
                        >
                            {getRating().toFixed(1)}
                        </Text>
                        {getRatingCount() > 0 && (
                            <Text
                                style={[
                                    styles.ratingCount,
                                    {
                                        color: theme.colors.textLight,
                                        fontFamily:
                                            theme.typography.fontFamily.regular,
                                        fontSize: theme.typography.fontSize.xs,
                                    },
                                ]}
                            >
                                ({getRatingCount()})
                            </Text>
                        )}
                    </View>
                )}

                <View style={styles.footer}>
                    <Text
                        style={[
                            styles.price,
                            {
                                color: theme.colors.primary,
                                fontFamily: theme.typography.fontFamily.bold,
                                fontSize: theme.typography.fontSize.lg,
                            },
                        ]}
                    >
                        {formatPrice(book.price)}
                    </Text>

                    {book.stockQuantity <= 5 && book.stockQuantity > 0 && (
                        <Text
                            style={[
                                styles.stockText,
                                {
                                    color: theme.colors.warning,
                                    fontFamily:
                                        theme.typography.fontFamily.medium,
                                    fontSize: theme.typography.fontSize.xs,
                                },
                            ]}
                        >
                            Only {book.stockQuantity} left
                        </Text>
                    )}
                </View>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    // Default card styles
    container: {
        width: 180,
        borderRadius: 16,
        overflow: "hidden",
        marginBottom: 20,
    },
    imageContainer: {
        position: "relative",
        height: 240,
    },
    image: {
        width: "100%",
        height: "100%",
    },
    imageOverlay: {
        position: "absolute",
        top: 12,
        left: 12,
        right: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    stockIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    favoriteButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    content: {
        padding: 16,
    },
    header: {
        marginBottom: 12,
    },
    title: {
        lineHeight: 22,
        marginBottom: 4,
    },
    author: {
        lineHeight: 18,
    },
    ratingContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    rating: {
        marginLeft: 4,
    },
    ratingCount: {
        marginLeft: 4,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    price: {
        letterSpacing: -0.5,
    },
    stockText: {
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },

    // Compact card styles
    compactContainer: {
        flexDirection: "row",
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 12,
        padding: 12,
    },
    compactImageContainer: {
        position: "relative",
        width: 60,
        height: 80,
        marginRight: 12,
    },
    compactImage: {
        width: "100%",
        height: "100%",
        borderRadius: 8,
    },
    priceTag: {
        position: "absolute",
        bottom: -6,
        right: -6,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    priceTagText: {
        fontSize: 10,
    },
    compactContent: {
        flex: 1,
        justifyContent: "space-between",
    },
    compactTitle: {
        lineHeight: 18,
        marginBottom: 2,
    },
    compactAuthor: {
        lineHeight: 16,
        marginBottom: 4,
    },
    compactRating: {
        flexDirection: "row",
        alignItems: "center",
    },
    compactRatingText: {
        marginLeft: 2,
    },
    compactFavoriteButton: {
        position: "absolute",
        top: 8,
        right: 8,
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },

    // Featured card styles
    featuredContainer: {
        borderRadius: 20,
        overflow: "hidden",
        marginBottom: 24,
    },
    featuredImageContainer: {
        position: "relative",
        height: 200,
    },
    featuredImage: {
        width: "100%",
        height: "100%",
    },
    featuredOverlay: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "flex-end",
        padding: 16,
    },
    featuredPriceTag: {
        alignSelf: "flex-start",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    featuredPriceText: {
        fontSize: 16,
    },
    featuredContent: {
        padding: 20,
    },
    featuredHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    featuredTitleContainer: {
        flex: 1,
        marginRight: 12,
    },
    featuredTitle: {
        lineHeight: 28,
        marginBottom: 4,
    },
    featuredAuthor: {
        lineHeight: 22,
    },
    featuredFavoriteButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
    },
    featuredGenres: {
        flexDirection: "row",
        marginBottom: 16,
    },
    genreTag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginRight: 8,
    },
    genreTagText: {
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    featuredRating: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    starsContainer: {
        flexDirection: "row",
    },
    featuredRatingText: {
        marginLeft: 8,
    },
});
