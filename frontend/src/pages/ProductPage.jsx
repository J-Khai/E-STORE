import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductById } from '../services/productService';
import { useCart } from '../context/CartContext';

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cartItems, addToCart, updateQuantity } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh] mono text-[10px] uppercase tracking-widest animate-pulse">
        Loading Product Details...
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
  const displayImage = (product.images && product.images.length > 0) 
    ? product.images[0] 
    : (product.thumbnail || product.imageUrl || 'https://via.placeholder.com/600x800');

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
    </div>
  );
};

export default ProductPage;
