import React from 'react';
import ProductCard from './ProductCard';
import Skeleton from '../common/Skeleton';

const ProductGrid = ({ products, loading, error }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-8 animate-in fade-in duration-500">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex flex-col gap-6">
            <Skeleton height="400px" width="100%" />
            <div className="space-y-4">
              <div className="flex justify-between">
                <Skeleton height="12px" width="60px" />
                <Skeleton height="12px" width="40px" />
              </div>
              <Skeleton height="24px" width="100%" />
              <div className="space-y-2">
                <Skeleton height="8px" width="100%" />
                <Skeleton height="8px" width="80%" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-6 border-2 border-dashed border-[#e2e8f0]">
        <h2 className="text-xl font-bold mb-3 text-zinc-950 uppercase tracking-tighter">System Maintenance</h2>
        <p className="text-sm text-zinc-950/50 max-w-xs leading-relaxed">
          We are currently updating our digital store. Please visit us again in a few moments.
        </p>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-6">
        <div className="text-sm font-semibold text-zinc-950/40 uppercase tracking-widest">
          Our shelves are empty for now.
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-8 animate-in fade-in duration-1000">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
