/**
 * FixMyCondo - Create Booking Screen
 */
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    TextInput,
    Platform,
} from 'react-native';
import { Ionicons } from '../../components/Ionicons';
import { router } from 'expo-router';
import { FacilitiesAPI, Facility } from '../../services/api';
import { format, addDays, setHours, setMinutes } from 'date-fns';

export default function CreateBookingScreen() {
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(addDays(new Date(), 1));
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
    const [guests, setGuests] = useState('1');
    const [purpose, setPurpose] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Generate available dates (next 14 days)
    const availableDates = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i + 1));

    // Generate time slots
    const timeSlots = [
        '08:00 - 10:00',
        '10:00 - 12:00',
        '12:00 - 14:00',
        '14:00 - 16:00',
        '16:00 - 18:00',
        '18:00 - 20:00',
        '20:00 - 22:00',
    ];

    useEffect(() => {
        loadFacilities();
    }, []);

    const loadFacilities = async () => {
        try {
            const data = await FacilitiesAPI.getAll({ is_active: true });
            setFacilities(data);
        } catch (error) {
            console.error('Failed to load facilities:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedFacility) {
            Alert.alert('Error', 'Please select a facility');
            return;
        }
        if (!selectedTimeSlot) {
            Alert.alert('Error', 'Please select a time slot');
            return;
        }

        const [startTime, endTime] = selectedTimeSlot.split(' - ');
        const [startHour] = startTime.split(':').map(Number);
        const [endHour] = endTime.split(':').map(Number);

        const bookingDate = new Date(selectedDate);
        const startDateTime = setMinutes(setHours(bookingDate, startHour), 0);
        const endDateTime = setMinutes(setHours(bookingDate, endHour), 0);

        setIsSubmitting(true);
        try {
            await FacilitiesAPI.createBooking({
                facility_id: selectedFacility.id,
                booking_date: bookingDate.toISOString(),
                start_time: startDateTime.toISOString(),
                end_time: endDateTime.toISOString(),
                number_of_guests: parseInt(guests) || 1,
                purpose: purpose || undefined,
            });

            Alert.alert(
                'Success',
                'Your booking request has been submitted.',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (error: any) {
            Alert.alert(
                'Booking Failed',
                error.response?.data?.detail || 'Time slot may not be available'
            );
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

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Facility Selection */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Select Facility *</Text>
                <View style={styles.facilityGrid}>
                    {facilities.map((facility) => (
                        <TouchableOpacity
                            key={facility.id}
                            style={[
                                styles.facilityCard,
                                selectedFacility?.id === facility.id && styles.facilityCardActive,
                            ]}
                            onPress={() => setSelectedFacility(facility)}
                        >
                            <Ionicons
                                name={getFacilityIcon(facility.name)}
                                size={32}
                                color={selectedFacility?.id === facility.id ? '#2D6CDF' : '#6c757d'}
                            />
                            <Text
                                style={[
                                    styles.facilityName,
                                    selectedFacility?.id === facility.id && styles.facilityNameActive,
                                ]}
                                numberOfLines={2}
                            >
                                {facility.name}
                            </Text>
                            {facility.booking_fee > 0 && (
                                <Text style={styles.facilityFee}>RM {facility.booking_fee}/hr</Text>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Facility Details */}
            {selectedFacility && (
                <View style={styles.detailsCard}>
                    <Text style={styles.detailsTitle}>{selectedFacility.name}</Text>
                    {selectedFacility.description && (
                        <Text style={styles.detailsDesc}>{selectedFacility.description}</Text>
                    )}
                    <View style={styles.detailsRow}>
                        <View style={styles.detailItem}>
                            <Ionicons name="location-outline" size={16} color="#6c757d" />
                            <Text style={styles.detailText}>{selectedFacility.location || 'N/A'}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Ionicons name="people-outline" size={16} color="#6c757d" />
                            <Text style={styles.detailText}>Max {selectedFacility.capacity} pax</Text>
                        </View>
                    </View>
                    {selectedFacility.deposit_required > 0 && (
                        <Text style={styles.depositNote}>
                            💰 Deposit required: RM {selectedFacility.deposit_required}
                        </Text>
                    )}
                </View>
            )}

            {/* Date Selection */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Select Date *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.dateRow}>
                        {availableDates.map((date, index) => {
                            const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={[styles.dateCard, isSelected && styles.dateCardActive]}
                                    onPress={() => setSelectedDate(date)}
                                >
                                    <Text style={[styles.dateDay, isSelected && styles.dateDayActive]}>
                                        {format(date, 'EEE')}
                                    </Text>
                                    <Text style={[styles.dateNum, isSelected && styles.dateNumActive]}>
                                        {format(date, 'd')}
                                    </Text>
                                    <Text style={[styles.dateMonth, isSelected && styles.dateMonthActive]}>
                                        {format(date, 'MMM')}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </ScrollView>
            </View>

            {/* Time Slot Selection */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Select Time Slot *</Text>
                <View style={styles.timeGrid}>
                    {timeSlots.map((slot) => (
                        <TouchableOpacity
                            key={slot}
                            style={[
                                styles.timeSlot,
                                selectedTimeSlot === slot && styles.timeSlotActive,
                            ]}
                            onPress={() => setSelectedTimeSlot(slot)}
                        >
                            <Text
                                style={[
                                    styles.timeSlotText,
                                    selectedTimeSlot === slot && styles.timeSlotTextActive,
                                ]}
                            >
                                {slot}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Number of Guests */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Number of Guests</Text>
                <View style={styles.guestRow}>
                    <TouchableOpacity
                        style={styles.guestBtn}
                        onPress={() => setGuests(String(Math.max(1, parseInt(guests) - 1)))}
                    >
                        <Ionicons name="remove" size={24} color="#2D6CDF" />
                    </TouchableOpacity>
                    <TextInput
                        style={styles.guestInput}
                        value={guests}
                        onChangeText={setGuests}
                        keyboardType="numeric"
                        textAlign="center"
                    />
                    <TouchableOpacity
                        style={styles.guestBtn}
                        onPress={() => setGuests(String(parseInt(guests) + 1))}
                    >
                        <Ionicons name="add" size={24} color="#2D6CDF" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Purpose */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Purpose (Optional)</Text>
                <TextInput
                    style={styles.purposeInput}
                    placeholder="e.g., Birthday party, Family gathering"
                    placeholderTextColor="#999"
                    value={purpose}
                    onChangeText={setPurpose}
                    multiline
                />
            </View>

            {/* Fee Summary */}
            {selectedFacility && selectedTimeSlot && (
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Booking Summary</Text>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Facility</Text>
                        <Text style={styles.summaryValue}>{selectedFacility.name}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Date</Text>
                        <Text style={styles.summaryValue}>{format(selectedDate, 'EEE, MMM d, yyyy')}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Time</Text>
                        <Text style={styles.summaryValue}>{selectedTimeSlot}</Text>
                    </View>
                    <View style={[styles.summaryRow, styles.summaryTotal]}>
                        <Text style={styles.summaryTotalLabel}>Total Fee</Text>
                        <Text style={styles.summaryTotalValue}>
                            RM {(selectedFacility.booking_fee * 2).toFixed(2)}
                        </Text>
                    </View>
                </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={isSubmitting}
            >
                {isSubmitting ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <>
                        <Ionicons name="calendar-outline" size={20} color="#fff" />
                        <Text style={styles.submitButtonText}>Confirm Booking</Text>
                    </>
                )}
            </TouchableOpacity>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

function getFacilityIcon(name: string): any {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('pool') || nameLower.includes('swim')) return 'water';
    if (nameLower.includes('gym') || nameLower.includes('fitness')) return 'barbell';
    if (nameLower.includes('tennis')) return 'tennisball';
    if (nameLower.includes('badminton')) return 'tennisball-outline';
    if (nameLower.includes('bbq') || nameLower.includes('barbecue')) return 'flame';
    if (nameLower.includes('hall') || nameLower.includes('function')) return 'people';
    if (nameLower.includes('meeting')) return 'briefcase';
    return 'business';
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
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
    facilityGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -4,
    },
    facilityCard: {
        width: '33.33%',
        padding: 4,
    },
    facilityCardActive: {},
    facilityName: {
        fontSize: 12,
        color: '#333',
        textAlign: 'center',
        marginTop: 8,
    },
    facilityNameActive: {
        color: '#2D6CDF',
        fontWeight: '600',
    },
    facilityFee: {
        fontSize: 10,
        color: '#28a745',
        textAlign: 'center',
        marginTop: 4,
    },
    detailsCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        borderLeftWidth: 4,
        borderLeftColor: '#2D6CDF',
    },
    detailsTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    detailsDesc: {
        fontSize: 14,
        color: '#6c757d',
        marginBottom: 12,
    },
    detailsRow: {
        flexDirection: 'row',
        gap: 16,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    detailText: {
        fontSize: 13,
        color: '#6c757d',
    },
    depositNote: {
        fontSize: 12,
        color: '#fd7e14',
        marginTop: 12,
        fontWeight: '500',
    },
    dateRow: {
        flexDirection: 'row',
        gap: 8,
        paddingRight: 16,
    },
    dateCard: {
        width: 64,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#fff',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    dateCardActive: {
        borderColor: '#2D6CDF',
        backgroundColor: '#2D6CDF10',
    },
    dateDay: {
        fontSize: 12,
        color: '#6c757d',
    },
    dateDayActive: {
        color: '#2D6CDF',
    },
    dateNum: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginVertical: 4,
    },
    dateNumActive: {
        color: '#2D6CDF',
    },
    dateMonth: {
        fontSize: 12,
        color: '#6c757d',
    },
    dateMonthActive: {
        color: '#2D6CDF',
    },
    timeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -4,
    },
    timeSlot: {
        width: '50%',
        padding: 4,
    },
    timeSlotActive: {},
    timeSlotText: {
        fontSize: 14,
        color: '#333',
        textAlign: 'center',
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 2,
        borderColor: 'transparent',
        overflow: 'hidden',
    },
    timeSlotTextActive: {
        color: '#2D6CDF',
        fontWeight: '600',
        borderColor: '#2D6CDF',
        backgroundColor: '#2D6CDF10',
    },
    guestRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
    },
    guestBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#2D6CDF',
    },
    guestInput: {
        width: 60,
        height: 48,
        backgroundColor: '#fff',
        borderRadius: 12,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    purposeInput: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#333',
        minHeight: 80,
        textAlignVertical: 'top',
    },
    summaryCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    summaryLabel: {
        fontSize: 14,
        color: '#6c757d',
    },
    summaryValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    summaryTotal: {
        borderBottomWidth: 0,
        marginTop: 8,
        paddingTop: 12,
        borderTopWidth: 2,
        borderTopColor: '#e9ecef',
    },
    summaryTotalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    summaryTotalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#28a745',
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2D6CDF',
        borderRadius: 12,
        padding: 16,
        gap: 8,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
