/**
 * FixMyCondo - Announcement Detail Screen
 */
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '../../components/Ionicons';
import { useLocalSearchParams } from 'expo-router';
import { AnnouncementsAPI, Announcement } from '../../services/api';
import { format, formatDistanceToNow } from 'date-fns';

export default function AnnouncementDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [announcement, setAnnouncement] = useState<Announcement | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadAnnouncement();
    }, [id]);

    const loadAnnouncement = async () => {
        try {
            const data = await AnnouncementsAPI.getById(Number(id));
            setAnnouncement(data);
        } catch (error) {
            console.error('Failed to load announcement:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2D6CDF" />
            </View>
        );
    }

    if (!announcement) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="document-text-outline" size={64} color="#6c757d" />
                <Text style={styles.errorText}>Announcement not found</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <Ionicons name="megaphone" size={32} color="#2D6CDF" />
                </View>
                <Text style={styles.timeAgo}>
                    {formatDistanceToNow(new Date(announcement.published_at || announcement.created_at), {
                        addSuffix: true,
                    })}
                </Text>
            </View>

            <Text style={styles.title}>{announcement.title}</Text>

            <View style={styles.metaRow}>
                <Ionicons name="calendar-outline" size={16} color="#6c757d" />
                <Text style={styles.metaText}>
                    {format(new Date(announcement.published_at || announcement.created_at), 'EEEE, MMMM d, yyyy')}
                </Text>
            </View>

            <View style={styles.divider} />

            <Text style={styles.content}>{announcement.content}</Text>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 24,
    },
    errorText: {
        fontSize: 18,
        color: '#6c757d',
        marginTop: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#2D6CDF15',
        justifyContent: 'center',
        alignItems: 'center',
    },
    timeAgo: {
        fontSize: 14,
        color: '#6c757d',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
        lineHeight: 32,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 20,
    },
    metaText: {
        fontSize: 14,
        color: '#6c757d',
    },
    divider: {
        height: 1,
        backgroundColor: '#e9ecef',
        marginBottom: 20,
    },
    content: {
        fontSize: 16,
        color: '#333',
        lineHeight: 26,
    },
});
