/**
 * FixMyCondo - My Unit
 */
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '../../components/Ionicons';
import { useAuth } from '../../contexts/AuthContext';
import { AuthAPI, ResidenceDetails } from '../../services/api';

export default function MyUnitScreen() {
    const { user } = useAuth();
    const [residence, setResidence] = useState<ResidenceDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadResidenceDetails();
    }, []);

    const loadResidenceDetails = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await AuthAPI.getResidenceDetails();
            setResidence(data);
        } catch (err: any) {
            console.error('Failed to load residence details:', err);
            setError('Could not load unit details. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Mock Data for residents/vehicles (still mock for now as backend doesn't have these models yet)
    const vehicles = [
        { plate: 'ABC 1234', model: 'Honda Civic', color: 'White' },
        { plate: 'XYZ 5678', model: 'Toyota Camry', color: 'Black' },
    ];

    const residents = [
        { name: user?.full_name || 'Resident', role: 'Owner' },
        { name: 'Spouse Name', role: 'Occupant' },
    ];

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2D6CDF" />
                <Text style={styles.loadingText}>Loading unit details...</Text>
            </View>
        );
    }

    if (error || !residence) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={48} color="#dc3545" />
                <Text style={styles.errorText}>{error || 'Unit not found'}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={loadResidenceDetails}>
                    <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.headerCard}>
                <View style={styles.iconCircle}>
                    <Ionicons name="home" size={32} color="#fff" />
                </View>
                <Text style={styles.buildingName}>{residence.building_name}</Text>
                <Text style={styles.unitNumber}>Unit #{residence.unit_number}</Text>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{residence.is_owner ? 'Owner Occupied' : 'Tenant'}</Text>
                </View>
                {residence.building_address && (
                    <Text style={styles.addressText}>{residence.building_address}</Text>
                )}
            </View>

            <View style={styles.infoRow}>
                <View style={styles.infoCol}>
                    <Text style={styles.infoLabel}>Block</Text>
                    <Text style={styles.infoValue}>{residence.block || 'N/A'}</Text>
                </View>
                <View style={styles.infoCol}>
                    <Text style={styles.infoLabel}>Floor</Text>
                    <Text style={styles.infoValue}>{residence.floor || 'N/A'}</Text>
                </View>
                <View style={styles.infoCol}>
                    <Text style={styles.infoLabel}>Type</Text>
                    <Text style={styles.infoValue}>{residence.unit_type || 'Residential'}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Residents</Text>
                <View style={styles.card}>
                    {residents.map((r, i) => (
                        <View key={i} style={styles.listItem}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{r.name[0]}</Text>
                            </View>
                            <View style={styles.listContent}>
                                <Text style={styles.listTitle}>{r.name}</Text>
                                <Text style={styles.listSubtitle}>{r.role}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Registered Vehicles</Text>
                <View style={styles.card}>
                    {vehicles.map((v, i) => (
                        <View key={i} style={styles.listItem}>
                            <View style={styles.carIcon}>
                                <Ionicons name="car-sport" size={20} color="#6c757d" />
                            </View>
                            <View style={styles.listContent}>
                                <Text style={styles.listTitle}>{v.plate}</Text>
                                <Text style={styles.listSubtitle}>{v.color} {v.model}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </View>

            <View style={styles.managementCard}>
                <Text style={styles.sectionTitle}>Management Office</Text>
                <View style={styles.card}>
                    <View style={styles.listItem}>
                        <Ionicons name="person" size={20} color="#6c757d" style={{ marginRight: 12 }} />
                        <View style={styles.listContent}>
                            <Text style={styles.listTitle}>{residence.building_manager || 'Site Manager'}</Text>
                            <Text style={styles.listSubtitle}>Building Manager</Text>
                        </View>
                    </View>
                    <View style={styles.listItem}>
                        <Ionicons name="call" size={20} color="#6c757d" style={{ marginRight: 12 }} />
                        <View style={styles.listContent}>
                            <Text style={styles.listTitle}>{residence.manager_phone || 'Contact Support'}</Text>
                            <Text style={styles.listSubtitle}>Main Office</Text>
                        </View>
                    </View>
                </View>
            </View>

            <View style={{ padding: 16 }}>
                <TouchableOpacity
                    style={styles.updateButton}
                    onPress={() => alert('Please contact building management to update unit details or register new residents/vehicles.')}
                >
                    <Text style={styles.updateButtonText}>Request Update</Text>
                </TouchableOpacity>
                <Text style={styles.noteText}>
                    Note: Official Unit details are managed by the building administration.
                </Text>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        padding: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    loadingText: {
        marginTop: 12,
        color: '#6c757d',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        backgroundColor: '#f8f9fa',
    },
    errorText: {
        marginTop: 16,
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
        marginBottom: 24,
    },
    retryButton: {
        backgroundColor: '#2D6CDF',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 25,
    },
    retryText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    headerCard: {
        backgroundColor: '#2D6CDF',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#2D6CDF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    buildingName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 4,
    },
    unitNumber: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 12,
    },
    badge: {
        backgroundColor: '#fff',
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 12,
        marginBottom: 12,
    },
    badgeText: {
        color: '#2D6CDF',
        fontWeight: '600',
        fontSize: 12,
    },
    addressText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
    },
    infoRow: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        justifyContent: 'space-around',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    infoCol: {
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: 12,
        color: '#6c757d',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    section: {
        marginBottom: 24,
    },
    managementCard: {
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
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e9ecef',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#495057',
    },
    carIcon: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#f8f9fa',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    listContent: {
        flex: 1,
    },
    listTitle: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    listSubtitle: {
        fontSize: 13,
        color: '#6c757d',
        marginTop: 2,
    },
    updateButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#2D6CDF',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    updateButtonText: {
        color: '#2D6CDF',
        fontSize: 16,
        fontWeight: '600',
    },
    noteText: {
        fontSize: 12,
        color: '#adb5bd',
        textAlign: 'center',
        marginTop: 12,
        fontStyle: 'italic',
    },
});
