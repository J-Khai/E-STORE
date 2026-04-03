import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product);
    
    // feedback for adding to cart
    setIsAdded(true);
    setTimeout(() => {
        setIsAdded(false);
    }, 2000);
  };

  // check stock level for the badge
  const getStockStatus = () => {
    if (product.stock === 0) return { label: 'Out of Stock', color: 'text-red-500' };
    if (product.stock <= 10) return { label: 'Low Stock', color: 'text-orange-500' };
    return { label: 'In Stock', color: 'text-green-600' };
  };

  const status = getStockStatus();

  return (
    <div className="product-card group relative bg-white border-soft hover:shadow-2xl hover:border-zinc-200 transition-all duration-500 flex flex-col h-full">
      {/* product image */}
      <Link to={`/product/${product.id}`} className="relative overflow-hidden aspect-[4/5] bg-zinc-50 block">
        <img 
          src={product.imageUrl || 'https://via.placeholder.com/400x500'} 
          alt={product.name} 
          className="object-cover w-full h-full grayscale group-hover:grayscale-0 
                     transition-all duration-1000 group-hover:scale-105"
        />
        
        {/* stock status */}
        <div className={`absolute top-6 right-6 text-[8px] font-bold uppercase tracking-widest px-3 py-1.5 bg-white/95 backdrop-blur-md shadow-sm border-main ${status.color}`}>
            {status.label}
        </div>

        {/* quick add on hover */}
        <div className="absolute inset-0 bg-zinc-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
            <button 
                onClick={handleAddToCart}
                disabled={product.stock === 0 || isAdded}
                className={`w-full py-4 bg-zinc-950 text-white label-mono text-[10px] uppercase font-bold tracking-widest translate-y-4 group-hover:translate-y-0 transition-all duration-500 shadow-2xl ${isAdded ? 'bg-green-600' : ''}`}
            >
                {product.stock === 0 ? 'Unavailable' : (isAdded ? 'Added to Cart' : '+ Quick Add')}
            </button>
        </div>

        {isAdded && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-md flex items-center justify-center animate-in fade-in zoom-in duration-500 z-10">
                <span className="label-mono bg-zinc-950 text-white py-3 px-10 shadow-2xl text-[11px] uppercase tracking-widest">Added</span>
            </div>
        )}
      </Link>

      <div className="flex flex-col grow p-8">
        <div className="flex-grow">
          <div className="flex justify-between items-start mb-4">
            <span className="label-mono text-[9px] uppercase tracking-widest opacity-40">
                {product.categoryName || 'General'}
            </span>
            <span className="text-sm font-bold text-zinc-950 tracking-tighter">
                ${product.price?.toFixed(2)}
            </span>
          </div>
          
          <Link to={`/product/${product.id}`}>
            <h3 className="text-lg font-bold text-zinc-950 mb-3 tracking-tighter uppercase leading-tight group-hover:underline underline-offset-8">
                {product.name}
            </h3>
          </Link>
          
          <p className="text-[11px] text-zinc-950/40 line-clamp-2 leading-relaxed font-medium uppercase tracking-tight">
            {product.description}
          </p>
        </div>
        
        <div className="flex items-center gap-4 mt-8 pt-8 divider-soft">
           <span className="label-mono text-[8px] uppercase tracking-widest opacity-30">Brand</span>
           <span className="label-mono text-[8px] uppercase font-bold tracking-widest">{product.brand || 'E-Store'}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
