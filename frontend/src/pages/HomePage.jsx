import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services/productService';
import ProductCard from '../components/catalog/ProductCard';
import heroBanner from '../assets/hero_banner_v2.webp';

const HomePage = () => {
    const [allProducts, setAllProducts] = useState([]);
    const [featured, setFeatured] = useState([]);
    const [newArrivals, setNewArrivals] = useState([]);
    const [recommended, setRecommended] = useState([]);
    const [loading, setLoading] = useState(true);

    const refreshSuggestions = (all) => {
        const pool = all || allProducts;
        if (pool.length === 0) return;
        const randomSample = [...pool].sort(() => 0.5 - Math.random()).slice(0, 4);
        setRecommended(randomSample);
    };

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            try {
                const res = await productService.getProducts();
                const all = res.data;
                setAllProducts(all);
                
                // pull featured products if marked, or just take the first 8 if not
                const featuredPool = all.filter(p => p.isFeatured === true);
                setFeatured(featuredPool.length > 0 ? featuredPool.slice(0, 8) : all.slice(0, 8));
                
                setNewArrivals(all.slice(-8).reverse());
                
                // random picks for the 'picks for you' section
                const firstSample = [...all].sort(() => 0.5 - Math.random()).slice(0, 4);
                setRecommended(firstSample);
                
                setLoading(false);
            } catch (err) {
                console.error("Home store initialization failure", err);
                setLoading(false);
            }
        };
        loadInitialData();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh] mono text-[10px] uppercase tracking-widest animate-pulse">
            Loading Storefront...
        </div>
    );

    return (
        <div className="home-page overflow-x-hidden">
            {/* large hero banner at the top */}
            <section className="relative bg-zinc-100 overflow-hidden">
                <img 
                    src={heroBanner} 
                    alt="E-Store Selection" 
                    className="w-full block grayscale transition-all duration-1000"
                />
                <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]"></div>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                    <span className="label-mono mb-8 uppercase tracking-[0.3em] opacity-40 text-zinc-950">
                        Quality Products. Direct Shipping.
                    </span>
                    <h1 className="text-4xl md:text-7xl lg:text-9xl font-bold tracking-tighter uppercase text-zinc-950 mb-12 animate-in fade-in slide-in-from-bottom duration-700">
                        Modern <br /> Essentials
                    </h1>
                    <Link 
                        to="/products"
                        className="btn-primary px-16 py-6 shadow-2xl hover:bg-zinc-900 transition-all duration-500"
                    >
                        Shop the Catalog
                    </Link>
                </div>
            </section>

            {/* list of featured items */}
            <section className="py-32 px-6 lg:px-20 max-w-[1920px] mx-auto">
                <header className="text-center mb-32">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tighter uppercase text-zinc-950 mb-6 px-6 md:px-12 inline-block relative">
                        Featured Products
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-1 bg-zinc-950"></div>
                    </h2>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-20">
                    {featured.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>

                <div className="mt-24 text-center border-t border-zinc-100 pt-20">
                    <Link 
                        to="/products"
                        className="btn-outline px-20 py-5 text-[10px] uppercase font-bold tracking-[0.2em] hover:bg-zinc-950 hover:text-white transition-all duration-500"
                    >
                        View All Collections
                    </Link>
                </div>
            </section>

            {/* promo blurbs about shipping/quality */}
            <section className="bg-zinc-950 text-white py-40 px-6 lg:px-20">
                <div className="max-w-4xl mx-auto text-center mb-32">
                    <span className="label-mono opacity-40 text-[10px] block mb-8 uppercase tracking-widest">Our Store Standards</span>
                    <h2 className="text-4xl lg:text-6xl font-bold tracking-tighter uppercase mb-12">Quality in Every Detail</h2>
                    <p className="label-mono text-sm opacity-60 leading-relaxed uppercase tracking-wide px-12">
                        We source the best products to ensure a better shopping experience. 
                        Direct shipping ensures your items arrive on time and in perfect condition.
                    </p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-24 border-t border-white/10 pt-32">
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold tracking-tighter uppercase">01 / Shipping</h3>
                        <p className="label-mono text-[11px] opacity-40 leading-relaxed uppercase">Fast and reliable delivery options for all your orders.</p>
                    </div>
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold tracking-tighter uppercase">02 / Sourcing</h3>
                        <p className="label-mono text-[11px] opacity-40 leading-relaxed uppercase">Hand-picked items from verified suppliers you can trust.</p>
                    </div>
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold tracking-tighter uppercase">03 / Support</h3>
                        <p className="label-mono text-[11px] opacity-40 leading-relaxed uppercase">Helpful customer support for any questions during your shop.</p>
                    </div>
                </div>
            </section>

            {/* randomized product suggestions */}
            <section className="py-32 px-6 lg:px-20 bg-zinc-50 border-y border-zinc-100">
                <header className="text-center mb-24">
                   <h2 className="text-3xl md:text-4xl font-bold tracking-tighter uppercase text-zinc-950 mb-4 italic">Picks for You</h2>
                   <p className="label-mono text-[9px] uppercase opacity-40 tracking-widest">Suggestions from our catalog</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {recommended.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
                
                <div className="mt-20 text-center">
                   <button onClick={() => refreshSuggestions()} className="label-mono text-[10px] uppercase font-bold text-zinc-400 hover:text-zinc-950 transition-all underline underline-offset-8">
                        See Different Suggestions
                   </button>
                </div>
            </section>

            {/* newest additions to the catalog */}
            <section className="py-32 px-6 lg:px-20 max-w-[1920px] mx-auto">
                <header className="text-center mb-32">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tighter uppercase text-zinc-950 mb-6 px-6 md:px-12 inline-block relative">
                        New Arrivals
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-1 bg-zinc-950"></div>
                    </h2>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-20">
                    {newArrivals.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </section>
        </div>
    );
};

export default HomePage;
