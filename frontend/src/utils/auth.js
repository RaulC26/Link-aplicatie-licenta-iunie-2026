export function saveToken(token) {
  localStorage.setItem("token", token);
}


export function getToken() {
  return localStorage.getItem("token");
}


export function removeToken() {
  localStorage.removeItem("token");
}


export function isLoggedIn() {
  return getToken() !== null;
}


export function isAdmin() {
  const user = getUserFromToken();
  return user !== null && user.role === "admin";
}



export function getFirstName() {
  const user = getUserFromToken();
  if (!user) return "";
  if (user.name && user.name.trim()) return user.name.trim().split(" ")[0];
  if (user.email) return user.email.split("@")[0];
  return "";
}




export function getUserFromToken() {
  const token = getToken();
  if (!token) return null;

  try {
    
    const payload = token.split(".")[1];

    
    
    const decoded = JSON.parse(atob(payload));

    return decoded;
  } catch (eroare) {
    
    return null;
  }
}
