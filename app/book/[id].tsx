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
import { useAppTheme } from "../../contexts/ThemeContext";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function BookDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const theme = useAppTheme();
    const [isFavorite, setIsFavorite] = useState(false);
    const [quantity, setQuantity] = useState(1);

    // In a real app, you'd fetch the book data
    // const { data: book, isLoading } = useBook(id);

    // Mock book data for demo
    const book = {
        id: id,
        title: "The Silent Observer",
        authors: [{ name: "Emma Richardson" }],
        imageURL:
            "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
        price: 299,
        description:
            "A captivating psychological thriller that follows Dr. Sarah Chen, a forensic psychologist who becomes entangled in a complex murder case. When the prime suspect claims to have witnessed the crime through telepathic visions, Sarah must question everything she believes about reality and the human mind. Set against the backdrop of modern-day San Francisco, this page-turner explores themes of perception, truth, and the thin line between genius and madness.",
        genres: [
            { id: 1, name: "Thriller" },
            { id: 2, name: "Mystery" },
        ],
        publisher: "Midnight Press",
        publicationDate: "2024-01-15",
        isbn: "978-0-123456-78-9",
        pageCount: 342,
        language: "English",
        stockQuantity: 12,
        combinedRating: 4.3,
        combinedRatingCount: 1247,
    };

    const formatPrice = (price: number) => {
        return `${price.toFixed(0)} CZK`;
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
        console.log(`Added ${quantity} copies of "${book.title}" to cart`);
    };

    const handleQuantityChange = (change: number) => {
        const newQuantity = quantity + change;
        if (newQuantity >= 1 && newQuantity <= book.stockQuantity) {
            setQuantity(newQuantity);
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
                        <Image
                            source={{ uri: book.imageURL }}
                            style={styles.bookImage}
                            resizeMode="cover"
                        />
                        <View
                            style={[
                                styles.stockBadge,
                                {
                                    backgroundColor:
                                        book.stockQuantity > 5
                                            ? theme.colors.success
                                            : book.stockQuantity > 0
                                            ? theme.colors.warning
                                            : theme.colors.error,
                                },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.stockBadgeText,
                                    {
                                        color: theme.colors.white,
                                        fontFamily:
                                            theme.typography.fontFamily.bold,
                                    },
                                ]}
                            >
                                {book.stockQuantity > 5
                                    ? "In Stock"
                                    : book.stockQuantity > 0
                                    ? `${book.stockQuantity} Left`
                                    : "Out of Stock"}
                            </Text>
                        </View>
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
                            by{" "}
                            {book.authors
                                .map((author) => author.name)
                                .join(", ")}
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
                                    reviews)
                                </Text>
                            </View>
                        )}

                        {/* Genres */}
                        {book.genres && (
                            <View style={styles.genresContainer}>
                                {book.genres.map((genre, index) => (
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
                        )}
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
                        About this book
                    </Text>
                    <Text
                        style={[
                            styles.description,
                            {
                                color: theme.colors.textSecondary,
                                fontFamily: theme.typography.fontFamily.regular,
                            },
                        ]}
                    >
                        {book.description}
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
                        Details
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
                                Publisher
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
                                {book.publisher}
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
                                Pages
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
                                {book.pageCount}
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
                                Language
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
                                {book.language}
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
                                ISBN
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
                                {book.isbn}
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
                        Price
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
                        {formatPrice(book.price)}
                    </Text>
                </View>

                <View style={styles.actionsSection}>
                    <View style={styles.quantitySelector}>
                        <TouchableOpacity
                            style={[
                                styles.quantityButton,
                                {
                                    backgroundColor:
                                        theme.colors.backgroundSecondary,
                                },
                            ]}
                            onPress={() => handleQuantityChange(-1)}
                            disabled={quantity <= 1}
                        >
                            <Ionicons
                                name="remove"
                                size={20}
                                color={
                                    quantity <= 1
                                        ? theme.colors.textLight
                                        : theme.colors.text
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
                                    backgroundColor:
                                        theme.colors.backgroundSecondary,
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
                                        : theme.colors.text
                                }
                            />
                        </TouchableOpacity>
                    </View>

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
                            name="bag-add"
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
                            Add to Cart
                        </Text>
                    </TouchableOpacity>
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
        flexDirection: "row",
        alignItems: "center",
    },
    quantitySelector: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 16,
    },
    quantityButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    quantityText: {
        fontSize: 18,
        marginHorizontal: 16,
        minWidth: 24,
        textAlign: "center",
    },
    addToCartButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    addToCartText: {
        fontSize: 16,
        marginLeft: 8,
    },
});
