import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  FlatList,
  Image,
  Dimensions,
  RefreshControl,
  TextInput,
  Alert,
} from "react-native";
import { Picker } from '@react-native-picker/picker';
import LinearGradient from "react-native-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import EventService from "../services/apiService/event_service";
import EventModel from "../model/EventModel";

const { width, height } = Dimensions.get("window");
const isSmallDevice = width < 375;
const cardWidth = width * 0.9;

// Default event images for fallback
const getEventImage = (index) => {
  const images = [
    { uri: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80' },
    { uri: 'https://images.unsplash.com/photo-1536244636800-a3f74db0f3cf?auto=format&fit=crop&q=80' },
    { uri: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80' },
    { uri: 'https://images.unsplash.com/photo-1533240332313-0db49b459ad6?auto=format&fit=crop&q=80' },
    { uri: 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&q=80' },
  ];
  return images[index % images.length];
};

// Join Event Form Component
const JoinEventForm = ({ event, onClose }) => {
  const [formData, setFormData] = useState({
    event_id: event?.id || '',
    category_id: '',
    class_id: '',
    crew_members: [
      { name: '', mobile: '', email: '' },
      { name: '', mobile: '', email: '' }
    ]
  });
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [classes, setClasses] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [classesLoading, setClassesLoading] = useState(false);

  // Load categories when component mounts
  useEffect(() => {
    loadCategories();
  }, []);

  // Load classes when category changes
  useEffect(() => {
    if (formData.category_id) {
      loadClasses(formData.category_id);
    } else {
      setClasses([]);
      setFormData(prev => ({ ...prev, class_id: '' }));
    }
  }, [formData.category_id]);

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      console.log("Loading categories for event:", event?.id);
      
      // For debugging - add mock data fallback
      const mockCategories = [
        { id: 1, name: "Solo Race" },
        { id: 2, name: "Team Race" },
        { id: 3, name: "Endurance Race" }
      ];

      const response = await EventService.getEventCategories(event?.id);
      
      console.log("Categories response:", response);
      
      if (response.success && response.data?.data) {
        setCategories(response.data.data);
      } else if (response.success && response.data) {
        // Handle different response structures
        setCategories(response.data);
      } else {
        console.error("Categories API failed:", response);
        // Use mock data for now
        console.log("Using mock categories for testing");
        setCategories(mockCategories);
      }
    } catch (error) {
      console.error("Categories error:", error);
      // Use mock data as fallback
      setCategories([
        { id: 1, name: "Solo Race" },
        { id: 2, name: "Team Race" },
        { id: 3, name: "Endurance Race" }
      ]);
      Alert.alert('Info', 'Using test categories due to API error');
    } finally {
      setCategoriesLoading(false);
    }
  };

  const loadClasses = async (categoryId) => {
    try {
      setClassesLoading(true);
      console.log("Loading classes for event:", event?.id, "category:", categoryId);
      
      // Mock classes data
      const mockClasses = [
        { id: 1, name: "Beginner Class" },
        { id: 2, name: "Intermediate Class" },
        { id: 3, name: "Advanced Class" }
      ];

      const response = await EventService.getCategoryClasses(event?.id, categoryId);
      
      console.log("Classes response:", response);
      
      if (response.success && response.data?.data) {
        setClasses(response.data.data);
      } else if (response.success && response.data) {
        // Handle different response structures
        setClasses(response.data);
      } else {
        console.error("Classes API failed:", response);
        // Use mock data for now
        console.log("Using mock classes for testing");
        setClasses(mockClasses);
      }
    } catch (error) {
      console.error("Classes error:", error);
      // Use mock data as fallback
      setClasses([
        { id: 1, name: "Beginner Class" },
        { id: 2, name: "Intermediate Class" },
        { id: 3, name: "Advanced Class" }
      ]);
    } finally {
      setClassesLoading(false);
    }
  };

  const updateCrewMember = (index, field, value) => {
    const updatedMembers = [...formData.crew_members];
    updatedMembers[index][field] = value;
    setFormData({ ...formData, crew_members: updatedMembers });
  };

  const addCrewMember = () => {
    if (formData.crew_members.length < 5) {
      setFormData({
        ...formData,
        crew_members: [...formData.crew_members, { name: '', mobile: '', email: '' }]
      });
    }
  };

  const removeCrewMember = (index) => {
    if (formData.crew_members.length > 1) {
      const updatedMembers = formData.crew_members.filter((_, i) => i !== index);
      setFormData({ ...formData, crew_members: updatedMembers });
    }
  };

  const validateAndFormatData = () => {
    // Ensure all required fields are present and properly formatted
    const cleanData = {
      event_id: parseInt(formData.event_id) || parseInt(event?.id),
      category_id: parseInt(formData.category_id),
      class_id: parseInt(formData.class_id),
      crew_members: formData.crew_members.map(member => ({
        name: member.name.trim(),
        mobile: member.mobile.trim(),
        email: member.email.trim().toLowerCase()
      }))
    };

    console.log("=== Data Validation Debug ===");
    console.log("Original Data:", formData);
    console.log("Cleaned Data:", cleanData);
    console.log("Event Object:", event);

    return cleanData;
  };

  const checkAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      console.log("=== Auth Token Check ===");
      console.log("Token exists:", !!token);
      console.log("Token preview:", token ? `${token.substring(0, 30)}...` : "null");
      return !!token;
    } catch (error) {
      console.error("Error checking auth token:", error);
      return false;
    }
  };

  const handleSubmit = async () => {
    // Validate form
    if (!formData.category_id) {
      Alert.alert('Error', 'Please select a category');
      return;
    }
    
    if (!formData.class_id) {
      Alert.alert('Error', 'Please select a class');
      return;
    }

    const hasEmptyFields = formData.crew_members.some(
      member => !member.name.trim() || !member.mobile.trim() || !member.email.trim()
    );

    if (hasEmptyFields) {
      Alert.alert('Error', 'Please fill in all crew member details');
      return;
    }

    try {
      setLoading(true);
      
      // Check auth token first
      const hasToken = await checkAuthToken();
      if (!hasToken) {
        Alert.alert('Authentication Error', 'Please log in again to submit registration');
        return;
      }
      
      // Validate and format data
      const cleanedData = validateAndFormatData();
      
      console.log("=== Join Event API Call Debug ===");
      console.log("Original Form Data:", formData);
      console.log("Cleaned Data for API:", cleanedData);
      console.log("Event Object:", event);
      
      const response = await EventService.joinEvent(cleanedData);
      
      console.log("=== Join Event Response Debug ===");
      console.log("Response Success:", response.success);
      console.log("Response Code:", response.code);
      console.log("Response Message:", response.message);
      console.log("Response Data:", response.data);
      console.log("Full Response:", response);
      
      if (response.success) {
        Alert.alert('Success', response.message || 'Event registration submitted successfully!', [
          { text: 'OK', onPress: onClose }
        ]);
      } else {
        Alert.alert('Registration Failed', `${response.message || 'Failed to submit registration'}\n\nError Code: ${response.code || 'Unknown'}`);
      }
    } catch (error) {
      console.error("=== Join Event Error Debug ===");
      console.error("Error:", error);
      console.error("Error Message:", error.message);
      console.error("Error Stack:", error.stack);
      Alert.alert('Network Error', `Failed to submit registration: ${error.message || 'Network connection error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.joinFormContainer}>
      <View style={styles.joinFormContent}>
        {/* Header */}
        <View style={styles.joinFormHeader}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.joinFormTitle}>Join Event</Text>
          <Text style={styles.joinFormSubtitle}>{event?.name}</Text>
        </View>

        {/* Event Info Card */}
        <View style={styles.eventInfoCard}>
          <Image source={getEventImage(0)} style={styles.eventInfoImage} resizeMode="cover" />
          <View style={styles.eventInfoContent}>
            <Text style={styles.eventInfoTitle}>{event?.name}</Text>
            <Text style={styles.eventInfoDetail}>📍 {event?.venue}</Text>
            <Text style={styles.eventInfoDetail}>📅 {event?.startDate}</Text>
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Event Details</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Category</Text>
            {categoriesLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.loadingText}>Loading categories...</Text>
              </View>
            ) : (
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                  style={styles.picker}
                  dropdownIconColor="#fff"
                >
                  <Picker.Item label="Select Category" value="" color="#999" />
                  {categories.map((category) => (
                    <Picker.Item 
                      key={category.id} 
                      label={category.name} 
                      value={category.id} 
                      color="#333"
                    />
                  ))}
                </Picker>
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Class</Text>
            {classesLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.loadingText}>Loading classes...</Text>
              </View>
            ) : (
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.class_id}
                  onValueChange={(value) => setFormData({ ...formData, class_id: value })}
                  style={styles.picker}
                  dropdownIconColor="#fff"
                  enabled={!!formData.category_id}
                >
                  <Picker.Item label="Select Class" value="" color="#999" />
                  {classes.map((classItem) => (
                    <Picker.Item 
                      key={classItem.id} 
                      label={classItem.name} 
                      value={classItem.id} 
                      color="#333"
                    />
                  ))}
                </Picker>
              </View>
            )}
          </View>
        </View>

        {/* Crew Members */}
        <View style={styles.formSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Crew Members</Text>
            <TouchableOpacity style={styles.addButton} onPress={addCrewMember}>
              <Text style={styles.addButtonText}>+ Add Member</Text>
            </TouchableOpacity>
          </View>

          {formData.crew_members.map((member, index) => (
            <View key={index} style={styles.crewMemberCard}>
              <View style={styles.crewMemberHeader}>
                <Text style={styles.crewMemberTitle}>Member {index + 1}</Text>
                {formData.crew_members.length > 1 && (
                  <TouchableOpacity 
                    style={styles.removeButton} 
                    onPress={() => removeCrewMember(index)}
                  >
                    <Text style={styles.removeButtonText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={member.name}
                  onChangeText={(text) => updateCrewMember(index, 'name', text)}
                  placeholder="Enter full name"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mobile Number</Text>
                <TextInput
                  style={styles.input}
                  value={member.mobile}
                  onChangeText={(text) => updateCrewMember(index, 'mobile', text)}
                  keyboardType="phone-pad"
                  placeholder="Enter mobile number"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  value={member.email}
                  onChangeText={(text) => updateCrewMember(index, 'email', text)}
                  keyboardType="email-address"
                  placeholder="Enter email address"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                />
              </View>
            </View>
          ))}
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          <LinearGradient
            colors={loading ? ['#666', '#555'] : ['#36D1DC', '#5B86E5']}
            style={styles.submitButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.submitButtonText}>Submitting...</Text>
              </View>
            ) : (
              <Text style={styles.submitButtonText}>Submit Registration</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const OrganiserScreen = () => {
  const [viewTab, setViewTab] = useState("upcoming");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showJoinEventForm, setShowJoinEventForm] = useState(false);
  const [joiningEvent, setJoiningEvent] = useState(null);

  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [completedEvents, setCompletedEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // API call
  const fetchEvents = useCallback(async () => {
    setApiError("");
    setLoading(true);
    try {
      console.log("🚀 Starting API call to fetch events...");
      
      const res = await EventService.getEvents();
      
      console.log("🎯 API Response received!");
      console.log("Success:", res.success);
      console.log("Data:", res.data);
      
      // Check if we got real API data
      if (res.success === true || res.status === true) {
        let eventsArray = [];
        
        // Try different response structures
        if (res.data?.events) {
          eventsArray = res.data.events;
        } else if (res.data?.data) {
          eventsArray = res.data.data;
        } else if (Array.isArray(res.data)) {
          eventsArray = res.data;
        }
        
        if (eventsArray.length > 0) {
          console.log("✅ REAL API DATA FOUND! Events count:", eventsArray.length);
          const allEvents = eventsArray.map((e) => new EventModel(e));
          setUpcomingEvents(allEvents.filter((ev) => !ev.isCompleted));
          setCompletedEvents(allEvents.filter((ev) => ev.isCompleted));
          return; // Exit early - we have real data
        }
      }
      
      // If we reach here, show mock data
      console.log("❌ NO REAL API DATA - Using mock data");
      const mockEvents = [
        {
          id: 999,
          event_name: "🔄 MOCK: Sample Marathon",
          event_venue: "Mock Venue",
          event_desc: "This is MOCK data - API returned no events",
          event_start_date: "2024-12-01 08:00:00",
          event_end_date: "2024-12-01 12:00:00",
          event_organised_by: "Mock Organizer",
          created_date: "2024-11-01",
          is_deleted: "0"
        }
      ];
      
      const mockEventModels = mockEvents.map(e => new EventModel(e));
      setUpcomingEvents(mockEventModels);
      setCompletedEvents([]);
      setApiError("API returned no data - showing mock events");
      
    } catch (err) {
      console.error("💥 API CALL FAILED!");
      console.error("Error:", err.message);
      
      // Network error - show mock data
      const errorMockEvents = [
        {
          id: 888,
          event_name: "❌ ERROR: API Failed",
          event_venue: "Error Venue",
          event_desc: `API call failed: ${err.message}`,
          event_start_date: "2024-12-01 08:00:00",
          event_end_date: "2024-12-01 12:00:00",
          event_organised_by: "Error Handler",
          created_date: "2024-11-01",
          is_deleted: "0"
        }
      ];
      
      const errorEventModels = errorMockEvents.map(e => new EventModel(e));
      setUpcomingEvents(errorEventModels);
      setCompletedEvents([]);
      setApiError(`Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [fetchEvents])
  );

  const handleJoinEvent = (event) => {
    setJoiningEvent(event);
    setShowJoinEventForm(true);
  };

  const renderEventCard = (event, index) => (
    <TouchableOpacity
      key={event.id}
      style={styles.eventCard}
      onPress={() => setSelectedEvent(event)}
      activeOpacity={0.9}
    >
      <Image 
        source={getEventImage(index)} 
        style={styles.eventImage} 
        resizeMode="cover" 
      />
      
      {/* Status Badge */}
      <View style={[styles.statusBadge, { 
        backgroundColor: event.isCompleted ? 'rgba(76, 175, 80, 0.9)' : 'rgba(255, 152, 0, 0.9)' 
      }]}>
        <Text style={styles.statusText}>
          {event.isCompleted ? '✓ Completed' : '🔥 Upcoming'}
        </Text>
      </View>

      {/* Event Content */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.9)']}
        style={styles.eventOverlay}
      >
        <View style={styles.eventContent}>
          <Text style={styles.eventTitle} numberOfLines={2}>{event.name}</Text>
          
          <View style={styles.eventDetailRow}>
            <View style={styles.detailChip}>
              <Text style={styles.detailIcon}>📍</Text>
              <Text style={styles.detailText} numberOfLines={1}>{event.venue}</Text>
            </View>
          </View>

          <View style={styles.eventDetailRow}>
            <View style={styles.detailChip}>
              <Text style={styles.detailIcon}>📅</Text>
              <Text style={styles.detailText}>{event.startDate}</Text>
            </View>
          </View>

          <View style={styles.eventDetailRow}>
            <View style={styles.detailChip}>
              <Text style={styles.detailIcon}>👤</Text>
              <Text style={styles.detailText} numberOfLines={1}>{event.organisedBy}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity 
              style={styles.joinButton} 
              onPress={(e) => {
                e.stopPropagation();
                handleJoinEvent(event);
              }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#4CAF50', '#45a049']}
                style={styles.joinButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.joinButtonText}>🎯 Join Event</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.viewButton} 
              onPress={() => setSelectedEvent(event)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#feb47b', '#ff7e5f']}
                style={styles.viewButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.viewButtonText}>👁️ View Details</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={["#0f2027", "#203a43", "#2c5364"]} style={styles.gradient}>
      {/* Loader overlay */}
      {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#feb47b" />
          <Text style={styles.loadingText}>Loading Events...</Text>
        </View>
      )}

      {/* Main Content */}
      {showJoinEventForm ? (
        <JoinEventForm 
          event={joiningEvent}
          onClose={() => {
            setShowJoinEventForm(false);
            setJoiningEvent(null);
          }}
        />
      ) : !selectedEvent ? (
        <ScrollView 
          style={styles.container}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={fetchEvents}
              colors={['#feb47b']}
              tintColor="#feb47b"
            />
          }
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.headerTitleContainer}>
              <View style={styles.titleAccent} />
              <Text style={styles.headerTitle}>Event Management</Text>
            </View>
            <Text style={styles.headerSubtitle}>Manage and track your events</Text>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <LinearGradient
                colors={['rgba(255, 152, 0, 0.2)', 'rgba(255, 152, 0, 0.1)']}
                style={styles.statGradient}
              >
                <Text style={styles.statNumber}>{upcomingEvents.length}</Text>
                <Text style={styles.statLabel}>Upcoming</Text>
              </LinearGradient>
            </View>
            <View style={styles.statCard}>
              <LinearGradient
                colors={['rgba(76, 175, 80, 0.2)', 'rgba(76, 175, 80, 0.1)']}
                style={styles.statGradient}
              >
                <Text style={styles.statNumber}>{completedEvents.length}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </LinearGradient>
            </View>
          </View>

          {/* Tab Section */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, viewTab === "upcoming" && styles.activeTab]}
              onPress={() => setViewTab("upcoming")}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={viewTab === "upcoming" ? ['#feb47b', '#ff7e5f'] : ['transparent', 'transparent']}
                style={styles.tabGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={[styles.tabText, viewTab === "upcoming" && styles.activeTabText]}>
                  🔥 Upcoming Events
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, viewTab === "completed" && styles.activeTab]}
              onPress={() => setViewTab("completed")}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={viewTab === "completed" ? ['#feb47b', '#ff7e5f'] : ['transparent', 'transparent']}
                style={styles.tabGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={[styles.tabText, viewTab === "completed" && styles.activeTabText]}>
                  ✓ Completed Events
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Error Message */}
          {!!apiError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{apiError}</Text>
            </View>
          )}

          {/* Event List */}
          <View style={styles.eventsContainer}>
            {viewTab === "upcoming" && (
              <>
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map((event, index) => renderEventCard(event, index))
                ) : (
                  !loading && (
                    <View style={styles.emptyState}>
                      <Text style={styles.emptyIcon}>📅</Text>
                      <Text style={styles.emptyTitle}>No Upcoming Events</Text>
                      <Text style={styles.emptySubtitle}>Check back later for new events</Text>
                    </View>
                  )
                )}
              </>
            )}

            {viewTab === "completed" && (
              <>
                {completedEvents.length > 0 ? (
                  completedEvents.map((event, index) => renderEventCard(event, index))
                ) : (
                  !loading && (
                    <View style={styles.emptyState}>
                      <Text style={styles.emptyIcon}>✅</Text>
                      <Text style={styles.emptyTitle}>No Completed Events</Text>
                      <Text style={styles.emptySubtitle}>Completed events will appear here</Text>
                    </View>
                  )
                )}
              </>
            )}
          </View>
        </ScrollView>
      ) : (
        // Event Details View
        <ScrollView style={styles.detailsScrollView}>
          <View style={styles.detailsContainer}>
            {/* Back Button */}
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => setSelectedEvent(null)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['rgba(254, 180, 123, 0.2)', 'rgba(255, 126, 95, 0.2)']}
                style={styles.backButtonGradient}
              >
                <Text style={styles.backText}>← Back to Events</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Event Image */}
            <View style={styles.detailImageContainer}>
              <Image 
                source={getEventImage(0)} 
                style={styles.detailImage} 
                resizeMode="cover" 
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.detailImageOverlay}
              >
                <View style={[styles.statusBadge, styles.detailStatusBadge, { 
                  backgroundColor: selectedEvent.isCompleted ? 'rgba(76, 175, 80, 0.9)' : 'rgba(255, 152, 0, 0.9)' 
                }]}>
                  <Text style={styles.statusText}>
                    {selectedEvent.isCompleted ? '✓ Completed' : '🔥 Live Event'}
                  </Text>
                </View>
              </LinearGradient>
            </View>

            {/* Event Details */}
            <View style={styles.detailsContent}>
              <Text style={styles.detailTitle}>{selectedEvent.name}</Text>
              
              <View style={styles.detailSection}>
                <View style={styles.detailItem}>
                  <View style={styles.detailIconContainer}>
                    <Text style={styles.detailItemIcon}>🆔</Text>
                  </View>
                  <View style={styles.detailItemContent}>
                    <Text style={styles.detailItemLabel}>Event ID</Text>
                    <Text style={styles.detailItemValue}>{selectedEvent.id}</Text>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <View style={styles.detailIconContainer}>
                    <Text style={styles.detailItemIcon}>📍</Text>
                  </View>
                  <View style={styles.detailItemContent}>
                    <Text style={styles.detailItemLabel}>Venue</Text>
                    <Text style={styles.detailItemValue}>{selectedEvent.venue}</Text>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <View style={styles.detailIconContainer}>
                    <Text style={styles.detailItemIcon}>📝</Text>
                  </View>
                  <View style={styles.detailItemContent}>
                    <Text style={styles.detailItemLabel}>Description</Text>
                    <Text style={styles.detailItemValue}>{selectedEvent.desc || 'No description available'}</Text>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <View style={styles.detailIconContainer}>
                    <Text style={styles.detailItemIcon}>📅</Text>
                  </View>
                  <View style={styles.detailItemContent}>
                    <Text style={styles.detailItemLabel}>Start Date</Text>
                    <Text style={styles.detailItemValue}>{selectedEvent.startDate}</Text>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <View style={styles.detailIconContainer}>
                    <Text style={styles.detailItemIcon}>🏁</Text>
                  </View>
                  <View style={styles.detailItemContent}>
                    <Text style={styles.detailItemLabel}>End Date</Text>
                    <Text style={styles.detailItemValue}>{selectedEvent.endDate}</Text>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <View style={styles.detailIconContainer}>
                    <Text style={styles.detailItemIcon}>👤</Text>
                  </View>
                  <View style={styles.detailItemContent}>
                    <Text style={styles.detailItemLabel}>Organised By</Text>
                    <Text style={styles.detailItemValue}>{selectedEvent.organisedBy}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { 
    flex: 1 
  },
  container: { 
    flex: 1,
    paddingBottom: 20,
  },
  
  // Header Styles
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleAccent: {
    backgroundColor: '#feb47b',
    width: 4,
    height: 28,
    marginRight: 12,
    borderRadius: 2,
  },
  headerTitle: {
    fontSize: isSmallDevice ? 24 : 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: 16,
    fontWeight: '700',
  },

  // Stats Cards
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 15,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statGradient: {
    padding: 20,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '800',
  },

  // Tab Styles
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 10,
  },
  tab: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  tabGradient: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderColor: '#feb47b',
  },
  tabText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '800',
  },

  // Event Card Styles
  eventsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 10,
  },
  eventCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 24,
    marginBottom: 32,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 20,
    elevation: 15,
    borderWidth: 1.5,
    borderColor: 'rgba(254, 180, 123, 0.2)',
    transform: [{ scale: 1 }],
  },
  eventImage: {
    width: '100%',
    height: 220,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  statusBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    zIndex: 3,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 3,
    letterSpacing: 0.3,
  },
  eventOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
    justifyContent: 'flex-end',
  },
  eventContent: {
    padding: 24,
    paddingTop: 20,
    paddingBottom: 28,
  },
  eventTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: {width: 1, height: 2},
    textShadowRadius: 4,
    letterSpacing: 0.5,
    lineHeight: 28,
  },
  eventDetailRow: {
    marginBottom: 10,
  },
  detailChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(254, 180, 123, 0.15)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 25,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(254, 180, 123, 0.3)',
    shadowColor: '#feb47b',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  detailIcon: {
    fontSize: 16,
    marginRight: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  detailText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    maxWidth: width * 0.6,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 0.3,
  },
  
  // Action Buttons
  actionButtonsContainer: {
    flexDirection: 'row',
    marginTop: 24,
    marginBottom: 8,
    gap: 12,
  },
  joinButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#4CAF50',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
  },
  joinButtonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.6,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  viewButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#feb47b',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
  },
  viewButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // Error and Empty States
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.3)',
  },
  errorIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  errorText: {
    color: '#ffcdd2',
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '600',
  },

  // Loader
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 100,
  },
  loadingText: {
    color: '#feb47b',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 12,
    letterSpacing: 0.5,
  },

  // Detail View Styles
  detailsScrollView: {
    flex: 1,
  },
  detailsContainer: {
    flex: 1,
  },
  backButton: {
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  backButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(254, 180, 123, 0.3)',
    borderRadius: 12,
  },
  backText: {
    color: '#feb47b',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  detailImageContainer: {
    height: 250,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  detailImage: {
    width: '100%',
    height: '100%',
  },
  detailImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    padding: 16,
  },
  detailStatusBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  detailsContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  detailTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 5,
    letterSpacing: 0.5,
  },
  detailJoinButton: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  detailJoinButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  detailJoinButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  detailSection: {
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  detailIconContainer: {
    backgroundColor: 'rgba(254, 180, 123, 0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(254, 180, 123, 0.3)',
  },
  detailItemIcon: {
    fontSize: 18,
  },
  detailItemContent: {
    flex: 1,
  },
  detailItemLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  detailItemValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '700',
    lineHeight: 22,
  },

  // Join Event Form Styles
  joinFormContainer: {
    flex: 1,
    backgroundColor: 'rgba(15, 32, 39, 0.95)',
  },
  joinFormContent: {
    padding: 20,
    paddingBottom: 40,
  },
  joinFormHeader: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  joinFormTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  joinFormSubtitle: {
    fontSize: 16,
    color: '#feb47b',
    fontWeight: '600',
    textAlign: 'center',
  },
  eventInfoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  eventInfoImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  eventInfoContent: {
    flex: 1,
    justifyContent: 'center',
  },
  eventInfoTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  eventInfoDetail: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    marginBottom: 4,
  },
  formSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: 'rgba(254, 180, 123, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(254, 180, 123, 0.3)',
  },
  addButtonText: {
    color: '#feb47b',
    fontSize: 12,
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  crewMemberCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  crewMemberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  crewMemberTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#feb47b',
  },
  removeButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.3)',
  },
  removeButtonText: {
    color: '#f44336',
    fontSize: 14,
    fontWeight: '700',
  },
  submitButton: {
    marginTop: 16,
    marginHorizontal: 40,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonGradient: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  pickerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  picker: {
    color: '#fff',
    backgroundColor: 'transparent',
    height: 50,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default OrganiserScreen;
