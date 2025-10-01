import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  searchTerm: '',
  location: '',
  categories: [],
  jobTypes: [],
  experienceLevels: [],
  datePosted: 'all',
  salaryRange: 50,
  tags: [],
};

export const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    updateSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    updateLocation: (state, action) => {
      state.location = action.payload;
    },
    toggleCategory: (state, action) => {
      if (state.categories.includes(action.payload)) {
        state.categories = state.categories.filter(c => c !== action.payload);
      } else {
        state.categories.push(action.payload);
      }
    },
    toggleJobType: (state, action) => {
      if (state.jobTypes.includes(action.payload)) {
        state.jobTypes = state.jobTypes.filter(t => t !== action.payload);
      } else {
        state.jobTypes.push(action.payload);
      }
    },
    toggleExperienceLevel: (state, action) => {
      if (state.experienceLevels.includes(action.payload)) {
        state.experienceLevels = state.experienceLevels.filter(l => l !== action.payload);
      } else {
        state.experienceLevels.push(action.payload);
      }
    },
    setDatePosted: (state, action) => {
      state.datePosted = action.payload;
    },
    updateSalaryRange: (state, action) => {
      state.salaryRange = action.payload;
    },
    toggleTag: (state, action) => {
      if (state.tags.includes(action.payload)) {
        state.tags = state.tags.filter(t => t !== action.payload);
      } else {
        state.tags.push(action.payload);
      }
    },
    resetFilters: (state) => {
      Object.assign(state, initialState);
    },
  },
});

export const { 
  updateSearchTerm, 
  updateLocation, 
  toggleCategory, 
  toggleJobType, 
  toggleExperienceLevel, 
  setDatePosted, 
  updateSalaryRange, 
  toggleTag, 
  resetFilters 
} = filterSlice.actions;

export default filterSlice.reducer;
