/**
 * FixMyCondo - Login Screen
 * With pre-filled test credentials for different roles
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

// Test credentials for different roles
const TEST_ACCOUNTS = [
    {
        role: 'Resident',
        email: 'ahmad.hassan@gmail.com',
        password: 'User@123',
        description: 'Tenant in Unit 01-01',
        color: '#28a745',
        icon: '🏠',
    },
    {
        role: 'Technician',
        email: 'raju.tech@fixmycondo.com',
        password: 'Tech@123',
        description: 'Plumbing Specialist',
        color: '#fd7e14',
        icon: '🔧',
    },
    {
        role: 'Admin',
        email: 'admin@fixmycondo.com',
        password: 'Admin@123',
        description: 'Super Administrator',
        color: '#dc3545',
        icon: '👔',
    },
];

export default function LoginScreen() {
    const { login, isLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

    const validate = () => {
        const newErrors: { email?: string; password?: string } = {};

        if (!email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validate()) return;

        try {
            await login(email, password);
            router.replace('/(tabs)/home');
        } catch (error: any) {
            Alert.alert(
                'Login Failed',
                error.response?.data?.detail || 'Invalid email or password'
            );
        }
    };

    const fillCredentials = (account: typeof TEST_ACCOUNTS[0]) => {
        setEmail(account.email);
        setPassword(account.password);
        setErrors({});
    };

    return (
        <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
        >
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.header}>
                    <Text style={styles.logo}>🏢</Text>
                    <Text style={styles.title}>FixMyCondo</Text>
                    <Text style={styles.subtitle}>Tenant Complaint Management</Text>
                </View>

                {/* Quick Login Section */}
                <View style={styles.quickLoginSection}>
                    <Text style={styles.quickLoginTitle}>Quick Login (Demo)</Text>
                    <Text style={styles.quickLoginSubtitle}>Tap to auto-fill credentials</Text>
                    <View style={styles.accountsGrid}>
                        {TEST_ACCOUNTS.map((account) => (
                            <TouchableOpacity
                                key={account.role}
                                style={[styles.accountCard, { borderColor: account.color }]}
                                onPress={() => fillCredentials(account)}
                            >
                                <Text style={styles.accountIcon}>{account.icon}</Text>
                                <Text style={[styles.accountRole, { color: account.color }]}>
                                    {account.role}
                                </Text>
                                <Text style={styles.accountEmail} numberOfLines={1}>
                                    {account.email}
                                </Text>
                                <Text style={styles.accountDescription} numberOfLines={1}>
                                    {account.description}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={[styles.input, errors.email && styles.inputError]}
                            placeholder="Enter your email"
                            placeholderTextColor="#999"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={[styles.input, errors.password && styles.inputError]}
                            placeholder="Enter your password"
                            placeholderTextColor="#999"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                    </View>

                    <TouchableOpacity
                        style={[styles.button, isLoading && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Login</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Don't have an account? </Text>
                        <Link href="/(auth)/register" asChild>
                            <TouchableOpacity>
                                <Text style={styles.linkText}>Register</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </View>

                {/* Credentials Reference */}
                <View style={styles.credentialsRef}>
                    <Text style={styles.credentialsTitle}>All Test Credentials</Text>
                    <View style={styles.credentialsList}>
                        <Text style={styles.credentialItem}>
                            <Text style={styles.credentialLabel}>Residents:</Text> User@123
                        </Text>
                        <Text style={styles.credentialItem}>
                            <Text style={styles.credentialLabel}>Technicians:</Text> Tech@123
                        </Text>
                        <Text style={styles.credentialItem}>
                            <Text style={styles.credentialLabel}>Admins:</Text> Admin@123
                        </Text>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    container: {
        flex: 1,
        padding: 24,
        paddingTop: 40,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    logo: {
        fontSize: 56,
        marginBottom: 12,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2D6CDF',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#6c757d',
    },
    quickLoginSection: {
        marginBottom: 24,
    },
    quickLoginTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
        marginBottom: 4,
    },
    quickLoginSubtitle: {
        fontSize: 12,
        color: '#6c757d',
        textAlign: 'center',
        marginBottom: 16,
    },
    accountsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    accountCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        borderWidth: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    accountIcon: {
        fontSize: 28,
        marginBottom: 6,
    },
    accountRole: {
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 2,
    },
    accountEmail: {
        fontSize: 9,
        color: '#6c757d',
        marginBottom: 2,
    },
    accountDescription: {
        fontSize: 8,
        color: '#adb5bd',
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
        marginBottom: 20,
    },
    label: {
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
        marginTop: 24,
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
    credentialsRef: {
        marginTop: 24,
        padding: 16,
        backgroundColor: '#e9ecef',
        borderRadius: 12,
    },
    credentialsTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#495057',
        textAlign: 'center',
        marginBottom: 8,
    },
    credentialsList: {
        alignItems: 'center',
    },
    credentialItem: {
        fontSize: 11,
        color: '#6c757d',
        marginBottom: 2,
    },
    credentialLabel: {
        fontWeight: '600',
        color: '#495057',
    },
});
