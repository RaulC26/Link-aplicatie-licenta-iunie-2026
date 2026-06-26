import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
// Icoane Lucide pentru features și butoane hero
import { CalendarCheck, Map, Trophy, Rocket, ArrowRight } from 'lucide-react'
import FieldsList from '../components/FieldsList'
import { isLoggedIn } from '../utils/auth'

// Animație hero content — apare din jos la montare
const heroVariants = {
 hidden: { opacity: 0, y: 32 },
 visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
}

// Stagger pentru statisticile din hero — apar pe rând cu delay
const statsContainer = {
 hidden: {},
 visible: { transition: { staggerChildren: 0.1, delayChildren: 0.35 } }
}
const statItem = {
 hidden: { opacity: 0, y: 18 },
 visible: { opacity: 1, y: 0, transition: { duration: 0.38 } }
}

// Stagger pentru features strip — se activează când intră în viewport
const featuresContainer = {
 hidden: {},
 visible: { transition: { staggerChildren: 0.13 } }
}
const featureItem = {
 hidden: { opacity: 0, x: -22 },
 visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } }
}

function HomePage() {
 return (
 <div className="page-container">

 {/* ===== HERO ===== */}
 <div className="hero-section">

 {/* Conținut principal animat la montare */}
 <motion.div
 className="hero-content"
 variants={heroVariants}
 initial="hidden"
 animate="visible"
 >
 {/* Badge "live" cu dot verde pulsator */}
 <div className="hero-badge">
 <span className="hero-badge-dot" />Cea mai mare platformă de rezervări de terenuri sintetice de fotbal.
 </div>

 <h1 className="hero-title">Terenul tău preferat<br />
 <span className="hero-highlight">poate fi rezervat în cateva secunde.</span>
 </h1>
 <p className="hero-subtitle">Alegi terenul, selectezi intervalul orar, confirmi rezervarea și este totul gata în cateva clipe, făra apeluri telefonice. 
 </p>

 <div className="hero-actions">
 {!isLoggedIn() ? (
 <>
 {/* Buton principal cu iconița Rocket */}
 <Link to="/register" className="btn-primary">
 <Rocket size={16} strokeWidth={2.5} />Începe gratuit
 </Link>
 <Link to="/login" className="btn-secondary">Ai deja cont? Intră
 <ArrowRight size={15} strokeWidth={2.5} />
 </Link>
 </>
 ) : (
 <Link to="/tournaments" className="btn-secondary">
 <Trophy size={16} strokeWidth={2.5} />Înscrie-ți echipa la unul din turneele Fotrez
 <ArrowRight size={15} strokeWidth={2.5} />
 </Link>
 )}
 </div>
 </motion.div>

 {/* Statistici rapide cu stagger — apar pe rând după hero content */}
 <motion.div
 className="hero-stats"
 variants={statsContainer}
 initial="hidden"
 animate="visible"
 >
 <motion.div className="hero-stat" variants={statItem} whileHover={{ y: -3, transition: { duration: 0.2 } }}>
 <span className="hero-stat-icon"></span>
 <div className="hero-stat-info">
 <span className="hero-stat-number">100%</span>
 <span className="hero-stat-label">Terenuri verificate</span>
 </div>
 </motion.div>
 <motion.div className="hero-stat" variants={statItem} whileHover={{ y: -3, transition: { duration: 0.2 } }}>
 <span className="hero-stat-icon"></span>
 <div className="hero-stat-info">
 <span className="hero-stat-number">&lt; 1 min</span>
 <span className="hero-stat-label">Timp rezervare</span>
 </div>
 </motion.div>
 <motion.div className="hero-stat" variants={statItem} whileHover={{ y: -3, transition: { duration: 0.2 } }}>
 <span className="hero-stat-icon"></span>
 <div className="hero-stat-info">
 <span className="hero-stat-number">Stripe</span>
 <span className="hero-stat-label">Aplicația cu care platești</span>
 </div>
 </motion.div>
 <motion.div className="hero-stat" variants={statItem} whileHover={{ y: -3, transition: { duration: 0.2 } }}>
 <span className="hero-stat-icon"></span>
 <div className="hero-stat-info">
 <span className="hero-stat-number">Turnee</span>
 <span className="hero-stat-label">Competiții locale</span>
 </div>
 </motion.div>
 </motion.div>
 </div>

 {/* ===== FEATURES STRIP — apare când intră în viewport ===== */}
 <motion.div
 className="features-strip"
 variants={featuresContainer}
 initial="hidden"
 whileInView="visible"
 viewport={{ once: true, margin: '-60px' }}
 >
 {/* Feature 1 — Rezervare instant cu iconiță verde */}
 <motion.div
 className="feature-box"
 variants={featureItem}
 whileHover={{ y: -5, transition: { duration: 0.2 } }}
 >
 <div className="feature-box-icon feature-box-icon-green">
 <CalendarCheck size={22} strokeWidth={2} color="var(--green-dark)" />
 </div>
 <div className="feature-box-text">
 <h4>Rezervă rapid</h4>
 <p>Selectezi terenul, intervalul orar dorit, plătești și din câteva click-uri ai rezervat terenul.</p>
 </div>
 </motion.div>

 {/* Feature 2 — Hartă interactivă cu iconiță indigo */}
 <motion.div
 className="feature-box"
 variants={featureItem}
 whileHover={{ y: -5, transition: { duration: 0.2 } }}
 >
 <div className="feature-box-icon feature-box-icon-indigo">
 <Map size={22} strokeWidth={2} color="var(--indigo)" />
 </div>
 <div className="feature-box-text">
 <h4>Harta terenurilor</h4>
 <p>Vezi locația terenului pe hartă</p>
 </div>
 </motion.div>

 {/* Feature 3 — Turnee cu iconiță amber */}
 <motion.div
 className="feature-box"
 variants={featureItem}
 whileHover={{ y: -5, transition: { duration: 0.2 } }}
 >
 <div className="feature-box-icon feature-box-icon-amber">
 <Trophy size={22} strokeWidth={2} color="#b45309" />
 </div>
 <div className="feature-box-text">
 <h4>Turnee & Competiții</h4>
 <p>Înscrie-ți echipa la turneele organizate de noi și poți câștiga chiar și premii.</p>
 </div>
 </motion.div>
 </motion.div>

 {/* ===== HEADER SECȚIUNE TERENURI ===== */}
 <div className="section-header">
 <h2>Terenuri disponibile</h2>
 </div>

 {/* Lista terenuri — are propria animație stagger internă */}
 <FieldsList />

 </div>
 )
}

export default HomePage
