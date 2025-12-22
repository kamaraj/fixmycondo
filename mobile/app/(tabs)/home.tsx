/**
 * FixMyCondo - Home Dashboard Screen
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '../../components/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardAPI, DashboardStats, ComplaintsAPI } from '../../services/api';

export default function HomeScreen() {
    const { user, logout } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentComplaints, setRecentComplaints] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async () => {
        try {
            const [statsData, complaintsData] = await Promise.all([
                DashboardAPI.getStats(),
                ComplaintsAPI.getAll({ page_size: 3 })
            ]);
            setStats(statsData);
            setRecentComplaints(complaintsData.items);
        } catch (error: any) {
            console.error('Failed to load home data:', error);
            if (error.response?.status === 401) {
                logout();
                router.replace('/(auth)/login');
            }
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'submitted': return '#dc3545';
            case 'in_progress':
            case 'assigned': return '#ffc107';
            case 'completed':
            case 'closed': return '#28a745';
            default: return '#6c757d';
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2D6CDF" />
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>{getGreeting()},</Text>
                    <Text style={styles.userName}>{user?.full_name || 'Resident'}</Text>
                </View>
                <TouchableOpacity style={styles.notificationBtn}>
                    <Ionicons name="notifications-outline" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.actionsGrid}>
                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => router.push('/complaint/create')}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: '#dc354520' }]}>
                            <Ionicons name="warning-outline" size={28} color="#dc3545" />
                        </View>
                        <Text style={styles.actionLabel}>Report Issue</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => router.push('/booking/create')}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: '#28a74520' }]}>
                            <Ionicons name="calendar-outline" size={28} color="#28a745" />
                        </View>
                        <Text style={styles.actionLabel}>Book Facility</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => router.push('/visitor')}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: '#17a2b820' }]}>
                            <Ionicons name="person-add-outline" size={28} color="#17a2b8" />
                        </View>
                        <Text style={styles.actionLabel}>Visitor Pass</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => router.push('/(tabs)/announcements')}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: '#ffc10720' }]}>
                            <Ionicons name="megaphone-outline" size={28} color="#ffc107" />
                        </View>
                        <Text style={styles.actionLabel}>Announcements</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Emergency SOS Button */}
            <TouchableOpacity
                style={styles.sosCard}
                onPress={() => router.push('/emergency')}
            >
                <View style={styles.sosLeft}>
                    <View style={styles.sosIconBg}>
                        <Ionicons name="alert-circle" size={32} color="#dc3545" />
                    </View>
                    <View>
                        <Text style={styles.sosTitle}>Emergency SOS</Text>
                        <Text style={styles.sosSubtitle}>Quick alert to security</Text>
                    </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#dc3545" />
            </TouchableOpacity>

            {/* Stats Overview */}
            {stats && (
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Overview</Text>
                        <TouchableOpacity onPress={() => router.push('/dashboard')}>
                            <Text style={styles.seeAllText}>See Analytics</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.statsGrid}>
                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>{stats.total_complaints}</Text>
                            <Text style={styles.statLabel}>Total Issues</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={[styles.statNumber, { color: '#ffc107' }]}>
                                {stats.in_progress_complaints}
                            </Text>
                            <Text style={styles.statLabel}>In Progress</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={[styles.statNumber, { color: '#dc3545' }]}>
                                {stats.overdue_complaints}
                            </Text>
                            <Text style={styles.statLabel}>Overdue</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={[styles.statNumber, { color: '#28a745' }]}>
                                {stats.completed_today}
                            </Text>
                            <Text style={styles.statLabel}>Resolved Today</Text>
                        </View>
                    </View>
                </View>
            )}

            {/* Recent Activity */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recently Reported</Text>
                    <TouchableOpacity onPress={() => router.push('/(tabs)/complaints')}>
                        <Text style={styles.seeAll}>See All</Text>
                    </TouchableOpacity>
                </View>

                {recentComplaints.length > 0 ? (
                    <View style={styles.recentList}>
                        {recentComplaints.map((complaint) => (
                            <TouchableOpacity
                                key={complaint.id}
                                style={styles.complaintItem}
                                onPress={() => router.push({
                                    pathname: '/complaint/[id]',
                                    params: { id: complaint.id }
                                })}
                            >
                                <View style={[styles.statusDot, { backgroundColor: getStatusColor(complaint.status) }]} />
                                <View style={styles.complaintMain}>
                                    <Text style={styles.complaintTitle} numberOfLines={1}>{complaint.title}</Text>
                                    <Text style={styles.complaintDate}>
                                        {new Date(complaint.created_at).toLocaleDateString()}
                                    </Text>
                                </View>
                                <View style={styles.statusBadge}>
                                    <Text style={[styles.statusTabText, { color: getStatusColor(complaint.status) }]}>
                                        {complaint.status.replace('_', ' ')}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : (
                    <View style={styles.emptyCard}>
                        <Ionicons name="checkmark-circle-outline" size={48} color="#28a745" />
                        <Text style={styles.emptyText}>No pending issues</Text>
                        <Text style={styles.emptySubtext}>All maintenance requests are being handled</Text>
                    </View>
                )}
            </View>

            <View style={{ height: 24 }} />
        </ScrollView>
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
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingTop: 16,
        backgroundColor: '#fff',
    },
    greeting: {
        fontSize: 14,
        color: '#6c757d',
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
    },
    notificationBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#f8f9fa',
        justifyContent: 'center',
        alignItems: 'center',
    },
    section: {
        padding: 20,
        paddingTop: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
    },
    seeAll: {
        fontSize: 14,
        color: '#2D6CDF',
        fontWeight: '500',
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -6,
    },
    actionCard: {
        width: '50%',
        padding: 6,
    },
    actionIcon: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    actionLabel: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -6,
    },
    statCard: {
        width: '50%',
        padding: 6,
    },
    statNumber: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2D6CDF',
    },
    statLabel: {
        fontSize: 13,
        color: '#6c757d',
        marginTop: 2,
    },
    emptyCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 32,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginTop: 12,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#6c757d',
        marginTop: 4,
    },
    sosCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginTop: 8,
        padding: 16,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#dc354530',
        shadowColor: '#dc3545',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    sosLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    sosIconBg: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#dc354515',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sosTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#dc3545',
    },
    sosSubtitle: {
        fontSize: 12,
        color: '#6c757d',
    },
    seeAllText: {
        fontSize: 14,
        color: '#2D6CDF',
        fontWeight: '500',
    },
    recentList: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    complaintItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f8f9fa',
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 12,
    },
    complaintMain: {
        flex: 1,
    },
    complaintTitle: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    complaintDate: {
        fontSize: 12,
        color: '#adb5bd',
        marginTop: 2,
    },
    statusBadge: {
        backgroundColor: '#f8f9fa',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 8,
    },
    statusTabText: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
});
