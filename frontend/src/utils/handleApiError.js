import { removeToken } from "./auth";

async function handleApiError(response) {
  
  if (!response) {
    return "Eroare de conexiune. Verifică că serverul rulează.";
  }

  
  if (response.status === 401) {
    removeToken();
    
    window.location.href = "/login?expired=true";
    return "Sesiunea a expirat. Te rugăm să te loghezi din nou.";
  }

  
  if (response.status === 403) {
    return "Nu ai permisiunea să efectuezi această acțiune.";
  }

  
  if (response.status === 404) {
    return "Resursa căutată nu a fost găsită.";
  }

  
  if (response.status >= 500) {
    return "Eroare de server. Încearcă din nou mai târziu.";
  }

  
  try {
    const data = await response.json();
    return data.mesaj || "A apărut o eroare neașteptată.";
  } catch {
    return "A apărut o eroare neașteptată.";
  }
}

export default handleApiError;
