import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal, X, ArrowUpDown } from 'lucide-react'
import { API_URL } from '../utils/api'
import FieldCard from './FieldCard'
import ErrorMessage from './ErrorMessage'
import { SkeletonFieldCard } from './Skeleton'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } }
}
const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.34, 1.56, 0.64, 1] } }
}

function FieldsList() {
  const [fields, setFields] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('default') 
  const [maxPrice, setMaxPrice] = useState('')

  useEffect(() => {
    async function loadFields() {
      try {
        const response = await fetch(API_URL + '/fields')
        const data = await response.json()
        setFields(data)
      } catch {
        setError('Nu s-au putut încărca terenurile. Verifică că backend-ul rulează.')
      } finally {
        setLoading(false)
      }
    }
    loadFields()
  }, [])

  if (loading) return (
    <div className="fields-list">
      {[1, 2, 3].map(i => <SkeletonFieldCard key={i} />)}
    </div>
  )

  if (error) return <ErrorMessage message={error} />

  let filtered = [...fields]

  if (search.trim()) {
    const q = search.trim().toLowerCase()
    filtered = filtered.filter(f =>
      f.name.toLowerCase().includes(q) ||
      f.location.toLowerCase().includes(q)
    )
  }

  if (maxPrice !== '') {
    filtered = filtered.filter(f => parseFloat(f.price_per_hour) <= parseFloat(maxPrice))
  }

  if (sortBy === 'price_asc') {
    filtered.sort((a, b) => parseFloat(a.price_per_hour) - parseFloat(b.price_per_hour))
  } else if (sortBy === 'price_desc') {
    filtered.sort((a, b) => parseFloat(b.price_per_hour) - parseFloat(a.price_per_hour))
  }

  const hasFilters = search.trim() || maxPrice !== '' || sortBy !== 'default'

  function resetFilters() {
    setSearch('')
    setMaxPrice('')
    setSortBy('default')
  }

  const maxFieldPrice = Math.max(...fields.map(f => parseFloat(f.price_per_hour)), 0)

  return (
    <div>
      <div className="fields-filter-bar">

        <div className="fields-search-wrapper">
          <Search size={16} strokeWidth={2.5} className="fields-search-icon" />
          <input
            className="fields-search-input"
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Caută după nume sau locație..."
          />

          {search && (
            <button className="fields-search-clear" onClick={() => setSearch('')}>
              <X size={14} strokeWidth={2.5} />
            </button>
          )}
        </div>

        <div className="fields-filter-group">
          <SlidersHorizontal size={15} strokeWidth={2.5} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            className="fields-price-input"
            type="number"
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
            placeholder={`Max preț (${maxFieldPrice} lei)`}
            min={0}
          />
        </div>

        <div className="fields-filter-group">
          <ArrowUpDown size={15} strokeWidth={2.5} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <select
            className="fields-sort-select"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="default">Sortare implicită</option>
            <option value="price_asc">Preț: mic → mare</option>
            <option value="price_desc">Preț: mare → mic</option>
          </select>
        </div>

        {hasFilters && (
          <button className="fields-reset-btn" onClick={resetFilters}>
            <X size={14} strokeWidth={2.5} /> Resetează
          </button>
        )}
      </div>

      {hasFilters && (
        <p className="fields-results-count">
          {filtered.length === 0
            ? 'Niciun teren găsit'
            : `${filtered.length} teren${filtered.length !== 1 ? 'uri' : ''} găsite`}
        </p>
      )}

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p style={{ fontSize: '2.5rem' }}>🔍</p>
          <h3>Niciun teren nu corespunde filtrelor</h3>
          <p style={{ marginBottom: '16px' }}>Încearcă să modifici criteriile de căutare.</p>
          <button className="btn-secondary" onClick={resetFilters}>Resetează filtrele</button>
        </div>
      ) : (
        <motion.div
          className="fields-list"
          key={sortBy + search + maxPrice} 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filtered.map(field => (
            <motion.div
              key={field.id}
              variants={cardVariants}
              whileHover={{ y: -8, transition: { duration: 0.22, ease: 'easeOut' } }}
            >
              <FieldCard field={field} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}

export default FieldsList
