import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import toast from 'react-hot-toast';

const AdminInventoryPage = () => {
  // Defensive: Initial state is Always an Array
  const [products, setProducts] = useState([]);
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
    fetchInventory();
  }, []);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ price: 0, stock: 0, isFeatured: false });
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });

  const startEditing = (product) => {
    setEditingId(product.id);
    setEditForm({ price: product.price, stock: product.stock, isFeatured: product.isFeatured || false });
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
          <input
            type="text"
            placeholder="Search catalog..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-3 bg-white border-main text-[10px] font-bold uppercase tracking-widest outline-none focus:border-zinc-950 transition-all w-full md:w-64 h-full"
          />
        </div>
      </header>

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
                          <div className="flex justify-end gap-3">
                            <button onClick={() => handleSave(p.id)} className="text-[10px] font-black uppercase text-green-600 tracking-widest hover:underline">Save</button>
                            <button onClick={() => setEditingId(null)} className="text-[10px] font-black uppercase text-red-400 tracking-widest hover:underline">Exit</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEditing(p)}
                            className="text-[10px] font-bold uppercase underline underline-offset-4 tracking-widest text-zinc-950 hover:text-zinc-500 transition-all cursor-pointer active:scale-95"
                          >
                            Edit
                          </button>
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
