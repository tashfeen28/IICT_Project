/* ==========================================================================
   The Coffee Circle — Simulated User Authentication State
   Persisted in localStorage under 'coffeeCircleUser'
   ========================================================================== */

(function () {
  'use strict';

  var AUTH_STORAGE_KEY = 'coffeeCircleUser';

  function readUser() {
    try {
      var raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (err) {
      return null;
    }
  }

  function writeUser(user) {
    try {
      if (user) {
        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } else {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (err) {
      // Ignore storage errors in restricted environments.
    }
  }

  /**
   * Update the Account link in #site-header to reflect login status.
   */
  function updateAccountNav() {
    var headerHost = document.getElementById('site-header');
    if (!headerHost) return;

    var accountLink = headerHost.querySelector('a.nav-link[href*="account.html"]');
    if (!accountLink) return;

    var labelEl = accountLink.querySelector('span') || accountLink;
    var user = readUser();

    if (user && user.name) {
      var firstName = String(user.name).trim().split(/\s+/)[0];
      labelEl.textContent = firstName;
      accountLink.dataset.authState = 'signed-in';
      accountLink.setAttribute('title', 'Signed in as ' + user.name);
      accountLink.setAttribute('aria-label', 'Account (' + user.name + ')');
    } else {
      labelEl.textContent = 'Account';
      accountLink.dataset.authState = 'signed-out';
      accountLink.removeAttribute('title');
      accountLink.removeAttribute('aria-label');
    }
  }

  /**
   * Watch #site-header so the Account link updates once navigation.js renders it.
   */
  function observeHeaderInjection() {
    var headerHost = document.getElementById('site-header');
    if (!headerHost) return;

    updateAccountNav();

    if (typeof MutationObserver === 'function') {
      var observer = new MutationObserver(function () {
        updateAccountNav();
      });
      observer.observe(headerHost, { childList: true, subtree: true });
    }
  }

  var Auth = {
    STORAGE_KEY: AUTH_STORAGE_KEY,

    getCurrentUser: function () {
      return readUser();
    },

    isLoggedIn: function () {
      return Boolean(readUser());
    },

    login: function (userOrEmail, optionalName) {
      var email = '';
      var name = '';
      var phone = '';

      if (userOrEmail && typeof userOrEmail === 'object') {
        email = String(userOrEmail.email || '').trim();
        name = String(userOrEmail.name || '').trim();
        phone = String(userOrEmail.phone || '').trim();
      } else {
        email = String(userOrEmail || '').trim();
        name = String(optionalName || '').trim();
      }

      if (!name && email) {
        name = email.split('@')[0];
      }
      if (!name) {
        name = 'Coffee Member';
      }

      var user = {
        name: name,
        email: email || 'member@thecoffeecircle.com',
        phone: phone,
        loggedInAt: new Date().toISOString()
      };

      writeUser(user);
      updateAccountNav();
      window.dispatchEvent(new CustomEvent('auth:updated', { detail: { user: user } }));
      return user;
    },

    logout: function () {
      writeUser(null);
      updateAccountNav();
      window.dispatchEvent(new CustomEvent('auth:updated', { detail: { user: null } }));
    },

    updateAccountNav: updateAccountNav
  };

  window.Auth = Auth;

  window.addEventListener('storage', function (event) {
    if (!event || !event.key || event.key === AUTH_STORAGE_KEY) {
      updateAccountNav();
    }
  });
  window.addEventListener('auth:updated', updateAccountNav);

  if (document.readyState !== 'loading' || document.getElementById('site-header')) {
    observeHeaderInjection();
  } else {
    document.addEventListener('DOMContentLoaded', observeHeaderInjection);
  }
})();
