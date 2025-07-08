import { useAppTheme } from "@/contexts/ThemeContext";
import { Book } from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface BookCardProps {
    book: Book;
    onPress?: () => void;
    onFavoritePress?: () => void;
    onAddToCart?: () => void;
    isFavorite?: boolean;
    showAddToCart?: boolean;
}

export function BookCard({
    book,
    onPress,
    onFavoritePress,
    onAddToCart,
    isFavorite = false,
    showAddToCart = true,
}: BookCardProps) {
    const theme = useAppTheme();

    const formatPrice = (price: string) => {
        return `${Number(price)} CZK`;
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

    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: theme.colors.card }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: book.imageURL }}
                    style={styles.image}
                    resizeMode="cover"
                />
                {onFavoritePress && (
                    <TouchableOpacity
                        style={[
                            styles.favoriteButton,
                            { backgroundColor: theme.colors.white },
                        ]}
                        onPress={onFavoritePress}
                    >
                        <Ionicons
                            name={isFavorite ? "heart" : "heart-outline"}
                            size={20}
                            color={
                                isFavorite
                                    ? theme.colors.error
                                    : theme.colors.gray500
                            }
                        />
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.content}>
                <Text
                    style={[
                        styles.title,
                        {
                            color: theme.colors.text,
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
                            fontSize: theme.typography.fontSize.sm,
                        },
                    ]}
                    numberOfLines={1}
                >
                    {book.authors?.map((author) => author.name).join(", ") ||
                        "Unknown Author"}
                </Text>

                {book.genres && book.genres.length > 0 && (
                    <Text
                        style={[
                            styles.genre,
                            {
                                color: theme.colors.textLight,
                                fontSize: theme.typography.fontSize.xs,
                            },
                        ]}
                        numberOfLines={1}
                    >
                        {book.genres?.map((genre) => genre.name).join(", ")}
                    </Text>
                )}

                {getRating() > 0 && (
                    <View style={styles.ratingContainer}>
                        <Ionicons
                            name="star"
                            size={14}
                            color={theme.colors.secondary}
                        />
                        <Text
                            style={[
                                styles.rating,
                                {
                                    color: theme.colors.textSecondary,
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
                                fontSize: theme.typography.fontSize.lg,
                            },
                        ]}
                    >
                        {formatPrice(book.price)}
                    </Text>

                    {showAddToCart && onAddToCart && (
                        <TouchableOpacity
                            style={[
                                styles.addToCartButton,
                                { backgroundColor: theme.colors.primary },
                            ]}
                            onPress={onAddToCart}
                        >
                            <Ionicons
                                name="add"
                                size={20}
                                color={theme.colors.white}
                            />
                        </TouchableOpacity>
                    )}
                </View>

                {book.stockQuantity <= 5 && book.stockQuantity > 0 && (
                    <Text
                        style={[
                            styles.lowStock,
                            {
                                color: theme.colors.warning,
                                fontSize: theme.typography.fontSize.xs,
                            },
                        ]}
                    >
                        Only {book.stockQuantity} left in stock
                    </Text>
                )}

                {book.stockQuantity === 0 && (
                    <Text
                        style={[
                            styles.outOfStock,
                            {
                                color: theme.colors.error,
                                fontSize: theme.typography.fontSize.xs,
                            },
                        ]}
                    >
                        Out of stock
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 160,
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    imageContainer: {
        position: "relative",
        height: 200,
    },
    image: {
        width: "100%",
        height: "100%",
    },
    favoriteButton: {
        position: "absolute",
        top: 8,
        right: 8,
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    content: {
        padding: 12,
    },
    title: {
        fontWeight: "600",
        lineHeight: 20,
        marginBottom: 4,
    },
    author: {
        marginBottom: 4,
    },
    genre: {
        marginBottom: 8,
    },
    ratingContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    rating: {
        marginLeft: 4,
        fontWeight: "500",
    },
    ratingCount: {
        marginLeft: 4,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },
    price: {
        fontWeight: "700",
    },
    addToCartButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    lowStock: {
        fontWeight: "500",
    },
    outOfStock: {
        fontWeight: "600",
    },
});
