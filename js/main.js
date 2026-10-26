// Choose a language on every page load, then boot with that language and the font ready.
(function () {
  const chooser = document.getElementById('language-start');
  const controls = document.getElementById('language-controls');
  const choices = [...chooser.querySelectorAll('[data-start-language]')];
  let chosen = false;
  const start = () => {
    const game = new Phaser.Game({
      type: Phaser.AUTO, parent: 'game', backgroundColor: '#140c2e', width: GW, height: GH,
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: GW, height: GH, fullscreenTarget: document.body }, // body, so the video overlay stays visible in fullscreen
      input: { activePointers: 2 }, render: { antialias: true, roundPixels: false, powerPreference: 'high-performance' },
      audio: { disableWebAudio: false }, fps: TEST ? { min: 1, panicMax: 0 } : { min: 8 },
      scene: [BootScene, PreloadScene, TitleScene, TutorialScene, VillageScene, InvestigateScene, NotebookScene, DecisionScene, ResultScene, QuizScene, EndingScene],
    });
    window.GAME = game;
  };
  const f = document.fonts;
  const fontReady = (f && f.load
    ? Promise.race([Promise.all([f.load('900 40px Nunito'), f.load('800 40px Nunito'), f.load('italic 800 40px Nunito')]), new Promise(r => setTimeout(r, 4000))])
    : Promise.resolve()).catch(() => {});

  choices.forEach(button => button.addEventListener('click', event => {
    event.stopPropagation();
    const lang = button.dataset.startLanguage;
    if (chosen || !['mn', 'en'].includes(lang)) return;
    chosen = true;
    I18N.set(lang);
    choices.forEach(choice => { choice.disabled = true; });
    chooser.hidden = true;
    controls.hidden = false;
    document.getElementById('boot').hidden = false;
    document.getElementById('rotate').hidden = false;
    controls.querySelector(`[data-language="${lang}"]`).focus({ preventScroll: true });
    fontReady.then(start);
  }));
  // A saved preference sets keyboard focus; it never skips the opening choice.
  choices.find(button => button.dataset.startLanguage === I18N.lang).focus({ preventScroll: true });
})();
