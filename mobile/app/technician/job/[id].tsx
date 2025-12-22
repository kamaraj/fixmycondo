/**
 * FixMyCondo - Technician Job Detail Screen
 * Allows technicians to update job status and upload photos
 */
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { Ionicons } from '../../../components/Ionicons';
import { useLocalSearchParams, router } from 'expo-router';
import { ComplaintsAPI, Complaint, ComplaintUpdate } from '../../../services/api';
import { format } from 'date-fns';

const STATUS_OPTIONS = [
    { value: 'in_progress', label: 'In Progress', icon: 'construct', color: '#2D6CDF' },
    { value: 'pending_parts', label: 'Pending Parts', icon: 'cube', color: '#fd7e14' },
    { value: 'pending_vendor', label: 'Need Vendor', icon: 'business', color: '#fd7e14' },
    { value: 'completed', label: 'Completed', icon: 'checkmark-circle', color: '#28a745' },
];

export default function TechnicianJobDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [job, setJob] = useState<Complaint | null>(null);
    const [updates, setUpdates] = useState<ComplaintUpdate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [selectedStatus, setSelectedStatus] = useState('in_progress');
    const [notes, setNotes] = useState('');
    const [showUpdateForm, setShowUpdateForm] = useState(false);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            const [jobData, updatesData] = await Promise.all([
                ComplaintsAPI.getById(Number(id)),
                ComplaintsAPI.getUpdates(Number(id)),
            ]);
            setJob(jobData);
            setUpdates(updatesData);
            setSelectedStatus(jobData.status);
        } catch (error) {
            console.error('Failed to load job:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async () => {
        if (!notes.trim()) {
            Alert.alert('Error', 'Please add notes describing the update');
            return;
        }

        setIsSubmitting(true);
        try {
            await ComplaintsAPI.addUpdate(Number(id), {
                status: selectedStatus,
                message: notes.trim(),
            });

            // Also update the complaint status
            await ComplaintsAPI.update(Number(id), { status: selectedStatus as any });

            Alert.alert(
                'Success',
                selectedStatus === 'completed'
                    ? 'Job marked as completed!'
                    : 'Status updated successfully',
                [{
                    text: 'OK', onPress: () => {
                        setNotes('');
                        setShowUpdateForm(false);
                        loadData();
                    }
                }]
            );
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.detail || 'Failed to update status');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2D6CDF" />
            </View>
        );
    }

    if (!job) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={64} color="#dc3545" />
                <Text style={styles.errorText}>Job not found</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* Job Header */}
            <View style={styles.headerCard}>
                <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{job.category.replace('_', ' ')}</Text>
                </View>
                <Text style={styles.jobTitle}>{job.title}</Text>

                <View style={styles.infoGrid}>
                    <View style={styles.infoItem}>
                        <Ionicons name="location-outline" size={18} color="#6c757d" />
                        <Text style={styles.infoText}>Unit #{job.unit_id || 'N/A'}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Ionicons name="flag-outline" size={18} color="#6c757d" />
                        <Text style={[styles.infoText, { textTransform: 'capitalize' }]}>
                            {job.priority} Priority
                        </Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Ionicons name="calendar-outline" size={18} color="#6c757d" />
                        <Text style={styles.infoText}>
                            {format(new Date(job.created_at), 'MMM d, yyyy')}
                        </Text>
                    </View>
                </View>

                {job.is_sla_breached && (
                    <View style={styles.breachedBanner}>
                        <Ionicons name="alert-circle" size={20} color="#dc3545" />
                        <Text style={styles.breachedText}>SLA Breached - Urgent Attention Required</Text>
                    </View>
                )}
            </View>

            {/* Description */}
            {job.description && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Issue Description</Text>
                    <View style={styles.descriptionCard}>
                        <Text style={styles.descriptionText}>{job.description}</Text>
                    </View>
                </View>
            )}

            {/* Resident Contact */}
            {job.created_by && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Resident Contact</Text>
                    <View style={styles.contactCard}>
                        <View style={styles.contactRow}>
                            <Ionicons name="person-outline" size={20} color="#2D6CDF" />
                            <Text style={styles.contactName}>{job.created_by.full_name}</Text>
                        </View>
                        {job.created_by.phone && (
                            <TouchableOpacity style={styles.contactButton}>
                                <Ionicons name="call-outline" size={18} color="#fff" />
                                <Text style={styles.contactButtonText}>{job.created_by.phone}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            )}

            {/* Update Status Section */}
            <View style={styles.section}>
                <TouchableOpacity
                    style={styles.updateHeader}
                    onPress={() => setShowUpdateForm(!showUpdateForm)}
                >
                    <Text style={styles.sectionTitle}>Update Status</Text>
                    <Ionicons
                        name={showUpdateForm ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color="#6c757d"
                    />
                </TouchableOpacity>

                {showUpdateForm && (
                    <View style={styles.updateForm}>
                        {/* Status Options */}
                        <View style={styles.statusGrid}>
                            {STATUS_OPTIONS.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.statusOption,
                                        selectedStatus === option.value && styles.statusOptionActive,
                                        selectedStatus === option.value && { borderColor: option.color },
                                    ]}
                                    onPress={() => setSelectedStatus(option.value)}
                                >
                                    <Ionicons
                                        name={option.icon as any}
                                        size={24}
                                        color={selectedStatus === option.value ? option.color : '#6c757d'}
                                    />
                                    <Text
                                        style={[
                                            styles.statusOptionText,
                                            selectedStatus === option.value && { color: option.color },
                                        ]}
                                    >
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Notes */}
                        <Text style={styles.inputLabel}>Work Notes *</Text>
                        <TextInput
                            style={styles.notesInput}
                            placeholder="Describe what was done or what is needed..."
                            placeholderTextColor="#999"
                            value={notes}
                            onChangeText={setNotes}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                isSubmitting && styles.submitButtonDisabled,
                                selectedStatus === 'completed' && styles.submitButtonComplete,
                            ]}
                            onPress={handleUpdateStatus}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Ionicons
                                        name={selectedStatus === 'completed' ? 'checkmark-circle' : 'save'}
                                        size={20}
                                        color="#fff"
                                    />
                                    <Text style={styles.submitButtonText}>
                                        {selectedStatus === 'completed' ? 'Mark as Completed' : 'Update Status'}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Timeline */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Job Timeline</Text>
                <View style={styles.timeline}>
                    {updates.map((update, index) => (
                        <View key={update.id} style={styles.timelineItem}>
                            <View style={styles.timelineDot}>
                                <View style={styles.dot} />
                                {index < updates.length - 1 && <View style={styles.timelineLine} />}
                            </View>
                            <View style={styles.timelineContent}>
                                <Text style={styles.timelineStatus}>
                                    {(update.status || 'Update').replace('_', ' ')}
                                </Text>
                                <Text style={styles.timelineMessage}>{update.message}</Text>
                                <Text style={styles.timelineDate}>
                                    {format(new Date(update.created_at), 'MMM d, h:mm a')}
                                    {update.created_by && ` • ${update.created_by.full_name}`}
                                </Text>
                            </View>
                        </View>
                    ))}
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
    },
    errorText: {
        fontSize: 18,
        color: '#333',
        marginTop: 16,
    },
    headerCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#2D6CDF15',
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 12,
        marginBottom: 12,
    },
    categoryText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#2D6CDF',
        textTransform: 'capitalize',
    },
    jobTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    infoText: {
        fontSize: 14,
        color: '#6c757d',
    },
    breachedBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8d7da',
        padding: 12,
        borderRadius: 8,
        marginTop: 16,
        gap: 8,
    },
    breachedText: {
        fontSize: 14,
        color: '#dc3545',
        fontWeight: '600',
    },
    section: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    descriptionCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
    },
    descriptionText: {
        fontSize: 15,
        color: '#495057',
        lineHeight: 22,
    },
    contactCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    contactName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    contactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#28a745',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        gap: 6,
    },
    contactButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    updateHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    updateForm: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginTop: 12,
    },
    statusGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    statusOption: {
        width: '48%',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#e9ecef',
        backgroundColor: '#f8f9fa',
        gap: 8,
    },
    statusOptionActive: {
        backgroundColor: '#fff',
    },
    statusOptionText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#6c757d',
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        marginBottom: 8,
    },
    notesInput: {
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#e9ecef',
        borderRadius: 8,
        padding: 12,
        fontSize: 15,
        color: '#333',
        minHeight: 100,
        marginBottom: 16,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2D6CDF',
        borderRadius: 8,
        padding: 14,
        gap: 8,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonComplete: {
        backgroundColor: '#28a745',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
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
        backgroundColor: '#2D6CDF',
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
    timelineStatus: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        textTransform: 'capitalize',
        marginBottom: 4,
    },
    timelineMessage: {
        fontSize: 14,
        color: '#495057',
        lineHeight: 20,
        marginBottom: 4,
    },
    timelineDate: {
        fontSize: 12,
        color: '#6c757d',
    },
});
