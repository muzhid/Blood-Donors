import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { X, Trash2, Ban, CheckCircle, Save } from 'lucide-react'

export function EditUserModal({ user, onClose, onUpdate }) {
    const [formData, setFormData] = useState({
        full_name: '',
        phone_number: '',
        blood_type: '',
        sex: '',
        address: '',
        id_card_number: '',
        role: 'user',
        status: 'active'
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name || '',
                phone_number: user.phone_number || '',
                blood_type: user.blood_type || '',
                sex: user.sex || '',
                address: user.address || '',
                id_card_number: user.id_card_number || '',
                role: user.role || 'user',
                status: user.status || 'active'
            })
        }
    }, [user])

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSave = async () => {
        setLoading(true)
        setError(null)
        try {
            // Determine Endpoint
            const isCreate = !user || !user.telegram_id
            const endpoint = isCreate ? '/api/create_user' : '/api/update_user'

            const payload = { ...formData }
            if (!isCreate) payload.telegram_id = user.telegram_id

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            const result = await res.json()
            if (result.status !== 'ok') throw new Error(result.detail || 'Operation failed')

            onUpdate()
            onClose()
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleToggleBlock = async () => {
        if (!window.confirm(`Are you sure you want to ${formData.status === 'banned' ? 'unban' : 'ban'} this user?`)) return

        setLoading(true)
        const newStatus = formData.status === 'banned' ? 'active' : 'banned'
        try {
            const { error } = await supabase
                .from('users')
                .update({ status: newStatus })
                .eq('telegram_id', user.telegram_id)

            if (error) throw error
            onUpdate() // Refresh list
            onClose()  // Close or keep open? standard is close (or update local state)
        } catch (err) {
            setError(err.message)
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!window.confirm("Are you sure? This will delete the user AND all their requests. This action cannot be undone.")) return

        setLoading(true)
        try {
            // 1. Delete all requests by this user (FK constraint fix)
            const { error: reqError } = await supabase
                .from('requests')
                .delete()
                .eq('requester_id', user.telegram_id)

            if (reqError) throw reqError

            // 2. Delete the user
            const { error } = await supabase
                .from('users')
                .delete()
                .eq('telegram_id', user.telegram_id)

            if (error) throw error
            onUpdate()
            onClose()
        } catch (err) {
            console.error(err)
            setError(err.message)
            setLoading(false)
        }
    }

    const handleDeactivate = async () => {
        const isPending = formData.status === 'pending'
        if (!window.confirm(isPending ? "Activate this user?" : "Mark this user as 'deactive' (pending)? They won't appear in donor lists.")) return
        setLoading(true)
        try {
            // Use Backend API
            const res = await fetch('/api/update_user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    telegram_id: user.telegram_id,
                    status: isPending ? 'active' : 'pending'
                })
            })
            const result = await res.json()
            if (result.status !== 'ok') throw new Error(result.detail || 'Deactivation failed')

            onUpdate()
            onClose()
        } catch (err) {
            setError(err.message)
            setLoading(false)
        }
    }

    // if (!user) return null // Allow null user for Create Mode? 
    // Actually UserTable passes a user object. If create, it should pass {} or we handle null.
    // Let's assume parent passes null for create.

    // Valid props check
    // if (!user && !isCreateMode) return null 
    // But we rely on `user` prop to be truthy to open modal usually.
    // We should change check to `onClose` logic. Open state is controlled by parent rendering this component.
    // If parent renders <EditUserModal user={null} />, we should show "Add User".

    const isCreate = !user || !user.telegram_id

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-800 bg-gray-900/50 sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-bold text-white">{isCreate ? 'Add New User' : 'Edit User'}</h2>
                        {!isCreate && (
                            <a
                                href={`https://web.telegram.org/a/#${user.telegram_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-1"
                            >
                                ID: {user.telegram_id}
                                <span className="text-xs">↗</span>
                            </a>
                        )}
                    </div>

                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-900/50 border border-red-500/50 text-red-200 p-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                            <input
                                type="text"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-2.5 focus:ring-red-500 focus:border-red-500 outline-none"
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Phone Number</label>
                            <input
                                type="text"
                                name="phone_number"
                                value={formData.phone_number}
                                onChange={handleChange}
                                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-2.5 focus:ring-red-500 focus:border-red-500 outline-none"
                            />
                        </div>

                        {/* Blood Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Blood Type</label>
                            <select
                                name="blood_type"
                                value={formData.blood_type}
                                onChange={handleChange}
                                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-2.5 focus:ring-red-500 focus:border-red-500 outline-none"
                            >
                                <option value="">Select...</option>
                                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>

                        {/* Sex */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Sex</label>
                            <select
                                name="sex"
                                value={formData.sex}
                                onChange={handleChange}
                                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-2.5 focus:ring-red-500 focus:border-red-500 outline-none"
                            >
                                <option value="">Select...</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>

                        {/* ID Card */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">ID Card Number</label>
                            <input
                                type="text"
                                name="id_card_number"
                                value={formData.id_card_number}
                                onChange={handleChange}
                                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-2.5 focus:ring-red-500 focus:border-red-500 outline-none"
                            />
                        </div>

                        {/* Role */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-2.5 focus:ring-red-500 focus:border-red-500 outline-none"
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        {/* Address */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-400 mb-1">Address/Island</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-2.5 focus:ring-red-500 focus:border-red-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-6 border-t border-gray-800 flex flex-wrap gap-4 justify-between items-center">
                        <div className="flex gap-2">
                            <button
                                onClick={handleToggleBlock}
                                disabled={loading}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${formData.status === 'banned'
                                    ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50 border border-green-800'
                                    : 'bg-orange-900/30 text-orange-400 hover:bg-orange-900/50 border border-orange-800'
                                    }`}
                            >
                                {formData.status === 'banned' ? <CheckCircle size={16} /> : <Ban size={16} />}
                                {formData.status === 'banned' ? 'Unban User' : 'Block User'}
                            </button>

                            <button
                                onClick={handleDeactivate}
                                disabled={loading}
                                className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${formData.status === 'pending'
                                    ? 'bg-green-900/20 text-green-400 hover:bg-green-900/40 border-green-900'
                                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600'
                                    }`}
                            >
                                {formData.status === 'pending' ? <CheckCircle size={16} /> : <Ban size={16} className="rotate-90" />}
                                {formData.status === 'pending' ? 'Activate User' : 'Deactivate'}
                            </button>

                            <button
                                onClick={handleDelete}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 bg-red-900/20 text-red-500 hover:bg-red-900/40 border border-red-900 rounded-lg text-sm font-medium transition-colors"
                            >
                                <Trash2 size={16} />
                                Delete User
                            </button>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={onClose}
                                className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-red-900/20 transition-all"
                            >
                                <Save size={16} />
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
