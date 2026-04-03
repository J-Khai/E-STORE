import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile, addPaymentMethod } from '../services/userService';
import toast from 'react-hot-toast';

const ProfilePage = () => {
    const { logout, user: authUser } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isAddingCard, setIsAddingCard] = useState(false);
    const [loading, setLoading] = useState(true);
    const [editData, setEditData] = useState({});
    
    const [newCard, setNewCard] = useState({
        cardType: 'Visa',
        cardNumber: '',
        cvv: '',
        expiryDate: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const res = await getProfile();
                setProfile(res.data);
                // setup edit fields
                setEditData({
                    ...res.data,
                    address: res.data.address || { street: '', city: '', state: '', zip: '' }
                });
                setLoading(false);
            } catch (err) {
                console.error("Profile retrieval failed", err);
                toast.error("Could not load your profile.");
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('address.')) {
            const field = name.split('.')[1];
            setEditData(prev => ({
                ...prev,
                address: {
                    ...prev.address,
                    [field]: value
                }
            }));
        } else {
            setEditData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSaveProfile = async () => {
        try {
            const res = await updateProfile(editData);
            setProfile(res.data);
            setIsEditing(false);
            toast.success("Profile updated successfully.");
        } catch (err) {
            console.error("Update failed", err);
            toast.error("Failed to update profile details.");
        }
    };

    const handleAddCard = async (e) => {
        e.preventDefault();
        try {
            const lastFour = newCard.cardNumber.slice(-4);
            const res = await addPaymentMethod({
                cardType: newCard.cardType,
                lastFourDigits: lastFour,
                expiryDate: newCard.expiryDate
            });
            setProfile(res.data);
            setIsAddingCard(false);
            setNewCard({ cardType: 'Visa', cardNumber: '', cvv: '', expiryDate: '' });
            toast.success("Payment method added.");
        } catch (err) {
            console.error("Card addition failed", err);
            toast.error("Could not add payment method.");
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh] mono text-[10px] uppercase tracking-widest animate-pulse">
            Loading Account...
        </div>
    );

    if (!profile) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-12 text-center">
            <h2 className="text-2xl font-bold uppercase mb-4">Session Expired</h2>
            <p className="label-mono mb-12 opacity-40">Your session may have expired. Please log in again to access your profile.</p>
            <button 
                onClick={() => {
                    logout();
                    navigate('/login');
                }} 
                className="btn-primary px-12"
            >
                Log In
            </button>
        </div>
    );

    const hasAddress = profile.address && profile.address.street;

    return (
        <div className="page-container py-20 lg:py-32">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12 mb-20">
                <header>
                    <h1 className="text-4xl lg:text-5xl font-bold tracking-tighter uppercase text-zinc-950 mb-4">
                        Account Dashboard
                    </h1>
                    <p className="label-mono uppercase opacity-40">Your Account Overview</p>
                </header>
                <div className="flex gap-4">
                    <button 
                        onClick={() => {
                            logout();
                            navigate('/login');
                        }} 
                        className="btn-primary bg-zinc-400 border-zinc-400 px-12 py-4"
                    >
                        Sign Out
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* user info */}
                <div className="card-white">
                    <div className="flex justify-between items-baseline mb-12">
                        <h2 className="label-mono text-zinc-950/30 uppercase">Personal Information</h2>
                        {!isEditing ? (
                            <button onClick={() => setIsEditing(true)} className="label-mono text-[10px] uppercase font-bold text-zinc-950 underline underline-offset-4">Edit</button>
                        ) : (
                            <div className="flex gap-4">
                                <button onClick={handleSaveProfile} className="label-mono text-[10px] uppercase font-bold text-green-600 underline underline-offset-4">Save</button>
                                <button onClick={() => setIsEditing(false)} className="label-mono text-[10px] uppercase font-bold text-zinc-400 underline underline-offset-4">Cancel</button>
                            </div>
                        )}
                    </div>
                    <div className="space-y-8">
                        <div className="group">
                            <label className="label-mono text-[9px] block mb-3 uppercase tracking-widest">First Name</label>
                            {isEditing ? (
                                <input
                                    name="firstName"
                                    value={editData.firstName}
                                    onChange={handleChange}
                                    className="input-field w-full"
                                />
                            ) : (
                                <p className="text-base font-bold text-zinc-950 tracking-tight uppercase">{profile.firstName || 'N/A'}</p>
                            )}
                        </div>
                        <div className="group">
                            <label className="label-mono text-[9px] block mb-3 uppercase tracking-widest">Last Name</label>
                            {isEditing ? (
                                <input
                                    name="lastName"
                                    value={editData.lastName}
                                    onChange={handleChange}
                                    className="input-field w-full"
                                />
                            ) : (
                                <p className="text-base font-bold text-zinc-950 tracking-tight uppercase">{profile.lastName || 'N/A'}</p>
                            )}
                        </div>
                        <div className="group">
                            <label className="label-mono text-[9px] block mb-3 uppercase tracking-widest">Email (read-only)</label>
                            <p className="text-base font-bold text-zinc-950/50 tracking-tight uppercase">{profile.email}</p>
                        </div>
                    </div>
                </div>

                {/* shipping address info */}
                <div className="card-white">
                    <div className="flex justify-between items-baseline mb-12">
                        <h2 className="label-mono text-zinc-950/30 uppercase">Shipping Address</h2>
                        {hasAddress && !isEditing && (
                             <button onClick={() => setIsEditing(true)} className="label-mono text-[10px] uppercase font-bold text-zinc-950 underline underline-offset-4">Edit Address</button>
                        )}
                    </div>

                    {!hasAddress && !isEditing ? (
                        <div className="placeholder-card">
                            <p className="label-mono text-[10px] uppercase opacity-40 mb-6">No shipping address found</p>
                            <button onClick={() => setIsEditing(true)} className="btn-primary py-3 px-8 text-[10px]">Setup Shipping Address</button>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <div className="group">
                                <label className="label-mono text-[9px] block mb-3 uppercase tracking-widest">Street Address</label>
                                {isEditing ? (
                                    <input
                                        name="address.street"
                                        value={editData.address?.street || ''}
                                        onChange={handleChange}
                                        className="input-field w-full"
                                    />
                                ) : (
                                    <p className="text-base font-bold text-zinc-950 tracking-tight uppercase">{profile.address?.street}</p>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="group">
                                    <label className="label-mono text-[9px] block mb-3 uppercase tracking-widest">City</label>
                                    {isEditing ? (
                                        <input
                                            name="address.city"
                                            value={editData.address?.city || ''}
                                            onChange={handleChange}
                                            className="input-field w-full"
                                        />
                                    ) : (
                                        <p className="text-base font-bold text-zinc-950 tracking-tight uppercase">{profile.address?.city}</p>
                                    )}
                                </div>
                                <div className="group">
                                    <label className="label-mono text-[9px] block mb-3 uppercase tracking-widest">Province / State</label>
                                    {isEditing ? (
                                        <input
                                            name="address.state"
                                            value={editData.address?.state || ''}
                                            onChange={handleChange}
                                            className="input-field w-full"
                                        />
                                    ) : (
                                        <p className="text-base font-bold text-zinc-950 tracking-tight uppercase">{profile.address?.state}</p>
                                    )}
                                </div>
                                <div className="group md:col-span-2">
                                    <label className="label-mono text-[9px] block mb-3 uppercase tracking-widest">Zip / Postal Code</label>
                                    {isEditing ? (
                                        <input
                                            name="address.zip"
                                            value={editData.address?.zip || ''}
                                            onChange={handleChange}
                                            className="input-field w-full"
                                        />
                                    ) : (
                                        <p className="text-base font-bold text-zinc-950 tracking-tight uppercase">{profile.address?.zip}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* credit cards */}
                <div className="lg:col-span-2 card-dark">
                    <div className="flex justify-between items-center mb-12">
                        <header>
                            <h2 className="label-mono opacity-40 uppercase mb-2">Saved Cards</h2>
                            <p className="text-[11px] font-bold tracking-tighter uppercase">{profile.paymentMethods?.length || 0} card(s) on file</p>
                        </header>
                        {!isAddingCard && (
                            <button 
                                onClick={() => setIsAddingCard(true)}
                                className="text-[10px] font-bold uppercase tracking-widest bg-white text-zinc-950 px-8 py-3 hover:bg-zinc-200 transition-all"
                            >
                                + Add Card
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {profile.paymentMethods?.map((pm, idx) => (
                            <div key={idx} className="border border-white/10 p-8 flex flex-col gap-4 relative group">
                                <div className="flex justify-between items-start">
                                    <span className="label-mono text-[9px] uppercase opacity-40">{pm.cardType}</span>
                                    <div className="w-10 h-6 bg-white/5 rounded border border-white/10"></div>
                                </div>
                                <div className="flex gap-2 text-lg font-bold tracking-widest mt-4">
                                    <span className="opacity-20 text-sm">•••• •••• ••••</span>
                                    <span>{pm.lastFourDigits}</span>
                                </div>
                                <div className="flex justify-between items-end mt-4">
                                     <div className="flex flex-col">
                                         <span className="label-mono text-[8px] uppercase opacity-40">Expires</span>
                                         <span className="text-[10px] font-bold mono">{pm.expiryDate}</span>
                                     </div>
                                     <button className="text-[9px] uppercase font-bold opacity-0 group-hover:opacity-40 hover:opacity-100 transition-all text-red-500">Delete</button>
                                </div>
                            </div>
                        ))}

                        {isAddingCard && (
                            <form onSubmit={handleAddCard} className="col-span-1 lg:col-span-2 border-2 border-white/20 p-8 animate-in fade-in zoom-in-95 duration-300">
                                <h3 className="label-mono text-[10px] uppercase mb-8">Add a new card</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="group">
                                        <label className="label-mono text-[9px] block mb-3 uppercase tracking-widest opacity-40">Card Type</label>
                                        <select 
                                            value={newCard.cardType}
                                            onChange={(e) => setNewCard({...newCard, cardType: e.target.value})}
                                            className="w-full bg-zinc-900 border border-white/10 p-3 text-[11px] font-bold uppercase outline-none focus:border-white/40 transition-all"
                                        >
                                            <option value="Visa">Visa</option>
                                            <option value="Mastercard">Mastercard</option>
                                            <option value="AMEX">AMEX</option>
                                            <option value="Discover">Discover</option>
                                        </select>
                                    </div>
                                    <div className="group">
                                        <label className="label-mono text-[9px] block mb-3 uppercase tracking-widest opacity-40">Card Number</label>
                                        <input 
                                            required
                                            maxLength="16"
                                            value={newCard.cardNumber}
                                            onChange={(e) => setNewCard({...newCard, cardNumber: e.target.value})}
                                            placeholder="XXXX XXXX XXXX XXXX"
                                            className="w-full bg-zinc-900 border border-white/10 p-3 text-[11px] font-bold uppercase outline-none focus:border-white/40 transition-all"
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="label-mono text-[9px] block mb-3 uppercase tracking-widest opacity-40">Expiry Date</label>
                                        <input 
                                            required
                                            placeholder="MM/YY"
                                            maxLength="5"
                                            value={newCard.expiryDate}
                                            onChange={(e) => setNewCard({...newCard, expiryDate: e.target.value})}
                                            className="w-full bg-zinc-900 border border-white/10 p-3 text-[11px] font-bold uppercase outline-none focus:border-white/40 transition-all"
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="label-mono text-[9px] block mb-3 uppercase tracking-widest opacity-40">Security Code (CVV)</label>
                                        <input 
                                            required
                                            type="password"
                                            placeholder="XXX"
                                            maxLength="3"
                                            value={newCard.cvv}
                                            onChange={(e) => setNewCard({...newCard, cvv: e.target.value})}
                                            className="w-full bg-zinc-900 border border-white/10 p-3 text-[11px] font-bold uppercase outline-none focus:border-white/40 transition-all"
                                        />
                                    </div>
                                    <div className="flex gap-4 items-end md:col-span-2 pt-4">
                                        <button type="submit" className="flex-1 bg-white text-zinc-950 py-3 text-[10px] font-bold uppercase hover:bg-zinc-200 transition-all">Add Card</button>
                                        <button type="button" onClick={() => setIsAddingCard(false)} className="flex-1 border border-white/10 py-3 text-[10px] font-bold uppercase hover:bg-white/5 transition-all">Cancel</button>
                                    </div>
                                </div>
                            </form>
                        )}

                        {(!profile.paymentMethods || profile.paymentMethods.length === 0) && !isAddingCard && (
                            <div className="col-span-full py-12 border border-dashed border-white/10 flex flex-col items-center justify-center text-center opacity-30">
                                <span className="label-mono text-[9px] uppercase mb-4">No saved cards</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* link to orders */}
            <div className="mt-32 p-12 bg-zinc-50 border-main flex justify-between items-center group cursor-pointer hover:bg-zinc-100 transition-all" onClick={() => navigate('/profile/history')}>
                <div className="flex items-center gap-8">
                    <div className="w-12 h-12 bg-zinc-950 text-white flex items-center justify-center font-bold tracking-tighter">ORD</div>
                    <header>
                        <span className="label-mono text-[10px] tracking-widest uppercase opacity-40">Recent Activity</span>
                        <h3 className="text-lg font-bold uppercase tracking-tight">View Order History</h3>
                    </header>
                </div>
                <button
                    className="text-[10px] font-bold uppercase tracking-tighter hover:underline decoration-zinc-950 underline-offset-8 transition-all"
                >
                    View History &rarr;
                </button>
            </div>
        </div>
    );
};

export default ProfilePage;
