import React from 'react';

function Dashboard({ products = [], customers = [], orders = [] }) {
  // Business rule: Low stock products are those with stock < 10
  const lowStockThreshold = 10;
  const lowStockProducts = products.filter(p => p.quantity_in_stock < lowStockThreshold);

  return (
    <div className="dashboard-view">
      <div className="section-header">
        <h2>Dashboard Overview</h2>
      </div>

      {/* Metrics Cards */}
      <div className="dashboard-grid">
        <div className="metric-card">
          <span className="label">Total Products</span>
          <span className="value">{products.length}</span>
        </div>
        <div className="metric-card">
          <span className="label">Total Customers</span>
          <span className="value">{customers.length}</span>
        </div>
        <div className="metric-card">
          <span className="label">Total Orders</span>
          <span className="value">{orders.length}</span>
        </div>
        <div className={`metric-card ${lowStockProducts.length > 0 ? 'alert-low' : ''}`}>
          <span className="label" style={{ color: lowStockProducts.length > 0 ? 'var(--warning)' : 'inherit' }}>
            Low Stock Products
          </span>
          <span className="value" style={{ color: lowStockProducts.length > 0 ? 'var(--warning)' : 'inherit' }}>
            {lowStockProducts.length}
          </span>
        </div>
      </div>

      {/* Low Stock Listing Section */}
      <div className="low-stock-panel">
        <h2>Low Stock Alert Board (Stock &lt; 10)</h2>
        {lowStockProducts.length === 0 ? (
          <p className="no-data" style={{ padding: '10px 0' }}>All product stocks are at healthy levels.</p>
        ) : (
          <div className="table-card" style={{ marginTop: '10px' }}>
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>SKU / Code</th>
                  <th>Price</th>
                  <th>Stock Quantity</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map(product => (
                  <tr key={product.id}>
                    <td><strong>{product.name}</strong></td>
                    <td><code>{product.sku}</code></td>
                    <td>${Number(product.price).toFixed(2)}</td>
                    <td>
                      <span className="alert alert-warning btn-sm" style={{ display: 'inline-block', margin: 0, padding: '2px 8px' }}>
                        {product.quantity_in_stock} left
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
