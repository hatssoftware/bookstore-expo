import { ApiErrorBoundary } from "@/components/ApiErrorBoundary";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { BookCard } from "../../components/BookCard";
import { useI18n } from "../../contexts/I18nContext";
import { useAppTheme } from "../../contexts/ThemeContext";
import {
    useAddToCart,
    useFavorites,
    useRemoveFromFavorites,
    useSession,
} from "../../hooks/useApi";
import { Book } from "../../lib/api";

export default function FavoritesScreen() {
    const theme = useAppTheme();
    const { t } = useI18n();
    const { data: session } = useSession();
    const {
        data: favorites,
        isLoading,
        refetch,
        error,
    } = useFavorites(session?.user?.id || "");

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
        if (!session?.user?.id) return;

        removeFromFavoritesMutation.mutate({
            userId: session.user.id,
            bookId: book.id,
        });
    };

    const renderBookCard = ({ item }: { item: Book }) => (
        <View style={styles.bookItem}>
            <BookCard
                book={item}
                onPress={() => {
                    console.log("Navigate to book details:", item.id);
                }}
                onFavoritePress={() => handleRemoveFromFavorites(item)}
                onAddToCart={() => handleAddToCart(item)}
                isFavorite={true}
                showAddToCart={item.stockQuantity > 0}
            />
        </View>
    );

    // Show sign in prompt for non-authenticated users
    if (!session?.user) {
        return (
            <View
                style={[
                    styles.container,
                    { backgroundColor: theme.colors.background },
                ]}
            >
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
                            console.log("Navigate to sign in");
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
            </View>
        );
    }

    // Show loading state
    if (isLoading) {
        return (
            <View
                style={[
                    styles.container,
                    { backgroundColor: theme.colors.background },
                ]}
            >
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
            </View>
        );
    }

    // Show error state
    if (error) {
        // Check if this is an API unavailability error
        if ((error as any)?.isApiUnavailable) {
            return <ApiErrorBoundary><></></ApiErrorBoundary>;
        }
        
        return (
            <View
                style={[
                    styles.container,
                    { backgroundColor: theme.colors.background },
                ]}
            >
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
            </View>
        );
    }

    // Show empty state
    if (!favorites || favorites.length === 0) {
        return (
            <View
                style={[
                    styles.container,
                    { backgroundColor: theme.colors.background },
                ]}
            >
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
            </View>
        );
    }

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: theme.colors.background },
            ]}
        >
            <View style={styles.header}>
                <Text
                    style={[
                        styles.favoriteCount,
                        { color: theme.colors.textSecondary },
                    ]}
                >
                    {favorites.length}{" "}
                    {favorites.length === 1 ? "book" : "books"}
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },
    favoriteCount: {
        fontSize: 14,
        fontWeight: "500",
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
