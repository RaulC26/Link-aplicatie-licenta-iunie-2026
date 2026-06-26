import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const DAY_NAMES = ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm']

function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function toDateStr(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function DatePickerBar({ selectedDate, onChange }) {
  const today = getToday()

  const [weekStart, setWeekStart] = useState(() => {
    if (selectedDate) {
      const sel = new Date(selectedDate + 'T12:00:00')
      sel.setHours(0, 0, 0, 0)
      if (sel > today) return sel
    }
    return today
  })

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  function prevWeek() {
    const newStart = addDays(weekStart, -7)
    setWeekStart(newStart < today ? today : newStart)
  }

  function nextWeek() {
    const newStart = addDays(weekStart, 7)
    const maxDate = addDays(today, 60)
    if (newStart > maxDate) return
    setWeekStart(newStart)
  }

  const canGoPrev = toDateStr(weekStart) > toDateStr(today)

  return (
    <div className="datepicker-bar">
      <button
        className="datepicker-nav"
        onClick={prevWeek}
        disabled={!canGoPrev}
        title="Săptămâna anterioară"
      >
        <ChevronLeft size={17} strokeWidth={2.5} />
      </button>

      <div className="datepicker-days">
        {days.map(day => {
          const dateStr   = toDateStr(day)
          const isToday   = dateStr === toDateStr(today)
          const isPast    = day < today
          const isSelected = dateStr === selectedDate
          const dayName   = DAY_NAMES[day.getDay()]
          const dayNum    = String(day.getDate()).padStart(2, '0')
          const monthNum  = String(day.getMonth() + 1).padStart(2, '0')

          let cls = 'datepicker-day'
          if (isSelected) cls += ' datepicker-day-selected'
          else if (isToday) cls += ' datepicker-day-today'
          if (isPast)     cls += ' datepicker-day-past'

          return (
            <button
              key={dateStr}
              className={cls}
              onClick={() => !isPast && onChange(dateStr)}
              disabled={isPast}
              title={`${dayName} ${dayNum}.${monthNum}`}
            >
              <span className="dp-day-name">{dayName}</span>
              <span className="dp-day-date">{dayNum}.{monthNum}</span>
              {isToday && <span className="dp-day-label">astăzi</span>}
            </button>
          )
        })}
      </div>

      <button
        className="datepicker-nav"
        onClick={nextWeek}
        title="Săptămâna următoare"
      >
        <ChevronRight size={17} strokeWidth={2.5} />
      </button>
    </div>
  )
}

export default DatePickerBar
