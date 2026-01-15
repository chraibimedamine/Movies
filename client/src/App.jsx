import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { checkAuth } from './store/authSlice'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import MovieDetails from './pages/MovieDetails'
import Search from './pages/Search'
import Auth from './pages/Auth'
import Dashboard from './pages/admin/Dashboard'
import MoviesManager from './pages/admin/MoviesManager'
import ActorsManager from './pages/admin/ActorsManager'
import DirectorsManager from './pages/admin/DirectorsManager'
import GenresManager from './pages/admin/GenresManager'
import UsersManager from './pages/admin/UsersManager'
import ReviewsManager from './pages/admin/ReviewsManager'

function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(checkAuth())
  }, [dispatch])

  return (
    <>
      <Navbar />
      <main className="page">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/search" element={<Search />} />
          <Route path="/login" element={<Auth mode="login" />} />
          <Route path="/register" element={<Auth mode="register" />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/movies" element={<MoviesManager />} />
          <Route path="/admin/actors" element={<ActorsManager />} />
          <Route path="/admin/directors" element={<DirectorsManager />} />
          <Route path="/admin/genres" element={<GenresManager />} />
          <Route path="/admin/users" element={<UsersManager />} />
          <Route path="/admin/reviews" element={<ReviewsManager />} />
        </Routes>
      </main>
    </>
  )
}

export default App
