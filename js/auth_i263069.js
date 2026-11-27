/* auth.js - DEMO-ONLY login / registration.

   HOW THE "DATABASE" WORKS (be honest about it in your report):
   - data/users.txt holds demo accounts in PLAIN TEXT (no hashing, on purpose, for learning).
   - A static website cannot write to a text file on a server. So the accounts are
     copied into localStorage ("cc_users") and everything the user does
     (registering, points, history) is saved there, in this browser only.
   - USERS_TXT_FALLBACK below is a copy of users.txt, used when the page is opened
     straight from the file system (file://), where fetch() is blocked.
   - If the site runs on a local server (e.g. VS Code Live Server), the page also
     reads the real data/users.txt and adds any accounts listed there.
   - This is NOT secure: plain-text passwords, no server, anyone can read localStorage. */

const USERS_KEY = 'cc_users';
const SESSION_KEY = 'cc_session';

const USERS_TXT_FALLBACK =
  '# username,email,password,full name,starting points\n' +
  'demo,demo@coffeecircle.test,demo123,Demo Customer,150\n' +
  'tester,tester@coffeecircle.test,test1234,Test Student,0\n';

/* Turn the text of users.txt into user objects. */
function parseUsersTxt(text) {
  const users = [];
  String(text).split(/\r?\n/).forEach(function (line) {
    line = line.trim();
    if (!line || line.charAt(0) === '#') return;
    const parts = line.split(',');
    if (parts.length < 4) return;
    const points = parseInt(parts[4], 10) || 0;
    const user = {
      username: parts[0].trim(), email: parts[1].trim().toLowerCase(),
      password: parts[2].trim(), fullName: parts[3].trim(),
      points: points, history: [], redeemed: [], joined: new Date().toISOString(), source: 'users.txt'
    };
    if (points > 0) {
      user.history.push({ type: 'bonus', points: points, note: 'Demo starter balance', date: user.joined });
    }
    if (user.username && user.email && user.password) users.push(user);
  });
  return users;
}

function isUserObject(u) {
  return u && typeof u === 'object' && typeof u.username === 'string' && typeof u.email === 'string' &&
    typeof u.password === 'string';
}

function getUsers() {
  let users = readJSON(USERS_KEY, null);
  if (!Array.isArray(users)) {
    users = parseUsersTxt(USERS_TXT_FALLBACK);
    writeJSON(USERS_KEY, users);
  }
  return users.filter(isUserObject).map(function (u) {
    u.points = Number(u.points) || 0;
    if (!Array.isArray(u.history)) u.history = [];
    if (!Array.isArray(u.redeemed)) u.redeemed = [];
    return u;
  });
}

function saveUsers(users) {
  writeJSON(USERS_KEY, users);
}

/* Change one user and save (used by loyalty.js and checkout.js). */
function updateUser(username, change) {
  const users = getUsers();
  const user = users.find(function (u) { return u.username === username; });
  if (!user) return null;
  change(user);
  saveUsers(users);
  return user;
}

/* Local-server mode: read the real users.txt and add accounts we don't know yet. */
function syncUsersFromFile() {
  if (location.protocol === 'file:' || typeof fetch !== 'function') return Promise.resolve(false);
  return fetch(ROOT + 'data/users.txt', { cache: 'no-store' })
    .then(function (response) {
      if (!response.ok) throw new Error('not found');
      return response.text();
    })
    .then(function (text) {
      const users = getUsers();
      parseUsersTxt(text).forEach(function (fileUser) {
        const known = users.some(function (u) { return u.username.toLowerCase() === fileUser.username.toLowerCase(); });
        if (!known) users.push(fileUser);
      });
      saveUsers(users);
      return true;
    })
    .catch(function () { return false; });
}

function currentUser() {
  const username = readJSON(SESSION_KEY, null);
  if (typeof username !== 'string') return null;
  return getUsers().find(function (u) { return u.username === username; }) || null;
}

function validateLogin(identifier, password) {
  const errors = {};
  if (!identifier) errors.identifier = 'Please enter your username or email.';
  if (!password) errors.password = 'Please enter your password.';
  return errors;
}

function loginUser(identifier, password) {
  const wanted = identifier.trim().toLowerCase();
  const user = getUsers().find(function (u) {
    return u.username.toLowerCase() === wanted || u.email.toLowerCase() === wanted;
  });
  if (!user || user.password !== password) {
    return { ok: false, error: 'Incorrect username/email or password.' };
  }
  writeJSON(SESSION_KEY, user.username);
  return { ok: true, user: user };
}

function validateRegistration(data) {
  const errors = {};
  const users = getUsers();
  if (data.fullName.trim().length < 2) errors.fullName = 'Please enter your full name (at least 2 characters).';
  if (!isValidEmail(data.email.trim())) {
    errors.email = 'Please enter a valid email address, e.g. name@example.com.';
  } else if (users.some(function (u) { return u.email.toLowerCase() === data.email.trim().toLowerCase(); })) {
    errors.email = 'An account with this email already exists. Try logging in.';
  }
  if (!/^[A-Za-z0-9_]{3,20}$/.test(data.username.trim())) {
    errors.username = 'Username must be 3-20 characters: letters, numbers or underscore.';
  } else if (users.some(function (u) { return u.username.toLowerCase() === data.username.trim().toLowerCase(); })) {
    errors.username = 'That username is taken. Please choose another.';
  }
  if (data.password.length < 6) errors.password = 'Password must be at least 6 characters.';
  if (data.confirm !== data.password) errors.confirm = 'Passwords do not match.';
  else if (!data.confirm) errors.confirm = 'Please confirm your password.';
  return errors;
}

function registerUser(data) {
  const users = getUsers();
  const user = {
    username: data.username.trim(), email: data.email.trim().toLowerCase(),
    password: data.password, fullName: data.fullName.trim(),
    points: 0, history: [], redeemed: [], joined: new Date().toISOString(), source: 'registered'
  };
  users.push(user);
  saveUsers(users);
  writeJSON(SESSION_KEY, user.username);
  return user;
}

function logoutUser() {
  try { localStorage.removeItem(SESSION_KEY); } catch (error) { /* ignore */ }
}

/* Safe redirect target: only our own pages, never an outside URL. */
function safeNextPage() {
  const next = new URLSearchParams(location.search).get('next');
  const allowed = ['account.html', 'loyalty.html', 'checkout.html', 'cart.html', 'menu.html'];
  return allowed.indexOf(next) !== -1 ? next : 'account.html';
}

/* ---------- auth page ---------- */

function showFormErrors(form, errors) {
  form.querySelectorAll('[data-error-for]').forEach(function (el) {
    const message = errors[el.dataset.errorFor] || '';
    el.textContent = message;
    const input = form.querySelector('[name="' + el.dataset.errorFor + '"]');
    if (input) input.setAttribute('aria-invalid', message ? 'true' : 'false');
  });
  const firstBad = form.querySelector('[aria-invalid="true"]');
  if (firstBad) firstBad.focus();
}

function setupAuthPage() {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  if (!loginForm || !registerForm) return;

  const status = document.getElementById('auth-status');
  const note = document.getElementById('storage-note');
  const tabs = document.querySelectorAll('.tab');

  function showTab(name) {
    tabs.forEach(function (tab) {
      const active = tab.dataset.tab === name;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    loginForm.hidden = name !== 'login';
    registerForm.hidden = name !== 'register';
    status.textContent = '';
    status.className = 'form-message';
  }
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () { showTab(tab.dataset.tab); });
  });
  document.querySelectorAll('[data-switch]').forEach(function (link) {
    link.addEventListener('click', function () { showTab(link.dataset.switch); });
  });
  if (new URLSearchParams(location.search).get('mode') === 'register') showTab('register');

  /* Already logged in? Offer a way out instead of the forms. */
  const user = currentUser();
  if (user) {
    status.textContent = 'You are logged in as ' + user.username + '. You can log in as someone else below, or log out from the menu.';
    status.className = 'form-message info';
  }

  syncUsersFromFile().then(function (readFile) {
    if (!note) return;
    note.textContent = readFile
      ? 'Demo mode: accounts were read from data/users.txt through your local server, and new accounts are saved in this browser (localStorage).'
      : 'Demo mode: opened without a server, so a built-in copy of users.txt is used and accounts are saved in this browser (localStorage) only.';
  });

  function finish(message) {
    status.textContent = message;
    status.className = 'form-message success';
    setTimeout(function () { location.href = pageUrl(safeNextPage()); }, 900);
  }

  loginForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const identifier = loginForm.elements.identifier.value;
    const password = loginForm.elements.password.value;
    const errors = validateLogin(identifier.trim(), password);
    showFormErrors(loginForm, errors);
    if (Object.keys(errors).length) return;
    const result = loginUser(identifier, password);
    if (!result.ok) {
      status.textContent = result.error;
      status.className = 'form-message error';
      return;
    }
    updateHeaderAuth();
    finish('Welcome back, ' + result.user.fullName + '! Taking you to your account...');
  });

  registerForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const f = registerForm.elements;
    const data = {
      fullName: f.fullName.value, email: f.email.value, username: f.username.value,
      password: f.password.value, confirm: f.confirm.value
    };
    const errors = validateRegistration(data);
    showFormErrors(registerForm, errors);
    if (Object.keys(errors).length) return;
    const user = registerUser(data);
    updateHeaderAuth();
    finish('Account created! Welcome to the Circle, ' + user.fullName + '.');
  });
}

document.addEventListener('DOMContentLoaded', setupAuthPage);
