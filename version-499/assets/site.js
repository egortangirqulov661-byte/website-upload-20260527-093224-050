(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-mobile-nav]');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var active = 0;

  function showSlide(index) {
    if (!slides.length) return;
    active = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === active);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === active);
    });
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      showSlide(i);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(active + 1);
    }, 5200);
  }

  var searchInput = document.querySelector('[data-search]');
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      var value = searchInput.value.trim().toLowerCase();
      document.querySelectorAll('.movie-card').forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-year') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-genre') || '',
          card.getAttribute('data-type') || ''
        ].join(' ').toLowerCase();
        card.classList.toggle('hidden-card', value && haystack.indexOf(value) === -1);
      });
    });
  }

  document.querySelectorAll('[data-video]').forEach(function (box) {
    var video = box.querySelector('video');
    var cover = box.querySelector('[data-play]');
    var source = box.getAttribute('data-stream');
    var hlsInstance = null;

    function loadAndPlay() {
      if (!video || !source) return;
      if (cover) cover.classList.add('hidden');
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (video.src !== source) video.src = source;
        video.play().catch(function () {});
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls();
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        if (video.src !== source) video.src = source;
        video.play().catch(function () {});
      }
    }

    if (cover) cover.addEventListener('click', loadAndPlay);
    video.addEventListener('click', function () {
      if (!video.src) loadAndPlay();
    });
  });
})();
