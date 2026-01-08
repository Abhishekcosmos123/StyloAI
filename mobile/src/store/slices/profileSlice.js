import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {profileService} from '../../services/api/profileService';

export const setupProfile = createAsyncThunk(
  'profile/setup',
  async ({gender, styleGoals, occasions}, {rejectWithValue}) => {
    try {
      const response = await profileService.setupProfile(gender, styleGoals, occasions);
      return response.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Profile setup failed');
    }
  }
);

export const getProfile = createAsyncThunk(
  'profile/get',
  async (_, {rejectWithValue}) => {
    try {
      const response = await profileService.getProfile();
      return response.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get profile');
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    profile: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(setupProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setupProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(setupProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
      });
  },
});

export const {clearError} = profileSlice.actions;
export default profileSlice.reducer;

