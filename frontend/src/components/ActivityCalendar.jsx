import React, { useEffect, useMemo, useState } from 'react'
import {
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  isToday,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { activityService } from '../services'

const asList = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.results)) return payload.results
  return []
}

const CATEGORY_RULES = [
  { key: 'presentation', label: 'Presentation', pattern: /presentation|defen[cs]e|seminar|viva/i },
  { key: 'document', label: 'Document', pattern: /document|upload|submit|proposal|thesis|transcript|minutes/i },
  { key: 'review', label: 'Review', pattern: /review|approve|approval|feedback|correction/i },
  { key: 'meeting', label: 'Meeting', pattern: /meeting|consult|supervisor|appointment/i },
  { key: 'research', label: 'Research', pattern: /research|data|field|analysis|experiment/i },
]

const getCategory = (activity) => {
  const source = `${activity.title || ''} ${activity.description || ''}`
  return CATEGORY_RULES.find((rule) => rule.pattern.test(source)) || {
    key: 'planning',
    label: 'Planning',
  }
}

const getPriority = (activity) => {
  if (activity.status === 'COMPLETED') return { key: 'done', label: 'Done' }

  const today = startOfDay(new Date())
  const planned = startOfDay(new Date(activity.planned_date))
  const daysAway = Math.ceil((planned - today) / (1000 * 60 * 60 * 24))

  if (daysAway < 0) return { key: 'overdue', label: 'Overdue' }
  if (daysAway <= 2) return { key: 'high', label: 'High' }
  if (daysAway <= 7) return { key: 'medium', label: 'Medium' }
  return { key: 'normal', label: 'Normal' }
}

const groupActivitiesByDate = (activities) => {
  return activities.reduce((groups, activity) => {
    const dateKey = format(new Date(activity.planned_date), 'yyyy-MM-dd')
    return {
      ...groups,
      [dateKey]: [...(groups[dateKey] || []), activity],
    }
  }, {})
}

const getRelativeDateLabel = (date) => {
  if (isToday(date)) return 'Today'
  const tomorrow = startOfDay(new Date())
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (isSameDay(date, tomorrow)) return 'Tomorrow'
  return format(date, 'EEE, MMM d')
}

export const ActivityCalendar = ({ stageId, refreshKey = 0 }) => {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('month')
  const [cursorDate, setCursorDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [message, setMessage] = useState('')

  const fetchActivities = async () => {
    setLoading(true)
    try {
      const response = await activityService.getCalendar(stageId)
      const data = asList(response.data).sort(
        (a, b) => new Date(a.planned_date) - new Date(b.planned_date)
      )
      setActivities(data)
      setMessage('')
    } catch {
      setMessage('Activities could not be loaded right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivities()
  }, [stageId, refreshKey])

  const enrichedActivities = useMemo(() => {
    return activities.map((activity) => ({
      ...activity,
      category: getCategory(activity),
      priority: getPriority(activity),
    }))
  }, [activities])

  const activitiesByDate = useMemo(() => groupActivitiesByDate(enrichedActivities), [enrichedActivities])

  const monthDays = useMemo(() => {
    const monthStart = startOfMonth(cursorDate)
    const monthEnd = endOfMonth(cursorDate)
    return eachDayOfInterval({
      start: startOfWeek(monthStart, { weekStartsOn: 1 }),
      end: endOfWeek(monthEnd, { weekStartsOn: 1 }),
    })
  }, [cursorDate])

  const selectedActivities = useMemo(() => {
    const key = format(selectedDate, 'yyyy-MM-dd')
    return activitiesByDate[key] || []
  }, [activitiesByDate, selectedDate])

  const upcomingActivities = useMemo(() => {
    const today = startOfDay(new Date())
    return enrichedActivities
      .filter((activity) => activity.status !== 'COMPLETED')
      .filter((activity) => !isBefore(new Date(activity.planned_date), today))
      .slice(0, 8)
  }, [enrichedActivities])

  const stats = useMemo(() => {
    const today = startOfDay(new Date())
    return {
      total: enrichedActivities.length,
      overdue: enrichedActivities.filter(
        (activity) => activity.status !== 'COMPLETED' && isBefore(new Date(activity.planned_date), today)
      ).length,
      nextSeven: enrichedActivities.filter((activity) => {
        const date = new Date(activity.planned_date)
        return activity.status !== 'COMPLETED' && !isBefore(date, today) && isBefore(date, addWeeks(today, 1))
      }).length,
      completed: enrichedActivities.filter((activity) => activity.status === 'COMPLETED').length,
    }
  }, [enrichedActivities])

  const handleMarkDone = async (activityId) => {
    try {
      await activityService.markDone(activityId)
      await fetchActivities()
    } catch (error) {
      setMessage('Could not mark this activity as complete.')
    }
  }

  const moveCalendar = (direction) => {
    const nextDate = view === 'month'
      ? addMonths(cursorDate, direction)
      : addWeeks(cursorDate, direction)
    setCursorDate(nextDate)
  }

  const resetToToday = () => {
    const today = new Date()
    setCursorDate(today)
    setSelectedDate(today)
  }

  const renderActivityCard = (activity, compact = false) => (
    <article
      key={activity.id}
      className={`activity-card ${compact ? 'is-compact' : ''}`}
      data-category={activity.category.key}
      data-priority={activity.priority.key}
    >
      <div className="activity-card__stripe" />
      <div className="activity-card__body">
        <div className="activity-card__header">
          <div>
            <p className="activity-card__title">{activity.title}</p>
            {!compact && activity.description && (
              <p className="activity-card__description">{activity.description}</p>
            )}
          </div>
          <span className={`activity-priority activity-priority--${activity.priority.key}`}>
            {activity.priority.label}
          </span>
        </div>
        <div className="activity-card__meta">
          <span>{format(new Date(activity.planned_date), 'p')}</span>
          <span>{activity.category.label}</span>
          <span>{activity.status === 'COMPLETED' ? 'Completed' : 'Planned'}</span>
        </div>
        {activity.status !== 'COMPLETED' && !compact && (
          <button
            type="button"
            className="btn-secondary activity-card__action"
            onClick={() => handleMarkDone(activity.id)}
          >
            Mark done
          </button>
        )}
      </div>
    </article>
  )

  if (loading) {
    return (
      <section className="activity-calendar surface-elevated">
        <div className="activity-calendar__loading">
          <p>Loading activity calendar...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="activity-calendar surface-elevated">
      <div className="activity-calendar__header">
        <div>
          <p className="activity-calendar__eyebrow">Planning workspace</p>
          <h3>Activity Calendar</h3>
          <p className="activity-calendar__subtitle">
            Prioritized milestones, deadlines, and academic tasks in one clean view.
          </p>
        </div>
        <div className="activity-calendar__toolbar" aria-label="Calendar controls">
          <div className="segmented-control">
            <button type="button" className={view === 'month' ? 'is-active' : ''} onClick={() => setView('month')}>Month</button>
            <button type="button" className={view === 'agenda' ? 'is-active' : ''} onClick={() => setView('agenda')}>Agenda</button>
          </div>
          <div className="activity-calendar__nav">
            <button type="button" className="btn-secondary" onClick={() => moveCalendar(-1)}>Prev</button>
            <button type="button" className="btn-secondary" onClick={resetToToday}>Today</button>
            <button type="button" className="btn-secondary" onClick={() => moveCalendar(1)}>Next</button>
          </div>
        </div>
      </div>

      {message && <div className="alert-warning">{message}</div>}

      <div className="activity-calendar__stats" aria-label="Activity summary">
        <div>
          <span>Total</span>
          <strong>{stats.total}</strong>
        </div>
        <div>
          <span>Next 7 days</span>
          <strong>{stats.nextSeven}</strong>
        </div>
        <div>
          <span>Overdue</span>
          <strong>{stats.overdue}</strong>
        </div>
        <div>
          <span>Completed</span>
          <strong>{stats.completed}</strong>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="activity-calendar__empty">
          <h4>No activities scheduled</h4>
          <p>Add your first planned activity to start building a clear timeline for this stage.</p>
        </div>
      ) : view === 'month' ? (
        <div className="activity-calendar__layout">
          <div className="month-board" aria-label={`Month view for ${format(cursorDate, 'MMMM yyyy')}`}>
            <div className="month-board__title">
              <h4>{format(cursorDate, 'MMMM yyyy')}</h4>
              <div className="activity-legend">
                {CATEGORY_RULES.slice(0, 4).map((category) => (
                  <span key={category.key} data-category={category.key}>{category.label}</span>
                ))}
              </div>
            </div>
            <div className="month-board__weekdays">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => <span key={day}>{day}</span>)}
            </div>
            <div className="month-board__grid">
              {monthDays.map((day) => {
                const key = format(day, 'yyyy-MM-dd')
                const dayActivities = activitiesByDate[key] || []
                return (
                  <button
                    key={key}
                    type="button"
                    className={`month-day ${isSameMonth(day, cursorDate) ? '' : 'is-muted'} ${isToday(day) ? 'is-today' : ''} ${isSameDay(day, selectedDate) ? 'is-selected' : ''}`}
                    onClick={() => setSelectedDate(day)}
                  >
                    <span className="month-day__number">{format(day, 'd')}</span>
                    <span className="month-day__dots">
                      {dayActivities.slice(0, 4).map((activity) => (
                        <span key={activity.id} data-category={activity.category.key} />
                      ))}
                    </span>
                    {dayActivities.length > 4 && <span className="month-day__more">+{dayActivities.length - 4}</span>}
                  </button>
                )
              })}
            </div>
          </div>

          <aside className="activity-side-panel">
            <div>
              <p className="activity-calendar__eyebrow">Selected day</p>
              <h4>{format(selectedDate, 'EEEE, MMMM d')}</h4>
            </div>
            <div className="activity-side-panel__list">
              {selectedActivities.length === 0 ? (
                <p className="activity-calendar__muted">No activities for this day.</p>
              ) : (
                selectedActivities.map((activity) => renderActivityCard(activity))
              )}
            </div>

            <div className="activity-upcoming">
              <p className="activity-calendar__eyebrow">Upcoming</p>
              {upcomingActivities.length === 0 ? (
                <p className="activity-calendar__muted">No upcoming planned activities.</p>
              ) : (
                upcomingActivities.map((activity) => renderActivityCard(activity, true))
              )}
            </div>
          </aside>
        </div>
      ) : (
        <div className="agenda-list">
          {enrichedActivities.map((activity) => {
            const date = new Date(activity.planned_date)
            return (
              <div key={activity.id} className="agenda-row">
                <div className="agenda-row__date">
                  <strong>{getRelativeDateLabel(date)}</strong>
                  <span>{format(date, 'MMM d, yyyy')}</span>
                </div>
                {renderActivityCard(activity)}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
