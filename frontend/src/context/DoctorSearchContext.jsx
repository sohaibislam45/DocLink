import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchDoctors } from '../api/doctors';

const DoctorSearchContext = createContext();

export const useDoctorSearch = () => {
  const context = useContext(DoctorSearchContext);
  if (!context) {
    throw new Error('useDoctorSearch must be used within a DoctorSearchProvider');
  }
  return context;
};

export const DoctorSearchProvider = ({ children }) => {
  const location = useLocation();
  const initialSpecialty = location.state?.specialty || 'All';

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [filters, setFilters] = useState({
    specialty: initialSpecialty,
    rating: 0,
    priceRange: [0, 1000],
    availability: null,
    gender: 'All'
  });

  useEffect(() => {
    if (location.state?.specialty && location.state.specialty !== filters.specialty) {
      setFilters(prev => ({ ...prev, specialty: location.state.specialty }));
    }
  }, [location.state?.specialty]);

  const loadDoctors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Map frontend filters to API params
      const apiFilters = {
        specialty: filters.specialty,
        minRating: filters.rating,
        maxFee: filters.priceRange[1],
        availableToday: filters.availability === 'today',
        availableThisWeek: filters.availability === 'week',
        sortBy: sortBy === 'rating' ? 'rating' : (sortBy === 'price-low' ? 'fee_asc' : (sortBy === 'price-high' ? 'fee_desc' : null))
      };

      const data = await fetchDoctors(apiFilters);
      setDoctors(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy]);

  useEffect(() => {
    loadDoctors();
  }, [loadDoctors]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters({
      specialty: 'All',
      rating: 0,
      priceRange: [0, 1000],
      availability: null,
      gender: 'All'
    });
    setSearchQuery('');
  };

  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        doc.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGender = filters.gender === 'All' || doc.gender === filters.gender;
    
    // Note: Other filters (specialty, rating, price, availability) are handled by the API
    return matchesSearch && matchesGender;
  });

  const value = {
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    filters,
    handleFilterChange,
    handleReset,
    filteredDoctors,
    loading,
    error,
    retry: loadDoctors
  };

  return (
    <DoctorSearchContext.Provider value={value}>
      {children}
    </DoctorSearchContext.Provider>
  );
};
