import React, { useEffect, useState } from 'react';
import { getUsers, adminUpdateUser, adminDeleteUser } from '../../services/userService';
import toast from 'react-hot-toast';

const AdminUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({ 
        firstName: '', 
        lastName: '', 
        address: { street: '', city: '', state: '', zip: '' } 
    });

    const loadUsers = () => {
        setLoading(true);
        getUsers()
            .then(res => {
                setUsers(Array.isArray(res.data) ? res.data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error('Unauthorized access to user list', err);
                toast.error("Failed to load users.");
                setLoading(false);
            });
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const startEdit = (user) => {
        setEditingUser(user.id);
        const addr = user.address || {};
        setEditForm({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            address: {
                street: addr.street || '',
                city: addr.city || '',
                state: addr.state || '',
                zip: addr.zipCode || addr.zip || ''
            }
        });
    };

    const handleUpdate = async (id) => {
        try {
            await adminUpdateUser(id, editForm);
            toast.success("Profile updated.");
            setEditingUser(null);
            loadUsers();
        } catch (err) {
            console.error("Update failure", err);
            toast.error("Failed to process profile update.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
        try {
            await adminDeleteUser(id);
            toast.success("User account deleted.");
            loadUsers();
        } catch (err) {
            console.error("Deletion failure", err);
            toast.error("Error clearing user record.");
        }
    };

    return (
        <div className="space-y-12">
            <header className="divider-soft pb-8 flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                  <h1 className="heading-large tracking-tighter uppercase text-zinc-950">User Directory</h1>
                  <p className="label-mono mt-2">Internal accounts overview | User Registry</p>
                </div>
            </header>

            {loading ? (
                <div className="mono text-[10px] uppercase tracking-widest animate-pulse font-bold text-zinc-950/40 py-12">
                     Loading Users...
                </div>
            ) : (
                <div className="admin-table-container">
                    <div className="max-h-[700px] overflow-y-auto relative">
                        <table className="w-full border-collapse">
                            <thead className="sticky top-0 bg-white z-20 shadow-sm">
                                <tr className="border-b-2 border-zinc-950 text-left bg-white">
                                    <th className="py-4 text-[9px] font-black uppercase tracking-widest text-zinc-950/40 pl-6">Email (ID)</th>
                                    <th className="py-4 text-[9px] font-black uppercase tracking-widest text-zinc-950/40 px-4">FullName</th>
                                    <th className="py-4 text-[9px] font-black uppercase tracking-widest text-zinc-950/40">Registered Location (Address)</th>
                                    <th className="py-4 text-[9px] font-black uppercase tracking-widest text-zinc-950/40">Role</th>
                                    <th className="py-4 text-right text-[9px] font-black uppercase tracking-widest text-zinc-950/40 pr-6">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-soft">
                                {users.map(u => {
                                    const isEditing = editingUser === u.id;
                                    const formattedAddr = u.address ? `${u.address.street}, ${u.address.city}` : '— (unset)';
                                    return (
                                        <tr key={u.id} className="group hover:bg-zinc-50 transition-colors">
                                            <td className="py-6 pl-6 text-xs font-mono tracking-tighter text-zinc-950/40 italic">
                                                {u.email}
                                            </td>
                                            <td className="py-6 px-4">
                                                {isEditing ? (
                                                    <div className="flex gap-2">
                                                        <input 
                                                            type="text" 
                                                            className="text-xs uppercase font-bold tracking-tight bg-zinc-50 border border-zinc-200 px-2 py-1 w-24"
                                                            value={editForm.firstName}
                                                            onChange={e => setEditForm(p => ({...p, firstName: e.target.value}))}
                                                        />
                                                        <input 
                                                            type="text" 
                                                            className="text-xs uppercase font-bold tracking-tight bg-zinc-50 border border-zinc-200 px-2 py-1 w-24"
                                                            value={editForm.lastName}
                                                            onChange={e => setEditForm(p => ({...p, lastName: e.target.value}))}
                                                        />
                                                    </div>
                                                ) : (
                                                    <span className="text-xs font-bold uppercase tracking-tight text-zinc-950">
                                                        {u.firstName} {u.lastName}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-6 text-xs text-zinc-950/60 uppercase font-bold tracking-tight pr-6">
                                                {isEditing ? (
                                                    <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
                                                        <input 
                                                            type="text" 
                                                            className="col-span-2 text-xs uppercase font-bold tracking-tight bg-zinc-50 border border-zinc-200 px-2 py-1"
                                                            placeholder="Street"
                                                            value={editForm.address.street}
                                                            onChange={e => setEditForm(p => ({...p, address: {...p.address, street: e.target.value}}))}
                                                        />
                                                        <input 
                                                            type="text" 
                                                            className="text-xs uppercase font-bold tracking-tight bg-zinc-50 border border-zinc-200 px-2 py-1"
                                                            placeholder="City"
                                                            value={editForm.address.city}
                                                            onChange={e => setEditForm(p => ({...p, address: {...p.address, city: e.target.value}}))}
                                                        />
                                                        <div className="flex gap-1">
                                                            <input 
                                                                type="text" 
                                                                className="text-xs uppercase font-bold tracking-tight bg-zinc-50 border border-zinc-200 px-2 py-1 w-full"
                                                                placeholder="ST"
                                                                value={editForm.address.state}
                                                                onChange={e => setEditForm(p => ({...p, address: {...p.address, state: e.target.value}}))}
                                                            />
                                                            <input 
                                                                type="text" 
                                                                className="text-xs uppercase font-bold tracking-tight bg-zinc-50 border border-zinc-200 px-2 py-1 w-full"
                                                                placeholder="ZIP"
                                                                value={editForm.address.zip}
                                                                onChange={e => setEditForm(p => ({...p, address: {...p.address, zip: e.target.value}}))}
                                                            />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    formattedAddr
                                                )}
                                            </td>
                                            <td className="py-6">
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-zinc-200
                                                    ${u.role === 'ADMIN' ? 'bg-zinc-950 text-white' : 'bg-white text-zinc-950'}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="py-6 text-right pr-6">
                                                <div className="flex justify-end gap-6 items-center">
                                                    {isEditing ? (
                                                        <>
                                                            <button 
                                                                onClick={() => handleUpdate(u.id)}
                                                                className="text-[10px] font-bold uppercase tracking-widest text-green-600 hover:underline underline-offset-4"
                                                            >
                                                                Confirm
                                                            </button>
                                                            <button 
                                                                onClick={() => setEditingUser(null)}
                                                                className="text-[10px] font-bold uppercase tracking-widest text-zinc-950/20 hover:text-zinc-950"
                                                            >
                                                                X
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button 
                                                                onClick={() => startEdit(u)}
                                                                className="text-[10px] font-bold uppercase tracking-widest text-zinc-950/40 hover:text-zinc-950"
                                                            >
                                                                Update
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDelete(u.id)}
                                                                className="text-[10px] font-bold uppercase tracking-widest text-red-400 opacity-0 group-hover:opacity-100 transition-all hover:text-red-600"
                                                            >
                                                                Delete
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsersPage;
