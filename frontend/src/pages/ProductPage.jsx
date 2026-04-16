import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductById } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import Skeleton from '../components/common/Skeleton';

const ProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { cartItems, addToCart, updateQuantity } = useCart();
    const { user } = useAuth();
    const [product, setProduct] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const [isAdvancedEditOpen, setIsAdvancedEditOpen] = useState(false);
    const [advancedEditForm, setAdvancedEditForm] = useState(null);
    const [advancedImageMode, setAdvancedImageMode] = useState('URL');
    const [advancedImageFile, setAdvancedImageFile] = useState(null);

    const openAdvancedEdit = () => {
        setAdvancedEditForm({
            name: product.name || '',
            description: product.description || '',
            brand: product.brand || '',
            categoryId: product.categoryId || (product.category?.id) || '',
            price: product.price || 0,
            stock: product.stock || 0,
            imageUrl: product.imageUrl || '',
            isFeatured: product.isFeatured || false
        });
        setAdvancedImageMode('URL');
        setAdvancedImageFile(null);
        setIsAdvancedEditOpen(true);
    };

    const handleAdvancedSave = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put(`/admin/products/${product.id}`, {
                ...advancedEditForm,
                price: parseFloat(advancedEditForm.price),
                stock: parseInt(advancedEditForm.stock),
                imageUrl: advancedImageMode === 'URL' ? advancedEditForm.imageUrl : product.imageUrl
            });

            let updatedProduct = res.data;

            if (advancedImageMode === 'UPLOAD' && advancedImageFile) {
                const formData = new FormData();
                formData.append('file', advancedImageFile);
                const imageRes = await axios.patch(`/admin/products/${product.id}/image`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                updatedProduct = imageRes.data;
            }

            setProduct(updatedProduct);
            setIsAdvancedEditOpen(false);
            toast.success("Product Updated.");
        } catch (err) {
            console.error(err);
            toast.error("Failed to update product.");
        }
    };

    // find this product in the cart
    const cartItem = cartItems.find(item => (item.productId === parseInt(id)) || (item.id === parseInt(id) && !item.productId));
    const quantityInCart = cartItem ? cartItem.quantity : 0;

    useEffect(() => {
        setLoading(true);
        getProductById(id)
            .then(res => {
                setProduct(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error('oops product fetching failed', err);
                setError(true);
                setLoading(false);
            });

        axios.get('/categories')
            .then(res => setCategories(res.data))
            .catch(err => console.error('categories load fail', err));
    }, [id]);

    if (loading) return (
        <div className="page-container py-20 lg:py-32">
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
                {/* ghostly image preview */}
                <div className="flex-1 min-h-[500px]">
                    <Skeleton height="100%" width="100%" />
                </div>

                {/* ghostly product details */}
                <div className="flex-1 flex flex-col justify-start space-y-8">
                    <div className="space-y-4">
                        <Skeleton height="20px" width="150px" />
                        <Skeleton height="60px" width="100%" />
                        <Skeleton height="20px" width="200px" />
                    </div>
                    <div className="w-20 h-1 bg-zinc-100"></div>
                    <div className="flex items-center gap-6">
                        <Skeleton height="40px" width="100px" />
                        <Skeleton height="40px" width="120px" />
                    </div>
                    <div className="space-y-4 pt-8">
                        <Skeleton height="15px" width="100%" />
                        <Skeleton height="15px" width="90%" />
                        <Skeleton height="15px" width="95%" />
                    </div>
                    <div className="pt-12">
                        <Skeleton height="60px" width="100%" />
                    </div>
                </div>
            </div>
        </div>
    );

    if (error || !product) return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] px-12 text-center">
            <h1 className="heading-large mb-4">Product Not Found</h1>
            <p className="label-mono mb-8">The requested item doesn't exist in our current collection.</p>
            <Link to="/products" className="btn-primary">Return to Catalog</Link>
        </div>
    );

    // update stock based on what's in cart
    const effectiveStock = Math.max(0, product.stock - quantityInCart);

    // check stock status
    const getStockStatus = () => {
        if (product.stock === 0 || effectiveStock === 0) return { label: 'Out of Stock / Max in Cart', color: 'text-red-500 border-red-200 bg-red-50' };
        if (effectiveStock <= 10) return { label: `Only ${effectiveStock} remaining!`, color: 'text-orange-500 border-orange-200 bg-orange-50' };
        return { label: 'In Stock', color: 'text-green-600 border-green-200 bg-green-50' };
    };

    const status = getStockStatus();

    // get the best image
    const displayImage = product.imageUrl || 'https://via.placeholder.com/600x800';

    return (
        <div className="page-container py-20 lg:py-32">
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
                {/* image preview */}
                <div className="flex-1 border-main bg-white group hover:border-zinc-950 transition-colors relative flex items-center justify-center">
                    <div className="w-full h-full max-h-[500px] flex items-center justify-center overflow-hidden">
                        <img
                            src={displayImage}
                            alt={product.name}
                            className="max-h-[500px] w-full object-contain group-hover:scale-105 transition-transform duration-[2000ms]"
                        />
                    </div>
                </div>

                {/* product details */}
                <div className="flex-1 flex flex-col justify-start">
                    <header className="mb-12">
                        <nav className="mb-8">
                            <Link to="/products" className="label-mono hover:text-zinc-950 transition-colors">Catalog</Link>
                            <span className="mx-4 text-zinc-950/20">/</span>
                            <span className="label-mono text-zinc-950">{product.categoryName}</span>
                        </nav>

                        <h1 className="text-4xl lg:text-5xl font-bold tracking-tighter uppercase text-zinc-950 mb-6 leading-none">
                            {product.name}
                        </h1>

                        {product.brand && (
                            <p className="label-mono uppercase mb-8 text-zinc-950/40">Manufactured by: {product.brand}</p>
                        )}

                        <div className="w-20 h-1 bg-zinc-950 mb-12"></div>

                        <div className="flex items-center gap-6 mb-8">
                            <p className="text-2xl font-bold text-zinc-950 tracking-tight">
                                ${product.price?.toFixed(2)}
                            </p>
                            <span className={`px-4 py-2 border text-[9px] font-bold uppercase tracking-widest ${status.color}`}>
                                {status.label}
                            </span>
                            {user?.role === 'ADMIN' && (
                                <button
                                    onClick={openAdvancedEdit}
                                    className="bg-blue-600 text-white px-6 py-2 text-[10px] uppercase font-black hover:bg-blue-700 transition-colors shadow-lg active:scale-95"
                                >
                                    Modify Product
                                </button>
                            )}
                        </div>
                    </header>

                    <div className="space-y-12">
                        <section>
                            <h2 className="label-mono mb-4 text-zinc-950/30">About this item</h2>
                            <p className="text-sm text-zinc-950/60 leading-relaxed max-w-md uppercase tracking-tight">
                                {product.description}
                            </p>
                        </section>

                        <footer className="pt-12 divider-soft space-y-12">
                            {/* add to cart/change quantity */}
                            <div>
                                {quantityInCart > 0 ? (
                                    <div className="flex flex-col gap-6">
                                        <div className="flex items-center gap-8 bg-zinc-100 border-main p-4 w-full lg:w-max">
                                            <button
                                                onClick={() => updateQuantity(cartItem.id, quantityInCart - 1, product.stock)}
                                                className="w-8 h-8 flex items-center justify-center hover:bg-zinc-200 transition-colors font-bold"
                                            >
                                                -
                                            </button>
                                            <span className="mono text-base font-bold min-w-[20px] text-center">{quantityInCart}</span>
                                            <button
                                                disabled={effectiveStock <= 0}
                                                onClick={() => updateQuantity(cartItem.id, quantityInCart + 1, product.stock)}
                                                className="w-8 h-8 flex items-center justify-center hover:bg-zinc-200 disabled:opacity-20 transition-colors font-bold"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        disabled={product.stock === 0 || effectiveStock <= 0}
                                        onClick={() => addToCart(product)}
                                        className="btn-primary w-full lg:w-max px-16 py-6 disabled:opacity-30 disabled:bg-zinc-400 disabled:cursor-not-allowed transition-all"
                                    >
                                        {product.stock === 0 ? 'Waitlisting Available' : 'Add to Order'}
                                    </button>
                                )}
                            </div>

                            {/* nav buttons */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={() => navigate('/cart')}
                                    className="btn-primary flex-1 py-5 border border-zinc-950"
                                >
                                    Checkout
                                </button>
                                <button
                                    onClick={() => navigate(-1)}
                                    className="btn-outline flex-1 py-5"
                                >
                                    Continue Shopping
                                </button>
                            </div>

                            <p className="label-mono text-[9px] opacity-40">Guaranteed shipping within 24 hours of confirmation.</p>
                        </footer>
                    </div>
                </div>
            </div>

            {/* Advanced Edit Product Modal */}
            {isAdvancedEditOpen && advancedEditForm && (
                <div className="fixed inset-0 z-[999] bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center p-6">
                    <div className="bg-white border-main shadow-2xl p-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-10 pb-6 divider-soft">
                            <h2 className="text-3xl tracking-tighter uppercase font-bold text-zinc-950">Modify Product</h2>
                            <button onClick={() => setIsAdvancedEditOpen(false)} className="text-zinc-400 hover:text-zinc-950 text-2xl font-bold">
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleAdvancedSave} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <input required type="text" placeholder="Product Name" value={advancedEditForm.name} onChange={e => setAdvancedEditForm({ ...advancedEditForm, name: e.target.value })} className="input-field w-full col-span-2" />
                                <input type="text" placeholder="Brand / Designer" value={advancedEditForm.brand} onChange={e => setAdvancedEditForm({ ...advancedEditForm, brand: e.target.value })} className="input-field w-full" />
                                <select value={advancedEditForm.categoryId} onChange={e => setAdvancedEditForm({ ...advancedEditForm, categoryId: e.target.value })} className="input-field w-full" required>
                                    <option value="" disabled>Select Category...</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase opacity-30">PRICE</span>
                                    <input required type="number" step="0.01" min="0" placeholder="0.00" value={advancedEditForm.price} onChange={e => setAdvancedEditForm({ ...advancedEditForm, price: e.target.value })} className="input-field w-full pl-16 font-mono font-bold" />
                                </div>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase opacity-30">QTY</span>
                                    <input required type="number" min="0" placeholder="0" value={advancedEditForm.stock} onChange={e => setAdvancedEditForm({ ...advancedEditForm, stock: e.target.value })} className="input-field w-full pl-16 font-mono font-bold" />
                                </div>
                                <textarea required placeholder="Product Description..." value={advancedEditForm.description} onChange={e => setAdvancedEditForm({ ...advancedEditForm, description: e.target.value })} className="input-field w-full col-span-2 min-h-[120px] resize-y" />

                                <div className="col-span-2 flex flex-col gap-4 p-4 border-2 border-dashed border-zinc-200 bg-zinc-50/50 text-left">
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" checked={advancedImageMode === 'URL'} onChange={() => setAdvancedImageMode('URL')} className="accent-zinc-950" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-950/60">Use Image URL</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" checked={advancedImageMode === 'UPLOAD'} onChange={() => setAdvancedImageMode('UPLOAD')} className="accent-zinc-950" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-950/60">Upload Image File</span>
                                        </label>
                                    </div>

                                    {advancedImageMode === 'URL' ? (
                                        <input type="url" placeholder="Placeholder Image URL (optional)" value={advancedEditForm.imageUrl} onChange={e => setAdvancedEditForm({ ...advancedEditForm, imageUrl: e.target.value })} className="input-field w-full bg-white" />
                                    ) : (
                                        <input type="file" accept="image/*" onChange={e => setAdvancedImageFile(e.target.files[0])} className="w-full text-[10px] font-bold uppercase p-2 border border-zinc-200 bg-white" />
                                    )}
                                </div>

                                <label className="flex items-center gap-4 col-span-2 p-4 bg-zinc-50 border-main cursor-pointer hover:bg-zinc-100 transition-colors">
                                    <input type="checkbox" checked={advancedEditForm.isFeatured} onChange={e => setAdvancedEditForm({ ...advancedEditForm, isFeatured: e.target.checked })} className="w-5 h-5 accent-zinc-950" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-950/80 mt-1">Pin to Top Featured List</span>
                                </label>
                            </div>
                            <div className="pt-6">
                                <button type="submit" className="btn-primary w-full py-4 text-[12px] shadow-heavy mt-4 uppercase font-black">Confirm Modification</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductPage;
