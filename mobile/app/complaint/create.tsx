/**
 * FixMyCondo - Create Complaint Screen
 */
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '../../components/Ionicons';
import { router } from 'expo-router';
import { ComplaintsAPI } from '../../services/api';

const CATEGORIES = [
    { value: 'plumbing', label: 'Plumbing', icon: 'water' },
    { value: 'electrical', label: 'Electrical', icon: 'flash' },
    { value: 'lift', label: 'Lift/Elevator', icon: 'swap-vertical' },
    { value: 'security', label: 'Security', icon: 'shield' },
    { value: 'common_area', label: 'Common Area', icon: 'business' },
    { value: 'cleaning', label: 'Cleaning', icon: 'sparkles' },
    { value: 'pest', label: 'Pest Control', icon: 'bug' },
    { value: 'parking', label: 'Parking', icon: 'car' },
    { value: 'other', label: 'Other', icon: 'help-circle' },
];

const PRIORITIES = [
    { value: 'low', label: 'Low', color: '#28a745', description: 'Can wait 3 days' },
    { value: 'medium', label: 'Medium', color: '#ffc107', description: 'Within 48 hours' },
    { value: 'high', label: 'High', color: '#fd7e14', description: 'Within 24 hours' },
    { value: 'critical', label: 'Critical', color: '#dc3545', description: 'Emergency - 4 hours' },
];

export default function CreateComplaintScreen() {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        priority: 'medium',
        allow_technician_entry: true,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        } else if (formData.title.length < 5) {
            newErrors.title = 'Title must be at least 5 characters';
        } else if (formData.title.length > 100) {
            newErrors.title = 'Title must be less than 100 characters';
        }

        if (!formData.category) {
            newErrors.category = 'Please select a category';
        }

        if (formData.description && formData.description.length > 500) {
            newErrors.description = 'Description must be less than 500 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            await ComplaintsAPI.create({
                title: formData.title.trim(),
                description: formData.description.trim() || undefined,
                category: formData.category,
                priority: formData.priority,
                allow_technician_entry: formData.allow_technician_entry,
            });

            Alert.alert(
                'Success',
                'Your complaint has been submitted successfully.',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (error: any) {
            Alert.alert(
                'Error',
                error.response?.data?.detail || 'Failed to submit complaint'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Category Selection */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Category *</Text>
                <View style={styles.categoryGrid}>
                    {CATEGORIES.map((cat) => (
                        <TouchableOpacity
                            key={cat.value}
                            style={[
                                styles.categoryItem,
                                formData.category === cat.value && styles.categoryItemActive,
                            ]}
                            onPress={() => updateField('category', cat.value)}
                        >
                            <Ionicons
                                name={cat.icon as any}
                                size={24}
                                color={formData.category === cat.value ? '#2D6CDF' : '#6c757d'}
                            />
                            <Text
                                style={[
                                    styles.categoryLabel,
                                    formData.category === cat.value && styles.categoryLabelActive,
                                ]}
                            >
                                {cat.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
                {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
            </View>

            {/* Title */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Issue Title *</Text>
                <TextInput
                    style={[styles.input, errors.title && styles.inputError]}
                    placeholder="e.g., Water leaking in bathroom"
                    placeholderTextColor="#999"
                    value={formData.title}
                    onChangeText={(v) => updateField('title', v)}
                    maxLength={100}
                />
                {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
                <Text style={styles.charCount}>{formData.title.length}/100</Text>
            </View>

            {/* Description */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Description</Text>
                <TextInput
                    style={[styles.input, styles.textArea, errors.description && styles.inputError]}
                    placeholder="Provide more details about the issue..."
                    placeholderTextColor="#999"
                    value={formData.description}
                    onChangeText={(v) => updateField('description', v)}
                    multiline
                    numberOfLines={4}
                    maxLength={500}
                    textAlignVertical="top"
                />
                {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
                <Text style={styles.charCount}>{formData.description.length}/500</Text>
            </View>

            {/* Priority */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Priority Level</Text>
                <View style={styles.priorityList}>
                    {PRIORITIES.map((pri) => (
                        <TouchableOpacity
                            key={pri.value}
                            style={[
                                styles.priorityItem,
                                formData.priority === pri.value && styles.priorityItemActive,
                                formData.priority === pri.value && { borderColor: pri.color },
                            ]}
                            onPress={() => updateField('priority', pri.value)}
                        >
                            <View style={[styles.priorityIndicator, { backgroundColor: pri.color }]} />
                            <View style={styles.priorityContent}>
                                <Text
                                    style={[
                                        styles.priorityLabel,
                                        formData.priority === pri.value && { color: pri.color },
                                    ]}
                                >
                                    {pri.label}
                                </Text>
                                <Text style={styles.priorityDesc}>{pri.description}</Text>
                            </View>
                            {formData.priority === pri.value && (
                                <Ionicons name="checkmark-circle" size={24} color={pri.color} />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Technician Entry Toggle */}
            <View style={styles.section}>
                <TouchableOpacity
                    style={styles.toggleRow}
                    onPress={() => updateField('allow_technician_entry', !formData.allow_technician_entry)}
                >
                    <View>
                        <Text style={styles.toggleLabel}>Allow technician entry</Text>
                        <Text style={styles.toggleDesc}>
                            Permit technician to enter unit when you're not home
                        </Text>
                    </View>
                    <View
                        style={[
                            styles.toggle,
                            formData.allow_technician_entry && styles.toggleActive,
                        ]}
                    >
                        <View
                            style={[
                                styles.toggleKnob,
                                formData.allow_technician_entry && styles.toggleKnobActive,
                            ]}
                        />
                    </View>
                </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={isSubmitting}
            >
                {isSubmitting ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <>
                        <Ionicons name="send" size={20} color="#fff" />
                        <Text style={styles.submitButtonText}>Submit Complaint</Text>
                    </>
                )}
            </TouchableOpacity>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -4,
    },
    categoryItem: {
        width: '33.33%',
        padding: 4,
    },
    categoryItemActive: {
        opacity: 1,
    },
    categoryLabel: {
        fontSize: 12,
        color: '#6c757d',
        marginTop: 4,
        textAlign: 'center',
    },
    categoryLabelActive: {
        color: '#2D6CDF',
        fontWeight: '600',
    },
    input: {
        backgroundColor: '#fff',
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
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    errorText: {
        color: '#dc3545',
        fontSize: 12,
        marginTop: 4,
    },
    charCount: {
        fontSize: 12,
        color: '#6c757d',
        textAlign: 'right',
        marginTop: 4,
    },
    priorityList: {
        gap: 8,
    },
    priorityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#e9ecef',
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
    },
    priorityItemActive: {
        backgroundColor: '#f8f9fa',
    },
    priorityIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 12,
    },
    priorityContent: {
        flex: 1,
    },
    priorityLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    priorityDesc: {
        fontSize: 13,
        color: '#6c757d',
        marginTop: 2,
    },
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
    },
    toggleLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    toggleDesc: {
        fontSize: 13,
        color: '#6c757d',
        marginTop: 2,
    },
    toggle: {
        width: 50,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#e9ecef',
        padding: 2,
    },
    toggleActive: {
        backgroundColor: '#2D6CDF',
    },
    toggleKnob: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#fff',
    },
    toggleKnobActive: {
        marginLeft: 22,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2D6CDF',
        borderRadius: 12,
        padding: 16,
        marginTop: 8,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
});
