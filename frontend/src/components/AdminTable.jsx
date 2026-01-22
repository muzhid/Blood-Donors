import { useEffect, useState } from 'react'

export function AdminTable() {
    const [admins, setAdmins] = useState([])
    const [loading, setLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)
    const [newUsername, setNewUsername] = useState('')
    const [newPhone, setNewPhone] = useState('')
    const [error, setError] = useState('')

    // Reset Password State
    const [resetTarget, setResetTarget] = useState(null)
    const [adminNewPass, setAdminNewPass] = useState('')
    const [adminConfirmPass, setAdminConfirmPass] = useState('')
    const [resetMsg, setResetMsg] = useState('')

    const handleAdminReset = async () => {
        setResetMsg('')
        if (!adminNewPass || adminNewPass !== adminConfirmPass) return setResetMsg("Passwords do not match or empty")
        if (adminNewPass.length < 4) return setResetMsg("Min 4 chars")

        try {
            const res = await fetch('/api/update_password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: resetTarget.phone_number || resetTarget.username, // Use Phone as ID
                    new_password: adminNewPass
                })
            })
            const data = await res.json()
            if (data.status === 'ok') {
                setResetTarget(null)
                setAdminNewPass('')
                setAdminConfirmPass('')
                alert("Password Updated!")
                fetchAdmins()
            } else {
                setResetMsg(data.message || 'Failed')
            }
        } catch (e) {
            setResetMsg('Error')
        }
    }



    const handleDeleteAdmin = async (admin) => {
        if (!window.confirm(`Are you sure you want to delete admin ${admin.username}?`)) return

        try {
            const res = await fetch('/api/delete_admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telegram_id: admin.telegram_id, username: admin.username })
            })
            const data = await res.json()
            if (data.status === 'ok') {
                fetchAdmins()
            } else {
                alert("Delete Failed: " + data.detail)
            }
        } catch (e) {
            alert("Delete Error")
        }
    }

    const handleCreateAdmin = async () => {
        setError('')
        if (!newUsername || !newPhone) return setError("Username and Phone are required")

        try {
            const res = await fetch('/api/create_admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: newUsername, phone_number: newPhone })
            })
            const data = await res.json()
            if (data.status === 'ok') {
                setShowAddModal(false)
                setNewUsername('')
                setNewPhone('')
                fetchAdmins()
            } else {
                setError(data.message || 'Creation failed')
            }
        } catch (e) {
            setError('Connection error')
        }
    }

    useEffect(() => {
        fetchAdmins()
    }, [])

    const fetchAdmins = async () => {
        try {
            const res = await fetch('/api/get_admins')
            const data = await res.json()
            if (Array.isArray(data)) {
                setAdmins(data)
            } else {
                console.error("API Error or Invalid Format:", data)
                setAdmins([])
            }
        } catch (error) {
            console.error("Error fetching admins:", error)
        }
        setLoading(false)
    }

    if (loading) return <div>Loading Admins...</div>

    return (
        <div className="mt-8 bg-white rounded-lg shadow overflow-x-auto">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
                <h3 className="text-lg font-bold text-slate-800">Admin Users</h3>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="w-full md:w-auto bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                >
                    + Add User
                </button>
            </div>
            <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold">
                    <tr>
                        <th className="p-3">Name</th>
                        <th className="p-3">Phone</th>
                        <th className="p-3">Password</th>
                        <th className="p-3">Created At</th>
                        <th className="p-3">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {admins.map((admin, index) => (
                        <tr key={index} className="hover:bg-slate-50">
                            <td className="p-3 font-medium text-slate-800">{admin.username}</td>
                            <td className="p-3">{admin.phone_number || '-'}</td>
                            <td className="p-3 font-mono text-xs bg-slate-100 rounded px-2 py-1 select-all">••••••••</td>
                            <td className="p-3">{new Date(admin.created_at).toLocaleDateString()}</td>
                            <td className="p-3">
                                <button
                                    onClick={() => setResetTarget(admin)}
                                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                                >
                                    Reset Password
                                </button>
                                <button
                                    onClick={() => handleDeleteAdmin(admin)}
                                    className="text-xs text-red-600 hover:text-red-800 underline ml-3"
                                >
                                    Delete
                                </button>

                            </td>
                        </tr>
                    ))}
                    {admins.length === 0 && (
                        <tr>
                            <td colSpan="4" className="p-4 text-center text-slate-400">No admins found.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {
                showAddModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                            <h2 className="text-xl font-bold mb-4">Add New Admin</h2>

                            <input
                                className="w-full p-2 border rounded mb-2"
                                placeholder="Username"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                            />
                            <input
                                className="w-full p-2 border rounded mb-2"
                                placeholder="Phone Number"
                                value={newPhone}
                                onChange={(e) => setNewPhone(e.target.value)}
                            />
                            <p className="text-xs text-slate-500 mb-4">Default Password: <b>Password1</b></p>

                            {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

                            <div className="flex justify-end space-x-2">
                                <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Cancel</button>
                                <button onClick={handleCreateAdmin} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Create</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                resetTarget && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                            <h2 className="text-xl font-bold mb-4">Reset Password for {resetTarget.username}</h2>
                            <input
                                type="password"
                                className="w-full p-2 border rounded mb-2"
                                placeholder="New Password"
                                value={adminNewPass}
                                onChange={(e) => setAdminNewPass(e.target.value)}
                            />
                            <input
                                type="password"
                                className="w-full p-2 border rounded mb-2"
                                placeholder="Confirm Password"
                                value={adminConfirmPass}
                                onChange={(e) => setAdminConfirmPass(e.target.value)}
                            />
                            {resetMsg && <p className="text-red-600 text-sm mb-2">{resetMsg}</p>}
                            <div className="flex justify-end space-x-2">
                                <button onClick={() => setResetTarget(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Cancel</button>
                                <button onClick={handleAdminReset} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Update</button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    )
}
