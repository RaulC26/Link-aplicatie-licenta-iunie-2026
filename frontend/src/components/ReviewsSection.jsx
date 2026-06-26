import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { API_URL } from '../utils/api'
import { getToken, isLoggedIn, getUserFromToken } from '../utils/auth'
import { useToast } from '../context/ToastContext'

function StarRating({ value, onChange, readonly = false }) {
 const [hovered, setHovered] = useState(0)

 return (
 <div className="star-rating" onMouseLeave={() => !readonly && setHovered(0)}>
 {[1, 2, 3, 4, 5].map(star => (
 <button
 key={star}
 type="button"
 className={`star-btn ${readonly ? 'star-readonly' : ''}`}
 onClick={() => !readonly && onChange && onChange(star)}
 onMouseEnter={() => !readonly && setHovered(star)}
 disabled={readonly}
 aria-label={`${star} stele`}
 >
 <Star
 size={readonly ? 16 : 28}
 fill={(hovered || value) >= star ? '#f59e0b' : 'none'}
 stroke={(hovered || value) >= star ? '#f59e0b' : '#d1d5db'}
 strokeWidth={1.5}
 />
 </button>
 ))}
 </div>
 )
}

function RatingLabel({ rating }) {
 const labels = { 1: 'Foarte slab', 2: 'Slab', 3: 'Bun', 4: 'Foarte bun', 5: 'Excelent' }
 if (!rating) return null
 return <span className="rating-label">{labels[rating]}</span>
}

function ReviewsSection({ fieldId }) {
 const { showToast } = useToast()

 const [reviews, setReviews] = useState([])
 const [avgRating, setAvgRating] = useState(null)
 const [totalReviews, setTotalReviews] = useState(0)
 const [loading, setLoading] = useState(true)

 const [rating, setRating] = useState(0)
 const [comment, setComment] = useState('')
 const [submitting, setSubmitting] = useState(false)
 const [formError, setFormError] = useState('')

 const [isEditing, setIsEditing] = useState(false)

 const currentUser = getUserFromToken()
 const currentUserId = currentUser ? currentUser.userId : null

 async function loadReviews() {
 try {
 const res = await fetch(`${API_URL}/reviews/field/${fieldId}`)
 const data = await res.json()
 if (res.ok) {
 setReviews(data.reviews)
 setAvgRating(data.avg_rating)
 setTotalReviews(data.total_reviews)


 
 if (currentUserId) {
 const myReview = data.reviews.find(r => r.user_id === currentUserId)
 if (myReview) {
 setRating(myReview.rating)
 setComment(myReview.comment || '')
 setIsEditing(true)
 } else {
 setIsEditing(false)
 }
 }
 }
 } catch {
 } finally {
 setLoading(false)
 }
 }

 useEffect(() => { loadReviews() }, [fieldId])

 async function handleSubmit(e) {
 e.preventDefault()
 setFormError('')

 if (rating === 0) { setFormError('Te rugăm să selectezi un rating.'); return }

 setSubmitting(true)
 try {
 const res = await fetch(`${API_URL}/reviews/field/${fieldId}`, {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 'Authorization': 'Bearer ' + getToken()
 },
 body: JSON.stringify({ rating, comment })
 })
 const data = await res.json()
 if (!res.ok) { setFormError(data.mesaj || 'Eroare la trimitere.'); return }

 showToast(isEditing ? 'Recenzie actualizată! ' : 'Recenzie salvată! ', 'success')
 loadReviews()
 } catch {
 setFormError('Eroare de conexiune. Încearcă din nou.')
 } finally {
 setSubmitting(false)
 }
 }

 function formatDate(dateStr) {
 return new Date(dateStr).toLocaleDateString('ro-RO', {
 day: 'numeric', month: 'long', year: 'numeric'
 })
 }

 function getRatingCount(star) {
 return reviews.filter(r => r.rating === star).length
 }

 return (
 <div className="reviews-section">
 <div className="reviews-header">
 <h2>Recenzii teren</h2>
 </div>

 {totalReviews > 0 && (
 <div className="reviews-summary">
 <div className="reviews-score-box">
 <div className="reviews-big-score">{avgRating}</div>
 <StarRating value={Math.round(avgRating)} readonly />
 <p className="reviews-score-count">{totalReviews} {totalReviews === 1 ? 'recenzie' : 'recenzii'}</p>
 </div>

 <div className="reviews-distribution">
 {[5, 4, 3, 2, 1].map(star => {
 const count = getRatingCount(star)
 const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0
 return (
 <div key={star} className="reviews-dist-row">
 <span className="reviews-dist-label">{star} </span>
 <div className="reviews-dist-bar-bg">
 <div
 className="reviews-dist-bar-fill"
 style={{ width: `${pct}%` }}
 />
 </div>
 <span className="reviews-dist-count">{count}</span>
 </div>
 )
 })}
 </div>
 </div>
 )}

 {isLoggedIn() ? (
 isEditing ? (
 <div className="review-already-sent">Ai trimis deja o recenzie pentru acest teren.
 </div>
 ) : (
 <form className="review-form" onSubmit={handleSubmit}>
 <h3 className="review-form-title">Lasă o recenzie</h3>

 <div className="review-form-row">
 <label className="review-form-label">Rating *</label>
 <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
 <StarRating value={rating} onChange={setRating} />
 <RatingLabel rating={rating} />
 </div>
 </div>

 <div className="review-form-row">
 <label className="review-form-label">Comentariu (opțional)</label>
 <textarea
 className="review-textarea"
 value={comment}
 onChange={e => setComment(e.target.value)}
 placeholder="Descrie experiența ta pe acest teren..."
 maxLength={1000}
 rows={3}
 />
 <span className="review-char-count">{comment.length}/1000</span>
 </div>

 {formError && (
 <p className="review-form-error"> {formError}</p>
 )}

 <button
 type="submit"
 className="btn-primary"
 disabled={submitting || rating === 0}
 >
 {submitting ? 'Se trimite...' : ' Trimite recenzia'}
 </button>
 </form>
 )
 ) : (
 <div className="review-login-prompt">
 <p> <a href="/login">Autentifică-te</a>pentru a lăsa o recenzie.</p>
 <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>Poți recenza doar terenuri pe care le-ai rezervat și plătit.
 </p>
 </div>
 )}

 <div className="reviews-list">
 {loading ? (
 [1, 2].map(i => (
 <div key={i} className="review-card">
 <div className="skeleton" style={{ height: 16, width: '40%', borderRadius: 8, marginBottom: 8 }} />
 <div className="skeleton" style={{ height: 12, width: '20%', borderRadius: 8, marginBottom: 10 }} />
 <div className="skeleton" style={{ height: 14, width: '80%', borderRadius: 8 }} />
 </div>
 ))
 ) : reviews.length === 0 ? (
 <div className="reviews-empty">
 <p>Fii primul care lasă o recenzie pentru acest teren!</p>
 </div>
 ) : (
 <AnimatePresence>
 {reviews.map(review => (
 <motion.div
 key={review.id}
 className={`review-card ${review.user_id === currentUserId ? 'review-card-mine' : ''}`}
 initial={{ opacity: 0, y: 16 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.3 }}
 >
 <div className="review-card-header">
 <div>
 <div className="review-avatar">
 {review.user_name ? review.user_name[0].toUpperCase() : '?'}
 </div>
 </div>
 <div style={{ flex: 1 }}>
 <div className="review-card-user">
 {review.user_name || 'Utilizator anonim'}
 {review.user_id === currentUserId && (
 <span className="review-mine-badge">Tu</span>
 )}
 </div>
 <div className="review-card-date">{formatDate(review.created_at)}</div>
 </div>
 <StarRating value={review.rating} readonly />
 </div>

 {review.comment && (
 <p className="review-card-comment">"{review.comment}"</p>
 )}
 </motion.div>
 ))}
 </AnimatePresence>
 )}
 </div>
 </div>
 )
}

export default ReviewsSection
