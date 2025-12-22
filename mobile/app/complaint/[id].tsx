/**
 * FixMyCondo - Complaint Detail Screen
 * Shows complaint details with timeline and actions
 */
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Platform,
} from 'react-native';
import { Ionicons } from '../../components/Ionicons';
import { useLocalSearchParams, router } from 'expo-router';
import { ComplaintsAPI, Complaint, ComplaintUpdate } from '../../services/api';
import { format } from 'date-fns';

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

const STATUS_ICONS: Record<string, string> = {
    submitted: 'document-text',
    reviewing: 'eye',
    assigned: 'person-add',
    in_progress: 'construct',
    pending_parts: 'cube',
    pending_vendor: 'business',
    completed: 'checkmark-circle',
    closed: 'lock-closed',
    reopened: 'refresh',
    cancelled: 'close-circle',
};

export default function ComplaintDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [complaint, setComplaint] = useState<Complaint | null>(null);
    const [updates, setUpdates] = useState<ComplaintUpdate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [rating, setRating] = useState(0);
    const [hasRated, setHasRated] = useState(false);

    const loadData = async () => {
        try {
            const [complaintData, updatesData] = await Promise.all([
                ComplaintsAPI.getById(Number(id)),
                ComplaintsAPI.getUpdates(Number(id)),
            ]);
            setComplaint(complaintData);
            setUpdates(updatesData);
        } catch (error) {
            console.error('Failed to load complaint:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [id]);

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const getSlaInfo = () => {
        if (!complaint?.sla_deadline) return null;

        const deadline = new Date(complaint.sla_deadline);
        const now = new Date();
        const hoursLeft = Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60));

        if (complaint.is_sla_breached) {
            return { text: 'SLA Breached', color: '#dc3545', icon: 'alert-circle' };
        }

        if (hoursLeft <= 4) {
            return { text: `${hoursLeft}h left`, color: '#dc3545', icon: 'timer' };
        }
        if (hoursLeft <= 24) {
            return { text: `${hoursLeft}h left`, color: '#fd7e14', icon: 'timer' };
        }
        return { text: `${hoursLeft}h left`, color: '#28a745', icon: 'timer' };
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2D6CDF" />
            </View>
        );
    }

    if (!complaint) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={64} color="#dc3545" />
                <Text style={styles.errorText}>Complaint not found</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const slaInfo = getSlaInfo();

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            {/* Status Banner */}
            <View style={[styles.statusBanner, { backgroundColor: STATUS_COLORS[complaint.status] }]}>
                <Ionicons
                    name={(STATUS_ICONS[complaint.status] || 'help-circle') as any}
                    size={24}
                    color="#fff"
                />
                <Text style={styles.statusText}>
                    {complaint.status.replace('_', ' ').toUpperCase()}
                </Text>
            </View>

            {/* Main Content */}
            <View style={styles.content}>
                {/* Title & Category */}
                <View style={styles.headerSection}>
                    <Text style={styles.title}>{complaint.title}</Text>
                    <View style={styles.tagRow}>
                        <View style={styles.tag}>
                            <Text style={styles.tagText}>{complaint.category.replace('_', ' ')}</Text>
                        </View>
                        <View style={[styles.tag, styles.priorityTag]}>
                            <Text style={styles.tagText}>{complaint.priority.toUpperCase()}</Text>
                        </View>
                    </View>
                </View>

                {/* SLA Info */}
                {slaInfo && (
                    <View style={[styles.slaCard, { backgroundColor: `${slaInfo.color}10` }]}>
                        <Ionicons name={slaInfo.icon as any} size={20} color={slaInfo.color} />
                        <Text style={[styles.slaText, { color: slaInfo.color }]}>{slaInfo.text}</Text>
                        {complaint.sla_deadline && (
                            <Text style={styles.slaDeadline}>
                                Deadline: {format(new Date(complaint.sla_deadline), 'MMM d, yyyy h:mm a')}
                            </Text>
                        )}
                    </View>
                )}

                {/* Description */}
                {complaint.description && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.description}>{complaint.description}</Text>
                    </View>
                )}

                {/* Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Details</Text>
                    <View style={styles.detailsCard}>
                        <View style={styles.detailRow}>
                            <Ionicons name="calendar-outline" size={18} color="#6c757d" />
                            <Text style={styles.detailLabel}>Created</Text>
                            <Text style={styles.detailValue}>
                                {format(new Date(complaint.created_at), 'MMM d, yyyy h:mm a')}
                            </Text>
                        </View>
                        {complaint.assigned_to && (
                            <View style={styles.detailRow}>
                                <Ionicons name="person-outline" size={18} color="#6c757d" />
                                <Text style={styles.detailLabel}>Technician</Text>
                                <Text style={styles.detailValue}>{complaint.assigned_to.full_name}</Text>
                            </View>
                        )}
                        {complaint.estimated_cost > 0 && (
                            <View style={styles.detailRow}>
                                <Ionicons name="cash-outline" size={18} color="#6c757d" />
                                <Text style={styles.detailLabel}>Estimated Cost</Text>
                                <Text style={styles.detailValue}>RM {complaint.estimated_cost.toFixed(2)}</Text>
                            </View>
                        )}
                        {complaint.resolved_at && (
                            <View style={styles.detailRow}>
                                <Ionicons name="checkmark-circle-outline" size={18} color="#28a745" />
                                <Text style={styles.detailLabel}>Resolved</Text>
                                <Text style={styles.detailValue}>
                                    {format(new Date(complaint.resolved_at), 'MMM d, yyyy h:mm a')}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Rating Section (Only for completed/closed jobs) */}
                {(complaint.status === 'completed' || complaint.status === 'closed') && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Rate Service</Text>
                        <View style={styles.ratingCard}>
                            {!hasRated ? (
                                <>
                                    <Text style={styles.ratingTitle}>How was the service?</Text>
                                    <View style={styles.starsContainer}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <TouchableOpacity
                                                key={star}
                                                onPress={() => setRating(star)}
                                                style={styles.starButton}
                                            >
                                                <Ionicons
                                                    name={rating >= star ? 'star' : 'star-outline'}
                                                    size={32}
                                                    color={rating >= star ? '#ffc107' : '#e9ecef'}
                                                />
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                    <TouchableOpacity
                                        style={[
                                            styles.submitRatingButton,
                                            rating === 0 && styles.submitRatingButtonDisabled
                                        ]}
                                        disabled={rating === 0}
                                        onPress={() => {
                                            if (rating > 0) {
                                                setHasRated(true);
                                                if (Platform.OS === 'web') {
                                                    window.alert('Thank you for your feedback!');
                                                } else {
                                                    // Native alert would go here
                                                }
                                            }
                                        }}
                                    >
                                        <Text style={styles.submitRatingText}>Submit Feedback</Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <View style={styles.ratedContainer}>
                                    <Ionicons name="checkmark-circle" size={48} color="#28a745" />
                                    <Text style={styles.ratedTitle}>Thank You!</Text>
                                    <Text style={styles.ratedText}>
                                        Your feedback helps us improve our service.
                                    </Text>
                                    <View style={styles.starsContainer}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Ionicons
                                                key={star}
                                                name={rating >= star ? 'star' : 'star-outline'}
                                                size={24}
                                                color="#ffc107"
                                            />
                                        ))}
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* Timeline */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Timeline</Text>
                    <View style={styles.timeline}>
                        {updates.map((update, index) => (
                            <View key={update.id} style={styles.timelineItem}>
                                <View style={styles.timelineDot}>
                                    <View
                                        style={[
                                            styles.dot,
                                            { backgroundColor: STATUS_COLORS[update.status || 'submitted'] },
                                        ]}
                                    />
                                    {index < updates.length - 1 && <View style={styles.timelineLine} />}
                                </View>
                                <View style={styles.timelineContent}>
                                    <View style={styles.timelineHeader}>
                                        <Text style={styles.timelineStatus}>
                                            {(update.status || 'Update').replace('_', ' ')}
                                        </Text>
                                        <Text style={styles.timelineDate}>
                                            {format(new Date(update.created_at), 'MMM d, h:mm a')}
                                        </Text>
                                    </View>
                                    <Text style={styles.timelineMessage}>{update.message}</Text>
                                    {update.created_by && (
                                        <Text style={styles.timelineAuthor}>
                                            by {update.created_by.full_name}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </View>

            <View style={{ height: 40 }} />
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
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        padding: 24,
    },
    errorText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginTop: 16,
    },
    backButton: {
        marginTop: 24,
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: '#2D6CDF',
        borderRadius: 8,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    statusBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    statusText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 1,
    },
    content: {
        padding: 16,
    },
    headerSection: {
        marginBottom: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    tagRow: {
        flexDirection: 'row',
        gap: 8,
    },
    tag: {
        backgroundColor: '#e9ecef',
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 16,
    },
    priorityTag: {
        backgroundColor: '#ffc10720',
    },
    tagText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#495057',
        textTransform: 'capitalize',
    },
    slaCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        gap: 8,
    },
    slaText: {
        fontSize: 16,
        fontWeight: '600',
    },
    slaDeadline: {
        fontSize: 12,
        color: '#6c757d',
        marginLeft: 'auto',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    description: {
        fontSize: 15,
        color: '#495057',
        lineHeight: 22,
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
    },
    detailsCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    detailLabel: {
        fontSize: 14,
        color: '#6c757d',
        marginLeft: 8,
        flex: 1,
    },
    detailValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    timeline: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
    },
    timelineItem: {
        flexDirection: 'row',
    },
    timelineDot: {
        alignItems: 'center',
        marginRight: 12,
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    timelineLine: {
        width: 2,
        flex: 1,
        backgroundColor: '#e9ecef',
        marginTop: 4,
    },
    timelineContent: {
        flex: 1,
        paddingBottom: 20,
    },
    timelineHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    timelineStatus: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        textTransform: 'capitalize',
    },
    timelineDate: {
        fontSize: 12,
        color: '#6c757d',
    },
    timelineMessage: {
        fontSize: 14,
        color: '#495057',
        lineHeight: 20,
    },
    timelineAuthor: {
        fontSize: 12,
        color: '#6c757d',
        marginTop: 4,
        fontStyle: 'italic',
    },
    ratingCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    ratingTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    starsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    starButton: {
        padding: 4,
    },
    submitRatingButton: {
        backgroundColor: '#2D6CDF',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 25,
        width: '100%',
        alignItems: 'center',
    },
    submitRatingButtonDisabled: {
        backgroundColor: '#adb5bd',
    },
    submitRatingText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    ratedContainer: {
        alignItems: 'center',
        padding: 16,
    },
    ratedTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#28a745',
        marginTop: 16,
        marginBottom: 8,
    },
    ratedText: {
        fontSize: 14,
        color: '#6c757d',
        textAlign: 'center',
        marginBottom: 16,
    },
});
