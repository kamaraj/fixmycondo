/**
 * FixMyCondo - Bookings Screen
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
import { FacilitiesAPI, Booking } from '../../services/api';
import { format } from 'date-fns';

const STATUS_COLORS: Record<string, string> = {
    pending: '#ffc107',
    confirmed: '#28a745',
    cancelled: '#dc3545',
    completed: '#6c757d',
};

export default function BookingsScreen() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadBookings = async () => {
        try {
            const data = await FacilitiesAPI.getBookings({ my_bookings: true, upcoming: true });
            setBookings(data.items || []);
        } catch (error) {
            console.error('Failed to load bookings:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadBookings();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadBookings();
    };

    const renderBooking = ({ item }: { item: Booking }) => (
        <View style={styles.bookingCard}>
            <View style={styles.cardHeader}>
                <View style={styles.facilityIcon}>
                    <Ionicons name="calendar" size={24} color="#2D6CDF" />
                </View>
                <View style={styles.cardContent}>
                    <Text style={styles.facilityName}>{item.facility?.name || 'Facility'}</Text>
                    <Text style={styles.bookingDate}>
                        {format(new Date(item.booking_date), 'EEE, MMM d, yyyy')}
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
                        {item.status}
                    </Text>
                </View>
            </View>

            <View style={styles.bookingDetails}>
                <View style={styles.detailRow}>
                    <Ionicons name="time-outline" size={16} color="#6c757d" />
                    <Text style={styles.detailText}>
                        {format(new Date(item.start_time), 'h:mm a')} - {format(new Date(item.end_time), 'h:mm a')}
                    </Text>
                </View>
                {item.total_fee > 0 && (
                    <View style={styles.detailRow}>
                        <Ionicons name="cash-outline" size={16} color="#6c757d" />
                        <Text style={styles.detailText}>RM {item.total_fee.toFixed(2)}</Text>
                    </View>
                )}
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2D6CDF" />
                </View>
            ) : (
                <FlatList
                    data={bookings}
                    renderItem={renderBooking}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="calendar-outline" size={64} color="#6c757d" />
                            <Text style={styles.emptyTitle}>No Bookings</Text>
                            <Text style={styles.emptySubtitle}>
                                Book facilities like gym, pool, or meeting rooms
                            </Text>
                            <TouchableOpacity
                                style={styles.createButton}
                                onPress={() => router.push('/booking/create')}
                            >
                                <Ionicons name="add" size={20} color="#fff" />
                                <Text style={styles.createButtonText}>Book Facility</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}

            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push('/booking/create')}
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
    listContent: {
        padding: 16,
        paddingBottom: 80,
    },
    bookingCard: {
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
    facilityIcon: {
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
    facilityName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    bookingDate: {
        fontSize: 14,
        color: '#6c757d',
        marginTop: 2,
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
    bookingDetails: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    detailText: {
        fontSize: 14,
        color: '#6c757d',
        marginLeft: 8,
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
        textAlign: 'center',
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
