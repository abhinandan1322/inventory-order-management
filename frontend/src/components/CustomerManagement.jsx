import React, { useState } from 'react';

function CustomerManagement({ customers = [], onAdd, onDelete }) {
  const [fullName, setFullName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  const resetForm = () => {
    setFullName('');
    setEmailAddress('');
    setPhoneNumber('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    // Front-end validation
    if (!fullName.trim() || !emailAddress.trim() || !phoneNumber.trim()) {
      setMessage({ type: 'error', text: 'All fields are required.' });
      return;
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailAddress.trim())) {
      setMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    const payload = {
      full_name: fullName.trim(),
      email_address: emailAddress.trim(),
      phone_number: phoneNumber.trim()
    };

    try {
      const success = await onAdd(payload);
      if (success) {
        setMessage({ type: 'success', text: 'Customer added successfully.' });
        resetForm();
      } else {
        setMessage({ type: 'error', text: 'Failed to add customer. Email address already exists.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'An unexpected error occurred.' });
    }
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      setMessage(null);
      try {
        const success = await onDelete(id);
        if (success) {
          setMessage({ type: 'success', text: 'Customer deleted successfully.' });
        } else {
          setMessage({ type: 'error', text: 'Failed to delete customer. They might have active orders associated with them.' });
        }
      } catch (err) {
        setMessage({ type: 'error', text: err.message || 'Failed to delete customer.' });
      }
    }
  };

  return (
    <div className="customer-view">
      <div className="section-header">
        <h2>Customer Management</h2>
      </div>

      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="management-layout">
        {/* Customer Table */}
        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email Address</th>
                <th>Phone Number</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="no-data">No customers available. Add a customer to get started.</td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id}>
                    <td><strong>{customer.full_name}</strong></td>
                    <td>{customer.email_address}</td>
                    <td>{customer.phone_number}</td>
                    <td>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteClick(customer.id)}
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

        {/* Customer Form */}
        <div className="form-card">
          <h3>Add New Customer</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="cust-name">Full Name *</label>
              <input
                id="cust-name"
                type="text"
                placeholder="e.g. Jane Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="cust-email">Email Address *</label>
              <input
                id="cust-email"
                type="email"
                placeholder="e.g. jane.doe@example.com"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="cust-phone">Phone Number *</label>
              <input
                id="cust-phone"
                type="text"
                placeholder="e.g. +1-555-0199"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Add Customer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CustomerManagement;
