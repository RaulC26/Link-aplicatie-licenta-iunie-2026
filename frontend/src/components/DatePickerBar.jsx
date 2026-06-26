import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// Denumiri scurte ale zilelor în română (0 = Duminică, 1 = Luni, ...)
const DAY_NAMES = ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm']

// Adaugă N zile la un obiect Date și returnează un nou Date
function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

// Convertește un Date în string YYYY-MM-DD fără offset de timezone
// Edge case: new Date().toISOString() poate returna ziua anterioară din cauza timezone-ului
function toDateStr(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Returnează data curentă la miezul nopții (fără ore, minute, secunde)
function getToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

// Bara de selectare dată — stilul Booksport, arată 7 zile cu navigație stânga/dreapta
// Props:
//   selectedDate = string YYYY-MM-DD (ziua selectată)
//   onChange     = callback(dateStr) apelat când userul selectează o zi
function DatePickerBar({ selectedDate, onChange }) {
  const today = getToday()

  // weekStart = prima zi vizibilă în bara (implicit: azi)
  // Edge case: dacă selectedDate e în viitor, pornim săptămâna de la acea zi
  const [weekStart, setWeekStart] = useState(() => {
    if (selectedDate) {
      const sel = new Date(selectedDate + 'T12:00:00')
      sel.setHours(0, 0, 0, 0)
      // Dacă ziua selectată e după azi, afișăm de acolo
      if (sel > today) return sel
    }
    return today
  })

  // Generăm 7 zile consecutive pornind de la weekStart
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  // Mergem cu 7 zile înapoi — nu mai departe de azi
  function prevWeek() {
    const newStart = addDays(weekStart, -7)
    // Edge case: nu permitem navigarea în trecut față de azi
    setWeekStart(newStart < today ? today : newStart)
  }

  // Mergem cu 7 zile înainte — maxim 60 de zile în viitor
  function nextWeek() {
    const newStart = addDays(weekStart, 7)
    const maxDate = addDays(today, 60)
    // Edge case: nu permitem mai mult de 60 de zile în avans
    if (newStart > maxDate) return
    setWeekStart(newStart)
  }

  // Butonul de navigare înapoi e dezactivat dacă am ajuns la azi
  const canGoPrev = toDateStr(weekStart) > toDateStr(today)

  return (
    <div className="datepicker-bar">
      {/* Buton navigare înapoi */}
      <button
        className="datepicker-nav"
        onClick={prevWeek}
        disabled={!canGoPrev}
        title="Săptămâna anterioară"
      >
        <ChevronLeft size={17} strokeWidth={2.5} />
      </button>

      {/* Grid de 7 zile */}
      <div className="datepicker-days">
        {days.map(day => {
          const dateStr   = toDateStr(day)
          const isToday   = dateStr === toDateStr(today)
          // Edge case: zilele înainte de azi sunt dezactivate — nu se pot rezerva în trecut
          const isPast    = day < today
          const isSelected = dateStr === selectedDate
          const dayName   = DAY_NAMES[day.getDay()]
          const dayNum    = String(day.getDate()).padStart(2, '0')
          const monthNum  = String(day.getMonth() + 1).padStart(2, '0')

          // Construim clasele CSS dinamic
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
              {/* Numele zilei (Lun, Mar, ...) */}
              <span className="dp-day-name">{dayName}</span>
              {/* Data în format DD.MM */}
              <span className="dp-day-date">{dayNum}.{monthNum}</span>
              {/* Label "astăzi" apare sub data curentă */}
              {isToday && <span className="dp-day-label">astăzi</span>}
            </button>
          )
        })}
      </div>

      {/* Buton navigare înainte */}
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
