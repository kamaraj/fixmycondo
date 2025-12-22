/**
 * FixMyCondo - Register Screen
 */
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

export default function RegisterScreen() {
    const { register, isLoading } = useAuth();
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.full_name.trim()) {
            newErrors.full_name = 'Name is required';
        } else if (formData.full_name.length < 2) {
            newErrors.full_name = 'Name must be at least 2 characters';
        }

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (formData.phone && !/^[0-9+\-\s]{8,15}$/.test(formData.phone)) {
            newErrors.phone = 'Invalid phone number';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        if (!validate()) return;

        try {
            await register({
                full_name: formData.full_name,
                email: formData.email,
                phone: formData.phone || undefined,
                password: formData.password,
                role: 'resident',
            });
            router.replace('/(tabs)/home');
        } catch (error: any) {
            Alert.alert(
                'Registration Failed',
                error.response?.data?.detail || 'Unable to create account'
            );
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <Text style={styles.logo}>🏢</Text>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Join your condo community</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Full Name *</Text>
                        <TextInput
                            style={[styles.input, errors.full_name && styles.inputError]}
                            placeholder="Enter your full name"
                            placeholderTextColor="#999"
                            value={formData.full_name}
                            onChangeText={(v) => updateField('full_name', v)}
                        />
                        {errors.full_name && <Text style={styles.errorText}>{errors.full_name}</Text>}
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email *</Text>
                        <TextInput
                            style={[styles.input, errors.email && styles.inputError]}
                            placeholder="Enter your email"
                            placeholderTextColor="#999"
                            value={formData.email}
                            onChangeText={(v) => updateField('email', v)}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Phone Number</Text>
                        <TextInput
                            style={[styles.input, errors.phone && styles.inputError]}
                            placeholder="e.g., 016-1234567"
                            placeholderTextColor="#999"
                            value={formData.phone}
                            onChangeText={(v) => updateField('phone', v)}
                            keyboardType="phone-pad"
                        />
                        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Password *</Text>
                        <TextInput
                            style={[styles.input, errors.password && styles.inputError]}
                            placeholder="Minimum 8 characters"
                            placeholderTextColor="#999"
                            value={formData.password}
                            onChangeText={(v) => updateField('password', v)}
                            secureTextEntry
                        />
                        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Confirm Password *</Text>
                        <TextInput
                            style={[styles.input, errors.confirmPassword && styles.inputError]}
                            placeholder="Re-enter your password"
                            placeholderTextColor="#999"
                            value={formData.confirmPassword}
                            onChangeText={(v) => updateField('confirmPassword', v)}
                            secureTextEntry
                        />
                        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
                    </View>

                    <TouchableOpacity
                        style={[styles.button, isLoading && styles.buttonDisabled]}
                        onPress={handleRegister}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Create Account</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <Link href="/(auth)/login" asChild>
                            <TouchableOpacity>
                                <Text style={styles.linkText}>Login</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
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
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logo: {
        fontSize: 48,
        marginBottom: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2D6CDF',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#6c757d',
    },
    form: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 6,
    },
    input: {
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#e9ecef',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: '#333',
    },
    inputError: {
        borderColor: '#dc3545',
    },
    errorText: {
        color: '#dc3545',
        fontSize: 12,
        marginTop: 4,
    },
    button: {
        backgroundColor: '#2D6CDF',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    footerText: {
        color: '#6c757d',
        fontSize: 14,
    },
    linkText: {
        color: '#2D6CDF',
        fontSize: 14,
        fontWeight: '600',
    },
});
