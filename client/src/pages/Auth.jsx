import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { login, register, clearError } from '../store/authSlice'

function Auth({ mode }) {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { isAuthenticated, loading, error } = useSelector((state) => state.auth)

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    })
    const [formError, setFormError] = useState('')

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/')
        }
    }, [isAuthenticated, navigate])

    useEffect(() => {
        dispatch(clearError())
        setFormError('')
    }, [mode, dispatch])

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        setFormError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (mode === 'register') {
            if (formData.password !== formData.confirmPassword) {
                setFormError('Passwords do not match')
                return
            }
            if (formData.password.length < 6) {
                setFormError('Password must be at least 6 characters')
                return
            }
            dispatch(register({
                username: formData.username,
                email: formData.email,
                password: formData.password,
            }))
        } else {
            dispatch(login({
                email: formData.email,
                password: formData.password,
            }))
        }
    }

    return (
        <div className="auth-page">
            <motion.div
                className="auth-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className="auth-header">
                    <h1>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h1>
                    <p>
                        {mode === 'login'
                            ? 'Sign in to continue to MovieHub'
                            : 'Join MovieHub to rate and review movies'}
                    </p>
                </div>

                {(error || formError) && (
                    <div className="toast error" style={{ marginBottom: 'var(--spacing-md)' }}>
                        {error || formError}
                    </div>
                )}

                <form className="auth-form" onSubmit={handleSubmit}>
                    {mode === 'register' && (
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Enter your username"
                                required
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    {mode === 'register' && (
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm your password"
                                required
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', padding: 'var(--spacing-md)' }}
                        disabled={loading}
                    >
                        {loading
                            ? 'Please wait...'
                            : mode === 'login' ? 'Sign In' : 'Create Account'}
                    </button>
                </form>

                <div className="auth-footer">
                    {mode === 'login' ? (
                        <>
                            Don't have an account? <Link to="/register">Sign up</Link>
                        </>
                    ) : (
                        <>
                            Already have an account? <Link to="/login">Sign in</Link>
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    )
}

export default Auth
