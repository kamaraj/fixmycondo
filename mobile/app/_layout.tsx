/**
 * FixMyCondo - Root Layout
 * App-wide layout with auth provider and navigation
 * Supports Mobile and Web platforms
 */
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { AuthProvider } from '../contexts/AuthContext';

export default function RootLayout() {
    return (
        <AuthProvider>
            <StatusBar style="auto" />
            <Stack
                screenOptions={{
                    headerStyle: {
                        backgroundColor: '#2D6CDF',
                    },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                    // Web-specific styling
                    ...(Platform.OS === 'web' && {
                        headerStyle: {
                            backgroundColor: '#2D6CDF',
                            height: 64,
                        },
                    }),
                }}
            >
                {/* Entry */}
                <Stack.Screen name="index" options={{ headerShown: false }} />

                {/* Auth Screens */}
                <Stack.Screen name="(auth)/login" options={{ title: 'Login', headerShown: false }} />
                <Stack.Screen name="(auth)/register" options={{ title: 'Register', headerShown: false }} />

                {/* Main Tab Navigation */}
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

                {/* Complaint Screens */}
                <Stack.Screen
                    name="complaint/[id]"
                    options={{
                        title: 'Complaint Details',
                        presentation: 'card',
                    }}
                />
                <Stack.Screen
                    name="complaint/create"
                    options={{
                        title: 'Report Issue',
                        presentation: 'modal',
                    }}
                />

                {/* Booking Screens */}
                <Stack.Screen
                    name="booking/create"
                    options={{
                        title: 'Book Facility',
                        presentation: 'modal',
                    }}
                />

                {/* Emergency & Visitor Screens */}
                <Stack.Screen
                    name="emergency/index"
                    options={{
                        headerShown: false,
                        presentation: 'fullScreenModal',
                    }}
                />
                <Stack.Screen
                    name="visitor/index"
                    options={{
                        headerShown: false,
                    }}
                />

                {/* Dashboard Screen */}
                <Stack.Screen
                    name="dashboard/index"
                    options={{
                        headerShown: false,
                    }}
                />

                {/* Profile Screens */}
                <Stack.Screen name="profile/edit" options={{ title: 'Edit Profile' }} />
                <Stack.Screen name="profile/unit" options={{ title: 'My Unit' }} />
                <Stack.Screen name="profile/notifications" options={{ title: 'Notifications' }} />
                <Stack.Screen name="profile/password" options={{ title: 'Change Password' }} />
                <Stack.Screen name="profile/support" options={{ title: 'Help & Support' }} />
                <Stack.Screen name="profile/terms" options={{ title: 'Terms & Privacy' }} />

                {/* Announcement Screens */}
                <Stack.Screen
                    name="announcement/[id]"
                    options={{
                        title: 'Announcement',
                    }}
                />

                {/* Technician Screens */}
                <Stack.Screen
                    name="technician/jobs"
                    options={{
                        title: 'My Jobs',
                    }}
                />
                <Stack.Screen
                    name="technician/job/[id]"
                    options={{
                        title: 'Job Details',
                    }}
                />
            </Stack>
        </AuthProvider>
    );
}
