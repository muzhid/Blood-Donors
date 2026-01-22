import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function Login() {
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        const username = e.target.phone.value // Send phone as username
        const password = e.target.password.value

        try {
            const res = await fetch('/api/admin_login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            })
            const data = await res.json()

            if (data.status === 'ok') {
                console.log("Login Successful", data.user)
                localStorage.setItem('admin_user', JSON.stringify(data.user))
                // Force reload or event to update App state (since App check localStorage)
                // A better way is using Context, but for quick fix:
                window.location.href = '/dashboard'
            } else {
                alert("Login Failed: " + data.message)
            }
        } catch (err) {
            console.error("Login Error:", err)
            alert("Login System Error")
        }
        setLoading(false)
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100">
            <form onSubmit={handleLogin} className="p-8 bg-white rounded-lg shadow-md w-96 font-sans">
                <h1 className="mb-6 text-2xl font-bold text-center text-slate-800">Naifaru Blood Donors Portal</h1>
                <div className="mb-4">
                    <label className="block mb-2 text-sm font-bold text-slate-700">Phone Number</label>
                    <input
                        type="text"
                        name="phone" // Keep name but treat as username
                        // Value handling removed to use form submit directly if simplest
                        // But previous code used 'email' state.
                        onChange={e => setEmail(e.target.value)}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                        required
                    />
                </div>
                <div className="mb-6">
                    <label className="block mb-2 text-sm font-bold text-slate-700">Password</label>
                    <input
                        name="password"
                        type="password"
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                        required
                    />
                </div>
                <button
                    disabled={loading}
                    className="w-full p-2 font-bold text-white transition-colors bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
                >
                    {loading ? 'Signing In...' : 'Sign In'}
                </button>
            </form>
        </div>
    )
}
