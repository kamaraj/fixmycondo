/**
 * FixMyCondo - Emergency SOS Screen
 * Quick emergency alert system for residents
 */
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Platform,
    Animated,
    Alert,
} from 'react-native';
import { Ionicons } from '../../components/Ionicons';
import { router } from 'expo-router';

const EMERGENCY_TYPES = [
    { id: 'fire', icon: 'flame', label: 'Fire', color: '#dc3545', number: '994' },
    { id: 'medical', icon: 'medical', label: 'Medical', color: '#28a745', number: '999' },
    { id: 'security', icon: 'shield', label: 'Security', color: '#2D6CDF', number: 'Guard House' },
    { id: 'flood', icon: 'water', label: 'Flood', color: '#17a2b8', number: 'Building Mgmt' },
];

export default function EmergencyScreen() {
    const [showConfirm, setShowConfirm] = useState(false);
    const [selectedEmergency, setSelectedEmergency] = useState<typeof EMERGENCY_TYPES[0] | null>(null);
    const [alertSent, setAlertSent] = useState(false);

    const handleEmergencyPress = (emergency: typeof EMERGENCY_TYPES[0]) => {
        setSelectedEmergency(emergency);
        setShowConfirm(true);
    };

    const sendEmergencyAlert = () => {
        setShowConfirm(false);
        setAlertSent(true);

        // Simulate sending alert
        setTimeout(() => {
            setAlertSent(false);
            if (Platform.OS === 'web') {
                window.alert(`Emergency alert sent! ${selectedEmergency?.label} team has been notified.`);
            } else {
                Alert.alert('Alert Sent', `${selectedEmergency?.label} team has been notified. Help is on the way.`);
            }
        }, 2000);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="chevron-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>Emergency SOS</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Warning Banner */}
            <View style={styles.warningBanner}>
                <Ionicons name="warning" size={24} color="#dc3545" />
                <Text style={styles.warningText}>
                    Only use in real emergencies. False alerts may result in penalties.
                </Text>
            </View>

            {/* Emergency Buttons */}
            <View style={styles.emergencyGrid}>
                {EMERGENCY_TYPES.map((emergency) => (
                    <TouchableOpacity
                        key={emergency.id}
                        style={[styles.emergencyCard, { borderColor: emergency.color }]}
                        onPress={() => handleEmergencyPress(emergency)}
                    >
                        <View style={[styles.iconCircle, { backgroundColor: `${emergency.color}15` }]}>
                            <Ionicons name={emergency.icon as any} size={40} color={emergency.color} />
                        </View>
                        <Text style={[styles.emergencyLabel, { color: emergency.color }]}>
                            {emergency.label}
                        </Text>
                        <Text style={styles.emergencyNumber}>{emergency.number}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Main SOS Button */}
            <View style={styles.sosContainer}>
                <TouchableOpacity
                    style={styles.sosButton}
                    onPress={() => handleEmergencyPress(EMERGENCY_TYPES[2])} // Security by default
                >
                    <Text style={styles.sosText}>SOS</Text>
                    <Text style={styles.sosSubtext}>Tap for Security</Text>
                </TouchableOpacity>
            </View>

            {/* Location Info */}
            <View style={styles.locationInfo}>
                <Ionicons name="location" size={20} color="#6c757d" />
                <Text style={styles.locationText}>
                    Your location will be shared with emergency responders
                </Text>
            </View>

            {/* Confirmation Modal */}
            <Modal
                visible={showConfirm}
                transparent
                animationType="fade"
                onRequestClose={() => setShowConfirm(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={[styles.modalIcon, { backgroundColor: `${selectedEmergency?.color}15` }]}>
                            <Ionicons
                                name={selectedEmergency?.icon as any}
                                size={48}
                                color={selectedEmergency?.color}
                            />
                        </View>
                        <Text style={styles.modalTitle}>Send {selectedEmergency?.label} Alert?</Text>
                        <Text style={styles.modalText}>
                            This will immediately notify building security and emergency services.
                        </Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setShowConfirm(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.confirmButton, { backgroundColor: selectedEmergency?.color }]}
                                onPress={sendEmergencyAlert}
                            >
                                <Text style={styles.confirmButtonText}>Send Alert</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Alert Sent Modal */}
            <Modal
                visible={alertSent}
                transparent
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.alertSentContent}>
                        <View style={styles.pulseCircle}>
                            <Ionicons name="checkmark-circle" size={64} color="#28a745" />
                        </View>
                        <Text style={styles.alertSentTitle}>Alert Sent!</Text>
                        <Text style={styles.alertSentText}>Help is on the way...</Text>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    warningBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8d7da',
        padding: 16,
        margin: 16,
        borderRadius: 12,
        gap: 12,
    },
    warningText: {
        flex: 1,
        fontSize: 13,
        color: '#721c24',
        lineHeight: 18,
    },
    emergencyGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 8,
        justifyContent: 'center',
    },
    emergencyCard: {
        width: '45%',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        margin: 8,
        alignItems: 'center',
        borderWidth: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    emergencyLabel: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    emergencyNumber: {
        fontSize: 12,
        color: '#6c757d',
    },
    sosContainer: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    sosButton: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: '#dc3545',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#dc3545',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 8,
    },
    sosText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#fff',
    },
    sosSubtext: {
        fontSize: 12,
        color: '#fff',
        opacity: 0.9,
    },
    locationInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        gap: 8,
    },
    locationText: {
        fontSize: 12,
        color: '#6c757d',
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '85%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
    },
    modalIcon: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    modalText: {
        fontSize: 14,
        color: '#6c757d',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#f8f9fa',
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6c757d',
    },
    confirmButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    alertSentContent: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 40,
        alignItems: 'center',
    },
    pulseCircle: {
        marginBottom: 16,
    },
    alertSentTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#28a745',
        marginBottom: 8,
    },
    alertSentText: {
        fontSize: 16,
        color: '#6c757d',
    },
});
