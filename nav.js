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

    function toggleMenu(forceOpen) {
      const isOpen = forceOpen !== undefined ? forceOpen : !menu.classList.contains('open');
      btn.classList.toggle('active', isOpen);
      menu.classList.toggle('open', isOpen);
      if (backdrop) backdrop.classList.toggle('open', isOpen);
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      menu.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
      if (backdrop) backdrop.setAttribute('aria-hidden', isOpen ? 'false' : 'true');

      // Impedisci lo scroll della pagina di sfondo quando il menu è aperto
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      toggleMenu();
    });

    if (backdrop) {
      backdrop.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
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

    // Chiudi se si clicca all'esterno del menu e del bottone
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
