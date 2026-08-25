// script.js — PiX'CRAFT playable welcome + voxel world (minimal)
document.addEventListener('DOMContentLoaded', () => {
  // UI
  const playBtn = document.getElementById('play-btn');
  const playOverlay = document.getElementById('play-popup');
  const closePlay = document.getElementById('close-play-btn');
  const settingsBtn = document.getElementById('settings-btn');
  const settingsOverlay = document.getElementById('settings-popup');
  const closeSettings = document.getElementById('close-settings');
  const tabs = document.querySelectorAll('.tab');
  const tabPanels = document.querySelectorAll('.tab-panel');
  const tipsEl = document.getElementById('tips');
  const hud = document.getElementById('hud');
  const canvas = document.getElementById('game-canvas');
  const hotbar = document.getElementById('hotbar');

  // Tips
  const tips = [
    "Astuce: Utilisez ZQSD pour vous déplacer.",
    "Astuce: Appuyez sur K pour basculer le plein écran.",
    "Astuce: Clic gauche pour casser, clic droit pour poser.",
    "Astuce: Maintenez Shift pour descendre d'un bloc.",
    "Astuce: Équipez la barre pour changer de bloc."
  ];
  function showTip() {
    tipsEl.textContent = tips[Math.floor(Math.random()*tips.length)];
    tipsEl.style.opacity = '1';
    setTimeout(()=> tipsEl.style.opacity='0', 5000);
  }
  showTip();
  setInterval(()=> showTip(), 20000 + Math.random()*15000);

  // Play popup morph animation (blocky)
  function rect(el){ return el.getBoundingClientRect(); }
  playBtn.addEventListener('click', () => {
    const r = rect(playBtn);
    const clone = playBtn.cloneNode(true);
    clone.style.position = 'fixed';
    clone.style.left = r.left + 'px';
    clone.style.top = r.top + 'px';
    clone.style.width = r.width + 'px';
    clone.style.height = r.height + 'px';
    clone.style.zIndex = 9999;
    clone.classList.add('morph-clone');
    document.body.appendChild(clone);
    requestAnimationFrame(()=> {
      const tw = Math.min(window.innerWidth*0.6, 520);
      const th = 160;
      clone.style.left = ((window.innerWidth - tw)/2) + 'px';
      clone.style.top = ((window.innerHeight - th)/2) + 'px';
      clone.style.width = tw + 'px';
      clone.style.height = th + 'px';
    });
    setTimeout(()=> {
      playOverlay.classList.add('show');
      playOverlay.setAttribute('aria-hidden','false');
      clone.remove();
    }, 360);
  });
  closePlay.addEventListener('click', ()=> { playOverlay.classList.remove('show'); playOverlay.setAttribute('aria-hidden','true'); });

  // Solo starts the game: hide start UI, show canvas + HUD, enable pointer lock
  document.getElementById('solo-btn').addEventListener('click', () => {
    playOverlay.classList.remove('show');
    document.getElementById('start-screen').style.display = 'none';
    canvas.classList.remove('hidden');
    hud.classList.remove('hidden');
    startGame();
  });
  document.getElementById('multi-btn').addEventListener('click', ()=> alert("Multijoueur non implémenté dans ce prototype."));

  // Settings
  settingsBtn.addEventListener('click', ()=> { settingsOverlay.classList.add('show'); settingsOverlay.setAttribute('aria-hidden','false'); });
  closeSettings.addEventListener('click', ()=> { settingsOverlay.classList.remove('show'); settingsOverlay.setAttribute('aria-hidden','true'); });
  tabs.forEach(tab => tab.addEventListener('click', ()=> {
    tabs.forEach(t=>t.classList.remove('active'));
    tab.classList.add('active');
    const target = tab.dataset.tab;
    tabPanels.forEach(p => p.id === target ? p.classList.remove('hidden') : p.classList.add('hidden'));
  }));

  // Fullscreen toggle on K
  document.addEventListener('keydown', async (ev) => {
    if (ev.key.toLowerCase() === 'k') {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen().catch(()=>{});
      else await document.exitFullscreen().catch(()=>{});
    }
    if (ev.key === 'Escape') {
      if (document.pointerLockElement) document.exitPointerLock();
    }
  });

  // Hotbar selection
  hotbar.addEventListener('click', (e) => {
    const slot = e.target.closest('.slot');
    if (!slot) return;
    document.querySelectorAll('.slot').forEach(s=>s.classList.remove('selected'));
    slot.classList.add('selected');
  });

  // ---------- Three.js voxel world ----------
  let renderer, scene, camera, controls;
  let pointerLockControls;
  let world = {}; // store blocks by key "x,y,z"
  const blockSize = 1;
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let selectedBlockType = 'grass';

  function startGame(){
    // init renderer
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: false });
    renderer.setPixelRatio(1);
    resizeRenderer();
    renderer.setClearColor(0x87ceeb);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.set(8, 6, 12);

    // pointer lock controls for FPS feel
    pointerLockControls = new THREE.PointerLockControls(camera, document.body);
    document.body.addEventListener('click', () => {
      if (!document.pointerLockElement) pointerLockControls.lock();
    });
    scene.add(pointerLockControls.getObject());

    // lights
    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(5, 10, 7);
    scene.add(dir);
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));

    // materials (simple canvas textures)
    function makeMat(color){
      const c = document.createElement('canvas');
      c.width = c.height = 16;
      const ctx = c.getContext('2d');
      ctx.fillStyle = color; ctx.fillRect(0,0,16,16);
      for (let i=0;i<30;i++){ ctx.fillStyle = 'rgba(0,0,0,0.03)'; ctx.fillRect(Math.random()*16, Math.random()*16,1,1); }
      const tex = new THREE.CanvasTexture(c);
      tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.NearestFilter;
      return new THREE.MeshLambertMaterial({ map: tex });
    }
    const materials = {
      grass: makeMat('#6db24a'),
      dirt: makeMat('#8b5a2b'),
      stone: makeMat('#7a7a7a'),
      wood: makeMat('#8b5a2b')
    };

    // geometry
    const cubeGeo = new THREE.BoxGeometry(blockSize, blockSize, blockSize);

    // helper to add block
    function addBlock(x,y,z,type){
      const key = `${x},${y},${z}`;
      if (world[key]) return;
      const m = new THREE.Mesh(cubeGeo, materials[type] || materials.dirt);
      m.position.set(x*blockSize + blockSize/2, y*blockSize + blockSize/2, z*blockSize + blockSize/2);
      m.userData = { pos:[x,y,z], type };
      scene.add(m);
      world[key] = m;
    }
    function removeBlock(x,y,z){
      const key = `${x},${y},${z}`;
      const m = world[key];
      if (!m) return;
      scene.remove(m);
      delete world[key];
    }

    // generate simple terrain 12x4x12
    for (let x=0;x<12;x++){
      for (let z=0;z<12;z++){
        const h = (x+z)%3 === 0 ? 2 : 1;
        for (let y=0;y<h;y++){
          addBlock(x,y,z, y===h-1 ? 'grass' : 'dirt');
        }
      }
    }
    // add a stone pillar and a tree
    addBlock(6,3,6,'stone'); addBlock(6,4,6,'stone');
    addBlock(9,1,3,'wood'); addBlock(9,2,3,'wood'); addBlock(9,3,3,'wood');
    for (let dx=-1;dx<=1;dx++) for (let dz=-1;dz<=1;dz++) addBlock(9+dx,4,3+dz,'grass');

    // movement
    const move = { forward:false, back:false, left:false, right:false, jump:false };
    const velocity = new THREE.Vector3();
    const onGround = () => true; // simplified

    document.addEventListener('keydown', (e) => {
      if (e.code === 'KeyW' || e.key.toLowerCase() === 'z') move.forward = true;
      if (e.code === 'KeyS' || e.key.toLowerCase() === 's') move.back = true;
      if (e.code === 'KeyA' || e.key.toLowerCase() === 'q') move.left = true;
      if (e.code === 'KeyD' || e.key.toLowerCase() === 'd') move.right = true;
      if (e.code === 'Space') move.jump = true;
    });
    document.addEventListener('keyup', (e) => {
      if (e.code === 'KeyW' || e.key.toLowerCase() === 'z') move.forward = false;
      if (e.code === 'KeyS' || e.key.toLowerCase() === 's') move.back = false;
      if (e.code === 'KeyA' || e.key.toLowerCase() === 'q') move.left = false;
      if (e.code === 'KeyD' || e.key.toLowerCase() === 'd') move.right = false;
      if (e.code === 'Space') move.jump = false;
    });

    // raycast for block interaction
    function getIntersect(){
      raycaster.setFromCamera({x:0,y:0}, camera);
      const intersects = raycaster.intersectObjects(Object.values(world));
      return intersects.length ? intersects[0] : null;
    }

    // mouse actions: left = remove, right = place
    document.addEventListener('mousedown', (e) => {
      if (!document.pointerLockElement) return;
      const inter = getIntersect();
      if (!inter) return;
      const pos = inter.object.userData.pos;
      if (e.button === 0) { // left remove
        removeBlock(...pos);
      } else if (e.button === 2) { // right place adjacent
        const face = inter.face;
        const normal = face.normal;
        const nx = pos[0] + Math.round(normal.x);
        const ny = pos[1] + Math.round(normal.y);
        const nz = pos[2] + Math.round(normal.z);
        addBlock(nx,ny,nz, selectedBlockType);
      }
    });
    // prevent context menu
    document.addEventListener('contextmenu', (e)=> { if (document.pointerLockElement) e.preventDefault(); });

    // hotbar selection mapping
    document.querySelectorAll('.slot').forEach(s => {
      s.addEventListener('click', ()=> {
        document.querySelectorAll('.slot').forEach(x=>x.classList.remove('selected'));
        s.classList.add('selected');
        selectedBlockType = s.dataset.block;
      });
    });

    // render loop
    const clock = new THREE.Clock();
    function animate(){
      requestAnimationFrame(animate);
      const delta = clock.getDelta();
      // simple movement
      const speed = 5;
      velocity.x -= velocity.x * 10.0 * delta;
      velocity.z -= velocity.z * 10.0 * delta;
      if (move.forward) velocity.z -= speed * delta;
      if (move.back) velocity.z += speed * delta;
      if (move.left) velocity.x -= speed * delta;
      if (move.right) velocity.x += speed * delta;
      pointerLockControls.moveRight(velocity.x * delta * 60);
      pointerLockControls.moveForward(velocity.z * delta * 60);
      renderer.render(scene, camera);
    }
    animate();

    // resize handling
    window.addEventListener('resize', resizeRenderer);
    function resizeRenderer(){
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);
      camera.aspect = w/h;
      camera.updateProjectionMatrix();
    }
  }

  // Accessibility: close popups with Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (playOverlay.classList.contains('show')) { playOverlay.classList.remove('show'); playOverlay.setAttribute('aria-hidden','true'); }
      if (settingsOverlay.classList.contains('show')) { settingsOverlay.classList.remove('show'); settingsOverlay.setAttribute('aria-hidden','true'); }
    }
  });
});
