import React, { useState } from 'react';

function ProductManagement({ products = [], onAdd, onUpdate, onDelete }) {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  const resetForm = () => {
    setName('');
    setSku('');
    setPrice('');
    setQuantity('');
    setEditingId(null);
  };

  const handleEditClick = (product) => {
    setEditingId(product.id);
    setName(product.name);
    setSku(product.sku);
    setPrice(product.price.toString());
    setQuantity(product.quantity_in_stock.toString());
    setMessage(null);
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    // Front-end validations
    if (!name.trim() || !sku.trim() || price === '' || quantity === '') {
      setMessage({ type: 'error', text: 'All fields are required.' });
      return;
    }

    const priceNum = parseFloat(price);
    const quantityNum = parseInt(quantity, 10);

    if (isNaN(priceNum) || priceNum < 0) {
      setMessage({ type: 'error', text: 'Price must be a positive number or zero.' });
      return;
    }

    if (isNaN(quantityNum) || quantityNum < 0) {
      setMessage({ type: 'error', text: 'Quantity in stock cannot be negative.' });
      return;
    }

    const payload = {
      name: name.trim(),
      sku: sku.trim(),
      price: priceNum,
      quantity_in_stock: quantityNum
    };

    try {
      if (editingId) {
        // Update product
        const success = await onUpdate(editingId, payload);
        if (success) {
          setMessage({ type: 'success', text: 'Product updated successfully.' });
          resetForm();
        } else {
          setMessage({ type: 'error', text: 'Failed to update product. SKU must be unique.' });
        }
      } else {
        // Add product
        const success = await onAdd(payload);
        if (success) {
          setMessage({ type: 'success', text: 'Product added successfully.' });
          resetForm();
        } else {
          setMessage({ type: 'error', text: 'Failed to add product. SKU must be unique.' });
        }
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'An unexpected error occurred.' });
    }
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setMessage(null);
      try {
        const success = await onDelete(id);
        if (success) {
          setMessage({ type: 'success', text: 'Product deleted successfully.' });
          if (editingId === id) {
            resetForm();
          }
        } else {
          setMessage({ type: 'error', text: 'Failed to delete product. It might be associated with existing orders.' });
        }
      } catch (err) {
        setMessage({ type: 'error', text: err.message || 'Failed to delete product.' });
      }
    }
  };

  return (
    <div className="product-view">
      <div className="section-header">
        <h2>Product Management</h2>
      </div>

      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="management-layout">
        {/* Product Table */}
        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="5" className="no-data">No products available. Add a product to get started.</td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id}>
                    <td><strong>{product.name}</strong></td>
                    <td><code>{product.sku}</code></td>
                    <td>${Number(product.price).toFixed(2)}</td>
                    <td>
                      <span className={product.quantity_in_stock < 10 ? 'alert alert-warning btn-sm' : ''} style={{ display: 'inline-block', margin: 0, padding: product.quantity_in_stock < 10 ? '2px 8px' : '0' }}>
                        {product.quantity_in_stock}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleEditClick(product)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteClick(product.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Product Form */}
        <div className="form-card">
          <h3>{editingId ? 'Update Product' : 'Add New Product'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="prod-name">Product Name *</label>
              <input
                id="prod-name"
                type="text"
                placeholder="e.g. Wireless Mouse"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="prod-sku">SKU / Code *</label>
              <input
                id="prod-sku"
                type="text"
                placeholder="e.g. MS-WRLS-01"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="prod-price">Price ($) *</label>
              <input
                id="prod-price"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 29.99"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="prod-quantity">Quantity in Stock *</label>
              <input
                id="prod-quantity"
                type="number"
                min="0"
                placeholder="e.g. 100"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update' : 'Add Product'}
              </button>
              {editingId && (
                <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProductManagement;
