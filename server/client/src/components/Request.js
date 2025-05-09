import React, { useState, useEffect } from 'react';
   import axios from 'axios';
   import './Request.css';

   const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

   const Request = () => {
     const [startDate, setStartDate] = useState('');
     const [endDate, setEndDate] = useState('');
     const [reason, setReason] = useState('');
     const [requests, setRequests] = useState([]);
     const [error, setError] = useState('');

     const token = localStorage.getItem('token');

     const fetchRequests = async () => {
       try {
         const res = await axios.get(`${API_URL}/api/timeoff/requests`, {
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

     const handleSubmit = async (e) => {
       e.preventDefault();
       try {
         await axios.post(
           `${API_URL}/api/timeoff/request`,
           { startDate, endDate, reason },
           { headers: { Authorization: `Bearer ${token}` } }
         );
         alert('Request submitted');
         setStartDate('');
         setEndDate('');
         setReason('');
         fetchRequests();
       } catch (err) {
         console.error('Submit request error:', err);
         alert(`Failed to submit request: ${err.response?.data?.message || 'Unknown error'}`);
       }
     };

     return (
       <div className="request-container">
         <h2>Submit Time-Off Request</h2>
         {error && <p className="error">{error}</p>}
         <form onSubmit={handleSubmit}>
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
           <button type="submit">Submit Request</button>
         </form>
         <h3>Your Requests</h3>
         <ul>
           {requests.map((req) => (
             <li key={req._id}>
               {req.startDate.split('T')[0]} to {req.endDate.split('T')[0]} - {req.reason} - Status: {req.status}
             </li>
           ))}
         </ul>
       </div>
     );
   };

   export default Request;