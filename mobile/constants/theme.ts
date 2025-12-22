/**
 * FixMyCondo - App Theme Constants
 */
export const COLORS = {
    primary: '#2D6CDF',
    primaryLight: '#2D6CDF20',
    secondary: '#6c757d',

    success: '#28a745',
    warning: '#ffc107',
    danger: '#dc3545',
    info: '#17a2b8',
    orange: '#fd7e14',

    white: '#ffffff',
    background: '#f8f9fa',
    card: '#ffffff',

    text: '#333333',
    textSecondary: '#6c757d',
    textMuted: '#adb5bd',

    border: '#e9ecef',
    borderLight: '#f0f0f0',

    shadow: '#000000',
};

export const FONTS = {
    regular: 'System',
    medium: 'System',
    bold: 'System',
};

export const SIZES = {
    // Font sizes
    xs: 10,
    sm: 12,
    md: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,

    // Spacing
    padding: 16,
    margin: 16,
    radius: 12,
    radiusSm: 8,
    radiusLg: 16,
    radiusFull: 9999,
};

export const SHADOWS = {
    small: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    medium: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    large: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
};

// Status colors mapping
export const STATUS_COLORS: Record<string, string> = {
    submitted: COLORS.secondary,
    reviewing: COLORS.info,
    assigned: COLORS.warning,
    in_progress: COLORS.primary,
    pending_parts: COLORS.orange,
    pending_vendor: COLORS.orange,
    completed: COLORS.success,
    closed: COLORS.success,
    reopened: COLORS.danger,
    cancelled: COLORS.secondary,
};

// Priority colors mapping
export const PRIORITY_COLORS: Record<string, string> = {
    low: COLORS.success,
    medium: COLORS.warning,
    high: COLORS.orange,
    critical: COLORS.danger,
};

// Category icons mapping
export const CATEGORY_ICONS: Record<string, string> = {
    plumbing: 'water',
    electrical: 'flash',
    lift: 'swap-vertical',
    security: 'shield',
    common_area: 'business',
    cleaning: 'sparkles',
    renovation: 'hammer',
    structural: 'construct',
    pest: 'bug',
    parking: 'car',
    other: 'help-circle',
};

export default {
    COLORS,
    FONTS,
    SIZES,
    SHADOWS,
    STATUS_COLORS,
    PRIORITY_COLORS,
    CATEGORY_ICONS,
};
