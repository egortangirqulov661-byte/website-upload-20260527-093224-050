(() => {
  const mobileButton = document.querySelector('.mobile-menu-button');
  const mobileNav = document.querySelector('.mobile-nav');

  if (mobileButton && mobileNav) {
    mobileButton.addEventListener('click', () => {
      mobileNav.classList.toggle('is-open');
    });
  }

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dot'));
  let activeSlide = 0;
  let slideTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === activeSlide);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === activeSlide);
    });
  }

  function startSlider() {
    if (slideTimer) {
      clearInterval(slideTimer);
    }

    if (slides.length > 1) {
      slideTimer = setInterval(() => showSlide(activeSlide + 1), 5200);
    }
  }

  document.querySelector('.hero-control--prev')?.addEventListener('click', () => {
    showSlide(activeSlide - 1);
    startSlider();
  });

  document.querySelector('.hero-control--next')?.addEventListener('click', () => {
    showSlide(activeSlide + 1);
    startSlider();
  });

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      showSlide(Number(dot.dataset.slide || 0));
      startSlider();
    });
  });

  showSlide(0);
  startSlider();

  const localSearch = document.querySelector('.local-search');
  const yearFilter = document.querySelector('.year-filter');
  const regionFilter = document.querySelector('.region-filter');
  const localCards = Array.from(document.querySelectorAll('.movie-card'));
  const emptyState = document.querySelector('.empty-state');

  if (localSearch && localCards.length) {
    const years = Array.from(new Set(localCards.map((card) => card.dataset.year).filter(Boolean))).sort((a, b) => Number(b) - Number(a));
    const regions = Array.from(new Set(localCards.map((card) => card.dataset.region).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'));

    years.forEach((year) => {
      const option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      yearFilter?.appendChild(option);
    });

    regions.forEach((region) => {
      const option = document.createElement('option');
      option.value = region;
      option.textContent = region;
      regionFilter?.appendChild(option);
    });

    const applyFilter = () => {
      const keyword = localSearch.value.trim().toLowerCase();
      const year = yearFilter?.value || '';
      const region = regionFilter?.value || '';
      let visible = 0;

      localCards.forEach((card) => {
        const text = [card.dataset.title, card.dataset.genre, card.dataset.region, card.dataset.year].join(' ').toLowerCase();
        const matched = (!keyword || text.includes(keyword)) && (!year || card.dataset.year === year) && (!region || card.dataset.region === region);
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.hidden = visible !== 0;
      }
    };

    localSearch.addEventListener('input', applyFilter);
    yearFilter?.addEventListener('change', applyFilter);
    regionFilter?.addEventListener('change', applyFilter);
  }

  const player = document.getElementById('moviePlayer');
  const playerStart = document.querySelector('.player-start');

  if (player) {
    const source = player.querySelector('source');
    const streamUrl = source?.getAttribute('src') || '';

    if (streamUrl && window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(player);
    } else if (streamUrl && player.canPlayType('application/vnd.apple.mpegurl')) {
      player.src = streamUrl;
    }

    const playNow = () => {
      player.play().catch(() => {});
    };

    playerStart?.addEventListener('click', playNow);
    player.addEventListener('click', () => {
      if (player.paused) {
        playNow();
      }
    });
    player.addEventListener('play', () => playerStart?.classList.add('is-hidden'));
    player.addEventListener('pause', () => playerStart?.classList.remove('is-hidden'));
  }

  const globalInput = document.getElementById('globalSearchInput');
  const globalResults = document.getElementById('searchResults');
  const globalEmpty = document.getElementById('searchEmpty');
  const searchHotSection = document.getElementById('searchHotSection');

  if (globalInput && globalResults && Array.isArray(window.searchMovies)) {
    const renderResults = (items) => {
      globalResults.innerHTML = items.map((movie) => `
        <article class="movie-card" data-title="${escapeAttribute(movie.title)}" data-year="${movie.year}" data-region="${escapeAttribute(movie.region)}" data-genre="${escapeAttribute(movie.genre)}">
          <a class="movie-card__poster" href="${movie.url}">
            <img src="${movie.cover}" alt="${escapeAttribute(movie.title)}">
            <span class="movie-card__play">播放</span>
          </a>
          <div class="movie-card__body">
            <div class="movie-card__meta"><span>${escapeHtml(movie.region)}</span><span>${movie.year}</span></div>
            <h3><a href="${movie.url}">${escapeHtml(movie.title)}</a></h3>
            <p>${escapeHtml(movie.oneLine)}</p>
          </div>
        </article>
      `).join('');
      globalEmpty.hidden = items.length !== 0;
      searchHotSection.hidden = items.length !== 0;
    };

    const applyGlobalSearch = () => {
      const keyword = globalInput.value.trim().toLowerCase();
      if (!keyword) {
        globalResults.innerHTML = '';
        globalEmpty.hidden = true;
        searchHotSection.hidden = false;
        return;
      }

      const items = window.searchMovies.filter((movie) => {
        return [movie.title, movie.region, String(movie.year), movie.genre, movie.oneLine]
          .join(' ')
          .toLowerCase()
          .includes(keyword);
      }).slice(0, 120);

      renderResults(items);
    };

    globalInput.addEventListener('input', applyGlobalSearch);
    document.querySelector('.site-search')?.addEventListener('submit', (event) => {
      event.preventDefault();
      applyGlobalSearch();
    });
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replaceAll('`', '&#096;');
  }
})();
