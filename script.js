// script.js — logique minimale, sans animation
document.addEventListener('DOMContentLoaded', () => {
  // éléments
  const playBtn = document.getElementById('play-btn');
  const settingsBtn = document.getElementById('settings-btn');
  const shopBtn = document.getElementById('shop-btn');
  const accountBtn = document.getElementById('account-btn');

  const playPopup = document.getElementById('play-popup');
  const closePlay = document.getElementById('close-play-btn');
  const soloBtn = document.getElementById('solo-btn');
  const multiBtn = document.getElementById('multi-btn');

  const settingsPopup = document.getElementById('settings-popup');
  const closeSettings = document.getElementById('close-settings');
  const tabs = document.querySelectorAll('.tab');
  const tabPanels = document.querySelectorAll('.tab-panel');

  const tipsEl = document.getElementById('tips');

  // Tips statiques qui changent sans transition
  const tips = [
    "Astuce: Utilisez ZQSD pour vous déplacer.",
    "Astuce: Appuyez sur K pour basculer le plein écran.",
    "Astuce: Sauvegardez souvent votre progression.",
    "Astuce: Explorez pour trouver des ressources rares.",
    "Astuce: Ajustez la qualité graphique dans Paramètres > Image."
  ];
  function showTip() {
    const t = tips[Math.floor(Math.random() * tips.length)];
    tipsEl.textContent = t;
  }
  showTip();
  setInterval(showTip, 20000);

  // Ouvrir popup Jouer (sans animation)
  playBtn.addEventListener('click', () => {
    playPopup.classList.add('show');
    playPopup.setAttribute('aria-hidden', 'false');
  });
  closePlay.addEventListener('click', () => {
    playPopup.classList.remove('show');
    playPopup.setAttribute('aria-hidden', 'true');
  });

  // Actions boutons Jouer
  soloBtn.addEventListener('click', () => {
    // placeholder : démarrer le jeu (ici on affiche une alerte simple)
    alert("Démarrage du mode Solo (prototype).");
  });
  multiBtn.addEventListener('click', () => {
    alert("Mode Multijoueur non implémenté dans ce prototype.");
  });

  // Paramètres plein écran (sans animation)
  settingsBtn.addEventListener('click', () => {
    settingsPopup.classList.add('show');
    settingsPopup.setAttribute('aria-hidden', 'false');
  });
  closeSettings.addEventListener('click', () => {
    settingsPopup.classList.remove('show');
    settingsPopup.setAttribute('aria-hidden', 'true');
  });

  // Onglets paramètres (statique)
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

  // Touche K : bascule plein écran / sortie plein écran
  document.addEventListener('keydown', async (ev) => {
    if (ev.key.toLowerCase() === 'k') {
      if (!document.fullscreenElement) {
        try { await document.documentElement.requestFullscreen(); } catch(e) { /* ignore */ }
      } else {
        try { await document.exitFullscreen(); } catch(e) { /* ignore */ }
      }
    }
    // Échap ferme les popups si ouverts
    if (ev.key === 'Escape') {
      if (playPopup.classList.contains('show')) { playPopup.classList.remove('show'); playPopup.setAttribute('aria-hidden','true'); }
      if (settingsPopup.classList.contains('show')) { settingsPopup.classList.remove('show'); settingsPopup.setAttribute('aria-hidden','true'); }
    }
  });

  // Boutons Boutique / Compte placeholders
  shopBtn.addEventListener('click', () => alert("Boutique non implémentée dans ce prototype."));
  accountBtn.addEventListener('click', () => alert("Compte non implémenté dans ce prototype."));

  // Click en dehors des panels pour fermer (statique)
  playPopup.addEventListener('click', (e) => {
    if (e.target === playPopup) {
      playPopup.classList.remove('show');
      playPopup.setAttribute('aria-hidden','true');
    }
  });
  settingsPopup.addEventListener('click', (e) => {
    if (e.target === settingsPopup) {
      settingsPopup.classList.remove('show');
      settingsPopup.setAttribute('aria-hidden','true');
    }
  });
});
