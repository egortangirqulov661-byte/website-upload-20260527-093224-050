import { H } from './hls.js';

(function () {
  function initPlayer(root) {
    var video = root.querySelector('video');
    var cover = root.querySelector('[data-play-cover]');
    var button = root.querySelector('[data-play-button]');
    if (!video) return;

    var playUrl = video.getAttribute('data-play');
    var started = false;
    var hls = null;

    function attach() {
      if (started || !playUrl) return;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = playUrl;
      } else if (H && H.isSupported()) {
        hls = new H({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(playUrl);
        hls.attachMedia(video);
      } else {
        video.src = playUrl;
      }
      started = true;
    }

    function play() {
      attach();
      root.classList.add('is-playing');
      video.controls = true;
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {
          root.classList.remove('is-playing');
        });
      }
    }

    if (cover) cover.addEventListener('click', play);
    if (button) button.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) play();
    });
    video.addEventListener('play', function () {
      root.classList.add('is-playing');
    });
    window.addEventListener('beforeunload', function () {
      if (hls && typeof hls.destroy === 'function') hls.destroy();
    });
  }

  document.querySelectorAll('[data-player]').forEach(initPlayer);
})();
