import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import axios from 'axios';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './Calendar.css';

const locales = { 'en-US': require('date-fns/locale/en-US') };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales
});

const CalendarView = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  const fetchRequests = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/timeoff/requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const calendarEvents = res.data.map(req => ({
        id: req._id,
        title: `${req.userId?.name || req.employeeName} (${req.status})`,
        start: new Date(req.startDate),
        end: new Date(req.endDate),
        details: req
      }));
      setEvents(calendarEvents);
    } catch (err) {
      console.error('Fetch requests error:', err);
      setError('Failed to fetch requests');
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event.details);
  };

  return (
    <div className="calendar-container">
      <h2>Fayad's Time-Off Calendar</h2>
      {error && <p className="error">{error}</p>}
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        onSelectEvent={handleSelectEvent}
        className="rbc-calendar"
      />
      {selectedEvent && (
        <div className="event-details">
          <h3>Request Details</h3>
          <p><strong>Name:</strong> {selectedEvent.userId?.name || selectedEvent.employeeName}</p>
          <p><strong>Dates:</strong> {new Date(selectedEvent.startDate).toLocaleDateString()} to {new Date(selectedEvent.endDate).toLocaleDateString()}</p>
          <p><strong>Reason:</strong> {selectedEvent.reason}</p>
          <p><strong>Status:</strong> {selectedEvent.status}</p>
          <button onClick={() => setSelectedEvent(null)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default CalendarView;