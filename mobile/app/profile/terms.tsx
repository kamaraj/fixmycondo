/**
 * FixMyCondo - Terms & Privacy
 */
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
} from 'react-native';

export default function TermsScreen() {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Terms of Service</Text>
                <Text style={styles.text}>
                    Last updated: Dec 2025
                    {'\n\n'}
                    1. Acceptance of Terms{'\n'}
                    By accessing and using FixMyCondo, you accept and agree to be bound by the terms and provision of this agreement.
                    {'\n\n'}
                    2. Use of Services{'\n'}
                    You agree to use this application only for lawful purposes and in accordance with the management policies of your residence.
                    {'\n\n'}
                    3. Privacy Policy{'\n'}
                    We value your privacy. Your personal data is collected solely for the purpose of managing residence services and will not be shared with third parties without consent.
                    {'\n\n'}
                    4. Contact{'\n'}
                    For questions about these terms, please contact the management office.
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        padding: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 24,
    },
    text: {
        fontSize: 16,
        color: '#495057',
        lineHeight: 24,
    },
});
