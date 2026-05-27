document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('[data-mobile-toggle]');
  var nav = document.querySelector('[data-main-nav]');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeIndex = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeIndex);
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener('click', function () {
      showSlide(dotIndex);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5000);
  }

  var searchForms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));

  searchForms.forEach(function (form) {
    var scope = document.querySelector(form.getAttribute('data-filter-form')) || document;
    var input = form.querySelector('[data-filter-keyword]');
    var year = form.querySelector('[data-filter-year]');
    var category = form.querySelector('[data-filter-category]');
    var note = document.querySelector(form.getAttribute('data-filter-note'));
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-title]'));

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilter() {
      var keywordValue = normalize(input ? input.value : '');
      var yearValue = normalize(year ? year.value : '');
      var categoryValue = normalize(category ? category.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-category')
        ].join(' ').toLowerCase();
        var cardYear = normalize(card.getAttribute('data-year'));
        var cardCategory = normalize(card.getAttribute('data-category'));
        var matched = true;

        if (keywordValue && haystack.indexOf(keywordValue) === -1) {
          matched = false;
        }

        if (yearValue && cardYear !== yearValue) {
          matched = false;
        }

        if (categoryValue && cardCategory !== categoryValue) {
          matched = false;
        }

        card.style.display = matched ? '' : 'none';

        if (matched) {
          visible += 1;
        }
      });

      if (note) {
        note.textContent = '当前显示 ' + visible + ' 部影片';
      }
    }

    ['input', 'change'].forEach(function (eventName) {
      form.addEventListener(eventName, applyFilter);
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilter();
    });

    applyFilter();
  });

  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (shell) {
    var video = shell.querySelector('video');
    var cover = shell.querySelector('[data-play]');
    var source = shell.getAttribute('data-source');
    var initialized = false;

    function startPlayer() {
      if (!video || !source) {
        return;
      }

      if (!initialized) {
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          video._hls = hls;
        } else {
          video.src = source;
        }

        initialized = true;
      }

      shell.classList.add('is-playing');
      video.play().catch(function () {
        video.controls = true;
      });
    }

    if (cover) {
      cover.addEventListener('click', startPlayer);
    }
  });
});
