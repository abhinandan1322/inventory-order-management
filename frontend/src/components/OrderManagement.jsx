import React, { useState } from 'react';

function OrderManagement({ orders = [], customers = [], products = [], onCreate, onDelete }) {
  // Navigation internal state: 'list' or 'create'
  const [view, setView] = useState('list');
  const [selectedOrder, setSelectedOrder] = useState(null); // For details modal
  
  // Create Order Form State
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }]);
  
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  const handleOpenDetails = (order) => {
    setSelectedOrder(order);
  };

  const handleCloseDetails = () => {
    setSelectedOrder(null);
  };

  const handleAddItemRow = () => {
    setItems([...items, { product_id: '', quantity: 1 }]);
  };

  const handleRemoveItemRow = (index) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  const handleItemChange = (index, field, value) => {
    const updated = items.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setItems(updated);
  };

  const calculateFormTotal = () => {
    let total = 0;
    items.forEach(item => {
      if (item.product_id) {
        const prod = products.find(p => p.id === parseInt(item.product_id, 10));
        if (prod) {
          total += prod.price * (parseInt(item.quantity, 10) || 0);
        }
      }
    });
    return total;
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    // Front-end validations
    if (!customerId) {
      setMessage({ type: 'error', text: 'Please select a customer.' });
      return;
    }

    if (items.length === 0) {
      setMessage({ type: 'error', text: 'At least one product item is required.' });
      return;
    }

    // Validate rows
    const productIdsSet = new Set();
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.product_id) {
        setMessage({ type: 'error', text: `Please select a product for row ${i + 1}.` });
        return;
      }

      const pId = parseInt(item.product_id, 10);
      if (productIdsSet.has(pId)) {
        setMessage({ type: 'error', text: 'Each product can only be added once. Please adjust the quantity instead.' });
        return;
      }
      productIdsSet.add(pId);

      const qty = parseInt(item.quantity, 10);
      if (isNaN(qty) || qty <= 0) {
        setMessage({ type: 'error', text: `Quantity for row ${i + 1} must be greater than 0.` });
        return;
      }

      // Check available stock
      const prod = products.find(p => p.id === pId);
      if (!prod) {
        setMessage({ type: 'error', text: `Product not found.` });
        return;
      }
      if (qty > prod.quantity_in_stock) {
        setMessage({ 
          type: 'error', 
          text: `Insufficient stock for product '${prod.name}'. Available: ${prod.quantity_in_stock}, Ordered: ${qty}` 
        });
        return;
      }
    }

    // Build payload
    const payload = {
      customer_id: parseInt(customerId, 10),
      items: items.map(item => ({
        product_id: parseInt(item.product_id, 10),
        quantity: parseInt(item.quantity, 10)
      }))
    };

    try {
      const success = await onCreate(payload);
      if (success) {
        setMessage({ type: 'success', text: 'Order created successfully and stock adjusted!' });
        // Reset form
        setCustomerId('');
        setItems([{ product_id: '', quantity: 1 }]);
        // Switch back to list view
        setView('list');
      } else {
        setMessage({ type: 'error', text: 'Failed to create order. Please check product stock.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'An error occurred while placing the order.' });
    }
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      setMessage(null);
      try {
        const success = await onDelete(id);
        if (success) {
          setMessage({ type: 'success', text: 'Order deleted successfully.' });
        } else {
          setMessage({ type: 'error', text: 'Failed to delete order.' });
        }
      } catch (err) {
        setMessage({ type: 'error', text: err.message || 'Failed to delete order.' });
      }
    }
  };

  return (
    <div className="order-view">
      <div className="section-header">
        <h2>Order Management</h2>
        <div>
          {view === 'list' ? (
            <button className="btn btn-primary" onClick={() => { setView('create'); setMessage(null); }}>
              Create Order
            </button>
          ) : (
            <button className="btn btn-secondary" onClick={() => { setView('list'); setMessage(null); }}>
              Back to Orders List
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* =====================================================================
         VIEW: ORDERS LIST
         ===================================================================== */}
      {view === 'list' && (
        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer Name</th>
                <th>Total Amount</th>
                <th>Date / Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="no-data">No orders recorded yet. Create an order to get started.</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td><code>ORD-{order.id}</code></td>
                    <td><strong>{order.customer?.full_name || `ID: ${order.customer_id}`}</strong></td>
                    <td>${Number(order.total_amount).toFixed(2)}</td>
                    <td>{new Date(order.created_at).toLocaleString()}</td>
                    <td className="actions-cell">
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleOpenDetails(order)}
                      >
                        View Details
                      </button>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteClick(order.id)}
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
      )}

      {/* =====================================================================
         VIEW: CREATE ORDER PANEL
         ===================================================================== */}
      {view === 'create' && (
        <div className="form-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h3>Create New Order</h3>
          <form onSubmit={handleCreateSubmit}>
            {/* Customer Dropdown */}
            <div className="form-group">
              <label htmlFor="ord-customer">Select Customer *</label>
              <select
                id="ord-customer"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                required
              >
                <option value="">-- Choose a Customer --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.full_name} ({c.email_address})
                  </option>
                ))}
              </select>
            </div>

            {/* Product List Builder */}
            <div className="form-group" style={{ marginTop: '16px' }}>
              <label>Products &amp; Quantities *</label>
              <div className="order-items-builder">
                {items.map((item, index) => {
                  const selectedProd = products.find(p => p.id === parseInt(item.product_id, 10));
                  return (
                    <div className="order-item-row" key={index}>
                      {/* Product selection */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <select
                          value={item.product_id}
                          onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                          required
                          style={{ width: '100%' }}
                        >
                          <option value="">-- Select Product --</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} (${Number(p.price).toFixed(2)})
                            </option>
                          ))}
                        </select>
                        {selectedProd && (
                          <span style={{ fontSize: '0.8rem', color: selectedProd.quantity_in_stock === 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
                            Available stock: {selectedProd.quantity_in_stock}
                          </span>
                        )}
                      </div>

                      {/* Quantity */}
                      <div>
                        <input
                          type="number"
                          min="1"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          required
                          style={{ width: '100%' }}
                        />
                      </div>

                      {/* Remove item button */}
                      <div>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleRemoveItemRow(index)}
                          disabled={items.length === 1}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleAddItemRow}
                  style={{ marginTop: '8px' }}
                >
                  + Add Item Row
                </button>
              </div>
            </div>

            {/* Subtotal Display */}
            <div className="order-summary-block">
              <span>Order Subtotal:</span>
              <span>${calculateFormTotal().toFixed(2)}</span>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={products.length === 0 || customers.length === 0}>
                Place Order
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => { setView('list'); setMessage(null); }}>
                Cancel
              </button>
            </div>
            {(products.length === 0 || customers.length === 0) && (
              <p style={{ color: 'var(--danger)', marginTop: '8px', fontSize: '0.85rem' }}>
                * Note: You must add at least one customer and one product before placing an order.
              </p>
            )}
          </form>
        </div>
      )}

      {/* =====================================================================
         DETAILS MODAL
         ===================================================================== */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={handleCloseDetails}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Order details: ORD-{selectedOrder.id}</h3>
              <button className="btn btn-secondary btn-sm" onClick={handleCloseDetails}>Close</button>
            </div>

            {/* Customer Details */}
            <div className="modal-section">
              <h4>Customer Information</h4>
              <p><strong>Name:</strong> {selectedOrder.customer?.full_name}</p>
              <p><strong>Email:</strong> {selectedOrder.customer?.email_address}</p>
              <p><strong>Phone:</strong> {selectedOrder.customer?.phone_number}</p>
            </div>

            {/* Order Time */}
            <div className="modal-section">
              <h4>Order Metadata</h4>
              <p><strong>Date Placed:</strong> {new Date(selectedOrder.created_at).toLocaleString()}</p>
            </div>

            {/* Order Items Table */}
            <div className="modal-section">
              <h4>Products Ordered</h4>
              <div className="table-card" style={{ marginTop: '8px' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>SKU</th>
                      <th>Unit Price</th>
                      <th>Qty</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items?.map((item) => (
                      <tr key={item.id}>
                        <td><strong>{item.product?.name || `ID: ${item.product_id}`}</strong></td>
                        <td><code>{item.product?.sku || 'N/A'}</code></td>
                        <td>${Number(item.product?.price || 0).toFixed(2)}</td>
                        <td>{item.quantity}</td>
                        <td>${(Number(item.product?.price || 0) * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Grand Total */}
            <div className="order-summary-block" style={{ borderBottom: 'none', paddingBottom: 0 }}>
              <span>Grand Total:</span>
              <span style={{ color: 'var(--primary)', fontSize: '1.2rem' }}>
                ${Number(selectedOrder.total_amount).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderManagement;
