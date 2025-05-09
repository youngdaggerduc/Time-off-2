import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import axios from 'axios';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

function CalendarView() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchTimeOffs = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/timeoff/calendar', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const calendarEvents = res.data.map((timeOff) => ({
          title: `${timeOff.userId.name} - Off`,
          start: new Date(timeOff.startDate),
          end: new Date(timeOff.endDate),
        }));
        setEvents(calendarEvents);
      } catch (error) {
        alert('Failed to load calendar');
      }
    };
    fetchTimeOffs();
  }, []);

  return (
    <div className="calendar-container">
      <h2>Team Time Off Calendar</h2>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
      />
    </div>
  );
}

export default CalendarView;