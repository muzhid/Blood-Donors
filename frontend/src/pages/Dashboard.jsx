import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { LogOut, Users, Activity, ShieldAlert, Settings, Menu, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { UserTable } from '../components/UserTable'
import { RequestTable } from '../components/RequestTable'
import { CommandTable } from '../components/CommandTable'
import { AdminTable } from '../components/AdminTable' // New Component

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('feed')
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const navigate = useNavigate()

    const [user, setUser] = useState(null)
    const [isResetOpen, setIsResetOpen] = useState(false)
    const [newPass, setNewPass] = useState('')
    const [confirmPass, setConfirmPass] = useState('')
    const [resetError, setResetError] = useState('')
    const [resetSuccess, setResetSuccess] = useState('')

    const handleResetPassword = async () => {
        setResetError('')
        setResetSuccess('')

        if (newPass !== confirmPass) return setResetError('Passwords do not match.')
        if (newPass.length < 4) return setResetError('Minimum 4 characters required.')
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPass)) return setResetError('Must include at least one special character.')

        try {
            const res = await fetch('/api/update_password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: user.phone_number || user.username, new_password: newPass })
            })
            const data = await res.json()
            if (data.status === 'ok') {
                setResetSuccess('Password updated successfully!')
                setTimeout(() => {
                    setIsResetOpen(false)
                    setNewPass('')
                    setConfirmPass('')
                    setResetSuccess('')
                }, 1500)
            } else {
                setResetError(data.message || 'Update failed')
            }
        } catch (e) {
            setResetError('Connection error')
        }
    }

    useEffect(() => {
        const u = localStorage.getItem('admin_user')
        if (u) setUser(JSON.parse(u))
    }, [])

    const handleLogout = async () => {
        localStorage.removeItem('admin_user') // Clear local auth
        // await supabase.auth.signOut() // No longer used
        window.location.href = '/' // Force reload to App
    }



    return (
        <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out
                md:relative md:translate-x-0
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="p-6 text-xl font-bold tracking-tight border-b border-slate-800 flex justify-between items-center">
                    <span>Blood Network</span>
                    <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <button
                        onClick={() => { setActiveTab('feed'); setIsSidebarOpen(false); }}
                        className={`nav-item w-full flex items-center p-3 rounded transition-colors ${activeTab === 'feed' ? 'bg-red-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                    >
                        <Activity className="w-5 h-5 mr-3" /> Live Feed
                    </button>
                    <button
                        onClick={() => { setActiveTab('users'); setIsSidebarOpen(false); }}
                        className={`nav-item w-full flex items-center p-3 rounded transition-colors ${activeTab === 'users' ? 'bg-red-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                    >
                        <Users className="w-5 h-5 mr-3" /> User Management
                    </button>
                    <button
                        onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }}
                        className={`nav-item w-full flex items-center p-3 rounded transition-colors ${activeTab === 'settings' ? 'bg-red-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                    >
                        <Settings className="w-5 h-5 mr-3" /> Settings
                    </button>
                </nav>
                <div className="p-4 border-t border-slate-800">
                    <button onClick={handleLogout} className="flex items-center w-full p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded">
                        <LogOut className="w-5 h-5 mr-3" /> Logout
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col h-full relative overflow-hidden">
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <header className="mb-6 md:mb-8 flex justify-between items-center">
                        <div className="flex items-center">
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="mr-4 md:hidden text-slate-700 hover:text-slate-900"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 truncate">
                                {activeTab === 'feed' ? 'Live Requests' : activeTab === 'users' ? 'User Management' : 'Settings'}
                            </h1>
                        </div>
                        {user && (
                            <div className="flex items-center space-x-4">
                                <span className="text-slate-600 font-medium">Hello, {user.username}</span>
                                <button
                                    onClick={() => setIsResetOpen(true)}
                                    className="text-sm text-red-600 underline hover:text-red-800"
                                >
                                    Reset Password
                                </button>
                            </div>
                        )}
                    </header>

                    {activeTab === 'feed' && (
                        <RequestTable />
                    )}

                    {activeTab === 'users' && (
                        <div className="space-y-8">
                            <UserTable />
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="space-y-8">
                            <CommandTable />
                            <AdminTable />
                        </div>
                    )}
                </main>
            </div>

            {/* Password Reset Modal */}
            {isResetOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                        <h2 className="text-xl font-bold mb-4">Reset Password</h2>
                        <input
                            type="password"
                            placeholder="New Password"
                            className="w-full p-2 border rounded mb-2"
                            value={newPass}
                            onChange={(e) => setNewPass(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            className="w-full p-2 border rounded mb-2"
                            value={confirmPass}
                            onChange={(e) => setConfirmPass(e.target.value)}
                        />
                        <p className="text-xs text-slate-500 mb-4">Min 4 chars, 1 special character.</p>

                        {resetError && <p className="text-red-600 text-sm mb-2">{resetError}</p>}
                        {resetSuccess && <p className="text-green-600 text-sm mb-2">{resetSuccess}</p>}

                        <div className="flex justify-end space-x-2">
                            <button onClick={() => setIsResetOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Cancel</button>
                            <button onClick={handleResetPassword} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Update</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
