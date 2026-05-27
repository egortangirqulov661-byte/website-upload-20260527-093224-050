(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function initMenu() {
    var toggle = document.querySelector('.mobile-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!toggle || !panel) return;
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initSearchForms() {
    document.querySelectorAll('.search-form').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) {
          event.preventDefault();
          window.location.href = form.getAttribute('action') || 'movies.html';
        }
      });
    });
  }

  function initPosters() {
    document.querySelectorAll('img[data-poster]').forEach(function (img) {
      img.addEventListener('error', function () {
        var box = img.closest('.poster-box');
        if (box) box.classList.add('is-empty');
      }, { once: true });
    });
  }

  function initHero() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) return;
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) return;
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) window.clearInterval(timer);
    }

    if (prev) prev.addEventListener('click', function () { show(index - 1); start(); });
    if (next) next.addEventListener('click', function () { show(index + 1); start(); });
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { show(i); start(); });
    });
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    var page = document.querySelector('[data-filter-page]');
    if (!page) return;
    var cards = Array.prototype.slice.call(page.querySelectorAll('[data-card]'));
    var q = page.querySelector('[data-filter-search]');
    var region = page.querySelector('[data-filter-region]');
    var type = page.querySelector('[data-filter-type]');
    var year = page.querySelector('[data-filter-year]');
    var genre = page.querySelector('[data-filter-genre]');
    var count = page.querySelector('[data-filter-count]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q');

    if (initial && q) q.value = initial;

    function value(el) {
      return el ? el.value.trim() : '';
    }

    function apply() {
      var keyword = value(q).toLowerCase();
      var regionValue = value(region);
      var typeValue = value(type);
      var yearValue = value(year);
      var genreValue = value(genre);
      var visible = 0;

      cards.forEach(function (card) {
        var ok = true;
        if (keyword && card.getAttribute('data-search').indexOf(keyword) === -1) ok = false;
        if (regionValue && card.getAttribute('data-region') !== regionValue) ok = false;
        if (typeValue && card.getAttribute('data-type') !== typeValue) ok = false;
        if (yearValue && card.getAttribute('data-year') !== yearValue) ok = false;
        if (genreValue && card.getAttribute('data-genre').indexOf(genreValue) === -1) ok = false;
        card.classList.toggle('hidden-by-filter', !ok);
        if (ok) visible += 1;
      });

      if (count) count.textContent = String(visible);
    }

    [q, region, type, year, genre].forEach(function (el) {
      if (!el) return;
      el.addEventListener(el.tagName === 'INPUT' ? 'input' : 'change', apply);
    });

    apply();
  }

  ready(function () {
    initMenu();
    initSearchForms();
    initPosters();
    initHero();
    initFilters();
  });
})();
