/* auth.js - DEMO-ONLY login / registration.

   HOW THE "DATABASE" WORKS (be honest about it in your report):
   - data/users.txt holds demo accounts in PLAIN TEXT (no hashing, on purpose, for learning).
   - A static website cannot write to a text file on a server. So the accounts are
     copied into localStorage ("cc_users") and everything the user does
     (registering, points, history) is saved there, in this browser only.
   - USERS_TXT_FALLBACK below is a copy of users.txt, used when the page is opened
     straight from the file system (file://), where fetch() is blocked.
   - If the site runs on a local server (e.g. VS Code Live Server) or GitHub Pages,
     the page also reads the real data/users.txt and adds any accounts listed there.
   - This is NOT secure: plain-text passwords, no server, anyone can read localStorage. */

const USERS_KEY = 'cc_users';
const SESSION_KEY = 'cc_session';

const USERS_TXT_FALLBACK =
  '# username,email,password,full name,starting points\n' +
  'demo,demo@coffeecircle.test,demo123,Demo Customer,150\n' +
  'tester,tester@coffeecircle.test,test1234,Test Student,0\n';

/* ---------- safe helpers (delegate to main.js when loaded) ---------- */

function authReadStorage(key, fallback) {
  if (typeof readJSON === 'function') return readJSON(key, fallback);
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const value = JSON.parse(raw);
    return value === null ? fallback : value;
  } catch (error) {
    return fallback;
  }
}

function authWriteStorage(key, value) {
  if (typeof writeJSON === 'function') return writeJSON(key, value);
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    return false;
  }
}

function authValidEmail(email) {
  if (typeof isValidEmail === 'function') return isValidEmail(email);
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function authPageUrl(file) {
  if (typeof pageUrl === 'function') return pageUrl(file);
  const root = document.body.dataset.root || '';
  if (file === 'index.html') return root + 'index.html';
  return (root ? '' : 'pages/') + file;
}

/* ---------- user parsing & storage ---------- */

/* Turn the text of users.txt into normalised user objects. */
function parseUsersTxt(text) {
  const users = [];
  String(text || '').split(/\r?\n/).forEach(function (line) {
    line = line.trim();
    if (!line || line.charAt(0) === '#') return;
    const parts = line.split(',');
    if (parts.length < 4) return;

    const username = parts[0].trim();
    const email = parts[1].trim().toLowerCase();
    const password = parts[2].trim();
    const fullName = parts[3].trim() || username;
    const parsedPoints = parseInt(parts[4], 10);
    const points = !isNaN(parsedPoints) && parsedPoints > 0 ? parsedPoints : 0;
    if (!username || !email || !password) return;

    const joined = new Date().toISOString();
    const user = {
      username: username,
      email: email,
      password: password,
      fullName: fullName,
      points: points,
      history: [],
      redeemed: [],
      joined: joined,
      source: 'users.txt'
    };
    if (points > 0) {
      user.history.push({ type: 'bonus', points: points, note: 'Demo starter balance', date: joined });
    }
    users.push(user);
  });
  return users;
}

function isUserObject(u) {
  return Boolean(
    u &&
    typeof u === 'object' &&
    typeof u.username === 'string' && u.username.trim() !== '' &&
    typeof u.email === 'string' && u.email.trim() !== '' &&
    typeof u.password === 'string'
  );
}

function normalizeUser(u) {
  const points = Number(u.points);
  return {
    username: u.username.trim(),
    email: u.email.trim().toLowerCase(),
    password: u.password,
    fullName: typeof u.fullName === 'string' && u.fullName.trim() ? u.fullName.trim() : u.username.trim(),
    points: !isNaN(points) && points >= 0 ? points : 0,
    history: Array.isArray(u.history) ? u.history : [],
    redeemed: Array.isArray(u.redeemed) ? u.redeemed : [],
    joined: typeof u.joined === 'string' && u.joined ? u.joined : new Date().toISOString(),
    source: u.source || 'registered'
  };
}

function getUsers() {
  let users = authReadStorage(USERS_KEY, null);
  if (!Array.isArray(users)) {
    users = parseUsersTxt(USERS_TXT_FALLBACK);
    authWriteStorage(USERS_KEY, users);
  }
  return users.filter(isUserObject).map(normalizeUser);
}

function saveUsers(users) {
  return authWriteStorage(USERS_KEY, users);
}

/* Change one user and save (used by loyalty.js and checkout.js). */
function updateUser(username, change) {
  const users = getUsers();
  const user = users.find(function (u) { return u.username === username; });
  if (!user || typeof change !== 'function') return null;
  change(user);
  saveUsers(users);
  return user;
}

/* Local-server / GitHub Pages mode: read data/users.txt and add accounts we don't know yet. */
function syncUsersFromFile() {
  if (location.protocol === 'file:' || typeof fetch !== 'function') return Promise.resolve(false);
  const root = typeof ROOT === 'string' ? ROOT : (document.body.dataset.root || '');
  return fetch(root + 'data/users.txt', { cache: 'no-store' })
    .then(function (response) {
      if (!response.ok) throw new Error('not found');
      return response.text();
    })
    .then(function (text) {
      const users = getUsers();
      let changed = false;
      parseUsersTxt(text).forEach(function (fileUser) {
        const known = users.some(function (u) {
          return u.username.toLowerCase() === fileUser.username.toLowerCase() ||
            u.email.toLowerCase() === fileUser.email.toLowerCase();
        });
        if (!known) {
          users.push(fileUser);
          changed = true;
        }
      });
      if (changed) saveUsers(users);
      return true;
    })
    .catch(function () { return false; });
}

/* ---------- session & authentication ---------- */

function currentUser() {
  const username = authReadStorage(SESSION_KEY, null);
  if (typeof username !== 'string' || !username.trim()) return null;
  return getUsers().find(function (u) { return u.username === username; }) || null;
}

function validateLogin(identifier, password) {
  const errors = {};
  if (!String(identifier || '').trim()) errors.identifier = 'Please enter your username or email.';
  if (!String(password || '')) errors.password = 'Please enter your password.';
  return errors;
}

function loginUser(identifier, password) {
  const wanted = String(identifier || '').trim().toLowerCase();
  if (!wanted || typeof password !== 'string' || !password) {
    return { ok: false, error: 'Please enter your username/email and password.' };
  }
  const user = getUsers().find(function (u) {
    return u.username.toLowerCase() === wanted || u.email.toLowerCase() === wanted;
  });
  if (!user || user.password !== password) {
    return { ok: false, error: 'Incorrect username/email or password.' };
  }
  if (!authWriteStorage(SESSION_KEY, user.username)) {
    return { ok: false, error: 'Could not save your session (browser storage is blocked).' };
  }
  return { ok: true, user: user };
}

function validateRegistration(data) {
  const errors = {};
  const users = getUsers();
  const fullName = String(data.fullName || '').trim();
  const email = String(data.email || '').trim();
  const username = String(data.username || '').trim();
  const password = String(data.password || '');
  const confirm = String(data.confirm || '');

  if (fullName.length < 2) {
    errors.fullName = 'Please enter your full name (at least 2 characters).';
  }
  if (!email) {
    errors.email = 'Please enter your email address.';
  } else if (!authValidEmail(email)) {
    errors.email = 'Please enter a valid email address, e.g. name@example.com.';
  } else if (users.some(function (u) { return u.email.toLowerCase() === email.toLowerCase(); })) {
    errors.email = 'An account with this email already exists. Try logging in.';
  }

  if (!/^[A-Za-z0-9_]{3,20}$/.test(username)) {
    errors.username = 'Username must be 3-20 characters: letters, numbers or underscore.';
  } else if (users.some(function (u) { return u.username.toLowerCase() === username.toLowerCase(); })) {
    errors.username = 'That username is taken. Please choose another.';
  }

  if (!password || !password.trim()) {
    errors.password = 'Password must be at least 6 characters and cannot be blank spaces.';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  }

  if (!confirm) {
    errors.confirm = 'Please confirm your password.';
  } else if (confirm !== password) {
    errors.confirm = 'Passwords do not match.';
  }
  return errors;
}

function registerUser(data) {
  const users = getUsers();
  const username = String(data.username || '').trim();
  const email = String(data.email || '').trim().toLowerCase();
  const duplicate = users.some(function (u) {
    return u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === email;
  });
  if (duplicate) return null;

  const user = {
    username: username,
    email: email,
    password: String(data.password || ''),
    fullName: String(data.fullName || '').trim(),
    points: 0,
    history: [],
    redeemed: [],
    joined: new Date().toISOString(),
    source: 'registered'
  };
  users.push(user);
  if (!saveUsers(users) || !authWriteStorage(SESSION_KEY, user.username)) return null;
  return user;
}

function logoutUser() {
  try { localStorage.removeItem(SESSION_KEY); } catch (error) { /* ignore */ }
}

/* Safe redirect target: only our own pages, never an outside URL. */
function safeNextPage() {
  const next = new URLSearchParams(location.search).get('next');
  const allowed = ['account.html', 'loyalty.html', 'checkout.html', 'cart.html', 'menu.html', 'index.html'];
  return allowed.indexOf(next) !== -1 ? next : 'account.html';
}

/* ---------- auth page ---------- */

function showFormErrors(form, errors) {
  form.querySelectorAll('[data-error-for]').forEach(function (el) {
    const fieldName = el.dataset.errorFor;
    const message = errors[fieldName] || '';
    el.textContent = message;
    const input = form.querySelector('[name="' + fieldName + '"]');
    if (input) input.setAttribute('aria-invalid', message ? 'true' : 'false');
  });
  const firstBad = form.querySelector('[aria-invalid="true"]');
  if (firstBad) firstBad.focus();
}

function clearFieldError(form, fieldName) {
  const errorEl = form.querySelector('[data-error-for="' + fieldName + '"]');
  const input = form.querySelector('[name="' + fieldName + '"]');
  if (errorEl) errorEl.textContent = '';
  if (input) input.setAttribute('aria-invalid', 'false');
}

function renderLoggedInStatus(statusEl, user) {
  statusEl.textContent = '';
  statusEl.className = 'form-message info';
  statusEl.appendChild(document.createTextNode('You are logged in as ' + user.username + '. '));

  const accountLink = document.createElement('a');
  accountLink.href = authPageUrl('account.html');
  accountLink.textContent = 'Go to My Account';
  statusEl.appendChild(accountLink);
  statusEl.appendChild(document.createTextNode(' or '));

  const outBtn = document.createElement('button');
  outBtn.type = 'button';
  outBtn.className = 'link-inline';
  outBtn.textContent = 'log out';
  outBtn.addEventListener('click', function () {
    logoutUser();
    if (typeof updateHeaderAuth === 'function') updateHeaderAuth();
    statusEl.textContent = 'You have been logged out.';
    statusEl.className = 'form-message success';
  });
  statusEl.appendChild(outBtn);
  statusEl.appendChild(document.createTextNode('.'));
}

function setupAuthPage() {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  if (!loginForm || !registerForm) return;

  const status = document.getElementById('auth-status');
  const note = document.getElementById('storage-note');
  const tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));

  function showTab(name, moveFocus) {
    tabs.forEach(function (tab) {
      const active = tab.dataset.tab === name;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
      tab.setAttribute('tabindex', active ? '0' : '-1');
      if (active && moveFocus) tab.focus();
    });
    loginForm.hidden = name !== 'login';
    registerForm.hidden = name !== 'register';
    showFormErrors(loginForm, {});
    showFormErrors(registerForm, {});

    const user = currentUser();
    if (user) {
      renderLoggedInStatus(status, user);
    } else {
      status.textContent = '';
      status.className = 'form-message';
    }
  }

  tabs.forEach(function (tab, index) {
    tab.addEventListener('click', function () { showTab(tab.dataset.tab, false); });
    tab.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        const nextIndex = event.key === 'ArrowRight'
          ? (index + 1) % tabs.length
          : (index - 1 + tabs.length) % tabs.length;
        showTab(tabs[nextIndex].dataset.tab, true);
      }
    });
  });

  document.querySelectorAll('[data-switch]').forEach(function (link) {
    link.addEventListener('click', function () { showTab(link.dataset.switch, false); });
  });

  [loginForm, registerForm].forEach(function (form) {
    form.addEventListener('input', function (event) {
      if (event.target && event.target.name) clearFieldError(form, event.target.name);
    });
  });

  showTab(new URLSearchParams(location.search).get('mode') === 'register' ? 'register' : 'login', false);

  syncUsersFromFile().then(function (readFromFile) {
    if (!note) return;
    note.textContent = readFromFile
      ? 'Demo mode: accounts were read from data/users.txt through your local server, and new accounts are saved in this browser (localStorage).'
      : 'Demo mode: opened without a server, so a built-in copy of users.txt is used and accounts are saved in this browser (localStorage) only.';
  });

  function finish(message) {
    status.textContent = message;
    status.className = 'form-message success';
    setTimeout(function () { location.href = authPageUrl(safeNextPage()); }, 900);
  }

  loginForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const identifier = loginForm.elements.identifier.value;
    const password = loginForm.elements.password.value;
    const errors = validateLogin(identifier, password);
    showFormErrors(loginForm, errors);
    if (Object.keys(errors).length) {
      status.textContent = '';
      status.className = 'form-message';
      return;
    }

    const result = loginUser(identifier, password);
    if (!result.ok) {
      status.textContent = result.error;
      status.className = 'form-message error';
      loginForm.elements.password.focus();
      return;
    }

    if (typeof updateHeaderAuth === 'function') updateHeaderAuth();
    finish('Welcome back, ' + result.user.fullName + '! Taking you to your account...');
  });

  registerForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const f = registerForm.elements;
    const data = {
      fullName: f.fullName.value,
      email: f.email.value,
      username: f.username.value,
      password: f.password.value,
      confirm: f.confirm.value
    };
    const errors = validateRegistration(data);
    showFormErrors(registerForm, errors);
    if (Object.keys(errors).length) {
      status.textContent = '';
      status.className = 'form-message';
      return;
    }

    const user = registerUser(data);
    if (!user) {
      status.textContent = 'Could not create your account (duplicate details or browser storage is blocked).';
      status.className = 'form-message error';
      return;
    }

    if (typeof updateHeaderAuth === 'function') updateHeaderAuth();
    finish('Account created! Welcome to the Circle, ' + user.fullName + '.');
  });
}

document.addEventListener('DOMContentLoaded', setupAuthPage);
