/**
 * MENU AD HAMBURGER RESPONSIVE PER SMARTPHONE
 * Gestisce apertura/chiusura drawer mobile, transizioni fluide e accessibilità ARIA.
 */

(function () {
  'use strict';

  function initMobileMenu() {
    const btn = document.getElementById('hamburgerBtn');
    const menu = document.getElementById('mobileMenu');
    const backdrop = document.getElementById('mobileMenuBackdrop');

    if (!btn || !menu) return;

    function toggleMenu(open) {
      const isOpen = open !== undefined ? open : !menu.classList.contains('open');
      btn.classList.toggle('active', isOpen);
      menu.classList.toggle('open', isOpen);
      if (backdrop) backdrop.classList.toggle('open', isOpen);
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      menu.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
      if (backdrop) backdrop.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    }

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleMenu();
    });

    if (backdrop) {
      backdrop.addEventListener('click', function () {
        toggleMenu(false);
      });
    }

    // Chiudi il menu quando l'utente clicca su un link di navigazione
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        toggleMenu(false);
      });
    });

    // Chiudi alla pressione del tasto Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('open')) {
        toggleMenu(false);
      }
    });

    // Chiudi se si clicca all'esterno del menu
    document.addEventListener('click', function (e) {
      if (menu.classList.contains('open') && !menu.contains(e.target) && !btn.contains(e.target)) {
        toggleMenu(false);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileMenu);
  } else {
    initMobileMenu();
  }
})();
