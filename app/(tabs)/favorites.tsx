import { ApiErrorBoundary } from "@/components/ApiErrorBoundary";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
    FlatList,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { BookCard } from "../../components/BookCard";
import { useI18n } from "../../contexts/I18nContext";
import { useAppTheme } from "../../contexts/ThemeContext";
import { useUser } from "../../contexts/UserContext";
import {
    FavoriteItem,
    useAddToCart,
    useFavorites,
    useRemoveFromFavorites,
} from "../../hooks/useApi";
import { Book } from "../../lib/api";

export default function FavoritesScreen() {
    const theme = useAppTheme();
    const { t } = useI18n();
    const { user, isAuthenticated } = useUser();
    const {
        data: favorites,
        isLoading,
        refetch,
        error,
    } = useFavorites(user?.id || "");

    // Mutations
    const addToCartMutation = useAddToCart();
    const removeFromFavoritesMutation = useRemoveFromFavorites();

    const handleAddToCart = (book: Book) => {
        addToCartMutation.mutate(
            { bookId: book.id, quantity: 1 },
            {
                onSuccess: () => {
                    console.log(`Added ${book.title} to cart`);
                },
                onError: (error) => {
                    console.error("Failed to add to cart:", error);
                },
            }
        );
    };

    const handleRemoveFromFavorites = (book: Book) => {
        if (!user?.id) return;

        removeFromFavoritesMutation.mutate(
            {
                userId: user.id,
                bookId: book.id,
            },
            {
                onError: (error: any) => {
                    if (error?.status === 401) {
                        console.log(
                            "[FavoritesScreen] Remove favorites feature temporarily unavailable due to server authentication issue"
                        );
                    }
                },
            }
        );
    };

    const renderBookCard = ({ item }: { item: FavoriteItem }) => (
        <View style={styles.bookItem}>
            <BookCard
                book={item.book}
                onPress={() => {
                    console.log("Navigate to book details:", item.book.id);
                    router.push(`/book/${item.book.id}`);
                }}
                onFavoritePress={() => handleRemoveFromFavorites(item.book)}
                onAddToCart={() => handleAddToCart(item.book)}
                isFavorite={true}
                showAddToCart={item.book.stockQuantity > 0}
            />
        </View>
    );

    // Show sign in prompt for non-authenticated users
    if (!isAuthenticated || !user) {
        return (
            <SafeAreaView
                style={[
                    styles.container,
                    { backgroundColor: theme.colors.background },
                ]}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text
                        style={[
                            styles.headerTitle,
                            {
                                color: theme.colors.text,
                                fontFamily: theme.typography.fontFamily.bold,
                            },
                        ]}
                    >
                        {t("favorites.title")}
                    </Text>
                </View>

                <View style={styles.emptyStateContainer}>
                    <Ionicons
                        name="heart-outline"
                        size={64}
                        color={theme.colors.gray300}
                        style={styles.emptyIcon}
                    />
                    <Text
                        style={[
                            styles.emptyTitle,
                            { color: theme.colors.text },
                        ]}
                    >
                        {t("favorites.signIn.title")}
                    </Text>
                    <Text
                        style={[
                            styles.emptyText,
                            { color: theme.colors.textSecondary },
                        ]}
                    >
                        {t("favorites.signIn.description")}
                    </Text>
                    <TouchableOpacity
                        style={[
                            styles.signInButton,
                            { backgroundColor: theme.colors.primary },
                        ]}
                        onPress={() => {
                            router.push("/auth/login");
                        }}
                    >
                        <Text
                            style={[
                                styles.signInButtonText,
                                { color: theme.colors.white },
                            ]}
                        >
                            {t("favorites.signIn.signInButton")}
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // Show loading state
    if (isLoading) {
        return (
            <SafeAreaView
                style={[
                    styles.container,
                    { backgroundColor: theme.colors.background },
                ]}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text
                        style={[
                            styles.headerTitle,
                            {
                                color: theme.colors.text,
                                fontFamily: theme.typography.fontFamily.bold,
                            },
                        ]}
                    >
                        {t("favorites.title")}
                    </Text>
                </View>

                <View style={styles.loadingContainer}>
                    <Text
                        style={[
                            styles.loadingText,
                            { color: theme.colors.textSecondary },
                        ]}
                    >
                        Loading favorites...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    // Show error state
    if (error) {
        // Check if this is an API unavailability error
        if ((error as any)?.isApiUnavailable) {
            return (
                <ApiErrorBoundary>
                    <></>
                </ApiErrorBoundary>
            );
        }

        return (
            <SafeAreaView
                style={[
                    styles.container,
                    { backgroundColor: theme.colors.background },
                ]}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text
                        style={[
                            styles.headerTitle,
                            {
                                color: theme.colors.text,
                                fontFamily: theme.typography.fontFamily.bold,
                            },
                        ]}
                    >
                        {t("favorites.title")}
                    </Text>
                </View>

                <View style={styles.errorContainer}>
                    <Ionicons
                        name="alert-circle-outline"
                        size={64}
                        color={theme.colors.error}
                        style={styles.emptyIcon}
                    />
                    <Text
                        style={[
                            styles.errorTitle,
                            { color: theme.colors.error },
                        ]}
                    >
                        Failed to load favorites
                    </Text>
                    <Text
                        style={[
                            styles.errorText,
                            { color: theme.colors.textSecondary },
                        ]}
                    >
                        There was an error loading your favorite books. Please
                        try again.
                    </Text>
                    <TouchableOpacity
                        style={[
                            styles.retryButton,
                            { backgroundColor: theme.colors.primary },
                        ]}
                        onPress={() => refetch()}
                    >
                        <Text
                            style={[
                                styles.retryButtonText,
                                { color: theme.colors.white },
                            ]}
                        >
                            Try Again
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // Show empty state
    if (!favorites || favorites.length === 0) {
        return (
            <SafeAreaView
                style={[
                    styles.container,
                    { backgroundColor: theme.colors.background },
                ]}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text
                        style={[
                            styles.headerTitle,
                            {
                                color: theme.colors.text,
                                fontFamily: theme.typography.fontFamily.bold,
                            },
                        ]}
                    >
                        {t("favorites.title")}
                    </Text>
                </View>

                <View style={styles.emptyStateContainer}>
                    <Ionicons
                        name="heart-outline"
                        size={64}
                        color={theme.colors.gray300}
                        style={styles.emptyIcon}
                    />
                    <Text
                        style={[
                            styles.emptyTitle,
                            { color: theme.colors.text },
                        ]}
                    >
                        {t("favorites.empty.title")}
                    </Text>
                    <Text
                        style={[
                            styles.emptyText,
                            { color: theme.colors.textSecondary },
                        ]}
                    >
                        {t("favorites.empty.description")}
                    </Text>
                    <TouchableOpacity
                        style={[
                            styles.exploreButton,
                            { backgroundColor: theme.colors.primary },
                        ]}
                        onPress={() => {
                            // Navigate to home tab
                            console.log("Navigate to home tab");
                        }}
                    >
                        <Text
                            style={[
                                styles.exploreButtonText,
                                { color: theme.colors.white },
                            ]}
                        >
                            {t("favorites.empty.exploreButton")}
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView
            style={[
                styles.container,
                { backgroundColor: theme.colors.background },
            ]}
        >
            {/* Header */}
            <View style={styles.header}>
                <Text
                    style={[
                        styles.headerTitle,
                        {
                            color: theme.colors.text,
                            fontFamily: theme.typography.fontFamily.bold,
                        },
                    ]}
                >
                    {t("favorites.title")}
                </Text>
                <Text
                    style={[
                        styles.itemCount,
                        {
                            color: theme.colors.textSecondary,
                            fontFamily: theme.typography.fontFamily.regular,
                        },
                    ]}
                >
                    {favorites.length}{" "}
                    {favorites.length === 1 ? t("favorites.item") : t("favorites.items")}
                </Text>
            </View>

            <FlatList
                data={favorites}
                renderItem={renderBookCard}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.booksList}
                refreshControl={
                    <RefreshControl
                        refreshing={isLoading}
                        onRefresh={refetch}
                    />
                }
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
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
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },
    headerTitle: {
        fontSize: 24,
    },
    itemCount: {
        fontSize: 14,
        fontWeight: "600",
    },
    booksList: {
        padding: 16,
    },
    bookItem: {
        width: "48%",
        marginBottom: 16,
        marginHorizontal: "1%",
    },
    emptyStateContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
    },
    emptyIcon: {
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 8,
        textAlign: "center",
    },
    emptyText: {
        fontSize: 16,
        textAlign: "center",
        lineHeight: 24,
        marginBottom: 24,
    },
    signInButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    signInButtonText: {
        fontSize: 16,
        fontWeight: "600",
    },
    exploreButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    exploreButtonText: {
        fontSize: 16,
        fontWeight: "600",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 8,
        textAlign: "center",
    },
    errorText: {
        fontSize: 16,
        textAlign: "center",
        lineHeight: 24,
        marginBottom: 24,
    },
    retryButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        fontSize: 16,
        fontWeight: "600",
    },
});
