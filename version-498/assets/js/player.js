(function () {
  const player = document.querySelector('[data-player]');

  if (!player) {
    return;
  }

  const video = player.querySelector('video');
  const playButton = player.querySelector('.play-overlay');
  const streamUrl = player.getAttribute('data-stream');
  let attached = false;
  let hls = null;

  function attachMedia() {
    if (attached) {
      return Promise.resolve();
    }

    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return Promise.resolve();
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      return new Promise(function (resolve) {
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          resolve();
        });
        window.setTimeout(resolve, 1200);
      });
    }

    video.src = streamUrl;
    return Promise.resolve();
  }

  function playVideo() {
    attachMedia().then(function () {
      const action = video.play();
      if (action && typeof action.catch === 'function') {
        action.catch(function () {});
      }
    });
  }

  if (playButton) {
    playButton.addEventListener('click', function () {
      playButton.classList.add('is-hidden');
      playVideo();
    });
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      if (playButton) {
        playButton.classList.add('is-hidden');
      }
      playVideo();
    } else {
      video.pause();
    }
  });

  video.addEventListener('play', function () {
    if (playButton) {
      playButton.classList.add('is-hidden');
    }
  });

  video.addEventListener('ended', function () {
    if (playButton) {
      playButton.classList.remove('is-hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
})();
