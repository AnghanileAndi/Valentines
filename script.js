(function(){
  const playground = document.getElementById('playground');
  const yes = document.getElementById('yes');
  const no = document.getElementById('no');
  const modal = document.getElementById('modal');
  const closeBtn = document.getElementById('close');
  const revealImage = document.getElementById('revealImage');

  let yesScale = 1;
  let noScale = 1;

  function placeInitial() {
    const rect = playground.getBoundingClientRect();
    setButtonAt(yes, rect.width * 0.35 - yes.offsetWidth / 2, rect.height * 0.35 - yes.offsetHeight / 2);
    setButtonAt(no, rect.width * 0.65 - no.offsetWidth / 2, rect.height * 0.65 - no.offsetHeight / 2);
  }

  function setButtonAt(el, left, top){
    const rect = playground.getBoundingClientRect();
    const w = el.offsetWidth, h = el.offsetHeight;
    left = Math.max(6, Math.min(rect.width - w - 6, left));
    top  = Math.max(6, Math.min(rect.height - h - 6, top));
    el.style.left = left + 'px';
    el.style.top = top + 'px';
  }

  function onPointerMove(e){
    const rect = playground.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Yes grows on any cursor movement
    yesScale = Math.min(2.0, yesScale + 0.04);
    yes.style.transform = `scale(${yesScale})`;

    // No moves away from the cursor and shrinks
    const noRect = no.getBoundingClientRect();
    const noCenterX = (noRect.left - rect.left) + noRect.width / 2;
    const noCenterY = (noRect.top  - rect.top)  + noRect.height / 2;

    let dx = noCenterX - x;
    let dy = noCenterY - y;
    let dist = Math.hypot(dx, dy);
    if(dist < 1){
      dx = (Math.random() - 0.5) * 2;
      dy = (Math.random() - 0.5) * 2;
      dist = Math.hypot(dx,dy);
    }

    const push = Math.min(160, 220 / Math.max(8, dist));
    const nx = noCenterX + (dx / dist) * push;
    const ny = noCenterY + (dy / dist) * push;

    setButtonAt(no, nx - noRect.width/2, ny - noRect.height/2);

    noScale = Math.max(0.6, noScale - 0.03);
    no.style.transform = `scale(${noScale})`;
  }

  function rafLoop(){
    yesScale += (1 - yesScale) * 0.08;
    if(Math.abs(yesScale - 1) < 0.002) yesScale = 1;
    yes.style.transform = `scale(${yesScale})`;

    noScale += (1 - noScale) * 0.06;
    if(Math.abs(noScale - 1) < 0.002) noScale = 1;
    no.style.transform = `scale(${noScale})`;

    requestAnimationFrame(rafLoop);
  }

  function onResize(){
    setButtonAt(yes, parseFloat(yes.style.left || 0), parseFloat(yes.style.top || 0));
    setButtonAt(no, parseFloat(no.style.left || 0), parseFloat(no.style.top || 0));
  }

  no.addEventListener('mouseenter', (e)=>{
    const rect = playground.getBoundingClientRect();
    const noRect = no.getBoundingClientRect();
    const cx = (noRect.left - rect.left) + noRect.width / 2;
    const cy = (noRect.top - rect.top)  + noRect.height / 2;
    const nx = Math.random() < 0.5 ? cx + 80 : cx - 80;
    const ny = Math.random() < 0.5 ? cy + 40 : cy - 40;
    setButtonAt(no, nx - noRect.width/2, ny - noRect.height/2);
  });

  yes.addEventListener('click', async ()=>{
    // reveal modal image
    modal.classList.remove('hidden');

    // play confetti bursts using canvas-confetti (loaded from CDN)
    try{
      for(let i=0;i<6;i++){
        confetti({
          particleCount: 30,
          spread: 60 + i*6,
          origin: { x: Math.random(), y: Math.random() * 0.3 }
        });
        await new Promise(r => setTimeout(r, 120));
      }
    }catch(err){
      // confetti lib missing — silently ignore
    }
  });

  closeBtn.addEventListener('click', ()=>{
    modal.classList.add('hidden');
  });
  modal.addEventListener('click', (e)=>{
    if(e.target === modal) modal.classList.add('hidden');
  });

  window.addEventListener('load', ()=>{
    placeInitial();
    rafLoop();
  });
  window.addEventListener('resize', onResize);
  playground.addEventListener('pointermove', onPointerMove);
  document.addEventListener('pointermove', (e)=>{
    const rect = playground.getBoundingClientRect();
    if(e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom){
      onPointerMove(e);
    }
  });
})();
