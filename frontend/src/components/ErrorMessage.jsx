// Componentă pentru afișarea mesajelor de eroare
// Primește prop-ul "message" - textul erorii de afișat
function ErrorMessage({ message }) {
  return <div className="error">{message}</div>
}

export default ErrorMessage
