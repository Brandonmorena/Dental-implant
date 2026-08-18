/* Site behaviour: mobile nav, consult form validation, footer year.
   Plain ES5-compatible DOM code, no build step, no dependencies. */
(function () {
  'use strict';

  /* ---------- Mobile navigation ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('primary-nav');

  function isMobile() {
    return window.matchMedia('(max-width: 980px)').matches;
  }

  function setNavOpen(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    nav.hidden = !open;
  }

  function syncNav() {
    if (!nav) return;
    if (isMobile()) {
      setNavOpen(toggle && toggle.getAttribute('aria-expanded') === 'true');
    } else {
      nav.hidden = false;
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    }
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setNavOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a') && isMobile()) setNavOpen(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && isMobile() && toggle.getAttribute('aria-expanded') === 'true') {
        setNavOpen(false);
        toggle.focus();
      }
    });

    window.addEventListener('resize', syncNav);
    syncNav();
  }

  /* ---------- Consultation request form ----------
     No backend is wired up: the page ships as static HTML. Point the form at
     your practice-management endpoint (or a form service) by setting the
     `action` attribute, and this handler steps aside automatically. */
  var form = document.querySelector('[data-consult-form]');

  if (form && !form.getAttribute('action')) {
    var status = form.querySelector('[data-form-status]');

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      if (typeof form.reportValidity === 'function' && !form.reportValidity()) return;

      var name = (form.elements.name && form.elements.name.value || '').trim();
      if (status) {
        status.textContent = name
          ? 'Thanks, ' + name + '. This demo form is not connected to a mailbox yet — ' +
            'call the office to confirm your consultation.'
          : 'This demo form is not connected to a mailbox yet — call the office to confirm your consultation.';
        status.focus();
      }
    });
  }

  /* ---------- Persistent CTA dock ----------
     Visible only in the middle of the page: after the hero has scrolled away,
     and not while the booking form is on screen. Dismissal lasts the session. */
  var dock = document.querySelector('[data-cta-dock]');

  if (dock) {
    var hero = document.querySelector('.hero');
    var consult = document.getElementById('consult');
    var pastHero = false;
    var atConsult = false;
    var dismissed = false;

    try {
      dismissed = window.sessionStorage.getItem('ctaDockDismissed') === '1';
    } catch (e) {
      /* private mode or storage disabled — treat as not dismissed */
    }

    function updateDock() {
      dock.classList.toggle('is-visible', !dismissed && pastHero && !atConsult);
    }

    if ('IntersectionObserver' in window) {
      if (hero) {
        new IntersectionObserver(function (entries) {
          pastHero = !entries[0].isIntersecting;
          updateDock();
        }, { threshold: 0 }).observe(hero);
      } else {
        pastHero = true;
      }

      if (consult) {
        new IntersectionObserver(function (entries) {
          atConsult = entries[0].isIntersecting;
          updateDock();
        }, { threshold: 0 }).observe(consult);
      }
    } else {
      // Fallback: show past one viewport, hide near the end of the page.
      window.addEventListener('scroll', function () {
        var y = window.pageYOffset;
        pastHero = y > window.innerHeight;
        atConsult = consult ? y + window.innerHeight > consult.offsetTop : false;
        updateDock();
      });
    }

    var dismiss = dock.querySelector('[data-cta-dismiss]');
    if (dismiss) {
      dismiss.addEventListener('click', function () {
        dismissed = true;
        updateDock();
        try {
          window.sessionStorage.setItem('ctaDockDismissed', '1');
        } catch (e) {
          /* nothing to persist to — it stays hidden for this page view */
        }
      });
    }

    updateDock();
  }

  /* ---------- Promo modal ----------
     Free-consultation popup, shown once per session 3 seconds after the page
     loads. Reuses the sessionStorage-dismiss pattern already used for the
     CTA dock, so a visitor who closes it does not see it again this visit. */
  var promoModal = document.querySelector('[data-promo-modal]');

  if (promoModal) {
    var promoAlreadyShown = false;
    try {
      promoAlreadyShown = window.sessionStorage.getItem('promoModalShown') === '1';
    } catch (e) {
      /* private mode or storage disabled — falls back to once per page load */
    }

    var promoLastFocused = null;

    function onPromoKeydown(event) {
      if (event.key === 'Escape') {
        closePromoModal();
        return;
      }
      if (event.key !== 'Tab') return;
      var focusable = promoModal.querySelectorAll('a[href], button:not([disabled])');
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    function openPromoModal() {
      promoLastFocused = document.activeElement;
      promoModal.classList.add('is-open');
      /* The close button is still visibility:hidden in this same tick, and
         one requestAnimationFrame is not reliably enough of a wait either —
         the transition needs a full frame to actually commit before an
         element inside it becomes focusable. A nested rAF (wait for the
         frame after next) is the standard way to defer past that. */
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          var closeBtn = promoModal.querySelector('.promo-modal__close');
          if (closeBtn) closeBtn.focus();
        });
      });
      document.addEventListener('keydown', onPromoKeydown);
    }

    function closePromoModal() {
      promoModal.classList.remove('is-open');
      document.removeEventListener('keydown', onPromoKeydown);
      if (promoLastFocused && typeof promoLastFocused.focus === 'function') {
        promoLastFocused.focus();
      }
      try {
        window.sessionStorage.setItem('promoModalShown', '1');
      } catch (e) {
        /* nothing to persist to — it may show again on the next page load */
      }
    }

    promoModal.addEventListener('click', function (event) {
      if (event.target === promoModal) closePromoModal();
    });

    var promoDismissers = promoModal.querySelectorAll('[data-promo-dismiss]');
    for (var i = 0; i < promoDismissers.length; i++) {
      promoDismissers[i].addEventListener('click', closePromoModal);
    }

    if (!promoAlreadyShown) {
      window.setTimeout(openPromoModal, 3000);
    }
  }

  /* ---------- Footer year ---------- */
  var year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
