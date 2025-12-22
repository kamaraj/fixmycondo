/**
 * FixMyCondo - API Service
 * Axios-based API client for backend communication
 * Works on both Mobile and Web platforms
 */
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// API Configuration - Update this based on your environment
const getBaseUrl = () => {
    // 1. Check for environment variable (injected at build time via Expo)
    if (process.env.EXPO_PUBLIC_API_URL) {
        return process.env.EXPO_PUBLIC_API_URL;
    }

    if (Platform.OS === 'web') {
        // Web developer fallback
        return 'http://localhost:9030/api';
    }
    // Mobile: Use your local IP for development
    // Replace with your actual local IP address
    return 'http://192.168.1.100:9030/api';
};

const API_BASE_URL = getBaseUrl();

// Token storage keys
const ACCESS_TOKEN_KEY = 'fixmycondo_access_token';
const REFRESH_TOKEN_KEY = 'fixmycondo_refresh_token';
const USER_KEY = 'fixmycondo_user';

// Create axios instance
const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Token management - Works on both web and mobile
export const TokenService = {
    async getAccessToken(): Promise<string | null> {
        try {
            return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
        } catch {
            return null;
        }
    },

    async getRefreshToken(): Promise<string | null> {
        try {
            return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
        } catch {
            return null;
        }
    },

    async setTokens(accessToken: string, refreshToken: string): Promise<void> {
        await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    },

    async clearTokens(): Promise<void> {
        await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
        await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
        await AsyncStorage.removeItem(USER_KEY);
    },

    async saveUser(user: User): Promise<void> {
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    },

    async getUser(): Promise<User | null> {
        try {
            const userStr = await AsyncStorage.getItem(USER_KEY);
            return userStr ? JSON.parse(userStr) : null;
        } catch {
            return null;
        }
    }
};

// Request interceptor - Add auth token
api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const token = await TokenService.getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - Handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = await TokenService.getRefreshToken();
                if (refreshToken) {
                    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                        refresh_token: refreshToken,
                    });

                    const { access_token, refresh_token } = response.data;
                    await TokenService.setTokens(access_token, refresh_token);

                    originalRequest.headers.Authorization = `Bearer ${access_token}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                await TokenService.clearTokens();
            }
        }

        return Promise.reject(error);
    }
);

// ============================================
// API Types
// ============================================

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    full_name: string;
    phone?: string;
    building_id?: number;
    unit_id?: number;
}

export interface User {
    id: number;
    email: string;
    full_name: string;
    phone?: string;
    role: string;
    building_id?: number;
    unit_id?: number;
    speciality?: string;
    is_active: boolean;
    is_verified: boolean;
    settings?: Record<string, any>;
    created_at: string;
    last_login?: string;
}

export interface ResidenceDetails {
    building_name: string;
    building_address?: string;
    unit_number: string;
    block?: string;
    floor?: number;
    unit_type?: string;
    is_owner: boolean;
    building_manager?: string;
    manager_phone?: string;
}

export interface Complaint {
    id: number;
    title: string;
    description?: string;
    category: string;
    priority: string;
    status: string;
    building_id: number;
    unit_id?: number;
    created_by_id: number;
    assigned_to_id?: number;
    sla_hours: number;
    sla_deadline?: string;
    is_sla_breached: boolean;
    photos?: string[];
    videos?: string[];
    estimated_cost: number;
    actual_cost: number;
    created_at: string;
    updated_at: string;
    resolved_at?: string;
    created_by?: User;
    assigned_to?: User;
}

export interface ComplaintCreate {
    title: string;
    description?: string;
    category: string;
    priority: string;
    unit_id?: number;
    photos?: string[];
    preferred_visit_time?: string;
    allow_technician_entry?: boolean;
}

export interface ComplaintUpdate {
    id: number;
    complaint_id: number;
    created_by_id: number;
    status?: string;
    message: string;
    photos?: string[];
    cost_update?: number;
    created_at: string;
    created_by?: User;
}

export interface Building {
    id: number;
    name: string;
    address?: string;
    city?: string;
    total_blocks: number;
    total_units: number;
    manager_name?: string;
    manager_phone?: string;
    is_active: boolean;
}

export interface Unit {
    id: number;
    building_id: number;
    unit_number: string;
    block?: string;
    floor?: number;
    is_occupied: boolean;
}

export interface Facility {
    id: number;
    building_id: number;
    name: string;
    description?: string;
    location?: string;
    capacity?: number;
    booking_fee: number;
    deposit_required: number;
    min_booking_hours: number;
    max_booking_hours: number;
    is_active: boolean;
}

export interface Booking {
    id: number;
    facility_id: number;
    user_id: number;
    booking_date: string;
    start_time: string;
    end_time: string;
    number_of_guests: number;
    purpose?: string;
    total_fee: number;
    deposit_paid: number;
    is_paid: boolean;
    status: string;
    created_at: string;
    facility?: Facility;
    user?: User;
}

export interface BookingCreate {
    facility_id: number;
    booking_date: string;
    start_time: string;
    end_time: string;
    number_of_guests: number;
    purpose?: string;
}

export interface Announcement {
    id: number;
    building_id: number;
    title: string;
    content: string;
    target_audience?: string[];
    attachments?: string[];
    is_published: boolean;
    published_at?: string;
    created_at: string;
}

export interface Vendor {
    id: number;
    name: string;
    company_name?: string;
    email?: string;
    phone?: string;
    service_type?: string;
    rating: number;
    total_jobs: number;
    completed_jobs: number;
    is_verified: boolean;
    is_active: boolean;
}

export interface VendorQuote {
    id: number;
    complaint_id: number;
    vendor_id: number;
    amount: number;
    currency: string;
    description?: string;
    estimated_days?: number;
    status: string;
    created_at: string;
    vendor?: Vendor;
}

export interface DashboardStats {
    total_complaints: number;
    new_complaints: number;
    in_progress_complaints: number;
    overdue_complaints: number;
    completed_today: number;
    total_residents: number;
    total_units: number;
    occupied_units: number;
    pending_bookings: number;
    today_bookings: number;
}

export interface ComplaintStats {
    by_category: Record<string, number>;
    by_status: Record<string, number>;
    by_priority: Record<string, number>;
    avg_resolution_time_hours: number;
    sla_compliance_rate: number;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
}

// ============================================
// API Methods
// ============================================

export const AuthAPI = {
    async login(data: LoginRequest) {
        const response = await api.post('/auth/login', data);
        return response.data;
    },

    async register(data: RegisterRequest) {
        const response = await api.post('/auth/register', data);
        return response.data;
    },

    async getMe(): Promise<User> {
        const response = await api.get('/auth/me');
        return response.data;
    },

    async updateProfile(data: Partial<User>): Promise<User> {
        const response = await api.patch('/auth/profile', data);
        await TokenService.saveUser(response.data); // Update local user data
        return response.data;
    },

    async changePassword(data: { current_password: string; new_password: string }): Promise<void> {
        await api.post('/auth/password', data);
    },

    async getResidenceDetails(): Promise<ResidenceDetails> {
        const response = await api.get('/auth/residence');
        return response.data;
    },

    async logout() {
        try {
            await api.post('/auth/logout');
        } catch {
            // Ignore logout errors
        }
        await TokenService.clearTokens();
    },
};

export const ComplaintsAPI = {
    async getAll(params?: Record<string, any>): Promise<PaginatedResponse<Complaint>> {
        const response = await api.get('/complaints/', { params });
        return response.data;
    },

    async getById(id: number): Promise<Complaint> {
        const response = await api.get(`/complaints/${id}`);
        return response.data;
    },

    async create(data: ComplaintCreate): Promise<Complaint> {
        const response = await api.post('/complaints/', data);
        return response.data;
    },

    async update(id: number, data: Partial<Complaint>): Promise<Complaint> {
        const response = await api.patch(`/complaints/${id}`, data);
        return response.data;
    },

    async addUpdate(id: number, data: { message: string; status?: string; photos?: string[] }): Promise<ComplaintUpdate> {
        const response = await api.post(`/complaints/${id}/updates`, data);
        return response.data;
    },

    async getUpdates(id: number): Promise<ComplaintUpdate[]> {
        const response = await api.get(`/complaints/${id}/updates`);
        return response.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/complaints/${id}`);
    },
};

export const BuildingsAPI = {
    async getAll(params?: Record<string, any>): Promise<PaginatedResponse<Building>> {
        const response = await api.get('/buildings/', { params });
        return response.data;
    },

    async getById(id: number): Promise<Building> {
        const response = await api.get(`/buildings/${id}`);
        return response.data;
    },

    async getUnits(buildingId: number): Promise<Unit[]> {
        const response = await api.get(`/buildings/${buildingId}/units`);
        return response.data;
    },
};

export const FacilitiesAPI = {
    async getAll(params?: Record<string, any>): Promise<Facility[]> {
        const response = await api.get('/facilities/', { params });
        return response.data;
    },

    async getById(id: number): Promise<Facility> {
        const response = await api.get(`/facilities/${id}`);
        return response.data;
    },

    async getBookings(params?: Record<string, any>): Promise<PaginatedResponse<Booking>> {
        const response = await api.get('/facilities/bookings', { params });
        return response.data;
    },

    async getBookingById(id: number): Promise<Booking> {
        const response = await api.get(`/facilities/bookings/${id}`);
        return response.data;
    },

    async createBooking(data: BookingCreate): Promise<Booking> {
        const response = await api.post('/facilities/bookings', data);
        return response.data;
    },

    async updateBooking(id: number, data: { status: string; is_paid?: boolean }): Promise<Booking> {
        const response = await api.patch(`/facilities/bookings/${id}`, data);
        return response.data;
    },

    async cancelBooking(id: number): Promise<void> {
        await api.delete(`/facilities/bookings/${id}`);
    },
};

export const AnnouncementsAPI = {
    async getAll(params?: Record<string, any>): Promise<PaginatedResponse<Announcement>> {
        const response = await api.get('/announcements/', { params });
        return response.data;
    },

    async getById(id: number): Promise<Announcement> {
        const response = await api.get(`/announcements/${id}`);
        return response.data;
    },
};

export const VendorsAPI = {
    async getAll(params?: Record<string, any>): Promise<PaginatedResponse<Vendor>> {
        const response = await api.get('/vendors/', { params });
        return response.data;
    },

    async getQuotesForComplaint(complaintId: number): Promise<VendorQuote[]> {
        const response = await api.get(`/vendors/quotes/complaint/${complaintId}`);
        return response.data;
    },
};

export const DashboardAPI = {
    async getStats(): Promise<DashboardStats> {
        const response = await api.get('/dashboard/stats');
        return response.data;
    },

    async getComplaintStats(days: number = 30): Promise<ComplaintStats> {
        const response = await api.get('/dashboard/complaint-stats', { params: { days } });
        return response.data;
    },

    async getTechnicianStats(params?: Record<string, any>) {
        const response = await api.get('/dashboard/technician-stats', { params });
        return response.data;
    },
};

export default api;
