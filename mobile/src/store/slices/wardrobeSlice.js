import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {wardrobeService} from '../../services/api/wardrobeService';

export const uploadWardrobeItem = createAsyncThunk(
  'wardrobe/upload',
  async ({imageUri, category, color, styleTags}, {rejectWithValue}) => {
    try {
      const response = await wardrobeService.uploadItem(imageUri, category, color, styleTags);
      return response.item;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Upload failed');
    }
  }
);

export const getWardrobe = createAsyncThunk(
  'wardrobe/get',
  async (category, {rejectWithValue}) => {
    try {
      const response = await wardrobeService.getWardrobe(category);
      return response.items;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get wardrobe');
    }
  }
);

export const deleteWardrobeItem = createAsyncThunk(
  'wardrobe/delete',
  async (itemId, {rejectWithValue}) => {
    try {
      await wardrobeService.deleteItem(itemId);
      return itemId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Delete failed');
    }
  }
);

const wardrobeSlice = createSlice({
  name: 'wardrobe',
  initialState: {
    items: [],
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
      .addCase(uploadWardrobeItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadWardrobeItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(uploadWardrobeItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getWardrobe.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(getWardrobe.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteWardrobeItem.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
      });
  },
});

export const {clearError} = wardrobeSlice.actions;
export default wardrobeSlice.reducer;

