import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../store/authSlice'

function Navbar() {
    const [searchQuery, setSearchQuery] = useState('')
    const { isAuthenticated, user } = useSelector((state) => state.auth)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const handleSearch = (e) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
        }
    }

    const handleLogout = () => {
        dispatch(logout())
        navigate('/')
    }

    return (
        <nav className="navbar">
            <div className="container navbar-content">
                <Link to="/" className="navbar-logo">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z" />
                    </svg>
                    <span>MovieHub</span>
                </Link>

                <form className="navbar-search" onSubmit={handleSearch}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search movies, actors, directors..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </form>

                <div className="navbar-nav">
                    <Link to="/" className="navbar-link">Home</Link>
                    <Link to="/search" className="navbar-link">Browse</Link>
                    {user?.role === 'admin' && (
                        <Link to="/admin" className="navbar-link" style={{ color: 'var(--color-accent-primary)' }}>Admin</Link>
                    )}

                    {isAuthenticated ? (
                        <>
                            <span className="navbar-link" style={{ color: 'var(--color-text-muted)' }}>
                                Hi, {user?.username}
                            </span>
                            <button onClick={handleLogout} className="btn btn-ghost">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-ghost">Login</Link>
                            <Link to="/register" className="btn btn-primary">Sign Up</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}

export default Navbar
