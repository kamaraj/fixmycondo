/**
 * FixMyCondo - Announcements Screen
 */
import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '../../components/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import { AnnouncementsAPI, Announcement } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';

export default function AnnouncementsScreen() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadAnnouncements = async () => {
        try {
            const data = await AnnouncementsAPI.getAll({ is_published: true });
            setAnnouncements(data.items || []);
        } catch (error) {
            console.error('Failed to load announcements:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadAnnouncements();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadAnnouncements();
    };

    const renderAnnouncement = ({ item }: { item: Announcement }) => (
        <TouchableOpacity
            style={styles.announcementCard}
            onPress={() => router.push(`/announcement/${item.id}`)}
        >
            <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                    <Ionicons name="megaphone" size={24} color="#2D6CDF" />
                </View>
                <Text style={styles.timeAgo}>
                    {formatDistanceToNow(new Date(item.published_at || item.created_at), {
                        addSuffix: true,
                    })}
                </Text>
            </View>

            <Text style={styles.announcementTitle}>{item.title}</Text>
            <Text style={styles.announcementPreview} numberOfLines={2}>
                {item.content}
            </Text>

            <View style={styles.readMore}>
                <Text style={styles.readMoreText}>Read more</Text>
                <Ionicons name="chevron-forward" size={16} color="#2D6CDF" />
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2D6CDF" />
                </View>
            ) : (
                <FlatList
                    data={announcements}
                    renderItem={renderAnnouncement}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="megaphone-outline" size={64} color="#6c757d" />
                            <Text style={styles.emptyTitle}>No Announcements</Text>
                            <Text style={styles.emptySubtitle}>
                                Check back later for building updates
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 16,
    },
    announcementCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#2D6CDF15',
        justifyContent: 'center',
        alignItems: 'center',
    },
    timeAgo: {
        fontSize: 13,
        color: '#6c757d',
    },
    announcementTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    announcementPreview: {
        fontSize: 14,
        color: '#6c757d',
        lineHeight: 20,
    },
    readMore: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    readMoreText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2D6CDF',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 64,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#6c757d',
        marginTop: 4,
    },
});
