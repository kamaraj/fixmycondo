/**
 * FixMyCondo - Notification Settings
 */
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Switch,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { AuthAPI } from '../../services/api';

export default function NotificationsScreen() {
    const { user, refreshUser } = useAuth();
    const [isSaving, setIsSaving] = useState(false);

    // Notification states
    const [pushEnabled, setPushEnabled] = useState(user?.settings?.pushEnabled ?? true);
    const [emailEnabled, setEmailEnabled] = useState(user?.settings?.emailEnabled ?? true);
    const [smsEnabled, setSmsEnabled] = useState(user?.settings?.smsEnabled ?? false);
    const [announcements, setAnnouncements] = useState(user?.settings?.announcements ?? true);
    const [complaintUpdates, setComplaintUpdates] = useState(user?.settings?.complaintUpdates ?? true);
    const [visitorAlerts, setVisitorAlerts] = useState(user?.settings?.visitorAlerts ?? true);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const newSettings = {
                pushEnabled,
                emailEnabled,
                smsEnabled,
                announcements,
                complaintUpdates,
                visitorAlerts,
            };

            await AuthAPI.updateProfile({ settings: newSettings });
            await refreshUser(); // Update global context

            Alert.alert('Success', 'Notification settings updated successfully');
        } catch (error) {
            console.error('Failed to save settings:', error);
            Alert.alert('Error', 'Failed to save settings. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const ToggleItem = ({ label, value, onValueChange, description }: any) => (
        <View style={styles.toggleItem}>
            <View style={styles.toggleInfo}>
                <Text style={styles.toggleLabel}>{label}</Text>
                {description && <Text style={styles.toggleDesc}>{description}</Text>}
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: '#e9ecef', true: '#2D6CDF' }}
                thumbColor={'#fff'}
            />
        </View>
    );

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Channels</Text>
                <View style={styles.card}>
                    <ToggleItem
                        label="Push Notifications"
                        value={pushEnabled}
                        onValueChange={setPushEnabled}
                    />
                    <View style={styles.divider} />
                    <ToggleItem
                        label="Email Notifications"
                        value={emailEnabled}
                        onValueChange={setEmailEnabled}
                    />
                    <View style={styles.divider} />
                    <ToggleItem
                        label="SMS Notifications"
                        value={smsEnabled}
                        onValueChange={setSmsEnabled}
                        description="Additional charges may apply"
                    />
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Alert Types</Text>
                <View style={styles.card}>
                    <ToggleItem
                        label="Announcements"
                        value={announcements}
                        onValueChange={setAnnouncements}
                        description="Building news and maintenance schedules"
                    />
                    <View style={styles.divider} />
                    <ToggleItem
                        label="Complaint Updates"
                        value={complaintUpdates}
                        onValueChange={setComplaintUpdates}
                        description="Status changes on your reported issues"
                    />
                    <View style={styles.divider} />
                    <ToggleItem
                        label="Visitor Alerts"
                        value={visitorAlerts}
                        onValueChange={setVisitorAlerts}
                        description="When a visitor checks in"
                    />
                </View>
            </View>

            <TouchableOpacity
                style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={isSaving}
            >
                {isSaving ? (
                    <ActivityIndicator color="#fff" size="small" />
                ) : (
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        padding: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
        marginLeft: 4,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    toggleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    toggleInfo: {
        flex: 1,
        paddingRight: 16,
    },
    toggleLabel: {
        fontSize: 16,
        color: '#333',
        marginBottom: 4,
    },
    toggleDesc: {
        fontSize: 13,
        color: '#6c757d',
    },
    divider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginHorizontal: 16,
    },
    saveButton: {
        backgroundColor: '#2D6CDF',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 8,
        shadowColor: '#2D6CDF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
