import { BookCard } from "@/components/BookCard";
import { SearchBar } from "@/components/SearchBar";
import { useAppTheme } from "@/contexts/ThemeContext";
import {
    useAddToFavorites,
    useFavorites,
    useRecommendations,
    useRemoveFromFavorites,
    useSearchBooks,
    useSession,
    useTopBooks,
} from "@/hooks/useApi";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    FlatList,
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function HomeScreen() {
    const theme = useAppTheme();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);

    // API hooks
    const { data: session } = useSession();
    const { data: topBooks } = useTopBooks();
    const { data: searchData } = useSearchBooks(searchQuery);
    const { data: recommendations } = useRecommendations();
    const { data: favorites } = useFavorites(session?.user?.id || "");

    // Mutations
    const addToFavoritesMutation = useAddToFavorites();
    const removeFromFavoritesMutation = useRemoveFromFavorites();

    const isAuthenticated = !!session?.user;

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (!query.trim()) {
            setSearchResults([]);
        }
    };

    // Update search results when search data changes
    React.useEffect(() => {
        if (searchQuery.trim() && searchData) {
            setSearchResults(searchData);
        } else if (!searchQuery.trim()) {
            setSearchResults([]);
        }
    }, [searchData, searchQuery]);

    const handleFavoriteToggle = (bookId: string) => {
        if (!session?.user?.id) return;

        const isFavorite = favorites?.some((fav) => fav.id === bookId);

        if (isFavorite) {
            removeFromFavoritesMutation.mutate({
                userId: session.user.id,
                bookId: bookId,
            });
        } else {
            addToFavoritesMutation.mutate({
                userId: session.user.id,
                bookId: bookId,
            });
        }
    };

    const isFavorite = (bookId: string) => {
        return favorites?.some((fav) => fav.id === bookId) || false;
    };

    const renderFeaturedSection = () => {
        if (!topBooks || topBooks.length === 0) return null;

        const featuredBook = topBooks[0];

        return (
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text
                        style={[
                            styles.sectionTitle,
                            {
                                color: theme.colors.text,
                                fontFamily: theme.typography.fontFamily.bold,
                            },
                        ]}
                    >
                        Featured Book
                    </Text>
                </View>
                <BookCard
                    book={featuredBook}
                    variant="featured"
                    onFavoritePress={() =>
                        handleFavoriteToggle(featuredBook.id)
                    }
                    isFavorite={isFavorite(featuredBook.id)}
                />
            </View>
        );
    };

    const renderBestsellersSection = () => {
        if (!topBooks || topBooks.length === 0) return null;

        return (
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text
                        style={[
                            styles.sectionTitle,
                            {
                                color: theme.colors.text,
                                fontFamily: theme.typography.fontFamily.bold,
                            },
                        ]}
                    >
                        Bestsellers
                    </Text>
                    <TouchableOpacity style={styles.seeAllButton}>
                        <Text
                            style={[
                                styles.seeAllText,
                                {
                                    color: theme.colors.secondary,
                                    fontFamily:
                                        theme.typography.fontFamily.medium,
                                },
                            ]}
                        >
                            See all
                        </Text>
                        <Ionicons
                            name="chevron-forward"
                            size={16}
                            color={theme.colors.secondary}
                        />
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={topBooks.slice(1)} // Skip first book as it's featured
                    renderItem={({ item }) => (
                        <BookCard
                            book={item}
                            variant="default"
                            onFavoritePress={() =>
                                handleFavoriteToggle(item.id)
                            }
                            isFavorite={isFavorite(item.id)}
                        />
                    )}
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalList}
                    ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
                />
            </View>
        );
    };

    const renderRecommendationsSection = () => {
        if (
            !isAuthenticated ||
            !recommendations?.books ||
            recommendations.books.length === 0
        ) {
            return null;
        }

        return (
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text
                        style={[
                            styles.sectionTitle,
                            {
                                color: theme.colors.text,
                                fontFamily: theme.typography.fontFamily.bold,
                            },
                        ]}
                    >
                        Recommended for you
                    </Text>
                    <TouchableOpacity style={styles.seeAllButton}>
                        <Text
                            style={[
                                styles.seeAllText,
                                {
                                    color: theme.colors.secondary,
                                    fontFamily:
                                        theme.typography.fontFamily.medium,
                                },
                            ]}
                        >
                            See all
                        </Text>
                        <Ionicons
                            name="chevron-forward"
                            size={16}
                            color={theme.colors.secondary}
                        />
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={recommendations.books}
                    renderItem={({ item }) => (
                        <BookCard
                            book={item}
                            variant="compact"
                            onFavoritePress={() =>
                                handleFavoriteToggle(item.id)
                            }
                            isFavorite={isFavorite(item.id)}
                        />
                    )}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={false}
                />
            </View>
        );
    };

    const renderSearchResults = () => {
        if (!searchQuery || searchResults.length === 0) return null;

        return (
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text
                        style={[
                            styles.sectionTitle,
                            {
                                color: theme.colors.text,
                                fontFamily: theme.typography.fontFamily.bold,
                                marginTop: -16,
                            },
                        ]}
                    >
                        Search Results
                    </Text>
                </View>
                <FlatList
                    data={searchResults}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.searchResultItem,
                                { backgroundColor: theme.colors.surface },
                                theme.shadows.sm,
                            ]}
                            onPress={() => router.push(`/book/${item.id}`)}
                        >
                            <Image
                                source={{ uri: item.imageURL }}
                                style={styles.searchResultImage}
                                resizeMode="cover"
                            />
                            <View style={styles.searchResultContent}>
                                <Text
                                    style={[
                                        styles.searchResultTitle,
                                        {
                                            color: theme.colors.text,
                                            fontFamily:
                                                theme.typography.fontFamily
                                                    .bold,
                                        },
                                    ]}
                                    numberOfLines={2}
                                >
                                    {item.title}
                                </Text>
                                <Text
                                    style={[
                                        styles.searchResultSubtitle,
                                        {
                                            color: theme.colors.textSecondary,
                                            fontFamily:
                                                theme.typography.fontFamily
                                                    .regular,
                                        },
                                    ]}
                                >
                                    Tap to view details
                                </Text>
                            </View>
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color={theme.colors.textLight}
                            />
                        </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={false}
                    ItemSeparatorComponent={() => (
                        <View style={{ height: 8 }} />
                    )}
                />
            </View>
        );
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

            <SafeAreaView>
                {/* Header */}
                <View style={[styles.header]}>
                    <View style={styles.headerContent}>
                        <View>
                            <Text
                                style={[
                                    styles.headerTitle,
                                    {
                                        color: theme.colors.text,
                                        fontFamily:
                                            theme.typography.fontFamily.bold,
                                    },
                                ]}
                            >
                                Bookstore
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Search */}
                <View style={[styles.searchSection]}>
                    <SearchBar
                        value={searchQuery}
                        onChangeText={handleSearch}
                        placeholder="Search for books, authors, or genres..."
                    />
                </View>
            </SafeAreaView>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {renderSearchResults()}
                {!searchQuery && renderFeaturedSection()}
                {!searchQuery && renderBestsellersSection()}
                {!searchQuery && renderRecommendationsSection()}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingBottom: 64,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    headerContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    greeting: {
        fontSize: 14,
        marginBottom: 2,
    },
    headerTitle: {
        fontSize: 24,
    },
    notificationButton: {
        position: "relative",
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
    },
    notificationBadge: {
        position: "absolute",
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    searchSection: {
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 32,
    },
    welcomeSection: {
        marginHorizontal: 20,
        marginTop: 16,
        borderRadius: 16,
        padding: 24,
    },
    welcomeContent: {
        alignItems: "center",
        textAlign: "center",
    },
    welcomeTitle: {
        fontSize: 24,
        textAlign: "center",
        marginBottom: 12,
    },
    welcomeDescription: {
        fontSize: 16,
        textAlign: "center",
        lineHeight: 24,
        marginBottom: 24,
    },
    signInButton: {
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 12,
    },
    signInButtonText: {
        fontSize: 16,
    },
    section: {
        marginTop: 32,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
    },
    seeAllButton: {
        flexDirection: "row",
        alignItems: "center",
    },
    seeAllText: {
        fontSize: 14,
        marginRight: 4,
    },
    horizontalList: {
        paddingLeft: 20,
        paddingRight: 8,
    },
    searchResultItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        marginHorizontal: 20,
        borderRadius: 12,
    },
    searchResultImage: {
        width: 48,
        height: 64,
        borderRadius: 8,
        marginRight: 16,
    },
    searchResultContent: {
        flex: 1,
        justifyContent: "center",
    },
    searchResultTitle: {
        fontSize: 16,
        marginBottom: 4,
    },
    searchResultSubtitle: {
        fontSize: 14,
    },
});
