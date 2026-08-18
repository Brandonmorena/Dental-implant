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

  /* ---------- Footer year ---------- */
  var year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
