/**
 * FixMyCondo - Technician Jobs Screen
 * Shows jobs assigned to the technician
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
import { format, differenceInHours } from 'date-fns';

const PRIORITY_COLORS: Record<string, string> = {
    low: '#28a745',
    medium: '#ffc107',
    high: '#fd7e14',
    critical: '#dc3545',
};

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

export default function TechnicianJobsScreen() {
    const [jobs, setJobs] = useState<Complaint[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<'pending' | 'completed'>('pending');

    const loadJobs = async () => {
        try {
            const params: any = { assigned_to_me: true };
            if (filter === 'pending') {
                // Get assigned and in_progress jobs
                const data = await ComplaintsAPI.getAll({ ...params });
                setJobs((data.items || []).filter(j =>
                    !['completed', 'closed', 'cancelled'].includes(j.status)
                ));
            } else {
                const data = await ComplaintsAPI.getAll({ ...params, status: 'completed' });
                setJobs(data.items || []);
            }
        } catch (error) {
            console.error('Failed to load jobs:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadJobs();
        }, [filter])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadJobs();
    };

    const getSlaUrgency = (deadline: string | undefined, breached: boolean) => {
        if (breached) return { text: 'OVERDUE', color: '#dc3545' };
        if (!deadline) return null;

        const hoursLeft = differenceInHours(new Date(deadline), new Date());
        if (hoursLeft <= 4) return { text: `${hoursLeft}h left`, color: '#dc3545' };
        if (hoursLeft <= 12) return { text: `${hoursLeft}h left`, color: '#fd7e14' };
        if (hoursLeft <= 24) return { text: `${hoursLeft}h left`, color: '#ffc107' };
        return { text: `${hoursLeft}h left`, color: '#28a745' };
    };

    const renderJob = ({ item }: { item: Complaint }) => {
        const slaInfo = getSlaUrgency(item.sla_deadline, item.is_sla_breached);

        return (
            <TouchableOpacity
                style={styles.jobCard}
                onPress={() => router.push(`/technician/job/${item.id}`)}
            >
                {/* Priority indicator */}
                <View
                    style={[
                        styles.priorityBar,
                        { backgroundColor: PRIORITY_COLORS[item.priority] }
                    ]}
                />

                <View style={styles.jobContent}>
                    <View style={styles.jobHeader}>
                        <View style={styles.iconContainer}>
                            <Ionicons
                                name={(CATEGORY_ICONS[item.category] || 'help-circle') as any}
                                size={24}
                                color="#2D6CDF"
                            />
                        </View>
                        <View style={styles.headerContent}>
                            <Text style={styles.jobTitle} numberOfLines={2}>{item.title}</Text>
                            <Text style={styles.jobUnit}>
                                Unit {item.unit_id ? `#${item.unit_id}` : 'N/A'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.jobMeta}>
                        <View style={styles.metaItem}>
                            <Ionicons name="time-outline" size={14} color="#6c757d" />
                            <Text style={styles.metaText}>
                                {format(new Date(item.created_at), 'MMM d, h:mm a')}
                            </Text>
                        </View>

                        {slaInfo && (
                            <View style={[styles.slaBadge, { backgroundColor: `${slaInfo.color}15` }]}>
                                <Ionicons name="timer-outline" size={14} color={slaInfo.color} />
                                <Text style={[styles.slaText, { color: slaInfo.color }]}>
                                    {slaInfo.text}
                                </Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.actionRow}>
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>{item.status.replace('_', ' ')}</Text>
                        </View>
                        <View style={styles.priorityBadge}>
                            <Text style={[styles.priorityText, { color: PRIORITY_COLORS[item.priority] }]}>
                                {item.priority.toUpperCase()}
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {/* Filter Tabs */}
            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[styles.filterTab, filter === 'pending' && styles.filterTabActive]}
                    onPress={() => setFilter('pending')}
                >
                    <Ionicons
                        name="construct-outline"
                        size={18}
                        color={filter === 'pending' ? '#fff' : '#6c757d'}
                    />
                    <Text style={[styles.filterText, filter === 'pending' && styles.filterTextActive]}>
                        Pending Jobs
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterTab, filter === 'completed' && styles.filterTabActive]}
                    onPress={() => setFilter('completed')}
                >
                    <Ionicons
                        name="checkmark-circle-outline"
                        size={18}
                        color={filter === 'completed' ? '#fff' : '#6c757d'}
                    />
                    <Text style={[styles.filterText, filter === 'completed' && styles.filterTextActive]}>
                        Completed
                    </Text>
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2D6CDF" />
                </View>
            ) : (
                <FlatList
                    data={jobs}
                    renderItem={renderJob}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons
                                name={filter === 'pending' ? 'checkmark-done-circle' : 'clipboard-outline'}
                                size={64}
                                color="#28a745"
                            />
                            <Text style={styles.emptyTitle}>
                                {filter === 'pending' ? 'No Pending Jobs' : 'No Completed Jobs'}
                            </Text>
                            <Text style={styles.emptySubtitle}>
                                {filter === 'pending'
                                    ? 'All caught up! Great work!'
                                    : 'Complete some jobs to see them here'}
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
    filterContainer: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    filterTab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: '#f8f9fa',
        gap: 8,
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
    },
    jobCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    priorityBar: {
        width: 4,
    },
    jobContent: {
        flex: 1,
        padding: 16,
    },
    jobHeader: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#2D6CDF10',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    headerContent: {
        flex: 1,
    },
    jobTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    jobUnit: {
        fontSize: 13,
        color: '#6c757d',
    },
    jobMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 12,
        color: '#6c757d',
    },
    slaBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 12,
        gap: 4,
    },
    slaText: {
        fontSize: 12,
        fontWeight: '600',
    },
    actionRow: {
        flexDirection: 'row',
        gap: 8,
    },
    statusBadge: {
        backgroundColor: '#e9ecef',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#495057',
        textTransform: 'capitalize',
    },
    priorityBadge: {
        backgroundColor: 'transparent',
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    priorityText: {
        fontSize: 11,
        fontWeight: '700',
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
        textAlign: 'center',
    },
});
