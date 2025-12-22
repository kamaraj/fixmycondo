/**
 * FixMyCondo - Profile Screen
 */
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Platform,
} from 'react-native';
import { Ionicons } from '../../components/Ionicons';
import { useAuth } from '../../contexts/AuthContext';
import { router } from 'expo-router';

export default function ProfileScreen() {
    const { user, logout, isLoading } = useAuth();

    const handleLogout = async () => {
        console.log('>>> handleLogout TRIGGERED');
        try {
            console.log('>>> Initiating AuthContext.logout()...');
            await logout();
            console.log('>>> AuthContext.logout() SUCCESSFUL');

            if (Platform.OS === 'web') {
                console.log('>>> WEB: Forcing navigation to root via window.location.href');
                window.location.href = '/';
            } else {
                console.log('>>> MOBILE: Navigating to login via router.replace');
                router.replace('/(auth)/login');
            }
        } catch (error) {
            console.error('>>> LOGOUT HANDLER CAUGHT ERROR:', error);
            // Universal emergency navigation
            if (Platform.OS === 'web') {
                window.location.href = '/';
            } else {
                router.replace('/(auth)/login');
            }
        }
    };

    const menuItems = [
        { icon: 'person-outline', label: 'Edit Profile', onPress: () => router.push('/profile/edit') },
        { icon: 'home-outline', label: 'My Unit', onPress: () => router.push('/profile/unit') },
        { icon: 'notifications-outline', label: 'Notifications', onPress: () => router.push('/profile/notifications') },
        { icon: 'lock-closed-outline', label: 'Change Password', onPress: () => router.push('/profile/password') },
        { icon: 'help-circle-outline', label: 'Help & Support', onPress: () => router.push('/profile/support') },
        { icon: 'document-text-outline', label: 'Terms & Privacy', onPress: () => router.push('/profile/terms') },
    ];

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={{ paddingBottom: 100 }}
        >
            {/* Profile Header */}
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                    </Text>
                </View>
                <Text style={styles.userName}>{user?.full_name || 'User'}</Text>
                <Text style={styles.userEmail}>{user?.email}</Text>
                <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>
                        {user?.role?.replace('_', ' ').toUpperCase() || 'RESIDENT'}
                    </Text>
                </View>
            </View>

            {/* Menu Items */}
            <View style={styles.menuSection}>
                {menuItems.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.menuItem}
                        onPress={item.onPress}
                    >
                        <View style={styles.menuIconContainer}>
                            <Ionicons name={item.icon as any} size={22} color="#2D6CDF" />
                        </View>
                        <Text style={styles.menuLabel}>{item.label}</Text>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    </TouchableOpacity>
                ))}
            </View>

            {/* Logout Button */}
            <TouchableOpacity
                style={[styles.logoutButton]}
                onPress={handleLogout}
                activeOpacity={0.7}
            >
                <Ionicons name="log-out-outline" size={22} color="#dc3545" />
                <Text style={styles.logoutText}>
                    {isLoading ? 'Logging out...' : 'Logout'}
                </Text>
            </TouchableOpacity>

            {/* App Version */}
            <Text style={styles.version}>FixMyCondo v1.0.0</Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        alignItems: 'center',
        paddingVertical: 32,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#2D6CDF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: '#6c757d',
        marginBottom: 12,
    },
    roleBadge: {
        backgroundColor: '#2D6CDF15',
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    roleText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#2D6CDF',
    },
    menuSection: {
        backgroundColor: '#fff',
        marginTop: 16,
        paddingHorizontal: 16,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#2D6CDF10',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    menuLabel: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        marginTop: 16,
        marginHorizontal: 16,
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#dc354530',
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#dc3545',
        marginLeft: 8,
    },
    version: {
        fontSize: 12,
        color: '#adb5bd',
        textAlign: 'center',
        marginVertical: 24,
    },
});
