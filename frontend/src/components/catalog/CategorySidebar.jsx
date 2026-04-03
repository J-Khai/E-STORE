import React, { useState } from 'react';

const CategorySidebar = ({ 
    categories = [], 
    selectedCategory, 
    handleCategorySelect,
    brands = [],
    selectedBrand,
    handleBrandSelect
}) => {
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [isBrandOpen, setIsBrandOpen] = useState(false);

  const filtered = categories.filter(c => c.id !== null && c.name !== 'All Categories');
  const uniqueByName = Array.from(new Map(filtered.map(cat => [cat.name.toLowerCase(), cat])).values());
  const allCategories = [{ id: null, name: 'All Categories' }, ...uniqueByName];

  return (
    <aside className="w-full lg:w-72 shrink-0 border-b lg:border-b-0 lg:border-r border-[#e2e8f0] lg:pr-12 mb-16 lg:mb-0">
      <div className="flex flex-col gap-10">
        {/* Collections Dropdown */}
        <section className="relative">
            <button 
                onClick={() => setIsCatOpen(!isCatOpen)}
                className="w-full flex items-center justify-between py-4 border-b-2 border-zinc-950 group"
            >
                <div>
                    <span className="label-mono block text-[9px] uppercase opacity-30 text-left mb-1">Collections</span>
                    <span className="text-sm font-bold uppercase tracking-widest text-zinc-950">
                        {allCategories.find(c => c.id === selectedCategory)?.name || 'Filter Category'}
                    </span>
                </div>
                <svg className={`w-4 h-4 transition-transform duration-500 ${isCatOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            
            {isCatOpen && (
                <div className="absolute top-full left-0 w-full bg-white border border-[#e2e8f0] shadow-2xl z-50 mt-2 max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-300">
                    <ul className="flex flex-col">
                        {allCategories.map((cat) => (
                            <li key={cat.id || 'all'} className="border-b border-zinc-50 last:border-0">
                                <button
                                    onClick={() => {
                                        handleCategorySelect && handleCategorySelect(cat.id);
                                        setIsCatOpen(false);
                                    }}
                                    className={`w-full text-left px-6 py-4 text-[10px] uppercase font-bold tracking-widest transition-colors
                                        ${selectedCategory === cat.id ? 'bg-zinc-950 text-white' : 'text-zinc-900 hover:bg-zinc-50'}`}
                                >
                                    {cat.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </section>

        {/* Makers/Brands Dropdown */}
        {brands.length > 0 && (
            <section className="relative">
                <button 
                    onClick={() => setIsBrandOpen(!isBrandOpen)}
                    className="w-full flex items-center justify-between py-4 border-b border-[#e2e8f0] hover:border-zinc-400 group transition-colors"
                >
                    <div>
                        <span className="label-mono block text-[9px] uppercase opacity-30 text-left mb-1">Brand Makers</span>
                        <span className="text-sm font-bold uppercase tracking-widest text-zinc-950/60 group-hover:text-zinc-950">
                            {selectedBrand || 'Select Maker'}
                        </span>
                    </div>
                    <svg className={`w-4 h-4 transition-transform duration-500 ${isBrandOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                
                {isBrandOpen && (
                    <div className="absolute top-full left-0 w-full bg-white border border-[#e2e8f0] shadow-2xl z-50 mt-2 max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-300">
                        <ul className="flex flex-col text-[10px] uppercase font-bold tracking-widest">
                            <li className="border-b border-zinc-50">
                                <button 
                                    onClick={() => { handleBrandSelect(null); setIsBrandOpen(false); }}
                                    className={`w-full text-left px-6 py-4 transition-colors ${!selectedBrand ? 'bg-zinc-950 text-white' : 'hover:bg-zinc-50'}`}
                                >
                                    All Makers
                                </button>
                            </li>
                            {brands.map((brand) => (
                                <li key={brand} className="border-b border-zinc-50 last:border-0">
                                    <button
                                        onClick={() => {
                                            handleBrandSelect && handleBrandSelect(brand);
                                            setIsBrandOpen(false);
                                        }}
                                        className={`w-full text-left px-6 py-4 transition-colors ${selectedBrand === brand ? 'bg-zinc-950 text-white' : 'hover:bg-zinc-50'}`}
                                    >
                                        {brand}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </section>
        )}
      </div>

      <div className="mt-12 hidden lg:block">
        <p className="label-mono text-[9px] uppercase tracking-widest opacity-20 leading-relaxed italic">
            Refining search <br />
            across global hubs <br />
            MS7 Registry active
        </p>
      </div>
    </aside>
  );
};

export default CategorySidebar;
