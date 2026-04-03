import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import toast from 'react-hot-toast';

const AdminInventoryPage = () => {
  // Defensive: Initial state is Always an Array
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await axios.get('/admin/products');
        const incomingData = res.data;

        if (Array.isArray(incomingData)) {
          setProducts(incomingData);
        } else if (incomingData && Array.isArray(incomingData.content)) {
          setProducts(incomingData.content);
        } else {
          setProducts([]);
        }

        setLoading(false);
      } catch (err) {
        console.error('Failed to load inventory! Full Error Details:', err.response || err);
        toast.error("Failed to load inventory.");
        setLoading(false);
      }
    };
    
    const fetchCategories = async () => {
        try {
            const res = await axios.get('/categories');
            setCategories(res.data);
        } catch (err) {
            console.error('Failed to load categories', err);
        }
    };

    fetchInventory();
    fetchCategories();
  }, []);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ price: 0, stock: 0, isFeatured: false });
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });

  const startEditing = (product) => {
    setEditingId(product.id);
    setEditForm({ price: product.price, stock: product.stock, isFeatured: product.isFeatured || false });
  };

  const [isAddingMode, setIsAddingMode] = useState(false);
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    description: '',
    brand: '',
    categoryId: '',
    price: '',
    stock: '',
    imageUrl: '',
    isFeatured: false
  });
  const [newProductImageMode, setNewProductImageMode] = useState('URL');
  const [newProductImageFile, setNewProductImageFile] = useState(null);

  const [advancedEditingProduct, setAdvancedEditingProduct] = useState(null);
  const [advancedEditForm, setAdvancedEditForm] = useState(null);
  const [advancedImageMode, setAdvancedImageMode] = useState('URL');
  const [advancedImageFile, setAdvancedImageFile] = useState(null);

  const openAdvancedEdit = (product) => {
      setAdvancedEditingProduct(product);
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
  };

  const handleAdvancedSave = async (e) => {
      e.preventDefault();
      try {
          const res = await axios.put(`/admin/products/${advancedEditingProduct.id}`, {
              ...advancedEditForm,
              price: parseFloat(advancedEditForm.price),
              stock: parseInt(advancedEditForm.stock),
              imageUrl: advancedImageMode === 'URL' ? advancedEditForm.imageUrl : (advancedEditingProduct.imageUrl || '')
          });

          let updatedProduct = res.data;

          if (advancedImageMode === 'UPLOAD' && advancedImageFile) {
              const formData = new FormData();
              formData.append('file', advancedImageFile);
              const imageRes = await axios.patch(`/admin/products/${advancedEditingProduct.id}/image`, formData, {
                  headers: { 'Content-Type': 'multipart/form-data' }
              });
              updatedProduct = imageRes.data;
          }

          setProducts(prev => prev.map(p => p.id === advancedEditingProduct.id ? updatedProduct : p));
          setAdvancedEditingProduct(null);
          setEditingId(null);
          toast.success("Product extensively modified.");
      } catch (err) {
          console.error(err);
          toast.error("Failed advanced modification.");
      }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/admin/products', {
          ...newProductForm,
          imageUrl: newProductImageMode === 'URL' ? newProductForm.imageUrl : '',
          price: parseFloat(newProductForm.price || 0),
          stock: parseInt(newProductForm.stock || 0),
          category: newProductForm.categoryId ? { id: parseInt(newProductForm.categoryId) } : null
      });

      let finalProduct = res.data;
      
      if (newProductImageMode === 'UPLOAD' && newProductImageFile) {
        const formData = new FormData();
        formData.append('file', newProductImageFile);
        const imageRes = await axios.patch(`/admin/products/${finalProduct.id}/image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        finalProduct = imageRes.data;
      }

      setProducts(prev => [...prev, finalProduct]);
      setIsAddingMode(false);
      setNewProductForm({ name: '', description: '', brand: '', categoryId: '', price: '', stock: '', imageUrl: '', isFeatured: false });
      setNewProductImageFile(null);
      toast.success("Product instantly generated.");
    } catch (err) {
      console.error(err);
      toast.error("An error occurred generating product.");
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Do you absolutely want to erase this product?")) return;
    try {
      await axios.delete(`/admin/products/${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success("Item permanently destroyed.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to destroy item.");
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleSave = async (id) => {
    try {

      const res = await axios.put(`/admin/products/${id}`, {
        price: parseFloat(editForm.price),
        stock: parseInt(editForm.stock),
        isFeatured: Boolean(editForm.isFeatured)
      });

      let updatedProduct = res.data;


      if (editForm.imageFile) {
        const formData = new FormData();
        formData.append('file', editForm.imageFile);
        const imageRes = await axios.patch(`/admin/products/${id}/image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        updatedProduct = imageRes.data;
      }

      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
      setEditingId(null);
      setEditForm({ price: 0, stock: 0, imageFile: null, previewUrl: null });
      toast.success("Changes Saved.");
    } catch (err) {
      console.error("Save failure", err);
      toast.error("Failed to save changes.");
    }
  };

  const [restockFilter, setRestockFilter] = useState(false);

  const dataToFilter = Array.isArray(products) ? products : [];

  const filteredAndSortedProducts = [...dataToFilter]
    .filter(p => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = (
        (p.name?.toLowerCase() || '').includes(term) ||
        (p.id?.toString() || '').includes(term) ||
        (p.price?.toString() || '').includes(term) ||
        (p.stock?.toString() || '').includes(term)
      );

      if (restockFilter) {
        return matchesSearch && p.stock < 5;
      }
      return matchesSearch;
    })
    .sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

  return (
    <div className="space-y-12">
      <header className="divider-soft pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter uppercase text-zinc-950">
            Product Inventory
          </h1>
          <p className="text-[10px] font-bold text-zinc-950/30 uppercase tracking-[0.2em] mt-2">
            Managing {dataToFilter.length} catalog items
          </p>
        </div>

        <div className="flex w-full md:w-auto gap-6 items-center">
          <div className="flex items-center gap-3 bg-zinc-100 px-4 py-3 border-main h-full">
            <input
              type="checkbox"
              id="restock"
              checked={restockFilter}
              onChange={(e) => setRestockFilter(e.target.checked)}
              className="w-4 h-4 accent-zinc-950"
            />
            <label htmlFor="restock" className="text-[10px] font-black uppercase tracking-widest text-zinc-950/60 cursor-pointer">Restock Needed ({"< 5"})</label>
          </div>
          <button onClick={() => setIsAddingMode(true)} className="btn-primary py-3 px-6 shrink-0 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
+ Add Item
          </button>
          <input
            type="text"
            placeholder="Search catalog..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-3 bg-white border-main text-[10px] font-bold uppercase tracking-widest outline-none focus:border-zinc-950 transition-all w-full md:w-64 h-full"
          />
        </div>
      </header>

      {/* Add Product Modal */}
      {isAddingMode && (
         <div className="fixed inset-0 z-[999] bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="bg-white border-main shadow-2xl p-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
                <div className="flex justify-between items-center mb-10 pb-6 divider-soft">
                   <h2 className="text-3xl tracking-tighter uppercase font-bold text-zinc-950">Add Product</h2>
                   <button onClick={() => setIsAddingMode(false)} className="text-zinc-400 hover:text-zinc-950">
                        ✕
                   </button>
                </div>
                <form onSubmit={handleAddProduct} className="space-y-6">
                   <div className="grid grid-cols-2 gap-6">
                       <input autoFocus required type="text" placeholder="Product Name" value={newProductForm.name} onChange={e => setNewProductForm({...newProductForm, name: e.target.value})} className="input-field w-full col-span-2" />
                       <input type="text" placeholder="Brand / Designer" value={newProductForm.brand} onChange={e => setNewProductForm({...newProductForm, brand: e.target.value})} className="input-field w-full" />
                       <select value={newProductForm.categoryId} onChange={e => setNewProductForm({...newProductForm, categoryId: e.target.value})} className="input-field w-full" required>
                           <option value="" disabled>Select Category...</option>
                           {categories.map(cat => (
                               <option key={cat.id} value={cat.id}>{cat.name}</option>
                           ))}
                       </select>
                       <div className="relative">
                           <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase opacity-30">PRICE</span>
                           <input required type="number" step="0.01" min="0" placeholder="0.00" value={newProductForm.price} onChange={e => setNewProductForm({...newProductForm, price: e.target.value})} className="input-field w-full pl-16 font-mono font-bold" />
                       </div>
                       <div className="relative">
                           <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase opacity-30">QTY</span>
                           <input required type="number" min="0" placeholder="0" value={newProductForm.stock} onChange={e => setNewProductForm({...newProductForm, stock: e.target.value})} className="input-field w-full pl-16 font-mono font-bold" />
                       </div>
                       <textarea required placeholder="Product Description..." value={newProductForm.description} onChange={e => setNewProductForm({...newProductForm, description: e.target.value})} className="input-field w-full col-span-2 min-h-[120px] resize-y" />
                       
                       <div className="col-span-2 flex flex-col gap-4 p-4 border-2 border-dashed border-zinc-200 bg-zinc-50/50">
                           <div className="flex gap-4">
                               <label className="flex items-center gap-2 cursor-pointer">
                                   <input type="radio" checked={newProductImageMode === 'URL'} onChange={() => setNewProductImageMode('URL')} className="accent-zinc-950" />
                                   <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-950/60">Use Image URL</span>
                               </label>
                               <label className="flex items-center gap-2 cursor-pointer">
                                   <input type="radio" checked={newProductImageMode === 'UPLOAD'} onChange={() => setNewProductImageMode('UPLOAD')} className="accent-zinc-950" />
                                   <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-950/60">Upload Image File</span>
                               </label>
                           </div>
                           
                           {newProductImageMode === 'URL' ? (
                               <input type="url" placeholder="Placeholder Image URL (optional)" value={newProductForm.imageUrl} onChange={e => setNewProductForm({...newProductForm, imageUrl: e.target.value})} className="input-field w-full bg-white" />
                           ) : (
                               <input type="file" accept="image/*" onChange={e => setNewProductImageFile(e.target.files[0])} className="w-full text-[10px] font-bold uppercase p-2 border border-zinc-200 bg-white" />
                           )}
                       </div>
                       
                       <label className="flex items-center gap-4 col-span-2 p-4 bg-zinc-50 border-main cursor-pointer hover:bg-zinc-100 transition-colors">
                           <input type="checkbox" checked={newProductForm.isFeatured} onChange={e => setNewProductForm({...newProductForm, isFeatured: e.target.checked})} className="w-5 h-5 accent-zinc-950" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-zinc-950/80 mt-1">Pin to Top Featured List</span>
                       </label>
                   </div>
                   <div className="pt-6">
                       <button type="submit" className="btn-primary w-full py-4 text-[12px] shadow-heavy mt-4">Confirm Injection</button>
                   </div>
                </form>
            </div>
         </div>
      )}

      {/* Advanced Edit Product Modal */}
      {advancedEditingProduct && advancedEditForm && (
         <div className="fixed inset-0 z-[999] bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="bg-white border-main shadow-2xl p-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
                <div className="flex justify-between items-center mb-10 pb-6 divider-soft">
                   <h2 className="text-3xl tracking-tighter uppercase font-bold text-zinc-950">Modify Product</h2>
                   <button onClick={() => setAdvancedEditingProduct(null)} className="text-zinc-400 hover:text-zinc-950">
                        ✕
                   </button>
                </div>
                <form onSubmit={handleAdvancedSave} className="space-y-6">
                   <div className="grid grid-cols-2 gap-6">
                       <input required type="text" placeholder="Product Name" value={advancedEditForm.name} onChange={e => setAdvancedEditForm({...advancedEditForm, name: e.target.value})} className="input-field w-full col-span-2" />
                       <input type="text" placeholder="Brand / Designer" value={advancedEditForm.brand} onChange={e => setAdvancedEditForm({...advancedEditForm, brand: e.target.value})} className="input-field w-full" />
                       <select value={advancedEditForm.categoryId} onChange={e => setAdvancedEditForm({...advancedEditForm, categoryId: e.target.value})} className="input-field w-full" required>
                           <option value="" disabled>Select Category...</option>
                           {categories.map(cat => (
                               <option key={cat.id} value={cat.id}>{cat.name}</option>
                           ))}
                       </select>
                       <div className="relative">
                           <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase opacity-30">PRICE</span>
                           <input required type="number" step="0.01" min="0" placeholder="0.00" value={advancedEditForm.price} onChange={e => setAdvancedEditForm({...advancedEditForm, price: e.target.value})} className="input-field w-full pl-16 font-mono font-bold" />
                       </div>
                       <div className="relative">
                           <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase opacity-30">QTY</span>
                           <input required type="number" min="0" placeholder="0" value={advancedEditForm.stock} onChange={e => setAdvancedEditForm({...advancedEditForm, stock: e.target.value})} className="input-field w-full pl-16 font-mono font-bold" />
                       </div>
                       <textarea required placeholder="Product Description..." value={advancedEditForm.description} onChange={e => setAdvancedEditForm({...advancedEditForm, description: e.target.value})} className="input-field w-full col-span-2 min-h-[120px] resize-y" />
                       
                       <div className="col-span-2 flex flex-col gap-4 p-4 border-2 border-dashed border-zinc-200 bg-zinc-50/50">
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
                               <input type="url" placeholder="Placeholder Image URL (optional)" value={advancedEditForm.imageUrl} onChange={e => setAdvancedEditForm({...advancedEditForm, imageUrl: e.target.value})} className="input-field w-full bg-white" />
                           ) : (
                               <input type="file" accept="image/*" onChange={e => setAdvancedImageFile(e.target.files[0])} className="w-full text-[10px] font-bold uppercase p-2 border border-zinc-200 bg-white" />
                           )}
                       </div>
                       
                       <label className="flex items-center gap-4 col-span-2 p-4 bg-zinc-50 border-main cursor-pointer hover:bg-zinc-100 transition-colors">
                           <input type="checkbox" checked={advancedEditForm.isFeatured} onChange={e => setAdvancedEditForm({...advancedEditForm, isFeatured: e.target.checked})} className="w-5 h-5 accent-zinc-950" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-zinc-950/80 mt-1">Pin to Top Featured List</span>
                       </label>
                   </div>
                   <div className="pt-6">
                       <button type="submit" className="btn-primary w-full py-4 text-[12px] shadow-heavy mt-4">Confirm Override</button>
                   </div>
                </form>
            </div>
         </div>
      )}

      {loading ? (
        <div className="mono text-[10px] uppercase tracking-widest animate-pulse font-bold text-zinc-950/40">
          Syncing Inventory...
        </div>
      ) : (
        <div className="admin-table-container">
          <div className="max-h-[600px] overflow-y-auto relative">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-white z-20 shadow-sm">
                <tr className="border-b-2 border-zinc-950 text-left">
                  <th
                    onClick={() => handleSort('id')}
                    className="py-4 text-[9px] font-black uppercase tracking-widest text-zinc-950/40 pl-6 cursor-pointer hover:text-zinc-950 transition-colors"
                  >
                    ID {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    onClick={() => handleSort('name')}
                    className="py-4 text-[9px] font-black uppercase tracking-widest text-zinc-950/40 px-4 cursor-pointer hover:text-zinc-950 transition-colors"
                  >
                    Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="py-4 text-[9px] font-black uppercase tracking-widest text-zinc-950/40">Media</th>
                  <th className="py-4 text-[9px] font-black uppercase tracking-widest text-zinc-950/40">Status</th>
                  <th
                    onClick={() => handleSort('price')}
                    className="py-4 text-right text-[9px] font-black uppercase tracking-widest text-zinc-950/40 cursor-pointer hover:text-zinc-950 transition-colors"
                  >
                    Price {sortConfig.key === 'price' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    onClick={() => handleSort('stock')}
                    className="py-4 text-right text-[9px] font-black uppercase tracking-widest text-zinc-950/40 cursor-pointer hover:text-zinc-950 transition-colors"
                  >
                    Stock {sortConfig.key === 'stock' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="py-4 text-right text-[9px] font-black uppercase tracking-widest text-zinc-950/40 pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-soft">
                {filteredAndSortedProducts.map(p => {
                  const isLowStock = p.stock < 10;
                  const isEditing = editingId === p.id;

                  return (
                    <tr key={p.id} className={`group hover:bg-zinc-50 transition-colors ${isEditing ? 'bg-zinc-100' : (isLowStock ? 'bg-red-50/20' : '')}`}>
                      <td className="py-5 pl-6 text-xs font-mono text-zinc-950/30">#{p.id}</td>
                      <td className="py-5 px-4">
                        <Link
                          to={`/product/${p.id}`}
                          className="text-xs font-bold uppercase tracking-tight text-zinc-950 hover:underline underline-offset-4 decoration-zinc-950/20 transition-all"
                        >
                          {p.name}
                        </Link>
                      </td>
                      <td className="py-5">
                        {isEditing ? (
                          <div className="flex flex-col gap-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  const url = URL.createObjectURL(file);
                                  setEditForm(prev => ({ ...prev, previewUrl: url, imageFile: file }));
                                }
                              }}
                              className="hidden"
                              id={`file-${p.id}`}
                            />
                            <label htmlFor={`file-${p.id}`} className="cursor-pointer">
                              <img
                                src={editForm.previewUrl || p.imageUrl || 'https://via.placeholder.com/40'}
                                className="media-preview"
                                alt="preview"
                              />
                            </label>
                          </div>
                        ) : (
                          <img src={p.imageUrl || 'https://via.placeholder.com/40'} className="media-preview grayscale opacity-50" alt="product" />
                        )}
                      </td>
                      <td className="py-5">
                        <div className="flex flex-col gap-2 items-start">
                          <span className={`status-badge ${isLowStock ? (p.stock === 0 ? 'status-badge-neutral' : 'status-badge-error') : 'status-badge-success'}`}>
                            {p.stock === 0 ? 'Out of Stock' : (isLowStock ? 'Low Stock' : 'In Stock')}
                          </span>
                          {!isEditing && p.isFeatured && (
                            <span className="text-[8px] font-black uppercase tracking-widest text-blue-500 bg-blue-50 px-2 rounded-full border border-blue-200">
                              ☆ Pinned
                            </span>
                          )}
                          {isEditing && (
                            <label className="flex items-center gap-2 cursor-pointer mt-1">
                              <input 
                                type="checkbox" 
                                className="accent-zinc-950 w-3 h-3" 
                                checked={editForm.isFeatured} 
                                onChange={e => setEditForm(prev => ({...prev, isFeatured: e.target.checked}))} 
                              />
                              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-950/60">Pin to Front</span>
                            </label>
                          )}
                        </div>
                      </td>
                      <td className="py-5 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editForm.price}
                            onChange={(e) => setEditForm(prev => ({ ...prev, price: e.target.value }))}
                            className="bg-white border border-zinc-300 w-24 px-2 py-1 text-xs font-bold text-right outline-none focus:border-zinc-950"
                          />
                        ) : (
                          <span className="text-xs font-bold text-zinc-950/60">${p.price?.toFixed(2)}</span>
                        )}
                      </td>
                      <td className="py-5 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editForm.stock}
                            onChange={(e) => setEditForm(prev => ({ ...prev, stock: e.target.value }))}
                            className="bg-white border border-zinc-300 w-16 px-2 py-1 text-xs font-bold text-right outline-none focus:border-zinc-950"
                          />
                        ) : (
                          <span className={`text-xs font-bold font-mono ${p.stock < 10 ? 'text-red-600' : 'text-zinc-400'}`}>
                            {p.stock}
                          </span>
                        )}
                      </td>
                      <td className="py-5 text-right pr-6">
                        {isEditing ? (
                          <div className="flex justify-end gap-3 items-center">
                            <button onClick={() => openAdvancedEdit(p)} className="text-[10px] font-black uppercase text-blue-500 tracking-widest hover:underline mr-2">Modify Product</button>
                            <button onClick={() => handleSave(p.id)} className="text-[10px] font-black uppercase text-green-600 tracking-widest hover:underline">Inline Save</button>
                            <button onClick={() => setEditingId(null)} className="text-[10px] font-black uppercase text-red-400 tracking-widest hover:underline">Exit</button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-4">
                              <button
                                onClick={() => startEditing(p)}
                                className="text-[10px] font-bold uppercase underline underline-offset-4 tracking-widest text-zinc-950 hover:text-zinc-500 transition-all cursor-pointer active:scale-95"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="text-[10px] font-bold uppercase hover:underline underline-offset-4 tracking-widest text-red-500 hover:text-red-700 transition-all cursor-pointer active:scale-95"
                              >
                                Delete
                              </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredAndSortedProducts.length === 0 && (
              <div className="py-32 text-center">
                <p className="label-mono text-[10px] uppercase opacity-20 tracking-[0.2em] font-black">No items matched your search</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventoryPage;
