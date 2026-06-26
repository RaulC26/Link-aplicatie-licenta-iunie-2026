import { Link } from 'react-router-dom'
import { MapPin, ArrowRight } from 'lucide-react'

function FieldCard({ field }) {
 return (
 <Link to={'/field/' + field.id} className="field-card-link">
 <div className="field-card">

 <div className="field-card-img-wrapper">
 {field.image_url ? (
 <img
 src={field.image_url}
 alt={field.name}
 className="field-card-img"
 onError={e => {
 e.target.style.display = 'none'
 e.target.nextSibling.style.display = 'flex'
 }}
 />
 ) : null}
 <div className="field-card-placeholder" style={{ display: field.image_url ? 'none' : 'flex' }}>
 
 </div>
 </div>

 <div className="field-card-body">
 <div className="field-card-header-row">
 <h2>{field.name}</h2>
 <span className="field-card-price">{field.price_per_hour} lei<small>/oră</small></span>
 </div>

 <p className="field-card-location">
 <MapPin size={13} strokeWidth={2.5} />
 {field.location}
 </p>

 {field.description && (
 <p className="field-card-desc">{field.description}</p>
 )}

 <div className="field-card-footer-row">
 {field.avg_rating ? (
 <span className="field-card-rating">
 ★ {field.avg_rating}
 <span style={{ fontWeight: 500, color: 'var(--text-light)' }}>
 ({field.reviews_count} {field.reviews_count === 1 ? 'recenzie' : 'recenzii'})
 </span>
 </span>
 ) : (
 <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Fără recenzii</span>
 )}

 <span className="field-card-cta">Rezervă acum
 <ArrowRight size={14} strokeWidth={2.5} />
 </span>
 </div>
 </div>
 </div>
 </Link>
 )
}

export default FieldCard
