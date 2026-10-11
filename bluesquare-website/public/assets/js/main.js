// Blue Square AI — minimal site script (no dependencies)
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Contact form: no backend yet, so compose an email to info@bluesquare.ai.
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var d = new FormData(form);
      var subject = 'Website enquiry: ' + (d.get('topic') || 'General') + ' — ' + d.get('name');
      var body =
        'Name: ' + d.get('name') + '\n' +
        'Company: ' + (d.get('company') || '-') + '\n' +
        'Email: ' + d.get('email') + '\n' +
        'Phone: ' + (d.get('phone') || '-') + '\n' +
        'Topic: ' + (d.get('topic') || '-') + '\n\n' +
        d.get('message');
      window.location.href = 'mailto:info@bluesquare.ai?subject=' +
        encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      var note = document.getElementById('form-status');
      if (note) note.textContent = 'Your email app should open with the message ready to send. If it does not, write to us at info@bluesquare.ai.';
    });
  }
})();
