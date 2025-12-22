/**
 * FixMyCondo - Help & Support
 */
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Linking,
} from 'react-native';
import { Ionicons } from '../../components/Ionicons';

export default function SupportScreen() {
    const handleCall = () => {
        Linking.openURL('tel:1800123456');
    };

    const handleEmail = () => {
        Linking.openURL('mailto:support@fixmycondo.com');
    };

    const FAQs = [
        { q: 'How do I book the BBQ pit?', a: 'Go to Home > Book Facility > BBQ Pit and verify availability.' },
        { q: 'Can I edit a complaint?', a: 'Yes, you can add updates to your reported issues in the Complaint Detail view.' },
        { q: 'How do I pay maintenance fees?', a: 'Currently, payments are handled offline at the management office.' },
    ];

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>How can we help?</Text>
                <Text style={styles.subtitle}>Find answers or contact us directly.</Text>
            </View>

            <View style={styles.contactRow}>
                <TouchableOpacity style={styles.contactBtn} onPress={handleCall}>
                    <Ionicons name="call" size={24} color="#2D6CDF" />
                    <Text style={styles.contactLabel}>Call Us</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.contactBtn} onPress={handleEmail}>
                    <Ionicons name="mail" size={24} color="#2D6CDF" />
                    <Text style={styles.contactLabel}>Email Us</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.contactBtn}>
                    <Ionicons name="chatbubbles" size={24} color="#2D6CDF" />
                    <Text style={styles.contactLabel}>Chat</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
                {FAQs.map((faq, i) => (
                    <View key={i} style={styles.faqCard}>
                        <Text style={styles.question}>{faq.q}</Text>
                        <Text style={styles.answer}>{faq.a}</Text>
                    </View>
                ))}
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
        padding: 24,
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6c757d',
        textAlign: 'center',
    },
    contactRow: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
    },
    contactBtn: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    contactLabel: {
        marginTop: 8,
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    section: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
    },
    faqCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#2D6CDF',
    },
    question: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    answer: {
        fontSize: 14,
        color: '#6c757d',
        lineHeight: 20,
    },
});
