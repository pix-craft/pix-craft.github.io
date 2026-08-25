// script.js
document.addEventListener('DOMContentLoaded', () => {
  const playBtn = document.getElementById('play-btn');
  const playOverlay = document.getElementById('play-popup');
  const closePlay = document.getElementById('close-play-btn');
  const settingsBtn = document.getElementById('settings-btn');
  const settingsOverlay = document.getElementById('settings-popup');
  const closeSettings = document.getElementById('close-settings');
  const tabs = document.querySelectorAll('.tab');
  const tabPanels = document.querySelectorAll('.tab-panel');
  const tipsEl = document.getElementById('tips');

  // Tips list
  const tips = [
    "Astuce: Utilisez ZQSD pour vous déplacer.",
    "Astuce: Appuyez sur K pour basculer le plein écran.",
    "Astuce: Sauvegardez souvent votre progression.",
    "Astuce: Explorez les grottes pour trouver des ressources rares.",
    "Astuce: Ajustez la qualité graphique dans Paramètres > Image."
  ];

  // Show random tip occasionally
  function showRandomTip() {
    const t = tips[Math.floor(Math.random() * tips.length)];
    tipsEl.textContent = t;
    tipsEl.style.opacity = '1';
    // hide after 6s
    setTimeout(() => {
      tipsEl.style.opacity = '0';
    }, 6000);
  }
  // initial tip
  showRandomTip();
  // show tip every 18-30s
  setInterval(() => {
    showRandomTip();
  }, 18000 + Math.random() * 12000);

  // Play button animation then show popup
  playBtn.addEventListener('click', async (e) => {
    // simple transform animation
    playBtn.style.transition = 'transform 300ms ease, opacity 300ms ease';
    playBtn.style.transform = 'scale(0.9) translateY(-6px)';
    playBtn.style.opacity = '0.9';
    // small delay to feel animated
    setTimeout(() => {
      playBtn.style.transform = '';
      playBtn.style.opacity = '';
      // show overlay
      playOverlay.classList.add('show');
      playOverlay.setAttribute('aria-hidden', 'false');
    }, 260);
  });

  closePlay.addEventListener('click', () => {
    playOverlay.classList.remove('show');
    playOverlay.setAttribute('aria-hidden', 'true');
  });

  // Solo / Multijoueur handlers (placeholder)
  document.getElementById('solo-btn').addEventListener('click', () => {
    alert('Démarrage du mode Solo (prototype).');
  });
  document.getElementById('multi-btn').addEventListener('click', () => {
    alert('Démarrage du mode Multijoueur (prototype).');
  });

  // Settings open full screen
  settingsBtn.addEventListener('click', () => {
    settingsOverlay.classList.add('show');
    settingsOverlay.setAttribute('aria-hidden', 'false');
  });
  closeSettings.addEventListener('click', () => {
    settingsOverlay.classList.remove('show');
    settingsOverlay.setAttribute('aria-hidden', 'true');
  });

  // Tabs logic
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.tab;
      tabPanels.forEach(p => {
        if (p.id === target) p.classList.remove('hidden');
        else p.classList.add('hidden');
      });
    });
  });

  // Fullscreen toggle on K
  document.addEventListener('keydown', async (ev) => {
    if (ev.key.toLowerCase() === 'k') {
      toggleFullScreen();
    }
  });

  async function toggleFullScreen() {
    const doc = document;
    if (!doc.fullscreenElement) {
      try {
        await doc.documentElement.requestFullscreen();
      } catch (err) {
        console.warn('Impossible d\'entrer en plein écran', err);
      }
    } else {
      try {
        await doc.exitFullscreen();
      } catch (err) {
        console.warn('Impossible de quitter le plein écran', err);
      }
    }
  }

  // Accessibility: close popups with Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (playOverlay.classList.contains('show')) {
        playOverlay.classList.remove('show');
        playOverlay.setAttribute('aria-hidden', 'true');
      }
      if (settingsOverlay.classList.contains('show')) {
        settingsOverlay.classList.remove('show');
        settingsOverlay.setAttribute('aria-hidden', 'true');
      }
    }
  });

  // Small UX: click outside popup to close
  playOverlay.addEventListener('click', (e) => {
    if (e.target === playOverlay) {
      playOverlay.classList.remove('show');
      playOverlay.setAttribute('aria-hidden', 'true');
    }
  });
  settingsOverlay.addEventListener('click', (e) => {
    if (e.target === settingsOverlay) {
      settingsOverlay.classList.remove('show');
      settingsOverlay.setAttribute('aria-hidden', 'true');
    }
  });
});
