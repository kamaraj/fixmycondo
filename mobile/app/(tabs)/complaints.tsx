/**
 * FixMyCondo - Complaints List Screen
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
import { ComplaintsAPI, Complaint } from '../../services/api';

const CATEGORY_ICONS: Record<string, string> = {
    plumbing: 'water',
    electrical: 'flash',
    lift: 'swap-vertical',
    security: 'shield',
    common_area: 'business',
    cleaning: 'sparkles',
    renovation: 'hammer',
    structural: 'construct',
    pest: 'bug',
    parking: 'car',
    other: 'help-circle',
};

const STATUS_COLORS: Record<string, string> = {
    submitted: '#6c757d',
    reviewing: '#17a2b8',
    assigned: '#ffc107',
    in_progress: '#2D6CDF',
    pending_parts: '#fd7e14',
    pending_vendor: '#fd7e14',
    completed: '#28a745',
    closed: '#28a745',
    reopened: '#dc3545',
    cancelled: '#6c757d',
};

export default function ComplaintsScreen() {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');

    // Statuses considered as "closed"
    const CLOSED_STATUSES = ['completed', 'closed', 'cancelled'];

    // Statuses considered as "open" (everything else)
    const OPEN_STATUSES = ['submitted', 'reviewing', 'assigned', 'in_progress', 'pending_parts', 'pending_vendor', 'reopened'];

    const loadComplaints = async () => {
        try {
            // Load all complaints, then filter client-side
            // created_by_me=true was restricting admins/techs to only see their own complaints
            const data = await ComplaintsAPI.getAll({ page_size: 100 });
            let items = data.items || [];

            // Apply client-side filtering
            if (filter === 'open') {
                items = items.filter(c => OPEN_STATUSES.includes(c.status));
            } else if (filter === 'closed') {
                items = items.filter(c => CLOSED_STATUSES.includes(c.status));
            }

            setComplaints(items);
        } catch (error) {
            console.error('Failed to load complaints:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            setIsLoading(true);
            loadComplaints();
        }, [filter])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadComplaints();
    };

    const renderComplaint = ({ item }: { item: Complaint }) => (
        <TouchableOpacity
            style={styles.complaintCard}
            onPress={() => router.push(`/complaint/${item.id}`)}
        >
            <View style={styles.cardHeader}>
                <View style={styles.categoryIcon}>
                    <Ionicons
                        name={(CATEGORY_ICONS[item.category] || 'help-circle') as any}
                        size={24}
                        color="#2D6CDF"
                    />
                </View>
                <View style={styles.cardContent}>
                    <Text style={styles.complaintTitle} numberOfLines={1}>
                        {item.title}
                    </Text>
                    <Text style={styles.complaintMeta}>
                        {item.category.replace('_', ' ')} • {new Date(item.created_at).toLocaleDateString()}
                    </Text>
                </View>
                <View
                    style={[
                        styles.statusBadge,
                        { backgroundColor: `${STATUS_COLORS[item.status]}20` },
                    ]}
                >
                    <Text
                        style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}
                    >
                        {item.status.replace('_', ' ')}
                    </Text>
                </View>
            </View>

            {item.is_sla_breached && (
                <View style={styles.breachedBanner}>
                    <Ionicons name="alert-circle" size={16} color="#dc3545" />
                    <Text style={styles.breachedText}>SLA Breached</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Filter Tabs */}
            <View style={styles.filterContainer}>
                {(['all', 'open', 'closed'] as const).map((f) => (
                    <TouchableOpacity
                        key={f}
                        style={[styles.filterTab, filter === f && styles.filterTabActive]}
                        onPress={() => setFilter(f)}
                    >
                        <Text
                            style={[
                                styles.filterText,
                                filter === f && styles.filterTextActive,
                            ]}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2D6CDF" />
                </View>
            ) : (
                <FlatList
                    data={complaints}
                    renderItem={renderComplaint}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons
                                name={filter === 'closed' ? 'clipboard-outline' : 'checkmark-circle-outline'}
                                size={64}
                                color={filter === 'closed' ? '#6c757d' : '#28a745'}
                            />
                            <Text style={styles.emptyTitle}>
                                {filter === 'all' ? 'No Complaints' :
                                    filter === 'open' ? 'No Open Issues' : 'No Closed Issues'}
                            </Text>
                            <Text style={styles.emptySubtitle}>
                                {filter === 'all' ? "You haven't reported any issues yet" :
                                    filter === 'open' ? 'All issues are resolved!' :
                                        'No resolved complaints yet'}
                            </Text>
                            {filter !== 'closed' && (
                                <TouchableOpacity
                                    style={styles.createButton}
                                    onPress={() => router.push('/complaint/create')}
                                >
                                    <Ionicons name="add" size={20} color="#fff" />
                                    <Text style={styles.createButtonText}>Report Issue</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    }
                />
            )}

            {/* FAB */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push('/complaint/create')}
            >
                <Ionicons name="add" size={28} color="#fff" />
            </TouchableOpacity>
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
    filterContainer: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    filterTab: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginRight: 8,
        backgroundColor: '#f8f9fa',
    },
    filterTabActive: {
        backgroundColor: '#2D6CDF',
    },
    filterText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6c757d',
    },
    filterTextActive: {
        color: '#fff',
    },
    listContent: {
        padding: 16,
        paddingBottom: 80,
    },
    complaintCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#2D6CDF10',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    cardContent: {
        flex: 1,
    },
    complaintTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    complaintMeta: {
        fontSize: 13,
        color: '#6c757d',
        textTransform: 'capitalize',
    },
    statusBadge: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    breachedBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f8d7da',
    },
    breachedText: {
        fontSize: 13,
        color: '#dc3545',
        fontWeight: '500',
        marginLeft: 6,
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
        marginBottom: 24,
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2D6CDF',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 24,
    },
    createButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#2D6CDF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#2D6CDF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
});
