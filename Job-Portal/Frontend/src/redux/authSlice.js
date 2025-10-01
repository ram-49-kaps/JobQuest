import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: localStorage.getItem('token') || null,
    role: null,
    user: null,
    fullName: null,
    logo: null, // Add logo state to store the logo URL or path
    loading: false,
    isProfileComplete: false,
    firstLogin: true
  },
  reducers: {
    setUser: (state, action) => {
      state.token = action.payload.token;
      state.role = action.payload.role;
      state.user = action.payload.user;
      state.fullName = action.payload.fullName;
      state.logo = action.payload.logo || null;
      state.isProfileComplete = action.payload.isProfileComplete || false;
      state.firstLogin = action.payload.firstLogin || true;
    },
    clearUser: (state) => {
      state.token = null;
      state.role = null;
      state.user = null;
      state.fullName = null;
      state.logo = null;
      state.isProfileComplete = false;
      state.firstLogin = true;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    updateProfileStatus: (state, action) => {
      state.isProfileComplete = action.payload;
      state.firstLogin = false;
    }
  },
});

export const { setUser, clearUser, setLoading, updateProfileStatus } = authSlice.actions;
export default authSlice.reducer;