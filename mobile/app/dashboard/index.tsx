/**
 * FixMyCondo - Smart Dashboard
 * Analytics and insights for the resident
 */
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { Ionicons } from '../../components/Ionicons';
import { router } from 'expo-router';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function DashboardScreen() {
    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="chevron-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>Smart Dashboard</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                {/* Monthly Spending Trend */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="stats-chart" size={20} color="#2D6CDF" />
                        <Text style={styles.cardTitle}>Monthly Expenses</Text>
                    </View>
                    <View style={styles.chartPlaceholder}>
                        <View style={styles.barsContainer}>
                            {[40, 65, 45, 80, 55, 70].map((height, index) => (
                                <View key={index} style={styles.barWrapper}>
                                    <View style={[styles.bar, { height: `${height}%` }]} />
                                    <Text style={styles.barLabel}>{['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index]}</Text>
                                </View>
                            ))}
                        </View>
                        <Text style={styles.chartTotal}>Total: RM 1,245.00</Text>
                    </View>
                </View>

                {/* Utility Usage (Mock) */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="flash" size={20} color="#ffc107" />
                        <Text style={styles.cardTitle}>Utility Usage</Text>
                    </View>
                    <View style={styles.utilityRow}>
                        <View style={styles.utilityItem}>
                            <View style={[styles.utilityIcon, { backgroundColor: '#ffc10720' }]}>
                                <Ionicons name="flash" size={24} color="#ffc107" />
                            </View>
                            <Text style={styles.utilityValue}>450 kWh</Text>
                            <Text style={styles.utilityLabel}>Electricity</Text>
                        </View>
                        <View style={styles.utilityDivider} />
                        <View style={styles.utilityItem}>
                            <View style={[styles.utilityIcon, { backgroundColor: '#17a2b820' }]}>
                                <Ionicons name="water" size={24} color="#17a2b8" />
                            </View>
                            <Text style={styles.utilityValue}>25 m³</Text>
                            <Text style={styles.utilityLabel}>Water</Text>
                        </View>
                    </View>
                    <Text style={styles.utilityNote}>* Estimated based on bill history</Text>
                </View>

                {/* Complaint Stats */}
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>12</Text>
                        <Text style={styles.statLabel}>Total Requests</Text>
                        <View style={[styles.statIndicator, { backgroundColor: '#2D6CDF' }]} />
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>8</Text>
                        <Text style={styles.statLabel}>Resolved</Text>
                        <View style={[styles.statIndicator, { backgroundColor: '#28a745' }]} />
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>4</Text>
                        <Text style={styles.statLabel}>Pending</Text>
                        <View style={[styles.statIndicator, { backgroundColor: '#ffc107' }]} />
                    </View>
                </View>

                {/* Recent Announcements */}
                <View style={[styles.card, { marginTop: 16 }]}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="megaphone" size={20} color="#dc3545" />
                        <Text style={styles.cardTitle}>Latest Updates</Text>
                    </View>
                    <View style={styles.announcementItem}>
                        <View style={styles.announcementIcon}>
                            <Ionicons name="water" size={16} color="#17a2b8" />
                        </View>
                        <View style={styles.announcementContent}>
                            <Text style={styles.announcementTitle}>Scheduled Water Disruption</Text>
                            <Text style={styles.announcementDate}>Tomorrow, 10:00 AM</Text>
                        </View>
                    </View>
                    <View style={[styles.announcementItem, { borderBottomWidth: 0 }]}>
                        <View style={styles.announcementIcon}>
                            <Ionicons name="construct" size={16} color="#fd7e14" />
                        </View>
                        <View style={styles.announcementContent}>
                            <Text style={styles.announcementTitle}>Lift Maintenance Block B</Text>
                            <Text style={styles.announcementDate}>Dec 24, 2:00 PM</Text>
                        </View>
                    </View>
                </View>
            </View>
        </ScrollView>
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
    content: {
        padding: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 8,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    chartPlaceholder: {
        height: 180,
    },
    barsContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    barWrapper: {
        alignItems: 'center',
        width: 30,
    },
    bar: {
        width: 12,
        backgroundColor: '#2D6CDF',
        borderRadius: 6,
        marginBottom: 8,
    },
    barLabel: {
        fontSize: 10,
        color: '#6c757d',
    },
    chartTotal: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginTop: 16,
    },
    utilityRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    utilityItem: {
        flex: 1,
        alignItems: 'center',
    },
    utilityIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    utilityValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    utilityLabel: {
        fontSize: 14,
        color: '#6c757d',
    },
    utilityDivider: {
        width: 1,
        height: 60,
        backgroundColor: '#e9ecef',
    },
    utilityNote: {
        textAlign: 'center',
        fontSize: 12,
        color: '#adb5bd',
        marginTop: 16,
        fontStyle: 'italic',
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        overflow: 'hidden',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#6c757d',
    },
    statIndicator: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 4,
    },
    announcementItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        gap: 12,
    },
    announcementIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#e9ecef',
        justifyContent: 'center',
        alignItems: 'center',
    },
    announcementContent: {
        flex: 1,
    },
    announcementTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    announcementDate: {
        fontSize: 12,
        color: '#adb5bd',
    },
});
