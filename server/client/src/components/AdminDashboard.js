import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [employeeName, setEmployeeName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [status, setStatus] = useState('approved');
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  const fetchRequests = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/timeoff/requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(res.data);
    } catch (err) {
      console.error('Fetch requests error:', err);
      setError('Failed to fetch requests');
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id, action) => {
    try {
      const res = await axios.patch(
        `http://localhost:5000/api/timeoff/${id}/${action}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Request ${action}ed`);
      fetchRequests();
    } catch (err) {
      console.error(`${action} error:`, err);
      alert(`Failed to ${action} request: ${err.response?.data?.message || 'Unknown error'}`);
    }
  };

  const handleAddTimeOff = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        'http://localhost:5000/api/timeoff/add',
        { employeeName, startDate, endDate, reason, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Time-off added');
      setEmployeeName('');
      setStartDate('');
      setEndDate('');
      setReason('');
      setStatus('approved');
      fetchRequests();
    } catch (err) {
      console.error('Add time-off error:', err);
      alert(`Failed to add time-off: ${err.response?.data?.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="admin-container">
      <h2>Admin Dashboard</h2>
      {error && <p className="error">{error}</p>}
      <h3>Add Time-Off</h3>
      <form onSubmit={handleAddTimeOff}>
        <div>
          <label>Employee Name:</label>
          <input
            type="text"
            value={employeeName}
            onChange={(e) => setEmployeeName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label>End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Reason:</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Status:</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <button type="submit">Add Time-Off</button>
      </form>
      <h3>Pending Requests</h3>
      <ul>
        {requests.filter(req => req.status === 'pending').map((req) => (
          <li key={req._id}>
            <p>
              {req.userId?.name || req.employeeName}: {new Date(req.startDate).toLocaleDateString()} to {new Date(req.endDate).toLocaleDateString()} - {req.reason}
            </p>
            <button onClick={() => handleAction(req._id, 'approve')}>Approve</button>
            <button onClick={() => handleAction(req._id, 'reject')}>Reject</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminDashboard;