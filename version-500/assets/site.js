(function () {
  var body = document.body;
  var menuButton = document.querySelector('[data-menu-button]');

  if (menuButton) {
    menuButton.addEventListener('click', function () {
      body.classList.toggle('menu-open');
    });
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      var holder = image.closest('.poster-frame, .hero-slide, .rank-thumb, .detail-poster');
      if (holder) {
        holder.classList.add('image-missing');
      }
      image.remove();
    });
  });

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    if (slides.length <= 1) {
      return;
    }

    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        restart();
      });
    });

    show(0);
    restart();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

    panels.forEach(function (panel) {
      var scopeSelector = panel.getAttribute('data-filter-panel') || 'body';
      var scope = document.querySelector(scopeSelector) || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-card]'));
      var input = panel.querySelector('[data-filter-search]');
      var typeSelect = panel.querySelector('[data-filter-type]');
      var regionSelect = panel.querySelector('[data-filter-region]');
      var resetButton = panel.querySelector('[data-filter-reset]');
      var empty = scope.querySelector('[data-empty-result]');

      function normalize(value) {
        return String(value || '').toLowerCase().trim();
      }

      function apply() {
        var keyword = normalize(input && input.value);
        var type = normalize(typeSelect && typeSelect.value);
        var region = normalize(regionSelect && regionSelect.value);
        var visibleCount = 0;

        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags') + ' ' + card.getAttribute('data-genre'));
          var cardType = normalize(card.getAttribute('data-type'));
          var cardRegion = normalize(card.getAttribute('data-region'));
          var matched = true;

          if (keyword && haystack.indexOf(keyword) === -1) {
            matched = false;
          }

          if (type && cardType !== type) {
            matched = false;
          }

          if (region && cardRegion !== region) {
            matched = false;
          }

          card.classList.toggle('is-hidden', !matched);
          if (matched) {
            visibleCount += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('is-visible', visibleCount === 0);
        }
      }

      [input, typeSelect, regionSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });

      if (resetButton) {
        resetButton.addEventListener('click', function () {
          if (input) {
            input.value = '';
          }
          if (typeSelect) {
            typeSelect.value = '';
          }
          if (regionSelect) {
            regionSelect.value = '';
          }
          apply();
        });
      }

      apply();
    });
  }

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }

    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';
    script.async = true;
    script.onload = callback;
    script.onerror = function () {
      callback(new Error('hls.js load failed'));
    };
    document.head.appendChild(script);
  }

  function setupPlayers() {
    document.querySelectorAll('[data-play-source]').forEach(function (button) {
      button.addEventListener('click', function () {
        var source = button.getAttribute('data-play-source');
        var playerId = button.getAttribute('data-player-target') || 'movie-player';
        var video = document.getElementById(playerId);
        var cover = button.closest('.player-cover');
        var note = document.querySelector('[data-player-note]');

        if (!video || !source) {
          return;
        }

        function playNative() {
          video.src = source;
          video.play().catch(function () {
            if (note) {
              note.textContent = '浏览器已拦截自动播放，请再次点击视频播放按钮。';
            }
          });
        }

        if (cover) {
          cover.classList.add('is-hidden');
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          playNative();
          return;
        }

        loadHls(function () {
          if (window.Hls && window.Hls.isSupported()) {
            if (video._hlsInstance) {
              video._hlsInstance.destroy();
            }

            var hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true,
              backBufferLength: 90
            });

            video._hlsInstance = hls;
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {
                if (note) {
                  note.textContent = '视频已加载，请点击播放器开始播放。';
                }
              });
            });
            hls.on(window.Hls.Events.ERROR, function (event, data) {
              if (data && data.fatal) {
                if (note) {
                  note.textContent = '当前播放源加载异常，可刷新页面后重试。';
                }
                hls.destroy();
                video.src = source;
              }
            });
          } else {
            playNative();
          }
        });
      });
    });
  }

  setupHero();
  setupFilters();
  setupPlayers();
})();
