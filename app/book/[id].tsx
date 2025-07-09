import { useBook } from "@/hooks/useApi";
import { theme } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
    Dimensions,
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { ApiErrorBoundary } from "../../components/ApiErrorBoundary";
import { useI18n } from "../../contexts/I18nContext";
import { useAppTheme } from "../../contexts/ThemeContext";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function BookDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const theme = useAppTheme();
    const { t } = useI18n();
    const [isFavorite, setIsFavorite] = useState(false);
    const [quantity, setQuantity] = useState(0);
    const [isInCart, setIsInCart] = useState(false);

    // Get book from API
    const { data: book, isLoading, error } = useBook(id);

    // Early return for loading state
    if (isLoading) {
        return (
            <View
                style={[
                    styles.container,
                    { backgroundColor: theme.colors.background },
                ]}
            >
                <SafeAreaView>
                    <View
                        style={[
                            styles.header,
                            { backgroundColor: theme.colors.surface },
                        ]}
                    >
                        <TouchableOpacity
                            style={[
                                styles.headerButton,
                                {
                                    backgroundColor:
                                        theme.colors.backgroundSecondary,
                                },
                            ]}
                            onPress={() => router.back()}
                        >
                            <Ionicons
                                name="arrow-back"
                                size={24}
                                color={theme.colors.text}
                            />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
                <View style={styles.loadingContainer}>
                    <Text
                        style={[
                            styles.loadingText,
                            { color: theme.colors.text },
                        ]}
                    >
                        {t("book.loading")}
                    </Text>
                </View>
            </View>
        );
    }

    // Early return for error state
    if (error || !book) {
        // Check if this is an API unavailability error
        if ((error as any)?.isApiUnavailable) {
            return (
                <ApiErrorBoundary>
                    <></>
                </ApiErrorBoundary>
            );
        }

        return (
            <View
                style={[
                    styles.container,
                    { backgroundColor: theme.colors.background },
                ]}
            >
                <SafeAreaView>
                    <View
                        style={[
                            styles.header,
                            { backgroundColor: theme.colors.surface },
                        ]}
                    >
                        <TouchableOpacity
                            style={[
                                styles.headerButton,
                                {
                                    backgroundColor:
                                        theme.colors.backgroundSecondary,
                                },
                            ]}
                            onPress={() => router.back()}
                        >
                            <Ionicons
                                name="arrow-back"
                                size={24}
                                color={theme.colors.text}
                            />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
                <View style={styles.loadingContainer}>
                    <Text
                        style={[
                            styles.errorText,
                            { color: theme.colors.error },
                        ]}
                    >
                        {error ? t("book.error") : t("book.notFound")}
                    </Text>
                </View>
            </View>
        );
    }

    const formatPrice = (price: string) => {
        return `${Number(price).toFixed(0)} CZK`;
    };

    const getRating = () => {
        return book.combinedRating || 0;
    };

    const getRatingCount = () => {
        return book.combinedRatingCount || 0;
    };

    const handleFavoriteToggle = () => {
        setIsFavorite(!isFavorite);
    };

    const handleAddToCart = () => {
        if (!isInCart) {
            // First time adding to cart
            setQuantity(1);
            setIsInCart(true);
            console.log(`Added 1 copy of "${book.title}" to cart`);
        }
    };

    const handleQuantityChange = (change: number) => {
        const newQuantity = quantity + change;
        if (newQuantity >= 0 && newQuantity <= book.stockQuantity) {
            setQuantity(newQuantity);
            if (newQuantity === 0) {
                setIsInCart(false);
                console.log(`Removed "${book.title}" from cart`);
            } else {
                console.log(
                    `Updated "${book.title}" quantity to ${newQuantity}`
                );
            }
        }
    };

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

            {/* Header */}
            <SafeAreaView>
                <View
                    style={[
                        styles.header,
                        { backgroundColor: theme.colors.surface },
                    ]}
                >
                    <TouchableOpacity
                        style={[
                            styles.headerButton,
                            {
                                backgroundColor:
                                    theme.colors.backgroundSecondary,
                            },
                        ]}
                        onPress={() => router.back()}
                    >
                        <Ionicons
                            name="arrow-back"
                            size={24}
                            color={theme.colors.text}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.headerButton,
                            {
                                backgroundColor:
                                    theme.colors.backgroundSecondary,
                            },
                        ]}
                        onPress={handleFavoriteToggle}
                    >
                        <Ionicons
                            name={isFavorite ? "heart" : "heart-outline"}
                            size={24}
                            color={
                                isFavorite
                                    ? theme.colors.accent
                                    : theme.colors.text
                            }
                        />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hero Section */}
                <View
                    style={[
                        styles.heroSection,
                        { backgroundColor: theme.colors.surface },
                    ]}
                >
                    <View style={styles.bookImageContainer}>
                        {book.imageURL && book.imageURL.length > 0 ? (
                            <Image
                                source={{ uri: book.imageURL }}
                                style={styles.bookImage}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={styles.bookImagePlaceholder}>
                                <Text style={styles.bookImagePlaceholderText}>
                                    ?
                                </Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.heroContent}>
                        <Text
                            style={[
                                styles.bookTitle,
                                {
                                    color: theme.colors.text,
                                    fontFamily:
                                        theme.typography.fontFamily.bold,
                                },
                            ]}
                        >
                            {book.title}
                        </Text>

                        <Text
                            style={[
                                styles.bookAuthor,
                                {
                                    color: theme.colors.textSecondary,
                                    fontFamily:
                                        theme.typography.fontFamily.medium,
                                },
                            ]}
                        >
                            {t("book.by")}{" "}
                            {book.authors
                                .map((author) => author.name)
                                .join(", ") || t("book.unknownAuthor")}
                        </Text>

                        {/* Rating */}
                        {getRating() > 0 && (
                            <View style={styles.ratingSection}>
                                <View style={styles.starsContainer}>
                                    {[...Array(5)].map((_, i) => (
                                        <Ionicons
                                            key={i}
                                            name={
                                                i < Math.floor(getRating())
                                                    ? "star"
                                                    : "star-outline"
                                            }
                                            size={20}
                                            color={theme.colors.accent}
                                        />
                                    ))}
                                </View>
                                <Text
                                    style={[
                                        styles.ratingText,
                                        {
                                            color: theme.colors.textSecondary,
                                            fontFamily:
                                                theme.typography.fontFamily
                                                    .medium,
                                        },
                                    ]}
                                >
                                    {getRating().toFixed(1)} ({getRatingCount()}{" "}
                                    {t("book.reviews")})
                                </Text>
                            </View>
                        )}

                        {/* Genres and Stock Status */}
                        <View style={styles.genresContainer}>
                            {/* Stock Status Tag */}
                            <View
                                style={[
                                    styles.genreTag,
                                    styles.stockTag,
                                    {
                                        backgroundColor:
                                            book.stockQuantity > 5
                                                ? theme.colors.success
                                                : book.stockQuantity > 0
                                                ? theme.colors.warning
                                                : theme.colors.error,
                                    },
                                    {
                                        flexDirection: "row",
                                        alignItems: "center",
                                        gap: 8,
                                    },
                                ]}
                            >
                                <Ionicons
                                    name={
                                        book.stockQuantity > 5
                                            ? "checkmark-circle"
                                            : book.stockQuantity > 0
                                            ? "alert-circle"
                                            : "close-circle"
                                    }
                                    size={16}
                                    color={theme.colors.white}
                                />
                                <Text
                                    style={[
                                        styles.genreTagText,
                                        {
                                            color: theme.colors.white,
                                            fontFamily:
                                                theme.typography.fontFamily
                                                    .bold,
                                        },
                                    ]}
                                >
                                    {book.stockQuantity > 5
                                        ? t("book.stock.inStock")
                                        : book.stockQuantity > 0
                                        ? `${book.stockQuantity} ${t(
                                              "book.stock.limited"
                                          )}`
                                        : t("book.stock.outOfStock")}
                                </Text>
                            </View>

                            {/* Genre Tags */}
                            {book.genres &&
                                book.genres.map((genre, index) => (
                                    <View
                                        key={genre.id || index}
                                        style={[
                                            styles.genreTag,
                                            {
                                                backgroundColor:
                                                    theme.colors
                                                        .backgroundSecondary,
                                            },
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.genreTagText,
                                                {
                                                    color: theme.colors
                                                        .textSecondary,
                                                    fontFamily:
                                                        theme.typography
                                                            .fontFamily.medium,
                                                },
                                            ]}
                                        >
                                            {genre.name}
                                        </Text>
                                    </View>
                                ))}
                        </View>
                    </View>
                </View>

                {/* Description */}
                <View
                    style={[
                        styles.section,
                        { backgroundColor: theme.colors.background },
                    ]}
                >
                    <Text
                        style={[
                            styles.sectionTitle,
                            {
                                color: theme.colors.text,
                                fontFamily: theme.typography.fontFamily.bold,
                            },
                        ]}
                    >
                        {t("book.sections.aboutBook")}
                    </Text>
                    <Text
                        style={[
                            styles.description,
                            {
                                color: book.description
                                    ? theme.colors.textSecondary
                                    : theme.colors.textLight,
                                fontFamily: theme.typography.fontFamily.regular,
                            },
                        ]}
                    >
                        {book.description || t("book.unknownDescription")}
                    </Text>
                </View>

                {/* Book Details */}
                <View
                    style={[
                        styles.section,
                        { backgroundColor: theme.colors.background },
                    ]}
                >
                    <Text
                        style={[
                            styles.sectionTitle,
                            {
                                color: theme.colors.text,
                                fontFamily: theme.typography.fontFamily.bold,
                            },
                        ]}
                    >
                        {t("book.sections.details")}
                    </Text>

                    <View style={styles.detailsGrid}>
                        <View style={styles.detailItem}>
                            <Text
                                style={[
                                    styles.detailLabel,
                                    {
                                        color: theme.colors.textLight,
                                        fontFamily:
                                            theme.typography.fontFamily.medium,
                                    },
                                ]}
                            >
                                {t("book.details.pages")}
                            </Text>
                            <Text
                                style={[
                                    styles.detailValue,
                                    {
                                        color: theme.colors.text,
                                        fontFamily:
                                            theme.typography.fontFamily.regular,
                                    },
                                ]}
                            >
                                {book.pagecount}
                            </Text>
                        </View>

                        <View style={styles.detailItem}>
                            <Text
                                style={[
                                    styles.detailLabel,
                                    {
                                        color: theme.colors.textLight,
                                        fontFamily:
                                            theme.typography.fontFamily.medium,
                                    },
                                ]}
                            >
                                {t("book.details.year")}
                            </Text>
                            <Text
                                style={[
                                    styles.detailValue,
                                    {
                                        color: theme.colors.text,
                                        fontFamily:
                                            theme.typography.fontFamily.regular,
                                    },
                                ]}
                            >
                                {book.year}
                            </Text>
                        </View>

                        <View style={styles.detailItem}>
                            <Text
                                style={[
                                    styles.detailLabel,
                                    {
                                        color: theme.colors.textLight,
                                        fontFamily:
                                            theme.typography.fontFamily.medium,
                                    },
                                ]}
                            >
                                {t("book.details.stock")}
                            </Text>
                            <Text
                                style={[
                                    styles.detailValue,
                                    {
                                        color: theme.colors.text,
                                        fontFamily:
                                            theme.typography.fontFamily.regular,
                                    },
                                ]}
                            >
                                {book.stockQuantity}{" "}
                                {t("book.details.available")}
                            </Text>
                        </View>

                        <View style={styles.detailItem}>
                            <Text
                                style={[
                                    styles.detailLabel,
                                    {
                                        color: theme.colors.textLight,
                                        fontFamily:
                                            theme.typography.fontFamily.medium,
                                    },
                                ]}
                            >
                                {t("book.details.rating")}
                            </Text>
                            <Text
                                style={[
                                    styles.detailValue,
                                    {
                                        color: theme.colors.text,
                                        fontFamily:
                                            theme.typography.fontFamily.regular,
                                    },
                                ]}
                            >
                                {book.criticRating}/5
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Action Bar */}
            <View
                style={[
                    styles.bottomBar,
                    { backgroundColor: theme.colors.surface },
                    theme.shadows.lg,
                ]}
            >
                <View style={styles.priceSection}>
                    <Text
                        style={[
                            styles.priceLabel,
                            {
                                color: theme.colors.textLight,
                                fontFamily: theme.typography.fontFamily.medium,
                            },
                        ]}
                    >
                        {t("book.price")}
                    </Text>
                    <Text
                        style={[
                            styles.price,
                            {
                                color: theme.colors.primary,
                                fontFamily: theme.typography.fontFamily.bold,
                            },
                        ]}
                    >
                        {formatPrice(book.price.toString())}
                    </Text>
                </View>

                <View style={styles.actionsSection}>
                    {isInCart ? (
                        <View style={styles.quantitySelector}>
                            <TouchableOpacity
                                style={[
                                    styles.quantityButton,
                                    {
                                        backgroundColor: theme.colors.accent,
                                    },
                                ]}
                                onPress={() => handleQuantityChange(-1)}
                                disabled={quantity <= 0}
                            >
                                <Ionicons
                                    name="remove"
                                    size={20}
                                    color={
                                        quantity <= 0
                                            ? theme.colors.textLight
                                            : theme.colors.white
                                    }
                                />
                            </TouchableOpacity>

                            <Text
                                style={[
                                    styles.quantityText,
                                    {
                                        color: theme.colors.text,
                                        fontFamily:
                                            theme.typography.fontFamily.bold,
                                    },
                                ]}
                            >
                                {quantity}
                            </Text>

                            <TouchableOpacity
                                style={[
                                    styles.quantityButton,
                                    {
                                        backgroundColor: theme.colors.accent,
                                    },
                                ]}
                                onPress={() => handleQuantityChange(1)}
                                disabled={quantity >= book.stockQuantity}
                            >
                                <Ionicons
                                    name="add"
                                    size={20}
                                    color={
                                        quantity >= book.stockQuantity
                                            ? theme.colors.textLight
                                            : theme.colors.white
                                    }
                                />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        // Show add to cart button when item is not in cart
                        <TouchableOpacity
                            style={[
                                styles.addToCartButton,
                                {
                                    backgroundColor:
                                        book.stockQuantity > 0
                                            ? theme.colors.accent
                                            : theme.colors.textLight,
                                },
                            ]}
                            onPress={handleAddToCart}
                            disabled={book.stockQuantity === 0}
                        >
                            <Ionicons
                                name={book.stockQuantity > 0 ? "cart" : "close"}
                                size={24}
                                color={theme.colors.white}
                            />
                            <Text
                                style={[
                                    styles.addToCartText,
                                    {
                                        color: theme.colors.white,
                                        fontFamily:
                                            theme.typography.fontFamily.bold,
                                    },
                                ]}
                            >
                                {book.stockQuantity > 0
                                    ? t("book.addToCart")
                                    : t("book.outOfStock")}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    headerButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
    },
    heroSection: {
        paddingHorizontal: 20,
        paddingBottom: 32,
    },
    bookImageContainer: {
        position: "relative",
        alignItems: "center",
        marginBottom: 24,
    },
    bookImage: {
        width: screenWidth * 0.5,
        height: screenWidth * 0.75,
        borderRadius: 16,
    },
    bookImagePlaceholder: {
        width: screenWidth * 0.5,
        height: screenWidth * 0.75,
        borderRadius: 16,
        backgroundColor: theme.colors.backgroundSecondary,
        justifyContent: "center",
        alignItems: "center",
    },
    bookImagePlaceholderText: {
        fontSize: 128,
        textAlign: "center",
        color: theme.colors.textLight,
    },
    stockBadge: {
        position: "absolute",
        top: 12,
        right: screenWidth * 0.25 - 40,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    stockBadgeText: {
        fontSize: 12,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    heroContent: {
        alignItems: "center",
    },
    bookTitle: {
        fontSize: 28,
        textAlign: "center",
        marginBottom: 8,
        lineHeight: 36,
    },
    bookAuthor: {
        fontSize: 18,
        textAlign: "center",
        marginBottom: 16,
    },
    ratingSection: {
        alignItems: "center",
        marginBottom: 16,
    },
    starsContainer: {
        flexDirection: "row",
        marginBottom: 4,
    },
    ratingText: {
        fontSize: 14,
    },
    genresContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
    },
    genreTag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        margin: 4,
    },
    genreTagText: {
        fontSize: 12,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    stockTag: {
        marginRight: 8,
    },
    section: {
        paddingHorizontal: 20,
        paddingVertical: 24,
    },
    sectionTitle: {
        fontSize: 20,
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
    },
    detailsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    detailItem: {
        width: "50%",
        marginBottom: 16,
    },
    detailLabel: {
        fontSize: 12,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 16,
    },
    bottomBar: {
        flexDirection: "row",
        paddingHorizontal: 20,
        paddingVertical: 16,
        justifyContent: "space-between",
        alignItems: "center",
        paddingBottom: 32,
    },
    priceSection: {
        flex: 1,
    },
    priceLabel: {
        fontSize: 12,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    price: {
        fontSize: 24,
        letterSpacing: -1,
    },
    actionsSection: {
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "center",
    },
    quantitySelector: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
        borderRadius: 12,
        paddingVertical: 8,
        paddingHorizontal: 16,
        flex: 1,
    },
    quantityButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.colors.accent,
    },
    quantityText: {
        fontSize: 18,
        marginHorizontal: 20,
        minWidth: 30,
        textAlign: "center",
        fontWeight: "600",
    },
    addToCartButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        flex: 1,
    },
    addToCartText: {
        fontSize: 16,
        marginLeft: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    loadingText: {
        fontSize: 18,
        textAlign: "center",
    },
    errorText: {
        fontSize: 18,
        textAlign: "center",
    },
});
