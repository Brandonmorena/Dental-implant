/* Google Analytics 4.
 *
 * Replace MEASUREMENT_ID with your own property's ID (Admin → Data streams →
 * your web stream → "Measurement ID", format G-XXXXXXXXXX). Until you do, this
 * file does nothing at all — no network request, no console noise.
 *
 * Using Google Tag Manager instead? Swap the gtag/js URL for
 * https://www.googletagmanager.com/gtm.js?id=GTM-XXXXXXX and drop the two
 * gtag() calls; GTM manages configuration on its own.
 */
(function () {
  'use strict';

  var MEASUREMENT_ID = 'G-XXXXXXXXXX';

  if (!MEASUREMENT_ID || MEASUREMENT_ID === 'G-XXXXXXXXXX') return;

  var tag = document.createElement('script');
  tag.async = true;
  tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(MEASUREMENT_ID);
  document.head.appendChild(tag);

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', MEASUREMENT_ID);

  /* Conversions worth counting on a service page. A pageview-only tag cannot
     tell you which section produced the call. No form field values are sent —
     only that a submission happened. */
  document.addEventListener('click', function (event) {
    var link = event.target.closest && event.target.closest('a[href^="tel:"]');
    if (!link) return;
    gtag('event', 'phone_call_click', {
      link_url: link.getAttribute('href'),
      link_location: link.closest('[data-cta-dock]') ? 'sticky_cta' : 'page'
    });
  });

  var form = document.querySelector('[data-consult-form]');
  if (form) {
    form.addEventListener('submit', function () {
      var interest = form.elements.interest;
      gtag('event', 'generate_lead', {
        form_name: 'implant_consultation',
        treatment_interest: interest ? interest.value : ''
      });
    });
  }
})();
