import { ApiErrorBoundary } from "@/components/ApiErrorBoundary";
import { SearchBar } from "@/components/SearchBar";
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
import { BookCard } from "../../components/BookCard";
import { useApiStatus } from "../../contexts/ApiStatusContext";
import { useI18n } from "../../contexts/I18nContext";
import { useAppTheme } from "../../contexts/ThemeContext";
import { useUser } from "../../contexts/UserContext";
import {
    useAddToFavorites,
    useFavorites,
    useRecommendations,
    useRemoveFromFavorites,
    useSearchBooks,
    useTopBooks,
} from "../../hooks/useApi";

export default function HomeScreen() {
    const theme = useAppTheme();
    const { t } = useI18n();
    const { isApiAvailable } = useApiStatus();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);

    // API hooks
    const { user, isAuthenticated } = useUser();
    const {
        data: topBooks,
        isLoading: topBooksLoading,
        error: topBooksError,
    } = useTopBooks();
    const { data: searchData } = useSearchBooks(searchQuery);
    const { data: recommendations } = useRecommendations();
    const { data: favorites } = useFavorites(user?.id || "");

    // Mutations
    const addToFavoritesMutation = useAddToFavorites();
    const removeFromFavoritesMutation = useRemoveFromFavorites();

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
        if (!user?.id) return;

        const isFavorite = favorites?.some((fav) => fav.book.id === bookId);

        if (isFavorite) {
            removeFromFavoritesMutation.mutate(
                {
                    userId: user.id,
                    bookId: bookId,
                },
                {
                    onError: (error: any) => {
                        if (error?.status === 401) {
                            console.log(
                                "[HomeScreen] Favorites feature temporarily unavailable due to server authentication issue"
                            );
                        }
                    },
                }
            );
        } else {
            addToFavoritesMutation.mutate(
                {
                    userId: user.id,
                    bookId: bookId,
                },
                {
                    onError: (error: any) => {
                        if (error?.status === 401) {
                            console.log(
                                "[HomeScreen] Favorites feature temporarily unavailable due to server authentication issue"
                            );
                        }
                    },
                }
            );
        }
    };

    const isFavorite = (bookId: string) => {
        return favorites?.some((fav) => fav.book.id === bookId) || false;
    };

    const renderFeaturedSection = () => {
        // Debug logging
        console.log("renderFeaturedSection:", {
            topBooksLoading,
            topBooksError: topBooksError?.message,
            isApiUnavailable: (topBooksError as any)?.isApiUnavailable,
            isApiAvailable,
            hasTopBooks: !!topBooks,
        });

        // Show loading state
        if (topBooksLoading) {
            return (
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text
                            style={[
                                styles.sectionTitle,
                                {
                                    color: theme.colors.text,
                                    fontFamily:
                                        theme.typography.fontFamily.bold,
                                },
                            ]}
                        >
                            {t("home.sections.featured")}
                        </Text>
                    </View>
                    <View style={styles.loadingCard}>
                        <Text
                            style={[
                                styles.loadingText,
                                { color: theme.colors.textSecondary },
                            ]}
                        >
                            {t("common.loading")}
                        </Text>
                    </View>
                </View>
            );
        }

        // Show offline content when API is unavailable
        if (
            !isApiAvailable ||
            (topBooksError && (topBooksError as any)?.isApiUnavailable) ||
            (topBooksError && !topBooks)
        ) {
            return (
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text
                            style={[
                                styles.sectionTitle,
                                {
                                    color: theme.colors.text,
                                    fontFamily:
                                        theme.typography.fontFamily.bold,
                                },
                            ]}
                        >
                            {t("home.sections.featured")}
                        </Text>
                    </View>
                    <View
                        style={[
                            styles.offlineCard,
                            { backgroundColor: theme.colors.surface },
                        ]}
                    >
                        <Ionicons
                            name="cloud-offline-outline"
                            size={48}
                            color={theme.colors.textLight}
                            style={styles.offlineIcon}
                        />
                        <Text
                            style={[
                                styles.offlineTitle,
                                { color: theme.colors.text },
                            ]}
                        >
                            Content Unavailable
                        </Text>
                        <Text
                            style={[
                                styles.offlineMessage,
                                { color: theme.colors.textSecondary },
                            ]}
                        >
                            Featured books will appear here when connection is
                            restored.
                        </Text>
                    </View>
                </View>
            );
        }

        // Regular content - if no data and no error, return null
        if (!topBooks || topBooks.length === 0) {
            // If there's no data and no error, don't show anything (normal empty state)
            if (!topBooksError) {
                return null;
            }
            // If there's an error but we didn't catch it above, show offline content as fallback
            return (
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text
                            style={[
                                styles.sectionTitle,
                                {
                                    color: theme.colors.text,
                                    fontFamily:
                                        theme.typography.fontFamily.bold,
                                },
                            ]}
                        >
                            {t("home.sections.featured")}
                        </Text>
                    </View>
                    <View
                        style={[
                            styles.offlineCard,
                            { backgroundColor: theme.colors.surface },
                        ]}
                    >
                        <Ionicons
                            name="cloud-offline-outline"
                            size={48}
                            color={theme.colors.textLight}
                            style={styles.offlineIcon}
                        />
                        <Text
                            style={[
                                styles.offlineTitle,
                                { color: theme.colors.text },
                            ]}
                        >
                            Content Unavailable
                        </Text>
                        <Text
                            style={[
                                styles.offlineMessage,
                                { color: theme.colors.textSecondary },
                            ]}
                        >
                            Featured books will appear here when connection is
                            restored.
                        </Text>
                    </View>
                </View>
            );
        }

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
                        {t("home.sections.featured")}
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
        // Show loading state
        if (topBooksLoading) {
            return (
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text
                            style={[
                                styles.sectionTitle,
                                {
                                    color: theme.colors.text,
                                    fontFamily:
                                        theme.typography.fontFamily.bold,
                                },
                            ]}
                        >
                            {t("home.sections.bestsellers")}
                        </Text>
                    </View>
                    <View style={styles.loadingCard}>
                        <Text
                            style={[
                                styles.loadingText,
                                { color: theme.colors.textSecondary },
                            ]}
                        >
                            {t("common.loading")}
                        </Text>
                    </View>
                </View>
            );
        }

        // Show offline content when API is unavailable
        if (
            !isApiAvailable ||
            (topBooksError && (topBooksError as any)?.isApiUnavailable) ||
            (topBooksError && !topBooks)
        ) {
            return (
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text
                            style={[
                                styles.sectionTitle,
                                {
                                    color: theme.colors.text,
                                    fontFamily:
                                        theme.typography.fontFamily.bold,
                                },
                            ]}
                        >
                            {t("home.sections.bestsellers")}
                        </Text>
                    </View>
                    <View
                        style={[
                            styles.offlineCard,
                            { backgroundColor: theme.colors.surface },
                        ]}
                    >
                        <Ionicons
                            name="library-outline"
                            size={48}
                            color={theme.colors.textLight}
                            style={styles.offlineIcon}
                        />
                        <Text
                            style={[
                                styles.offlineTitle,
                                { color: theme.colors.text },
                            ]}
                        >
                            Bestsellers Unavailable
                        </Text>
                        <Text
                            style={[
                                styles.offlineMessage,
                                { color: theme.colors.textSecondary },
                            ]}
                        >
                            Our bestselling books will be shown here when
                            connection is restored.
                        </Text>
                    </View>
                </View>
            );
        }

        // Regular content - if no data and no error, return null
        if (!topBooks || topBooks.length === 0) {
            // If there's no data and no error, don't show anything (normal empty state)
            if (!topBooksError) {
                return null;
            }
            // If there's an error but we didn't catch it above, show offline content as fallback
            return (
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text
                            style={[
                                styles.sectionTitle,
                                {
                                    color: theme.colors.text,
                                    fontFamily:
                                        theme.typography.fontFamily.bold,
                                },
                            ]}
                        >
                            {t("home.sections.bestsellers")}
                        </Text>
                    </View>
                    <View
                        style={[
                            styles.offlineCard,
                            { backgroundColor: theme.colors.surface },
                        ]}
                    >
                        <Ionicons
                            name="library-outline"
                            size={48}
                            color={theme.colors.textLight}
                            style={styles.offlineIcon}
                        />
                        <Text
                            style={[
                                styles.offlineTitle,
                                { color: theme.colors.text },
                            ]}
                        >
                            Bestsellers Unavailable
                        </Text>
                        <Text
                            style={[
                                styles.offlineMessage,
                                { color: theme.colors.textSecondary },
                            ]}
                        >
                            Our bestselling books will be shown here when
                            connection is restored.
                        </Text>
                    </View>
                </View>
            );
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
                        {t("home.sections.bestsellers")}
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
                            {t("home.sections.seeAll")}
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
                        {t("home.sections.recommendations")}
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
                            {t("home.sections.seeAll")}
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
                    ItemSeparatorComponent={() => (
                        <View style={{ height: 8 }} />
                    )}
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
                                {t("home.appName")}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* API Status Banner */}
                {!isApiAvailable && (
                    <ApiErrorBoundary minimalUI showRetry>
                        <></>
                    </ApiErrorBoundary>
                )}

                {/* Search */}
                <View style={[styles.searchSection]}>
                    <SearchBar
                        value={searchQuery}
                        onChangeText={handleSearch}
                        placeholder={t("home.search.placeholder")}
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

    // Loading and offline states
    loadingCard: {
        height: 200,
        backgroundColor: "transparent",
        borderRadius: 16,
        marginHorizontal: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        fontSize: 16,
    },
    offlineCard: {
        height: 200,
        borderRadius: 16,
        marginHorizontal: 20,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    offlineIcon: {
        marginBottom: 16,
    },
    offlineTitle: {
        fontSize: 18,
        fontWeight: "600",
        textAlign: "center",
        marginBottom: 8,
    },
    offlineMessage: {
        fontSize: 14,
        textAlign: "center",
        lineHeight: 20,
    },
});
