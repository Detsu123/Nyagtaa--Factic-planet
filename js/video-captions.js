// Timed English captions for the four 1280x720 films in assets/vid.
// Times include the fades of the original burned-in Mongolian subtitles.
// `lines` is the original subtitle height, so the opaque panel covers it fully.
const VIDEO_CAPTIONS = {
  'intro.mp4': [
    [0.7, 7.0, 2, 'Long ago, somewhere in this vast universe, there was a little world called Planet Fact.'],
    [7.4, 16.3, 3, 'The Faktiks who lived there never lied. There were no arguments or suspicions. They lived together in peace and happiness.'],
    [16.6, 21.8, 2, 'Then one day, a dark force of lies and deceit arrived from distant space.'],
    [22.3, 27.05, 1, 'So many happy faces... So much to feast on...', '#e5bcff'],
    [27.05, 37.45, 3, 'This evil force fed on fear, anger and sadness. It slipped inside the Faktiks, spread false news through their words, and turned them against each other.'],
    [37.45, 41.6, 1, 'The angrier they became, the more their planet lost its colors...'],
    [41.7, 47.3, 2, 'In this dark time, a humble but curious and honest Faktik stepped forward.'],
    [47.3, 49.3, 1, 'Who said that? How do they know?', '#a0f3ff'],
    [49.3, 51.1, 1, "...I'll find out!", '#a0f3ff'],
    [51.1, 57.7, 2, 'This is Nyagtaa. Nyagtaa set out on a journey to stop deception and defeat the darkness.'],
    [57.8, 60.5, 1, 'Can Nyagtaa save Planet Fact?'],
  ],
  'alarm.mp4': [
    [2.8, 8.6, 2, 'Everyone, stop! Drop your work! A bear! A giant bear is coming from the forest to the village!', '#ffe49b'],
    [8.6, 14.85, 2, "The village guard has issued a warning too! Close the gates and prepare our defenses! Hurry! There's no time to check!", '#ffe49b'],
    [14.85, 17.5, 1, 'A bear! Bataa never lies!'],
    [18.8, 28.6, 3, 'Wait... Uncle Bataa never used to lie. But since Khuurmag arrived, we need to check every piece of news. Check seven times, share once!', '#a0f3ff'],
  ],
  'dad.mp4': [
    [1.1, 5.5, 2, 'Uncle Bataa, the news you brought is false! Light of truth... shine!', '#a0f3ff'],
    [11.6, 17.4, 2, "You got lucky this time, little four-eyes! It won't be so easy next time!", '#e5bcff'],
    [20.3, 28.35, 2, "I... what happened? Something cold and horrible whispered to me at the forest edge... I'm sorry, everyone."],
    [28.35, 33.15, 2, 'Thank you, Nyagtaa! Without your checking, we would have had no firewood for winter!', '#ffc7e7'],
    [33.15, 38.4, 2, 'When you hear exciting news, stop and check. Check seven times, share once!', '#a0f3ff'],
  ],
  'dark.mp4': [
    [0.7, 7.0, 2, 'The villagers left their work and built a fence. A whole day passed... but no bear came.'],
    [7.4, 10.6, 1, 'A whole day wasted! Who spread this rumor?!'],
    [10.7, 17.3, 2, 'The winter firewood was left unprepared. Their anger flowed toward Khuurmag as black smoke.'],
    [17.3, 21.8, 1, 'Ha ha ha! Fear and anger... how delicious!', '#e5bcff'],
    [23.1, 26.7, 1, "I believed it without checking... Let's try again!", '#a0f3ff'],
  ],
};

const VideoCaptions = {
  track(src) { return VIDEO_CAPTIONS[src.split(/[?#]/)[0].split('/').pop()] || []; },
  cueAt(track, time) { return track.find(cue => time >= cue[0] && time < cue[1]) || null; },
  // object-fit: contain can leave bars on either axis. Anchor to the film, not the viewport.
  bounds(width, height, videoWidth, videoHeight) {
    const scale = Math.min(width / videoWidth, height / videoHeight);
    const w = videoWidth * scale, h = videoHeight * scale;
    return { left: (width - w) / 2, top: (height - h) / 2, width: w, height: h, scale: h / 720 };
  },
  attach(video, panel, src) {
    const track = this.track(src), label = panel.querySelector('span');
    let disposed = false, current = null, frame = null;
    const videoFrames = typeof video.requestVideoFrameCallback === 'function';
    const layout = () => {
      if (!current || panel.hidden) return;
      const b = this.bounds(video.clientWidth, video.clientHeight, video.videoWidth || 1280, video.videoHeight || 720);
      if (!b.width || !b.height) return;
      // Native captions end 18px above the film's bottom. Include a small masking margin.
      const height = current[2] * 38 + 28;
      Object.assign(panel.style, {
        left: `${b.left + b.width * 0.07}px`, top: `${b.top + b.height - (height + 10) * b.scale}px`,
        width: `${b.width * 0.86}px`, height: `${height * b.scale}px`,
        padding: `${8 * b.scale}px ${16 * b.scale}px`, borderRadius: `${10 * b.scale}px`,
      });
      let size = 28;
      label.style.fontSize = `${size * b.scale}px`;
      while (size > 16 && (label.scrollHeight > (height - 16) * b.scale + 1 || label.scrollWidth > panel.clientWidth - 32 * b.scale + 1)) {
        label.style.fontSize = `${--size * b.scale}px`;
      }
    };
    const render = (time = video.currentTime) => {
      if (disposed) return;
      const cue = I18N.lang === 'en' ? this.cueAt(track, time) : null;
      panel.hidden = !cue;
      if (cue === current) return;
      current = cue;
      label.textContent = cue ? cue[3] : '';
      panel.style.color = cue ? cue[4] || '#fff8ee' : '';
      layout();
    };
    const refresh = () => { render(); layout(); };
    const tick = (_, metadata) => {
      if (disposed) return;
      render(metadata ? metadata.mediaTime : video.currentTime);
      frame = videoFrames ? video.requestVideoFrameCallback(tick) : requestAnimationFrame(tick);
    };
    const events = ['loadedmetadata', 'timeupdate', 'seeking', 'seeked', 'play', 'pause', 'resize'];
    events.forEach(event => video.addEventListener(event, refresh));
    const unsubscribe = I18N.onChange(refresh);
    window.addEventListener('resize', refresh);
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(refresh) : null;
    if (observer) observer.observe(video);
    refresh();
    frame = videoFrames ? video.requestVideoFrameCallback(tick) : requestAnimationFrame(tick);
    return () => {
      disposed = true;
      if (videoFrames) video.cancelVideoFrameCallback(frame); else cancelAnimationFrame(frame);
      events.forEach(event => video.removeEventListener(event, refresh));
      window.removeEventListener('resize', refresh);
      if (observer) observer.disconnect();
      unsubscribe(); panel.hidden = true; label.textContent = '';
    };
  },
};
