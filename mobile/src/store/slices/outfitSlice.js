import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {outfitService} from '../../services/api/outfitService';

export const generateOutfit = createAsyncThunk(
  'outfit/generate',
  async ({styleType, occasion, weather}, {rejectWithValue}) => {
    try {
      const response = await outfitService.generateOutfit(styleType, occasion, weather);
      return response.outfit;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Outfit generation failed');
    }
  }
);

export const getOutfitHistory = createAsyncThunk(
  'outfit/history',
  async (savedOnly, {rejectWithValue}) => {
    try {
      const response = await outfitService.getHistory(savedOnly);
      return response.outfits;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get outfit history');
    }
  }
);

export const saveOutfit = createAsyncThunk(
  'outfit/save',
  async (outfitId, {rejectWithValue}) => {
    try {
      const response = await outfitService.saveOutfit(outfitId);
      return response.outfit;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to save outfit');
    }
  }
);

export const deleteOutfit = createAsyncThunk(
  'outfit/delete',
  async (outfitId, {rejectWithValue}) => {
    try {
      await outfitService.deleteOutfit(outfitId);
      return outfitId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete outfit');
    }
  }
);

const outfitSlice = createSlice({
  name: 'outfit',
  initialState: {
    currentOutfit: null,
    history: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentOutfit: (state) => {
      state.currentOutfit = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateOutfit.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateOutfit.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOutfit = action.payload;
        state.history.unshift(action.payload);
      })
      .addCase(generateOutfit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getOutfitHistory.fulfilled, (state, action) => {
        state.history = action.payload;
        state.loading = false;
      })
      .addCase(getOutfitHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(saveOutfit.fulfilled, (state, action) => {
        const index = state.history.findIndex((o) => o._id === action.payload._id);
        if (index !== -1) {
          state.history[index] = action.payload;
        }
        if (state.currentOutfit?._id === action.payload._id) {
          state.currentOutfit = action.payload;
        }
      })
      .addCase(deleteOutfit.fulfilled, (state, action) => {
        state.history = state.history.filter((o) => o._id !== action.payload);
        if (state.currentOutfit?._id === action.payload) {
          state.currentOutfit = null;
        }
      });
  },
});

export const {clearCurrentOutfit, clearError} = outfitSlice.actions;
export default outfitSlice.reducer;

