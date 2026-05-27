(function () {
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  const slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    const slides = Array.from(slider.querySelectorAll('[data-slide]'));
    const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
    const prev = slider.querySelector('[data-hero-prev]');
    const next = slider.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  const filterPanel = document.querySelector('[data-filter-panel]');

  if (filterPanel) {
    const keyword = filterPanel.querySelector('[data-filter-keyword]');
    const year = filterPanel.querySelector('[data-filter-year]');
    const type = filterPanel.querySelector('[data-filter-type]');
    const reset = filterPanel.querySelector('[data-filter-reset]');
    const cards = Array.from(document.querySelectorAll('[data-card]'));
    const empty = document.querySelector('[data-empty-state]');

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilter() {
      const q = normalize(keyword ? keyword.value : '');
      const yearValue = year ? year.value : '';
      const typeValue = type ? type.value : '';
      let visible = 0;

      cards.forEach(function (card) {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.category,
          card.dataset.tags,
          card.dataset.year,
          card.dataset.type
        ].join(' '));
        const matchKeyword = !q || haystack.indexOf(q) !== -1;
        const matchYear = !yearValue || card.dataset.year === yearValue;
        const matchType = !typeValue || card.dataset.type === typeValue;
        const showCard = matchKeyword && matchYear && matchType;
        card.style.display = showCard ? '' : 'none';
        if (showCard) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [keyword, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    if (reset) {
      reset.addEventListener('click', function () {
        if (keyword) {
          keyword.value = '';
        }
        if (year) {
          year.value = '';
        }
        if (type) {
          type.value = '';
        }
        applyFilter();
      });
    }
  }

  const searchRoot = document.querySelector('[data-search-root]');

  if (searchRoot && window.SEARCH_MOVIES) {
    const form = searchRoot.querySelector('[data-search-form]');
    const input = searchRoot.querySelector('[data-search-input]');
    const grid = searchRoot.querySelector('[data-search-results]');
    const status = searchRoot.querySelector('[data-search-status]');
    const params = new URLSearchParams(window.location.search);
    const initial = params.get('q') || '';

    function clean(value) {
      return String(value || '').trim().toLowerCase();
    }

    function itemTemplate(item) {
      return [
        '<article class="movie-card">',
        '  <a href="' + item.url + '">',
        '    <div class="poster-wrap">',
        '      <img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '" loading="lazy">',
        '      <span class="badge badge-left">' + item.type + '</span>',
        '      <span class="badge badge-right">' + item.year + '</span>',
        '      <span class="play-hover">▶</span>',
        '    </div>',
        '    <div class="movie-card-body">',
        '      <h3>' + item.title + '</h3>',
        '      <p>' + item.oneLine + '</p>',
        '      <div class="card-meta"><span>' + item.region + '</span><span>' + item.category + '</span></div>',
        '    </div>',
        '  </a>',
        '</article>'
      ].join('');
    }

    function render(query) {
      const q = clean(query);
      const results = window.SEARCH_MOVIES.filter(function (item) {
        if (!q) {
          return item.featured;
        }
        return clean([
          item.title,
          item.region,
          item.type,
          item.year,
          item.category,
          item.tags,
          item.oneLine
        ].join(' ')).indexOf(q) !== -1;
      }).slice(0, q ? 120 : 48);

      grid.innerHTML = results.map(itemTemplate).join('');
      if (status) {
        status.textContent = q ? '相关影片已为你筛选完成。' : '精选热门影片如下。';
      }
    }

    if (input) {
      input.value = initial;
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        const value = input ? input.value : '';
        const url = new URL(window.location.href);
        if (value.trim()) {
          url.searchParams.set('q', value.trim());
        } else {
          url.searchParams.delete('q');
        }
        window.history.replaceState({}, '', url.toString());
        render(value);
      });
    }

    render(initial);
  }
})();
