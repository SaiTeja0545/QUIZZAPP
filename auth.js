const API_BASE = APP_CONFIG.API_BASE;

// Session key to track legitimate navigation
const SESSION_KEY = 'quiz_session_token';

function generateSessionToken() {
  return Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function setSessionToken() {
  sessionStorage.setItem(SESSION_KEY, generateSessionToken());
}

function clearSessionToken() {
  sessionStorage.removeItem(SESSION_KEY);
}

function hasValidSession() {
  return sessionStorage.getItem(SESSION_KEY) !== null;
}

async function registerUser() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const msg = document.getElementById('msg');

  if (!username || !password) {
    msg.innerText = 'Please enter username and password.';
    msg.style.color = 'red';
    return;
  }

  try {
    // check existing user
    const res = await fetch(`${API_BASE}${APP_CONFIG.USERS}?username=${encodeURIComponent(username)}`);
    const existing = await res.json();
    if (existing.length) {
      msg.innerText = 'Username already taken.';
      msg.style.color = 'red';
      return;
    }

    const user = { username, password, isAdmin: false };

    const create = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });

    if (!create.ok) {
      msg.innerText = 'Registration failed.';
      msg.style.color = 'red';
      return;
    }

    console.log('registerUser: created user', user.username);
    if (msg) {
      msg.innerText = 'Registration successful. Redirecting to login...';
      msg.style.color = 'green';
    }
    
    const uEl = document.getElementById('username');
    const pEl = document.getElementById('password');
    if (uEl) uEl.value = '';
    if (pEl) pEl.value = '';
    
    // Set session token before redirect
    setSessionToken();
    setTimeout(() => {
      try {
        location.replace('login.html');
      } catch (e) {
        window.location.href = 'login.html';
      }
    }, 1000);
  } catch (err) {
    console.error('registerUser error', err);
    msg.innerText = 'Registration failed (network or server error).';
    msg.style.color = 'red';
  }
}

async function loginUser() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const msg = document.getElementById('msg');
  const adminRequested = !!document.getElementById('adminCheck') && document.getElementById('adminCheck').checked;

  if (!username || !password) {
    msg.innerText = 'Enter username and password.';
    msg.style.color = 'red';
    return;
  }

  const res = await fetch(`${API_BASE}${APP_CONFIG.USERS}?username=${username}&password=${password}`);
  const users = await res.json();

  if (!users.length) {
    msg.innerText = 'Invalid credentials.';
    msg.style.color = 'red';
    return;
  }

  const user = users[0];
  if (adminRequested && !user.isAdmin) {
    msg.innerText = 'This account does not have admin privileges.';
    msg.style.color = 'red';
    return;
  }

  localStorage.setItem('quiz_user', JSON.stringify(user));
  setSessionToken(); // Set valid session token
  
  if (user.isAdmin && adminRequested) {
    window.location.href = 'admin.html';
  } else {
    window.location.href = 'index.html';
  }
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('quiz_user')) || null;
  } catch (e) {
    return null;
  }
}

function logout() {
  localStorage.removeItem("quiz_user");
  localStorage.removeItem("quiz_completed");
  localStorage.removeItem("quizScore");

  location.replace("login.html");
}

function requireAdmin() {
  const user = getCurrentUser();
  if (!user || !user.isAdmin) {
    clearSessionToken();
    window.location.href = 'quiz.html';
  }
}

// Protection function - call this on protected pages
function requireAuth() {
  const user = getCurrentUser();
  if (!user || !hasValidSession()) {
    clearSessionToken();
    window.location.replace('quiz.html');
    return false;
  }
  return true;
}