(function(){
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  // Rotating taglines for Mike Ziemer
  const vibes = [
    "Dallas, TX",
    "20+ Years in Music",
    "Festival Producer",
    "Concert Promoter",
    "So What?! Founder",
    "Flip A Switch"
  ];
  const vibeEl = $("#vibe");
  if (vibeEl){
    let i = 0;
    setInterval(()=>{ i=(i+1)%vibes.length; vibeEl.textContent = vibes[i]; }, 3000);
  }

  // Smooth-scroll for hash links
  $$('a[href^="#"]').forEach(a=>{
    a.addEventListener("click", (e)=>{
      const id = a.getAttribute("href");
      const target = $(id);
      if(target){
        e.preventDefault();
        target.scrollIntoView({behavior:"smooth", block:"start"});
      }
    });
  });

  // ============================================
  // CLASSIC MYSPACE MUSIC PLAYER (Fake/Visual)
  // ============================================
  const playlist = [
    { title: "Sugar, We're Goin Down", artist: "Fall Out Boy", duration: "3:49", durationSec: 229 },
    { title: "Dance, Dance", artist: "Fall Out Boy", duration: "3:00", durationSec: 180 },
    { title: "Thnks fr th Mmrs", artist: "Fall Out Boy", duration: "3:22", durationSec: 202 }
  ];

  let currentTrack = 0;
  let isPlaying = false;
  let currentTime = 0;
  let playerInterval = null;

  const playBtn = $("#playBtn");
  const prevBtn = $("#prevBtn");
  const nextBtn = $("#nextBtn");
  const progressFill = $("#progressFill");
  const currentTimeEl = $("#currentTime");
  const totalTimeEl = $("#totalTime");
  const playerTitle = $("#playerTitle");
  const playerArtist = $("#playerArtist");
  const playlistItems = $$(".playlist-item");

  function formatTime(seconds){
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function updateTrackDisplay(){
    const track = playlist[currentTrack];
    if(playerTitle) playerTitle.textContent = track.title;
    if(playerArtist) playerArtist.textContent = track.artist;
    if(totalTimeEl) totalTimeEl.textContent = track.duration;

    playlistItems.forEach((item, i) => {
      item.classList.toggle('active', i === currentTrack);
    });
  }

  function updateProgress(){
    const track = playlist[currentTrack];
    const percent = (currentTime / track.durationSec) * 100;
    if(progressFill) progressFill.style.width = percent + '%';
    if(currentTimeEl) currentTimeEl.textContent = formatTime(currentTime);
  }

  function startPlayback(){
    isPlaying = true;
    if(playBtn){
      playBtn.textContent = '❚❚';
      playBtn.classList.add('playing');
    }
    playerInterval = setInterval(() => {
      currentTime += 1;
      const track = playlist[currentTrack];
      if(currentTime >= track.durationSec){
        // Next track
        currentTrack = (currentTrack + 1) % playlist.length;
        currentTime = 0;
        updateTrackDisplay();
      }
      updateProgress();
    }, 1000);
  }

  function stopPlayback(){
    isPlaying = false;
    if(playBtn){
      playBtn.textContent = '▶';
      playBtn.classList.remove('playing');
    }
    if(playerInterval){
      clearInterval(playerInterval);
      playerInterval = null;
    }
  }

  if(playBtn){
    playBtn.addEventListener('click', () => {
      if(isPlaying){
        stopPlayback();
      } else {
        startPlayback();
      }
    });
  }

  if(prevBtn){
    prevBtn.addEventListener('click', () => {
      currentTrack = (currentTrack - 1 + playlist.length) % playlist.length;
      currentTime = 0;
      updateTrackDisplay();
      updateProgress();
    });
  }

  if(nextBtn){
    nextBtn.addEventListener('click', () => {
      currentTrack = (currentTrack + 1) % playlist.length;
      currentTime = 0;
      updateTrackDisplay();
      updateProgress();
    });
  }

  playlistItems.forEach((item, i) => {
    item.addEventListener('click', () => {
      currentTrack = i;
      currentTime = 0;
      updateTrackDisplay();
      updateProgress();
      if(!isPlaying) startPlayback();
    });
  });

  // Initialize display
  updateTrackDisplay();
  updateProgress();

  // Contact form handling
  const contactForm = $("#contactForm");
  if(contactForm){
    contactForm.addEventListener("submit", (e)=>{
      e.preventDefault();
      alert("Thanks for reaching out! This form needs to be connected to a backend service (Netlify Forms, Formspree, etc.)");
    });
  }

  // Anonymous comment board (local storage only for this version)
  const listEl = $("#commentList");
  const form = $("#commentForm");
  const clearBtn = $("#clearCommentsBtn");

  const clean = (s)=> (s||"").replace(/[<>]/g,"").trim();

  function fmt(ts){
    const d = new Date(ts);
    return d.toLocaleString(undefined, {year:"numeric", month:"short", day:"2-digit", hour:"2-digit", minute:"2-digit"});
  }

  function renderItems(items){
    if(!listEl) return;
    const sorted = (items||[]).slice().sort((a,b)=> (b.ts||0)-(a.ts||0));
    if(sorted.length === 0){
      listEl.innerHTML = '<div class="small">No comments yet. Be the first to leave a message!</div>';
      return;
    }
    listEl.innerHTML = sorted.map(it => {
      const name = clean(it.name) || "Anonymous";
      const msg = clean(it.msg).slice(0,160);
      return `
        <div class="entry">
          <div class="top">
            <div class="from">From: ${name}</div>
            <div class="small">${fmt(it.ts || Date.now())}</div>
          </div>
          <div class="body">${msg}</div>
        </div>
      `;
    }).join("");
  }

  // Local storage
  const KEY = "mikeziemer_comments_local";
  function loadLocal(){
    try{ return JSON.parse(localStorage.getItem(KEY) || "[]"); }catch(e){ return []; }
  }
  function saveLocal(items){
    try{ localStorage.setItem(KEY, JSON.stringify(items||[])); }catch(e){}
  }

  function initComments(){
    if(!listEl) return;

    renderItems(loadLocal());

    if(form){
      form.addEventListener("submit", (e)=>{
        e.preventDefault();
        const name = clean($("#cname")?.value).slice(0,30);
        const msgEl = $("#cmsg");
        const msg = clean(msgEl?.value).slice(0,160);
        if(!msg) return;

        const payload = { name: name || "Anonymous", msg, ts: Date.now() };
        const items = loadLocal();
        items.push(payload);
        saveLocal(items);
        renderItems(items);

        if(msgEl) msgEl.value = "";
      });
    }

    if(clearBtn){
      clearBtn.addEventListener("click", ()=>{
        if(confirm("Clear comments stored on this device?")){
          localStorage.removeItem(KEY);
          renderItems([]);
        }
      });
    }
  }

  initComments();
})();
