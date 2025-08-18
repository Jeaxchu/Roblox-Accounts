// ==UserScript==
// @name         Roblox Alt Creator (Dictionary Auto Run, Retry Username, Auto Submit)
// @namespace    http://tampermonkey.net/
// @version      2.5
// @description  Automatically autofills the Roblox signup form with realistic usernames, retries if taken, and auto-clicks Sign Up.
// @author       find
// @match       https://www.roblox.com/*
// @match        https://www.roblox.com/CreateAccount
// @match        https://www.roblox.com/CreateAccount?returnUrl=https%3A%2F%2Fwww.roblox.com%2FCreateAccount%2A
// @run-at       document-idle
// @grant        GM_getResourceText
// @resource     WORDS https://raw.githubusercontent.com/dwyl/english-words/master/words.txt
// @license      MIT
// ==/UserScript==

(function () {
  'use strict';

  const MIN_BIRTH_YEAR = 1990;
  const MAX_BIRTH_YEAR = 2005;

  // --- Load dictionary
  let WORDS = [];
  try {
    const raw = GM_getResourceText('WORDS') || '';
    WORDS = raw.split(/\r?\n/).map(w => w.trim().toLowerCase())
      .filter(w => /^[a-z]+$/.test(w) && w.length >= 3 && w.length <= 8);
    if (WORDS.length > 25000) WORDS = WORDS.slice(0, 25000);
  } catch (e) {
    console.error('Dictionary resource failed:', e);
    WORDS = ['alex','mika','ryan','luna','nova','aria','ken','niko','tori','luka','kai','ivan','keira'];
  }

  function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function randNum(n) { return Math.floor(Math.random() * n); }

  function generateUsername() {
    const w1 = rand(WORDS);
    const w2 = rand(WORDS);
    const joiners = ['', '', '', '', '_'];
    const join = rand(joiners);

    let candidates = [
      w1,
      w1 + randNum(10000),
      w1 + join + w2,
      w1 + w2,
      w1 + randNum(100),
      w1 + w1.slice(-1),
      w1 + (randNum(9) + 1) + (randNum(9) + 1),
    ];

    let u = rand(candidates);
    if (!/^[a-z]/.test(u)) u = 'u' + u;
    if (u.length < 3) u = (u + rand(WORDS)).slice(0, 6);
    if (u.length > 20) u = u.slice(0, 20);

    return u;
  }

  function setDropdownValue(id, value) {
    const el = document.getElementById(id);
    if (el) {
      el.value = value;
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  function setInputValue(id, value) {
    const el = document.getElementById(id);
    if (el) {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(el, value);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      el.dispatchEvent(new Event('blur', { bubbles: true }));
    }
  }

  const wait = (ms) => new Promise(res => setTimeout(res, ms));

  async function tryUsernameUntilAvailable() {
    let attempts = 0;
    while (true) {
      attempts++;
      setInputValue('signup-username', generateUsername());
      await wait(1000);

      const msgEl = document.getElementById('signup-usernameInputValidation');
      const text = (msgEl && (msgEl.innerText || msgEl.textContent) || '').trim();

      if (!/This username is already in use\.|Username not appropriate for Roblox\./i.test(text)) {
        break;
      }
      if (attempts >= 50) {
        console.warn('Username retry soft cap reached.');
        break;
      }
    }
  }

  async function fillForm() {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const randomMonth = rand(months);
    const randomDay = String(randNum(28) + 1).padStart(2, '0');
    const randomYear = String(randNum(MAX_BIRTH_YEAR - MIN_BIRTH_YEAR + 1) + MIN_BIRTH_YEAR);

    setDropdownValue('MonthDropdown', randomMonth);
    setDropdownValue('DayDropdown', randomDay);
    setDropdownValue('YearDropdown', randomYear);

    setInputValue('signup-password', 'whotfisjoe');

    await tryUsernameUntilAvailable();

    if (Math.random() < 0.5) {
      document.getElementById('FemaleButton')?.click();
    } else {
      document.getElementById('MaleButton')?.click();
    }

    // ✅ Auto-click Sign Up after validation
    document.getElementById("signup-button")?.click();
    console.log("✅ Auto-clicked Sign Up");
  }

  let tries = 0;
  const observer = new MutationObserver(() => {
    const ready = document.getElementById('signup-button')
      && document.getElementById('signup-username')
      && document.getElementById('signup-password');
    if (ready && WORDS.length) {
      fillForm();
      tries++;
      if (tries >= 2) observer.disconnect();
      setTimeout(() => { if (tries < 2) fillForm(); tries++; }, 600);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
