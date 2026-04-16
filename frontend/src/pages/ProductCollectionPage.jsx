import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts } from '../services/productService';
import { getCategories } from '../services/categoryService';
import ProductGrid from '../components/catalog/ProductGrid';
import CategorySidebar from '../components/catalog/CategorySidebar';

const ProductCollectionPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('categoryId') ? parseInt(searchParams.get('categoryId')) : null;
  const selectedBrand = searchParams.get('brand') || null;

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sortBy, setBy] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleCategorySelect = (id) => {
    // reset brand when category changes
    // prevents empty results if brand isn't in new category
    searchParams.delete('brand');

    if (id) {
      searchParams.set('categoryId', id);
    } else {
      searchParams.delete('categoryId');
    }
    setSearchParams(searchParams);
  };

  const handleBrandSelect = (brand) => {
    if (brand) {
      searchParams.set('brand', brand);
    } else {
      searchParams.delete('brand');
    }
    setSearchParams(searchParams);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(false);
      try {
        const [prodRes, catRes] = await Promise.all([
          getProducts(selectedCategory),
          getCategories()
        ]);
        setProducts(prodRes.data);
        setCategories(catRes.data);
      } catch (err) {
        console.error('oops something went wrong', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedCategory]);

  // filter and sort logic
  const filteredProducts = products.filter(p => {
    const matchesSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());

    const matchesBrand = !selectedBrand || p.brand === selectedBrand;

    return matchesSearch && matchesBrand;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'name-az') return a.name.localeCompare(b.name);
    return 0; // default (id order)
  });

  // get all unique brands
  const brands = Array.from(new Set(products.map(p => p.brand).filter(b => b)));

  return (
    <div className="page-container flex flex-col lg:flex-row gap-6 lg:gap-12 text-zinc-950">
      <aside className="lg:sticky lg:top-[100px] lg:h-fit lg:w-72 shrink-0">
        <CategorySidebar
          categories={categories}
          selectedCategory={selectedCategory}
          handleCategorySelect={handleCategorySelect}
          brands={brands}
          selectedBrand={selectedBrand}
          handleBrandSelect={handleBrandSelect}
        />
      </aside>

      <main className="flex-1">
        <header className="mb-12 divider-soft pb-8 flex flex-col items-start gap-6">
          <div className="w-full flex flex-col md:flex-row justify-between items-baseline gap-4">
            <h1 className="heading-large tracking-tighter uppercase">
              {search ? `Searching for "${search}"` : (selectedCategory
                ? categories.find(c => c.id === selectedCategory)?.name || 'Catalog'
                : 'Full Catalog'
              )}
            </h1>

            <div className="flex items-center gap-4 shrink-0">
              <span className="label-mono lowercase">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setBy(e.target.value)}
                className="bg-transparent text-[11px] font-bold uppercase tracking-widest outline-none cursor-pointer border-b border-zinc-950 pb-1"
              >
                <option value="newest">Featured</option>
                <option value="name-az">Name (A-Z)</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          <p className="label-mono uppercase">
            {filteredProducts.length === 0 ? 'No results identified' : `Showing ${filteredProducts.length} items`}
          </p>
        </header>

        <ProductGrid
          products={filteredProducts}
          loading={loading}
          error={error}
        />
      </main>
    </div>
  );
};

export default ProductCollectionPage;
