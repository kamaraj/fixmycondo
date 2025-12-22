/**
 * FixMyCondo - Tab Navigation Layout
 */
import { Tabs } from 'expo-router';
import { Icon } from '../../components/Icon';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#2D6CDF',
                tabBarInactiveTintColor: '#6c757d',
                tabBarStyle: {
                    backgroundColor: '#fff',
                    borderTopWidth: 1,
                    borderTopColor: '#e9ecef',
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                },
                headerStyle: {
                    backgroundColor: '#2D6CDF',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="home-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="complaints"
                options={{
                    title: 'Complaints',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="construct-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="bookings"
                options={{
                    title: 'Bookings',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="calendar-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="announcements"
                options={{
                    title: 'News',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="megaphone-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="person-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
