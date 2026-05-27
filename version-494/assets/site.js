(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
    } else {
      document.addEventListener("DOMContentLoaded", callback);
    }
  }

  ready(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector(".hero-carousel");

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
      var prev = hero.querySelector(".hero-prev");
      var next = hero.querySelector(".hero-next");
      var current = 0;
      var timer = null;

      function showSlide(index) {
        if (!slides.length) {
          return;
        }

        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });

        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      function startTimer() {
        clearInterval(timer);
        timer = setInterval(function () {
          showSlide(current + 1);
        }, 5200);
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          showSlide(Number(dot.getAttribute("data-slide")) || 0);
          startTimer();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          showSlide(current - 1);
          startTimer();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          showSlide(current + 1);
          startTimer();
        });
      }

      startTimer();
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll(".site-search"));

    searchInputs.forEach(function (input) {
      var root = input.closest("main") || document;
      var cards = Array.prototype.slice.call(root.querySelectorAll(".movie-card"));

      input.addEventListener("input", function () {
        var keyword = input.value.trim().toLowerCase();

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-year") || "",
            card.getAttribute("data-region") || "",
            card.getAttribute("data-genre") || "",
            card.getAttribute("data-type") || "",
            card.textContent || ""
          ].join(" ").toLowerCase();

          card.classList.toggle("is-hidden", keyword && haystack.indexOf(keyword) === -1);
        });
      });
    });

    var panels = Array.prototype.slice.call(document.querySelectorAll(".player-panel"));

    panels.forEach(function (panel) {
      var video = panel.querySelector("video");
      var button = panel.querySelector(".player-start");
      var sourceElement = video ? video.querySelector("source") : null;
      var streamUrl = sourceElement ? sourceElement.getAttribute("src") : "";
      var initialized = false;

      function setupVideo() {
        if (!video || initialized || !streamUrl) {
          return;
        }

        initialized = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
      }

      function playVideo() {
        setupVideo();

        if (!video) {
          return;
        }

        var promise = video.play();

        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            panel.classList.remove("is-playing");
          });
        }
      }

      if (button) {
        button.addEventListener("click", playVideo);
      }

      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            playVideo();
          }
        });

        video.addEventListener("play", function () {
          panel.classList.add("is-playing");
        });

        video.addEventListener("pause", function () {
          panel.classList.remove("is-playing");
        });
      }
    });
  });
})();
