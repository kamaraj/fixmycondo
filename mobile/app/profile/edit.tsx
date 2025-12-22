/**
 * FixMyCondo - Edit Profile Screen
 */
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { Ionicons } from '../../components/Ionicons';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { AuthAPI } from '../../services/api';

export default function EditProfileScreen() {
    const { user, refreshUser } = useAuth();
    const [fullName, setFullName] = useState(user?.full_name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        if (!fullName.trim()) {
            Alert.alert('Error', 'Full Name is required');
            return;
        }

        setIsLoading(true);
        try {
            await AuthAPI.updateProfile({
                full_name: fullName,
                phone: phone,
            });
            await refreshUser(); // Update context
            Alert.alert('Success', 'Profile updated successfully', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            console.error('Update profile error:', error);
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email (Cannot be changed)</Text>
                        <TextInput
                            style={[styles.input, styles.disabledInput]}
                            value={user?.email}
                            editable={false}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput
                            style={styles.input}
                            value={fullName}
                            onChangeText={setFullName}
                            placeholder="Enter your full name"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone Number</Text>
                        <TextInput
                            style={styles.input}
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="Enter phone number"
                            keyboardType="phone-pad"
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
                        onPress={handleSave}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    scrollContent: {
        padding: 20,
    },
    formContainer: {
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6c757d',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ced4da',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#333',
        backgroundColor: '#fff',
    },
    disabledInput: {
        backgroundColor: '#e9ecef',
        color: '#6c757d',
    },
    saveButton: {
        backgroundColor: '#2D6CDF',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 12,
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
