// =========================================
// LOGGING IN
// People make an account with their email and a password, then click the link
// Firebase emails them to prove the email is theirs. Only then does the app open.
// Each account keeps its own businesses (see BIZ_USER in app.js).
//
// If firebase-config.js has no settings yet, the app opens without a login.
// =========================================
(function () {
  const FIREBASE_VERSION = '10.12.2';
  const config = window.FIREBASE_CONFIG;
  let started = false;
  let auth = null;

  // Open the real app (app.js), for this person
  function startApp(user) {
    if (started) return;
    started = true;
    window.BIZ_USER = user ? user.uid : null;
    if (user) {
      window.bizAuth = {
        email: user.email,
        logOut: function () {
          return auth.signOut().then(function () { location.reload(); });
        },
        resetPassword: function () {
          return auth.sendPasswordResetEmail(user.email);
        },
      };
    }
    // Keep the login card up with a note until the app has loaded (it's a big file)
    const screen = document.getElementById('auth');
    if (screen) screen.querySelector('.auth-body').innerHTML = '<p class="auth-note">Opening your businesses...</p>';
    const script = document.createElement('script');
    script.src = 'app.js';
    script.onload = function () { if (screen) screen.remove(); };
    document.body.appendChild(script);
  }

  if (!config || !config.apiKey) {
    startApp(null);
    return;
  }

  // ---------- The login screen ----------
  const STAR = '<svg class="logo-star" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1l3 7 7 1-5 5 1.5 8L12 18l-6.5 4L7 14 2 9l7-1z"/></svg>';
  const EYE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
  const MAIL = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>';

  document.getElementById('setup').hidden = true;
  const screen = document.createElement('div');
  screen.className = 'auth';
  screen.id = 'auth';
  screen.innerHTML = '<div class="auth-card"><div class="logo"><span class="logo-word">Biz Studio</span>' + STAR + '</div><div class="auth-body"><p class="auth-note">Loading...</p></div></div>';
  document.body.insertBefore(screen, document.body.firstChild);
  const body = screen.querySelector('.auth-body');

  // Plain-words messages for what Firebase sends back
  function problemText(error) {
    const code = (error && error.code) || '';
    const words = {
      'auth/email-already-in-use': 'There is already an account with this email. Try logging in.',
      'auth/invalid-email': 'That email doesn\'t look right.',
      'auth/missing-email': 'Type your email first.',
      'auth/weak-password': 'Pick a longer password (at least 8 letters, numbers or symbols).',
      'auth/missing-password': 'Type your password.',
      'auth/invalid-credential': 'The email or password is wrong.',
      'auth/invalid-login-credentials': 'The email or password is wrong.',
      'auth/wrong-password': 'The email or password is wrong.',
      'auth/user-not-found': 'The email or password is wrong.',
      'auth/user-disabled': 'This account has been turned off.',
      'auth/too-many-requests': 'Too many tries. Wait a few minutes, then try again.',
      'auth/network-request-failed': 'Couldn\'t connect. Check your internet and try again.',
      'auth/unauthorized-domain': 'This website isn\'t allowed to log in yet. Add it under Authorized domains in Firebase.',
      'auth/operation-not-allowed': 'Email and password sign-in isn\'t turned on in Firebase yet.',
    };
    return words[code] || 'Something went wrong. Try again.';
  }

  // A password box with a Show button
  function passwordField(id, label, autocomplete) {
    return '<label class="label" for="' + id + '">' + label + '</label>' +
      '<div class="auth-pass"><input class="input" id="' + id + '" type="password" autocomplete="' + autocomplete + '" required>' +
      '<button type="button" class="auth-eye" aria-label="Show password" aria-pressed="false">' + EYE + '</button></div>';
  }
  function hookEyes(root) {
    root.querySelectorAll('.auth-eye').forEach(function (b) {
      b.addEventListener('click', function () {
        const input = b.parentNode.querySelector('input');
        const show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        b.setAttribute('aria-pressed', show ? 'true' : 'false');
        b.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
      });
    });
  }
  // Turn a button off while waiting, so it can't be pressed twice
  function busy(button, on, text) {
    button.disabled = on;
    if (text) button.textContent = text;
  }

  // Log in or Sign up
  function showLogin(mode, email) {
    const signUp = mode === 'signup';
    body.innerHTML = `
      <h1 class="auth-title"></h1>
      <p class="auth-note"></p>
      <form class="auth-form" novalidate>
        <label class="label" for="auth-email">Email</label>
        <input class="input" id="auth-email" type="email" autocomplete="email" required>
        ${passwordField('auth-pass', 'Password', signUp ? 'new-password' : 'current-password')}
        ${signUp ? passwordField('auth-pass2', 'Type the password again', 'new-password') : ''}
        <p class="error" role="alert"></p>
        <p class="auth-ok" role="status"></p>
        <button class="btn auth-go" type="submit"></button>
      </form>
      ${signUp ? '' : '<button type="button" class="link-btn auth-forgot">Forgot your password?</button>'}
      <p class="auth-switch"><span></span> <button type="button" class="link-btn"></button></p>
    `;
    body.querySelector('.auth-title').textContent = signUp ? 'Make your account' : 'Welcome back';
    body.querySelector('.auth-note').textContent = signUp
      ? 'We\'ll email you a link to make sure the email is yours.'
      : 'Log in to open your businesses.';
    body.querySelector('.auth-go').textContent = signUp ? 'Make my account' : 'Log in';
    body.querySelector('.auth-switch span').textContent = signUp ? 'Already have an account?' : 'New here?';
    body.querySelector('.auth-switch button').textContent = signUp ? 'Log in' : 'Make an account';
    hookEyes(body);

    const form = body.querySelector('form');
    const emailBox = body.querySelector('#auth-email');
    const pass = body.querySelector('#auth-pass');
    const pass2 = body.querySelector('#auth-pass2');
    const error = body.querySelector('.error');
    const ok = body.querySelector('.auth-ok');
    const go = body.querySelector('.auth-go');
    emailBox.value = email || '';
    (email ? pass : emailBox).focus();

    body.querySelector('.auth-switch button').addEventListener('click', function () {
      showLogin(signUp ? 'login' : 'signup', emailBox.value.trim());
    });

    if (!signUp) {
      body.querySelector('.auth-forgot').addEventListener('click', function () {
        error.textContent = '';
        ok.textContent = '';
        const address = emailBox.value.trim();
        if (!address) { error.textContent = 'Type your email first, then press Forgot your password.'; emailBox.focus(); return; }
        auth.sendPasswordResetEmail(address).then(function () {
          ok.textContent = 'If there is an account for ' + address + ', we sent it a link to pick a new password.';
        }).catch(function (e) {
          // Don't say whether the email has an account
          if (e && e.code === 'auth/user-not-found') ok.textContent = 'If there is an account for ' + address + ', we sent it a link to pick a new password.';
          else error.textContent = problemText(e);
        });
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      error.textContent = '';
      ok.textContent = '';
      const address = emailBox.value.trim();
      if (!address) { error.textContent = 'Type your email.'; emailBox.focus(); return; }
      if (!pass.value) { error.textContent = 'Type your password.'; pass.focus(); return; }
      if (signUp) {
        if (pass.value.length < 8) { error.textContent = 'Pick a longer password (at least 8 letters, numbers or symbols).'; pass.focus(); return; }
        if (pass.value !== pass2.value) { error.textContent = 'The two passwords don\'t match.'; pass2.focus(); return; }
        busy(go, true, 'Making your account...');
        auth.createUserWithEmailAndPassword(address, pass.value)
          .then(function (result) { return result.user.sendEmailVerification(); })
          .catch(function (err) {
            error.textContent = problemText(err);
            busy(go, false, 'Make my account');
          });
        // onAuthStateChanged shows the "check your email" screen
      } else {
        busy(go, true, 'Logging in...');
        auth.signInWithEmailAndPassword(address, pass.value).catch(function (err) {
          error.textContent = problemText(err);
          busy(go, false, 'Log in');
        });
      }
    });
  }

  // Waiting for them to click the link in their email
  function showVerify(user) {
    body.innerHTML = `
      <span class="auth-mail">${MAIL}</span>
      <h1 class="auth-title">Check your email</h1>
      <p class="auth-note">We sent a link to <b></b>. Click it to prove the email is yours, then come back here.</p>
      <p class="auth-note small">Can't find it? Look in your spam or junk folder.</p>
      <p class="error" role="alert"></p>
      <p class="auth-ok" role="status"></p>
      <button class="btn auth-go" type="button">I clicked the link</button>
      <div class="auth-row">
        <button type="button" class="link-btn auth-again">Send the email again</button>
        <button type="button" class="link-btn auth-other">Use a different account</button>
      </div>
    `;
    body.querySelector('.auth-note b').textContent = user.email;
    const error = body.querySelector('.error');
    const ok = body.querySelector('.auth-ok');
    const go = body.querySelector('.auth-go');

    go.addEventListener('click', function () {
      error.textContent = '';
      ok.textContent = '';
      busy(go, true, 'Checking...');
      user.reload().then(function () {
        if (auth.currentUser && auth.currentUser.emailVerified) {
          startApp(auth.currentUser);
        } else {
          error.textContent = 'Your email isn\'t verified yet. Click the link in the email, then try again.';
          busy(go, false, 'I clicked the link');
        }
      }).catch(function (e) {
        error.textContent = problemText(e);
        busy(go, false, 'I clicked the link');
      });
    });
    body.querySelector('.auth-again').addEventListener('click', function () {
      error.textContent = '';
      ok.textContent = '';
      user.sendEmailVerification().then(function () {
        ok.textContent = 'Sent! Check your email.';
      }).catch(function (e) { error.textContent = problemText(e); });
    });
    body.querySelector('.auth-other').addEventListener('click', function () {
      auth.signOut();
    });
    go.focus();
  }

  // Couldn't load Firebase (no internet, or it's blocked)
  function showOffline() {
    body.innerHTML = '<h1 class="auth-title">Can\'t connect</h1><p class="auth-note">Logging in needs the internet. Check your connection, then try again.</p><button class="btn auth-go" type="button">Try again</button>';
    body.querySelector('button').addEventListener('click', function () { location.reload(); });
  }

  // ---------- Load Firebase, then watch who is logged in ----------
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  const base = 'https://www.gstatic.com/firebasejs/' + FIREBASE_VERSION + '/';
  const ready = window.firebase && window.firebase.auth
    ? Promise.resolve()
    : loadScript(base + 'firebase-app-compat.js').then(function () { return loadScript(base + 'firebase-auth-compat.js'); });

  ready.then(function () {
    if (!firebase.apps.length) firebase.initializeApp(config);
    auth = firebase.auth();
    auth.onAuthStateChanged(function (user) {
      if (started) return;
      if (!user) showLogin('login');
      else if (!user.emailVerified) showVerify(user);
      else startApp(user);
    });
  }).catch(showOffline);
})();
