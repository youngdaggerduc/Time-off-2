import React, { useState } from 'react';
import axios from 'axios';

function TimeOffRequest({ user }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        'http://localhost:5000/api/timeoff/request',
        { startDate, endDate, reason },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      alert('Time off request submitted');
      setStartDate('');
      setEndDate('');
      setReason('');
    } catch (error) {
      alert('Request failed');
    }
  };

  return (
    <div className="form-container">
      <h2>Request Time Off</h2>
      <form onSubmit={handleSubmit}>
        <label>Start Date</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />
        <label>End Date</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
        />
        <label>Reason</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for time off"
        />
        <button type="submit">Submit Request</button>
      </form>
    </div>
  );
}

export default TimeOffRequest;