/**
 * FixMyCondo - Icon Component
 * Cross-platform icon wrapper using react-icons for web
 */
import React from 'react';
import { Platform, Text, StyleSheet, View } from 'react-native';
import {
    IoHome, IoHomeOutline,
    IoDocumentText, IoDocumentTextOutline,
    IoCalendar, IoCalendarOutline,
    IoMegaphone, IoMegaphoneOutline,
    IoPerson, IoPersonOutline,
    IoAdd, IoAddOutline,
    IoChevronBack, IoChevronForward,
    IoCheckmarkCircle, IoCheckmarkCircleOutline,
    IoAlertCircle, IoAlertCircleOutline,
    IoTime, IoTimeOutline,
    IoLocation, IoLocationOutline,
    IoFlag, IoFlagOutline,
    IoCall, IoCallOutline,
    IoConstruct, IoConstructOutline,
    IoWater, IoFlash, IoSwapVertical, IoShield,
    IoBusiness, IoSparkles, IoHammer, IoBug, IoCar,
    IoHelpCircle, IoHelpCircleOutline,
    IoCube, IoTimer, IoSave,
    IoLogOut, IoChevronDown, IoChevronUp,
    IoRefresh, IoClose, IoSearch,
    IoSettings, IoSettingsOutline,
    IoNotifications, IoNotificationsOutline,
    IoClipboard, IoClipboardOutline,
    IoCheckmarkDone, IoCheckmarkDoneOutline,
} from 'react-icons/io5';

// Map Ionicons names to react-icons components
const iconMap: Record<string, any> = {
    // Home
    'home': IoHome,
    'home-outline': IoHomeOutline,
    // Documents
    'document-text': IoDocumentText,
    'document-text-outline': IoDocumentTextOutline,
    // Calendar
    'calendar': IoCalendar,
    'calendar-outline': IoCalendarOutline,
    // Megaphone
    'megaphone': IoMegaphone,
    'megaphone-outline': IoMegaphoneOutline,
    // Person
    'person': IoPerson,
    'person-outline': IoPersonOutline,
    // Add
    'add': IoAdd,
    'add-outline': IoAddOutline,
    'add-circle': IoAdd,
    'add-circle-outline': IoAddOutline,
    // Navigation
    'chevron-back': IoChevronBack,
    'chevron-forward': IoChevronForward,
    'chevron-down': IoChevronDown,
    'chevron-up': IoChevronUp,
    // Checkmarks
    'checkmark-circle': IoCheckmarkCircle,
    'checkmark-circle-outline': IoCheckmarkCircleOutline,
    'checkmark-done': IoCheckmarkDone,
    'checkmark-done-outline': IoCheckmarkDoneOutline,
    'checkmark-done-circle': IoCheckmarkDone,
    // Alert
    'alert-circle': IoAlertCircle,
    'alert-circle-outline': IoAlertCircleOutline,
    // Time
    'time': IoTime,
    'time-outline': IoTimeOutline,
    'timer': IoTimer,
    'timer-outline': IoTimer,
    // Location
    'location': IoLocation,
    'location-outline': IoLocationOutline,
    // Flag
    'flag': IoFlag,
    'flag-outline': IoFlagOutline,
    // Call
    'call': IoCall,
    'call-outline': IoCallOutline,
    // Construct
    'construct': IoConstruct,
    'construct-outline': IoConstructOutline,
    // Categories
    'water': IoWater,
    'flash': IoFlash,
    'swap-vertical': IoSwapVertical,
    'shield': IoShield,
    'business': IoBusiness,
    'sparkles': IoSparkles,
    'hammer': IoHammer,
    'bug': IoBug,
    'car': IoCar,
    'help-circle': IoHelpCircle,
    'help-circle-outline': IoHelpCircleOutline,
    // Misc
    'cube': IoCube,
    'save': IoSave,
    'log-out': IoLogOut,
    'log-out-outline': IoLogOut,
    'refresh': IoRefresh,
    'close': IoClose,
    'search': IoSearch,
    'settings': IoSettings,
    'settings-outline': IoSettingsOutline,
    'notifications': IoNotifications,
    'notifications-outline': IoNotificationsOutline,
    'clipboard': IoClipboard,
    'clipboard-outline': IoClipboardOutline,
};

interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: any;
}

export function Icon({ name, size = 24, color = '#000', style }: IconProps) {
    if (Platform.OS === 'web') {
        const IconComponent = iconMap[name];
        if (IconComponent) {
            return (
                <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
                    <IconComponent size={size} color={color} />
                </View>
            );
        }
        // Fallback for unknown icons
        return (
            <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
                <Text style={{ fontSize: size * 0.6, color }}>?</Text>
            </View>
        );
    }

    // For native, we'll use a simple text fallback for now
    // In production, you would use @expo/vector-icons here
    return (
        <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
            <Text style={{ fontSize: size * 0.6, color }}>●</Text>
        </View>
    );
}

export default Icon;
