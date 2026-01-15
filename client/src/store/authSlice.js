import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../services/api'

const initialState = {
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    loading: false,
    error: null,
}

export const checkAuth = createAsyncThunk(
    'auth/checkAuth',
    async (_, { rejectWithValue }) => {
        const token = localStorage.getItem('token')
        if (!token) {
            return rejectWithValue('No token')
        }
        try {
            const response = await api.get('/auth/me')
            return response.data
        } catch (error) {
            localStorage.removeItem('token')
            return rejectWithValue(error.response?.data?.message || 'Auth failed')
        }
    }
)

export const login = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/login', credentials)
            localStorage.setItem('token', response.data.token)
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Login failed')
        }
    }
)

export const register = createAsyncThunk(
    'auth/register',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/register', userData)
            localStorage.setItem('token', response.data.token)
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Registration failed')
        }
    }
)

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            localStorage.removeItem('token')
            state.user = null
            state.token = null
            state.isAuthenticated = false
        },
        clearError: (state) => {
            state.error = null
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(checkAuth.pending, (state) => {
                state.loading = true
            })
            .addCase(checkAuth.fulfilled, (state, action) => {
                state.loading = false
                state.user = action.payload
                state.isAuthenticated = true
            })
            .addCase(checkAuth.rejected, (state) => {
                state.loading = false
                state.isAuthenticated = false
            })
            .addCase(login.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false
                state.user = action.payload.user
                state.token = action.payload.token
                state.isAuthenticated = true
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            .addCase(register.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(register.fulfilled, (state, action) => {
                state.loading = false
                state.user = action.payload.user
                state.token = action.payload.token
                state.isAuthenticated = true
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
    },
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer
