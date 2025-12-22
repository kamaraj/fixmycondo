/**
 * FixMyCondo - Visitor Pass Screen
 * Pre-register visitors and generate QR codes
 */
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Modal,
    Platform,
} from 'react-native';
import { Ionicons } from '../../components/Ionicons';
import { router } from 'expo-router';

interface VisitorPass {
    id: string;
    name: string;
    purpose: string;
    date: string;
    time: string;
    vehiclePlate: string;
    status: 'active' | 'expired' | 'used';
    code: string;
}

const SAMPLE_PASSES: VisitorPass[] = [
    {
        id: '1',
        name: 'John Smith',
        purpose: 'Family Visit',
        date: '2024-12-23',
        time: '14:00 - 18:00',
        vehiclePlate: 'WKL 1234',
        status: 'active',
        code: 'VIS-A7B3C9',
    },
    {
        id: '2',
        name: 'Delivery - Lazada',
        purpose: 'Package Delivery',
        date: '2024-12-22',
        time: '10:00 - 12:00',
        vehiclePlate: '-',
        status: 'used',
        code: 'VIS-D4E5F6',
    },
];

export default function VisitorPassScreen() {
    const [passes, setPasses] = useState<VisitorPass[]>(SAMPLE_PASSES);
    const [showForm, setShowForm] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const [selectedPass, setSelectedPass] = useState<VisitorPass | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [purpose, setPurpose] = useState('');
    const [date, setDate] = useState('');
    const [vehiclePlate, setVehiclePlate] = useState('');

    const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = 'VIS-';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    };

    const handleCreatePass = () => {
        if (!name || !purpose || !date) {
            if (Platform.OS === 'web') {
                window.alert('Please fill in all required fields');
            }
            return;
        }

        const newPass: VisitorPass = {
            id: Date.now().toString(),
            name,
            purpose,
            date,
            time: '09:00 - 21:00',
            vehiclePlate: vehiclePlate || '-',
            status: 'active',
            code: generateCode(),
        };

        setPasses([newPass, ...passes]);
        setName('');
        setPurpose('');
        setDate('');
        setVehiclePlate('');
        setShowForm(false);
        setSelectedPass(newPass);
        setShowQR(true);
    };

    const viewPassQR = (pass: VisitorPass) => {
        setSelectedPass(pass);
        setShowQR(true);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return '#28a745';
            case 'used': return '#6c757d';
            case 'expired': return '#dc3545';
            default: return '#6c757d';
        }
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
                <Text style={styles.title}>Visitor Passes</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setShowForm(true)}
                >
                    <Ionicons name="add" size={24} color="#2D6CDF" />
                </TouchableOpacity>
            </View>

            {/* Info Banner */}
            <View style={styles.infoBanner}>
                <Ionicons name="information-circle" size={20} color="#2D6CDF" />
                <Text style={styles.infoText}>
                    Pre-register visitors to speed up their entry at the lobby
                </Text>
            </View>

            <ScrollView style={styles.content}>
                {/* Pass List */}
                {passes.map((pass) => (
                    <TouchableOpacity
                        key={pass.id}
                        style={styles.passCard}
                        onPress={() => viewPassQR(pass)}
                    >
                        <View style={styles.passHeader}>
                            <View style={styles.passIcon}>
                                <Ionicons
                                    name={pass.purpose.includes('Delivery') ? 'cube' : 'person'}
                                    size={24}
                                    color="#2D6CDF"
                                />
                            </View>
                            <View style={styles.passInfo}>
                                <Text style={styles.passName}>{pass.name}</Text>
                                <Text style={styles.passPurpose}>{pass.purpose}</Text>
                            </View>
                            <View style={[styles.passStatus, { backgroundColor: `${getStatusColor(pass.status)}15` }]}>
                                <Text style={[styles.passStatusText, { color: getStatusColor(pass.status) }]}>
                                    {pass.status.toUpperCase()}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.passDetails}>
                            <View style={styles.passDetail}>
                                <Ionicons name="calendar-outline" size={14} color="#6c757d" />
                                <Text style={styles.passDetailText}>{pass.date}</Text>
                            </View>
                            <View style={styles.passDetail}>
                                <Ionicons name="time-outline" size={14} color="#6c757d" />
                                <Text style={styles.passDetailText}>{pass.time}</Text>
                            </View>
                            {pass.vehiclePlate !== '-' && (
                                <View style={styles.passDetail}>
                                    <Ionicons name="car-outline" size={14} color="#6c757d" />
                                    <Text style={styles.passDetailText}>{pass.vehiclePlate}</Text>
                                </View>
                            )}
                        </View>
                        <View style={styles.passCode}>
                            <Text style={styles.passCodeLabel}>Pass Code:</Text>
                            <Text style={styles.passCodeValue}>{pass.code}</Text>
                        </View>
                    </TouchableOpacity>
                ))}

                {passes.length === 0 && (
                    <View style={styles.emptyState}>
                        <Ionicons name="person-add-outline" size={64} color="#6c757d" />
                        <Text style={styles.emptyTitle}>No Visitor Passes</Text>
                        <Text style={styles.emptyText}>Create a pass to pre-register your visitors</Text>
                    </View>
                )}
            </ScrollView>

            {/* Create Pass Modal */}
            <Modal
                visible={showForm}
                transparent
                animationType="slide"
                onRequestClose={() => setShowForm(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.formModal}>
                        <View style={styles.formHeader}>
                            <Text style={styles.formTitle}>New Visitor Pass</Text>
                            <TouchableOpacity onPress={() => setShowForm(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.formContent}>
                            <Text style={styles.inputLabel}>Visitor Name *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter visitor's name"
                                value={name}
                                onChangeText={setName}
                            />

                            <Text style={styles.inputLabel}>Purpose of Visit *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., Family Visit, Delivery"
                                value={purpose}
                                onChangeText={setPurpose}
                            />

                            <Text style={styles.inputLabel}>Visit Date *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="YYYY-MM-DD"
                                value={date}
                                onChangeText={setDate}
                            />

                            <Text style={styles.inputLabel}>Vehicle Plate (Optional)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., WKL 1234"
                                value={vehiclePlate}
                                onChangeText={setVehiclePlate}
                            />

                            <TouchableOpacity
                                style={styles.createButton}
                                onPress={handleCreatePass}
                            >
                                <Ionicons name="add-circle" size={20} color="#fff" />
                                <Text style={styles.createButtonText}>Generate Pass</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* QR Code Modal */}
            <Modal
                visible={showQR}
                transparent
                animationType="fade"
                onRequestClose={() => setShowQR(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.qrModal}>
                        <TouchableOpacity
                            style={styles.closeQR}
                            onPress={() => setShowQR(false)}
                        >
                            <Ionicons name="close" size={24} color="#333" />
                        </TouchableOpacity>

                        <Text style={styles.qrTitle}>Visitor Pass</Text>
                        <Text style={styles.qrName}>{selectedPass?.name}</Text>

                        {/* Simulated QR Code */}
                        <View style={styles.qrCode}>
                            <View style={styles.qrPattern}>
                                {[...Array(7)].map((_, row) => (
                                    <View key={row} style={styles.qrRow}>
                                        {[...Array(7)].map((_, col) => (
                                            <View
                                                key={col}
                                                style={[
                                                    styles.qrCell,
                                                    { backgroundColor: Math.random() > 0.5 ? '#333' : '#fff' }
                                                ]}
                                            />
                                        ))}
                                    </View>
                                ))}
                            </View>
                        </View>

                        <Text style={styles.qrCodeText}>{selectedPass?.code}</Text>

                        <View style={styles.qrDetails}>
                            <Text style={styles.qrDetailText}>
                                Valid: {selectedPass?.date} • {selectedPass?.time}
                            </Text>
                        </View>

                        <Text style={styles.qrInstruction}>
                            Show this code to the security guard for entry
                        </Text>
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
    addButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e7f1ff',
        padding: 12,
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 12,
        gap: 8,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: '#2D6CDF',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    passCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    passHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    passIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#2D6CDF10',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    passInfo: {
        flex: 1,
    },
    passName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    passPurpose: {
        fontSize: 13,
        color: '#6c757d',
    },
    passStatus: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 12,
    },
    passStatusText: {
        fontSize: 10,
        fontWeight: '700',
    },
    passDetails: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 12,
    },
    passDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    passDetailText: {
        fontSize: 12,
        color: '#6c757d',
    },
    passCode: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    passCodeLabel: {
        fontSize: 12,
        color: '#6c757d',
        marginRight: 8,
    },
    passCodeValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#2D6CDF',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 64,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginTop: 16,
    },
    emptyText: {
        fontSize: 14,
        color: '#6c757d',
        marginTop: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    formModal: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '80%',
    },
    formHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    formTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
    },
    formContent: {
        padding: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#e9ecef',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        marginBottom: 20,
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2D6CDF',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
        marginTop: 8,
    },
    createButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    qrModal: {
        backgroundColor: '#fff',
        margin: 24,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
    },
    closeQR: {
        position: 'absolute',
        top: 16,
        right: 16,
    },
    qrTitle: {
        fontSize: 14,
        color: '#6c757d',
        marginBottom: 4,
    },
    qrName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 24,
    },
    qrCode: {
        width: 180,
        height: 180,
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e9ecef',
    },
    qrPattern: {
        flex: 1,
        justifyContent: 'center',
    },
    qrRow: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    qrCell: {
        width: 16,
        height: 16,
        margin: 2,
    },
    qrCodeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2D6CDF',
        marginTop: 16,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    qrDetails: {
        marginTop: 16,
    },
    qrDetailText: {
        fontSize: 13,
        color: '#6c757d',
    },
    qrInstruction: {
        fontSize: 12,
        color: '#adb5bd',
        marginTop: 16,
        textAlign: 'center',
    },
});
