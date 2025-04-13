import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks for CRUD operations
export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async (_, { rejectWithValue }) => {
  try {
    const response = await fetch('/api/tasks');
    if (!response.ok) {
      const error = await response.json();
      return rejectWithValue(error.error || 'Failed to fetch tasks');
    }
    return await response.json();
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const addTask = createAsyncThunk('tasks/addTask', async (taskData, { rejectWithValue }) => {
  try {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });
    if (!response.ok) {
      const error = await response.json();
      return rejectWithValue(error.error || 'Failed to add task');
    }
    return await response.json();
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const updateTask = createAsyncThunk('tasks/updateTask', async (taskData, { rejectWithValue }) => {
  try {
    const response = await fetch(`/api/tasks/${taskData._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });
    if (!response.ok) {
      const error = await response.json();
      return rejectWithValue(error.error || 'Failed to update task');
    }
    return await response.json();
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const deleteTask = createAsyncThunk('tasks/deleteTask', async (taskId, { rejectWithValue }) => {
  try {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      const error = await response.json();
      return rejectWithValue(error.error || 'Failed to delete task');
    }
    return taskId;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    items: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch tasks cases
      .addCase(fetchTasks.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      // Add task cases
      .addCase(addTask.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(addTask.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      })
      // Update task cases
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.items.findIndex(task => task._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      })
      // Delete task cases
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.items = state.items.filter(task => task._id !== action.payload);
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      });
  }
});

export default taskSlice.reducer;
