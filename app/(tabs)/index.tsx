import React, { useState } from "react";
import {
    FlatList,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { BookCard } from "../../components/BookCard";
import { SearchBar } from "../../components/SearchBar";
import { useAppTheme } from "../../contexts/ThemeContext";
import {
    useAddToCart,
    useAddToFavorites,
    useFavorites,
    useRecommendations,
    useRemoveFromFavorites,
    useSearchBooks,
    useSession,
    useTopBooks,
} from "../../hooks/useApi";
import { Book } from "../../lib/api";

export default function HomeScreen() {
    const theme = useAppTheme();
    const [searchQuery, setSearchQuery] = useState("");
    const [refreshing, setRefreshing] = useState(false);

    // API hooks
    const { data: session } = useSession();
    const {
        data: topBooks,
        isLoading: topBooksLoading,
        refetch: refetchTopBooks,
    } = useTopBooks();
    const { data: searchResults, isLoading: searchLoading } =
        useSearchBooks(searchQuery);
    const { data: recommendations, refetch: refetchRecommendations } =
        useRecommendations();
    const { data: favorites } = useFavorites(session?.user?.id || "");

    // Mutations
    const addToCartMutation = useAddToCart();
    const addToFavoritesMutation = useAddToFavorites();
    const removeFromFavoritesMutation = useRemoveFromFavorites();

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await Promise.all([refetchTopBooks(), refetchRecommendations()]);
        } finally {
            setRefreshing(false);
        }
    };

    const handleAddToCart = (book: Book) => {
        addToCartMutation.mutate(
            { bookId: book.id, quantity: 1 },
            {
                onSuccess: () => {
                    // Could show a toast notification here
                    console.log(`Added ${book.title} to cart`);
                },
                onError: (error) => {
                    console.error("Failed to add to cart:", error);
                },
            }
        );
    };

    const handleFavoriteToggle = (book: Book) => {
        if (!session?.user?.id) return;

        const isFavorite = favorites?.some((fav) => fav.id === book.id);

        if (isFavorite) {
            removeFromFavoritesMutation.mutate({
                userId: session.user.id,
                bookId: book.id,
            });
        } else {
            addToFavoritesMutation.mutate({
                userId: session.user.id,
                bookId: book.id,
            });
        }
    };

    const isFavorite = (book: Book) => {
        return favorites?.some((fav) => fav.id === book.id) || false;
    };

    const renderBookCard = ({ item }: { item: Book }) => (
        <BookCard
            book={item}
            onPress={() => {
                // Navigate to book details
                console.log("Navigate to book details:", item.id);
            }}
            onFavoritePress={
                session?.user ? () => handleFavoriteToggle(item) : undefined
            }
            onAddToCart={() => handleAddToCart(item)}
            isFavorite={isFavorite(item)}
            showAddToCart={item.stockQuantity > 0}
        />
    );

    const renderSection = (
        title: string,
        books: Book[] | undefined,
        loading: boolean
    ) => {
        if (!books || books.length === 0) {
            return null;
        }

        return (
            <View style={styles.section}>
                <Text
                    style={[styles.sectionTitle, { color: theme.colors.text }]}
                >
                    {title}
                </Text>
                <FlatList
                    data={books}
                    renderItem={renderBookCard}
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.booksList}
                    ItemSeparatorComponent={() => (
                        <View style={{ width: 12 }} />
                    )}
                />
            </View>
        );
    };

    // Show search results if searching
    if (searchQuery.length >= 2) {
        return (
            <View
                style={[
                    styles.container,
                    { backgroundColor: theme.colors.background },
                ]}
            >
                <SearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search books..."
                />

                <ScrollView style={styles.content}>
                    {searchLoading ? (
                        <Text
                            style={[
                                styles.loadingText,
                                { color: theme.colors.textSecondary },
                            ]}
                        >
                            Searching...
                        </Text>
                    ) : searchResults && searchResults.length > 0 ? (
                        <View style={styles.searchResults}>
                            <Text
                                style={[
                                    styles.sectionTitle,
                                    { color: theme.colors.text },
                                ]}
                            >
                                Search Results ({searchResults.length})
                            </Text>
                            <View style={styles.searchGrid}>
                                {searchResults.map((book) => (
                                    <View
                                        key={book.id}
                                        style={styles.searchBookItem}
                                    >
                                        <BookCard
                                            book={book}
                                            onPress={() =>
                                                console.log(
                                                    "Navigate to book details:",
                                                    book.id
                                                )
                                            }
                                            onFavoritePress={
                                                session?.user
                                                    ? () =>
                                                          handleFavoriteToggle(
                                                              book
                                                          )
                                                    : undefined
                                            }
                                            onAddToCart={() =>
                                                handleAddToCart(book)
                                            }
                                            isFavorite={isFavorite(book)}
                                            showAddToCart={
                                                book.stockQuantity > 0
                                            }
                                        />
                                    </View>
                                ))}
                            </View>
                        </View>
                    ) : (
                        <Text
                            style={[
                                styles.noResultsText,
                                { color: theme.colors.textSecondary },
                            ]}
                        >
                            No books found for "{searchQuery}"
                        </Text>
                    )}
                </ScrollView>
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
            <SearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search books..."
            />

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
            >
                {session?.user &&
                    renderSection(
                        "Recommended for You",
                        recommendations?.books,
                        false
                    )}
                {renderSection("Bestsellers", topBooks, topBooksLoading)}

                {/* Welcome message for non-authenticated users */}
                {!session?.user && (
                    <View
                        style={[
                            styles.welcomeSection,
                            {
                                backgroundColor:
                                    theme.colors.backgroundSecondary,
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.welcomeTitle,
                                { color: theme.colors.text },
                            ]}
                        >
                            Welcome to Bookstore!
                        </Text>
                        <Text
                            style={[
                                styles.welcomeText,
                                { color: theme.colors.textSecondary },
                            ]}
                        >
                            Sign in to get personalized recommendations and
                            access your favorites and cart.
                        </Text>
                        <TouchableOpacity
                            style={[
                                styles.signInButton,
                                { backgroundColor: theme.colors.primary },
                            ]}
                            onPress={() => {
                                // Navigate to sign in
                                console.log("Navigate to sign in");
                            }}
                        >
                            <Text
                                style={[
                                    styles.signInButtonText,
                                    { color: theme.colors.white },
                                ]}
                            >
                                Sign In
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "700",
        marginHorizontal: 16,
        marginBottom: 16,
    },
    booksList: {
        paddingHorizontal: 16,
    },
    loadingText: {
        textAlign: "center",
        marginTop: 32,
        fontSize: 16,
    },
    searchResults: {
        padding: 16,
    },
    searchGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    searchBookItem: {
        width: "48%",
        marginBottom: 16,
    },
    noResultsText: {
        textAlign: "center",
        marginTop: 32,
        fontSize: 16,
        paddingHorizontal: 32,
    },
    welcomeSection: {
        margin: 16,
        padding: 20,
        borderRadius: 12,
        alignItems: "center",
    },
    welcomeTitle: {
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 8,
        textAlign: "center",
    },
    welcomeText: {
        fontSize: 16,
        textAlign: "center",
        lineHeight: 24,
        marginBottom: 20,
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
});
