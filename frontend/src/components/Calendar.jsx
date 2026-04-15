import React from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

export const Calendar = ({ activities = [] }) => {
  const events = activities.map((activity) => ({
    id: activity.id,
    title: activity.title,
    start: activity.planned_date,
    extendedProps: {
      status: activity.status,
      description: activity.description,
    },
    backgroundColor: activity.status === 'COMPLETED' ? '#10b981' : '#3b82f6',
  }))

  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-4">Calendar</h3>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek'
        }}
        events={events}
        height="auto"
      />
    </div>
  )
}

export default Calendar
