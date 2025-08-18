// ==UserScript==
// @name         Roblox Auto Follow + Add Connection + Logout + Accept Risk
// @namespace    http://tampermonkey.net/
// @version      1.6
// @description  Auto Follow first, then Add Connection, close menu, logout, and click "Accept Risk" on Roblox
// @author       You
// @match        *://*.roblox.com/users/*/profile
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function waitForElement(selector, callback, interval = 500, maxTries = 40) {
        let tries = 0;
        const timer = setInterval(() => {
            const el = document.querySelector(selector);
            tries++;
            if (el) {
                clearInterval(timer);
                callback(el);
            } else if (tries >= maxTries) {
                clearInterval(timer);
                console.warn("Element not found:", selector);
            }
        }, interval);
    }

    // 1️⃣ Click the three-dot menu first
    waitForElement('button[aria-label="See More"]', (menuBtn) => {
        menuBtn.click();
        console.log("✅ Clicked three-dot menu");

        // 2️⃣ Click Follow first
        waitForElement('#follow-button', (followBtn) => {
            followBtn.click();
            console.log("✅ Followed user!");

            // 3️⃣ Click "Add Connection" after short delay
            setTimeout(() => {
                waitForElement('span.web-blox-css-tss-1283320-Button-textContainer', (addBtn) => {
                    addBtn.click();
                    console.log("✅ Clicked 'Add Connection'");

                        // 3️⃣ Click Settings button
                setTimeout(() => {
                    waitForElement('button.btn-navigation-nav-settings-md', (settingsBtn) => {
                        settingsBtn.click();
                        console.log("✅ Clicked Settings");

                        // 4️⃣ Click Logout inside Settings
                        setTimeout(() => {
                            waitForElement('a.rbx-menu-item.logout-menu-item', (logoutBtn) => {
                                logoutBtn.click();
                                console.log("✅ Logged out!");
                                // 6️⃣ Click "Accept Risk" after logout page loads
                                setTimeout(() => {
                                    waitForElement('button.change-email-button', (acceptBtn) => {
                                        acceptBtn.click();
                                        console.log("✅ Clicked 'Accept Risk of Losing Account and Log Out'");
                                    }, 500, 20);
                                }, 1000); // wait a bit for logout modal/page
                            }, 500, 20);
                        }, 500);

                    }, 500, 20);
                }, 500);

                }, 500, 20);
            }, 500);

        }, 500, 20);

    }, 500, 20);

})();
