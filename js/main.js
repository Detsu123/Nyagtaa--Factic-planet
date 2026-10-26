// boot the game once the Mongolian-capable font is ready
(function () {
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
  const f = document.fonts; if (!f || !f.load) return start();
  Promise.race([Promise.all([f.load('900 40px Nunito'), f.load('800 40px Nunito'), f.load('italic 800 40px Nunito')]), new Promise(r => setTimeout(r, 4000))]).then(start, start);
})();
