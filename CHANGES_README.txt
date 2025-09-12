
# Added pages

- manager.html — Manager PIN gate (PIN: 2468) → centered tiles to site dashboards
- auditor.html — Auditor PIN gate (PIN: 1357) → centered site tiles
- audit.html — Site-specific Audit Forms with top site-switch control
- tutorials.html — Tutorials grid linking to tutorial-view.html
- tutorial-view.html — Centered video/PDF page with a prominent "Read PDF" button

Also patched login.js to store `userName`, `userEmail`, and `userBusiness` in sessionStorage.
Each dashboard page now shows a top "Welcome, {name}" banner.

You can change PINs inside each HTML file (search for MANAGER_PIN / AUDITOR_PIN).
