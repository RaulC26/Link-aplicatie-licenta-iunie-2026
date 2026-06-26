import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar, ChevronDown } from "lucide-react";

const MONTHS = [
  "Ianuarie",
  "Februarie",
  "Martie",
  "Aprilie",
  "Mai",
  "Iunie",
  "Iulie",
  "August",
  "Septembrie",
  "Octombrie",
  "Noiembrie",
  "Decembrie",
];

const WEEKDAYS = ["Lu", "Ma", "Mi", "Jo", "Vi", "Sâ", "Du"];

function AdminDatePicker({
  value,
  onChange,
  min,
  max,
  placeholder = "Selectează data",
}) {
  const [open, setOpen] = useState(false);

  const [viewYear, setViewYear] = useState(() => {
    if (value) return parseInt(value.substring(0, 4));
    return new Date().getFullYear();
  });
  const [viewMonth, setViewMonth] = useState(() => {
    if (value) return parseInt(value.substring(5, 7)) - 1;
    return new Date().getMonth();
  });

  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleOutsideClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    if (value) {
      setViewYear(parseInt(value.substring(0, 4)));
      setViewMonth(parseInt(value.substring(5, 7)) - 1);
    }
  }, [value]);

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  }

  function buildDateStr(day) {
    return `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function isDisabled(dateStr) {
    if (min && dateStr < min) return true;
    if (max && dateStr > max) return true;
    return false;
  }

  function selectDay(day) {
    const dateStr = buildDateStr(day);
    if (isDisabled(dateStr)) return;
    onChange(dateStr);
    setOpen(false);
  }

  const firstDayJS = new Date(viewYear, viewMonth, 1).getDay();
  const firstDayMon = firstDayJS === 0 ? 6 : firstDayJS - 1;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDayMon; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const _now = new Date();
  const todayStr = `${_now.getFullYear()}-${String(_now.getMonth() + 1).padStart(2, "0")}-${String(_now.getDate()).padStart(2, "0")}`;

  function formatDisplay(val) {
    if (!val) return "";
    const d = new Date(val + "T12:00:00");
    return d.toLocaleDateString("ro-RO", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  return (
    <div className="adp-wrapper" ref={wrapperRef}>
      <div
        className={`adp-input${open ? " adp-input-open" : ""}`}
        onClick={() => setOpen((o) => !o)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setOpen((o) => !o)}
      >
        <Calendar size={15} strokeWidth={2.5} className="adp-icon" />
        <span className={value ? "adp-value" : "adp-placeholder"}>
          {value ? formatDisplay(value) : placeholder}
        </span>
        <ChevronDown
          size={14}
          strokeWidth={2.5}
          className={`adp-chevron${open ? " adp-chevron-open" : ""}`}
        />
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="adp-popup"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <div className="adp-header">
              <button type="button" className="adp-nav-btn" onClick={prevMonth}>
                <ChevronLeft size={16} strokeWidth={2.5} />
              </button>
              <span className="adp-month-label">
                {MONTHS[viewMonth]} {viewYear}
              </span>
              <button type="button" className="adp-nav-btn" onClick={nextMonth}>
                <ChevronRight size={16} strokeWidth={2.5} />
              </button>
            </div>

            <div className="adp-weekdays">
              {WEEKDAYS.map((wd) => (
                <span key={wd} className="adp-weekday">
                  {wd}
                </span>
              ))}
            </div>

            <div className="adp-grid">
              {cells.map((day, i) => {
                if (!day)
                  return <span key={`e-${i}`} className="adp-cell-empty" />;

                const dateStr = buildDateStr(day);
                const disabled = isDisabled(dateStr);
                const isToday = dateStr === todayStr;
                const isSelected = dateStr === value;
                const isPast = min && dateStr < min;

                let cls = "adp-day";
                if (disabled) cls += " adp-day-disabled";
                if (isPast) cls += " adp-day-past";
                if (isToday && !isSelected) cls += " adp-day-today";
                if (isSelected) cls += " adp-day-selected";

                return (
                  <button
                    key={day}
                    type="button"
                    className={cls}
                    onClick={() => selectDay(day)}
                    disabled={disabled}
                    title={disabled ? "Dată indisponibilă" : undefined}
                  >
                    {day}
                    {isToday && <span className="adp-today-dot" />}
                  </button>
                );
              })}
            </div>

            {!isDisabled(todayStr) && (
              <div className="adp-footer">
                <button
                  type="button"
                  className="adp-today-btn"
                  onClick={() => {
                    onChange(todayStr);
                    setOpen(false);
                  }}
                >
                  Astăzi
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdminDatePicker;
