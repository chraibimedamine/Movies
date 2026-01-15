import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../services/api'

const initialState = {
    movies: [],
    currentMovie: null,
    trending: {
        featured: [],
        highestRated: [],
        mostViewed: [],
        recentReleases: [],
    },
    genres: [],
    loading: false,
    error: null,
    pagination: {
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0,
    },
}

export const fetchMovies = createAsyncThunk(
    'movies/fetchMovies',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await api.get('/movies', { params })
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch movies')
        }
    }
)

export const fetchMovieById = createAsyncThunk(
    'movies/fetchMovieById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.get(`/movies/${id}`)
            // Track view
            api.post(`/trending/view/${id}`).catch(() => { })
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch movie')
        }
    }
)

export const fetchTrending = createAsyncThunk(
    'movies/fetchTrending',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/trending')
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch trending')
        }
    }
)

export const fetchGenres = createAsyncThunk(
    'movies/fetchGenres',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/movies/meta/genres')
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch genres')
        }
    }
)

const moviesSlice = createSlice({
    name: 'movies',
    initialState,
    reducers: {
        clearCurrentMovie: (state) => {
            state.currentMovie = null
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMovies.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchMovies.fulfilled, (state, action) => {
                state.loading = false
                state.movies = action.payload.movies
                state.pagination = action.payload.pagination
            })
            .addCase(fetchMovies.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            .addCase(fetchMovieById.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchMovieById.fulfilled, (state, action) => {
                state.loading = false
                state.currentMovie = action.payload
            })
            .addCase(fetchMovieById.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            .addCase(fetchTrending.pending, (state) => {
                // We typically don't set global loading true if we want to show 'movies' while trending loads in background
                // But since Hero depends on it, maybe we should? 
                // Let's rely on the component checking trending data existence
            })
            .addCase(fetchTrending.fulfilled, (state, action) => {
                state.trending = action.payload
            })
            .addCase(fetchTrending.rejected, (state) => {
                // handle error silently or set error
            })
            .addCase(fetchGenres.fulfilled, (state, action) => {
                state.genres = action.payload
            })
    },
})

export const { clearCurrentMovie } = moviesSlice.actions
export default moviesSlice.reducer
