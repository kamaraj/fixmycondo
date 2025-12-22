/**
 * FixMyCondo - Ionicons Wrapper
 * Drop-in replacement for @expo/vector-icons Ionicons using react-icons
 * This avoids the registerWebModule error on web
 */
import React from 'react';
import { Platform, Text, View } from 'react-native';
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
    IoCreate, IoCreateOutline,
    IoTrash, IoTrashOutline,
    IoCamera, IoCameraOutline,
    IoImage, IoImageOutline,
    IoEye, IoEyeOutline,
    IoEyeOff, IoEyeOffOutline,
    IoMail, IoMailOutline,
    IoLockClosed, IoLockClosedOutline,
    IoWarning, IoWarningOutline,
    IoInformationCircle, IoInformationCircleOutline,
    IoStar, IoStarOutline,
    IoHeart, IoHeartOutline,
    IoShare, IoShareOutline,
    IoPricetag, IoPricetagOutline,
    IoCard, IoCardOutline,
    IoReceipt, IoReceiptOutline,
    IoLayers, IoLayersOutline,
    IoList, IoListOutline,
    IoGrid, IoGridOutline,
    IoMenu, IoMenuOutline,
    IoOptions, IoOptionsOutline,
    IoFilter, IoFilterOutline,
    IoArrowBack, IoArrowForward, IoArrowUp, IoArrowDown,
    IoPlay, IoPlayOutline,
    IoPause, IoPauseOutline,
    IoStop, IoStopOutline,
    IoFlame, IoFlameOutline,
    IoMedical, IoMedicalOutline,
    IoPersonAdd, IoPersonAddOutline,
    IoCarOutline,
    IoQrCode, IoQrCodeOutline,
    IoCopy, IoCopyOutline,
    IoCarSport, IoCarSportOutline,
    IoAddCircle, IoAddCircleOutline,
} from 'react-icons/io5';

// Map Ionicons names to react-icons components
const iconMap: Record<string, any> = {
    'home': IoHome,
    'home-outline': IoHomeOutline,
    'document-text': IoDocumentText,
    'document-text-outline': IoDocumentTextOutline,
    'calendar': IoCalendar,
    'calendar-outline': IoCalendarOutline,
    'megaphone': IoMegaphone,
    'megaphone-outline': IoMegaphoneOutline,
    'person': IoPerson,
    'person-outline': IoPersonOutline,
    'add': IoAdd,
    'add-outline': IoAddOutline,
    'chevron-back': IoChevronBack,
    'chevron-forward': IoChevronForward,
    'chevron-down': IoChevronDown,
    'chevron-up': IoChevronUp,
    'checkmark-circle': IoCheckmarkCircle,
    'checkmark-circle-outline': IoCheckmarkCircleOutline,
    'checkmark-done': IoCheckmarkDone,
    'checkmark-done-outline': IoCheckmarkDoneOutline,
    'checkmark-done-circle': IoCheckmarkDone,
    'alert-circle': IoAlertCircle,
    'alert-circle-outline': IoAlertCircleOutline,
    'time': IoTime,
    'time-outline': IoTimeOutline,
    'timer': IoTimer,
    'timer-outline': IoTimer,
    'location': IoLocation,
    'location-outline': IoLocationOutline,
    'flag': IoFlag,
    'flag-outline': IoFlagOutline,
    'call': IoCall,
    'call-outline': IoCallOutline,
    'construct': IoConstruct,
    'construct-outline': IoConstructOutline,
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
    'cube': IoCube,
    'save': IoSave,
    'log-out': IoLogOut,
    'log-out-outline': IoLogOut,
    'refresh': IoRefresh,
    'close': IoClose,
    'close-circle': IoClose,
    'close-circle-outline': IoClose,
    'search': IoSearch,
    'settings': IoSettings,
    'settings-outline': IoSettingsOutline,
    'notifications': IoNotifications,
    'notifications-outline': IoNotificationsOutline,
    'clipboard': IoClipboard,
    'clipboard-outline': IoClipboardOutline,
    'create': IoCreate,
    'create-outline': IoCreateOutline,
    'trash': IoTrash,
    'trash-outline': IoTrashOutline,
    'camera': IoCamera,
    'camera-outline': IoCameraOutline,
    'image': IoImage,
    'image-outline': IoImageOutline,
    'eye': IoEye,
    'eye-outline': IoEyeOutline,
    'eye-off': IoEyeOff,
    'eye-off-outline': IoEyeOffOutline,
    'mail': IoMail,
    'mail-outline': IoMailOutline,
    'lock-closed': IoLockClosed,
    'lock-closed-outline': IoLockClosedOutline,
    'warning': IoWarning,
    'warning-outline': IoWarningOutline,
    'information-circle': IoInformationCircle,
    'information-circle-outline': IoInformationCircleOutline,
    'star': IoStar,
    'star-outline': IoStarOutline,
    'heart': IoHeart,
    'heart-outline': IoHeartOutline,
    'share': IoShare,
    'share-outline': IoShareOutline,
    'share-social': IoShare,
    'share-social-outline': IoShareOutline,
    'pricetag': IoPricetag,
    'pricetag-outline': IoPricetagOutline,
    'card': IoCard,
    'card-outline': IoCardOutline,
    'receipt': IoReceipt,
    'receipt-outline': IoReceiptOutline,
    'layers': IoLayers,
    'layers-outline': IoLayersOutline,
    'list': IoList,
    'list-outline': IoListOutline,
    'grid': IoGrid,
    'grid-outline': IoGridOutline,
    'menu': IoMenu,
    'menu-outline': IoMenuOutline,
    'options': IoOptions,
    'options-outline': IoOptionsOutline,
    'filter': IoFilter,
    'filter-outline': IoFilterOutline,
    'arrow-back': IoArrowBack,
    'arrow-forward': IoArrowForward,
    'arrow-up': IoArrowUp,
    'arrow-down': IoArrowDown,
    'play': IoPlay,
    'play-outline': IoPlayOutline,
    'pause': IoPause,
    'pause-outline': IoPauseOutline,
    'stop': IoStop,
    'stop-outline': IoStopOutline,
    'flame': IoFlame,
    'flame-outline': IoFlameOutline,
    'medical': IoMedical,
    'medical-outline': IoMedicalOutline,
    'person-add': IoPersonAdd,
    'person-add-outline': IoPersonAddOutline,
    'car-outline': IoCarOutline,
    'qr-code': IoQrCode,
    'qr-code-outline': IoQrCodeOutline,
    'copy': IoCopy,
    'copy-outline': IoCopyOutline,
    'car-sport': IoCarSport,
    'car-sport-outline': IoCarSportOutline,
    'add-circle': IoAddCircle,
    'add-circle-outline': IoAddCircleOutline,
};

interface IoniconsProps {
    name: string;
    size?: number;
    color?: string;
    style?: any;
}

// This component mimics the Ionicons API
export function Ionicons({ name, size = 24, color = '#000', style }: IoniconsProps) {
    if (Platform.OS === 'web') {
        const IconComponent = iconMap[name];
        if (IconComponent) {
            return (
                <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
                    <IconComponent size={size} color={color} />
                </View>
            );
        }
        // Fallback
        return (
            <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
                <Text style={{ fontSize: size * 0.5, color }}>○</Text>
            </View>
        );
    }

    // Native fallback - simple dot
    return (
        <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
            <Text style={{ fontSize: size * 0.5, color }}>●</Text>
        </View>
    );
}

export default Ionicons;
