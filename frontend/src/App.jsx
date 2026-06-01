import React, { useState, useEffect } from 'react';
import './App.css';

// Importing Views
import Dashboard from './components/Dashboard';
import ProductManagement from './components/ProductManagement';
import CustomerManagement from './components/CustomerManagement';
import OrderManagement from './components/OrderManagement';

// Safe API endpoint loading with environment configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Reusable API query helper
  const apiCall = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || 'An API error occurred.');
    }

    if (response.status === 204) {
      return null;
    }
    return response.json();
  };

  // Fetch all core datasets
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [prodsData, custsData, ordsData] = await Promise.all([
        apiCall('/products'),
        apiCall('/customers'),
        apiCall('/orders')
      ]);

      setProducts(prodsData);
      setCustomers(custsData);
      setOrders(ordsData);
    } catch (err) {
      setError(`Failed to connect to the backend server (${API_BASE_URL}). Please verify it is running.`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // =====================================================================
  // PRODUCT HANDLERS
  // =====================================================================
  const handleAddProduct = async (payload) => {
    try {
      await apiCall('/products', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      await fetchData(); // Refresh local cache
      return true;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleUpdateProduct = async (id, payload) => {
    try {
      await apiCall(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      await fetchData();
      return true;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await apiCall(`/products/${id}`, {
        method: 'DELETE'
      });
      await fetchData();
      return true;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // =====================================================================
  // CUSTOMER HANDLERS
  // =====================================================================
  const handleAddCustomer = async (payload) => {
    try {
      await apiCall('/customers', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      await fetchData();
      return true;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleDeleteCustomer = async (id) => {
    try {
      await apiCall(`/customers/${id}`, {
        method: 'DELETE'
      });
      await fetchData();
      return true;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // =====================================================================
  // ORDER HANDLERS
  // =====================================================================
  const handleCreateOrder = async (payload) => {
    try {
      await apiCall('/orders', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      await fetchData();
      return true;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleDeleteOrder = async (id) => {
    try {
      await apiCall(`/orders/${id}`, {
        method: 'DELETE'
      });
      await fetchData();
      return true;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // Render Component depending on Active Tab
  const renderTabContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard products={products} customers={customers} orders={orders} />;
      case 'products':
        return (
          <ProductManagement 
            products={products} 
            onAdd={handleAddProduct}
            onUpdate={handleUpdateProduct}
            onDelete={handleDeleteProduct}
          />
        );
      case 'customers':
        return (
          <CustomerManagement 
            customers={customers} 
            onAdd={handleAddCustomer}
            onDelete={handleDeleteCustomer}
          />
        );
      case 'orders':
        return (
          <OrderManagement 
            orders={orders} 
            customers={customers} 
            products={products}
            onCreate={handleCreateOrder}
            onDelete={handleDeleteOrder}
          />
        );
      default:
        return <Dashboard products={products} customers={customers} orders={orders} />;
    }
  };

  return (
    <div className="app-container">
      {/* Header & Tabs Navbar */}
      <header>
        <div className="header-content">
          <h1>📦 Inventory &amp; Order Manager</h1>
          <nav className="nav-tabs">
            <button 
              className={`tab-btn ${currentTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setCurrentTab('dashboard')}
            >
              Dashboard
            </button>
            <button 
              className={`tab-btn ${currentTab === 'products' ? 'active' : ''}`}
              onClick={() => setCurrentTab('products')}
            >
              Products
            </button>
            <button 
              className={`tab-btn ${currentTab === 'customers' ? 'active' : ''}`}
              onClick={() => setCurrentTab('customers')}
            >
              Customers
            </button>
            <button 
              className={`tab-btn ${currentTab === 'orders' ? 'active' : ''}`}
              onClick={() => setCurrentTab('orders')}
            >
              Orders
            </button>
          </nav>
        </div>
      </header>

      {/* Main Body */}
      <main>
        {error && (
          <div className="alert alert-error" style={{ marginBottom: '20px' }}>
            <strong>Connection Error:</strong> {error}
            <div style={{ marginTop: '8px' }}>
              <button className="btn btn-secondary btn-sm" onClick={fetchData}>
                Retry Connecting
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Loading records from backend...</span>
          </div>
        ) : (
          renderTabContent()
        )}
      </main>
    </div>
  );
}

export default App;
