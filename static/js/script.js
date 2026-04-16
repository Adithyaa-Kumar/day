const sections = Array.from(document.querySelectorAll('.story-section'));
const ringProgress = document.getElementById('ring-progress');
const timerHH = document.getElementById('timer-hh');
const timerMM = document.getElementById('timer-mm');
const timerSS = document.getElementById('timer-ss');
const ringLength = 653.45;

const autoGiftVideoIds = ['gift-video-1', 'gift-video-2', 'gift-video-3'];
const allGiftVideoIds = ['gift-video-1', 'gift-video-2', 'gift-video-3', 'gift-video-4'];

const birthdayWaveEmojis = ['💙', '✨', '🌸', '🫶', '🎀', '🌷', '⭐', '💐'];
const loveRotatorPhrases = [
  'You are my favorite kind of magic 💙',
  'May your year bloom softly and beautifully ✿',
  'I hope every corner of life feels kinder to you 🌷',
  'You deserve warm hugs, loud laughs, and calm days 🫶',
  'Always cheering for your happiness, Harshi ✨'
];

let activeSection = 0;
let countdownFinished = false;
let finalTypewriterToken = 0;
let wrongAnswerClicks = 0;
let autoplayTimer = null;
let teaseClickCount = 0;
let loveRotatorTimer = null;
let birthdayRevealToken = 0;
let cakeFrameReady = false;

function showSection(index) {
  if (index < 0 || index >= sections.length) {
    return;
  }

  pauseAllGiftVideos();
  clearGiftAutoplayTimer();

  const previous = sections[activeSection];
  if (previous) {
    previous.classList.remove('active');
  }

  const next = sections[index];
  next.classList.add('active');
  activeSection = index;
  next.scrollTop = 0;

  const wishPanel = next.querySelector('.birthday-wish-panel');
  if (wishPanel) {
    wishPanel.scrollTop = 0;
  }

  if (window.gsap) {
    gsap.fromTo(next, { opacity: 0, y: 28, scale: 0.985 }, { opacity: 1, y: 0, scale: 1, duration: 0.62, ease: 'power2.out' });
  }

  if (index === 2) {
    resetTeaseSequence();
  }

  if (index === 13) {
    runFinalTypewriter();
  }

  if (index === 12) {
    startCakeSequence();
  }

  if (index === 4) {
    startLoveRotator();
    runBirthdayRevealSequence();

    const birthdayVideo = document.getElementById('birthday-video');
    if (birthdayVideo) {
      birthdayVideo.muted = true;
      birthdayVideo.play().catch(() => {
        // Ignore autoplay restrictions if browser blocks first attempt.
      });
    }
  }

  // Gift pages 1 and 2 (sections 8, 9) should auto-play muted after 2 seconds.
  // Gift pages 3 and 4 have custom play buttons with audio control.
  if (index >= 8 && index <= 9) {
    scheduleGiftAutoplay(index);
  }
}

function buildTargetDate() {
  // Update this target time as needed.
  const now = new Date();
  const target = new Date(now);
  target.setHours(18, 15, 0, 0);

  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }
  return target;
}

function getTimeParts(msLeft) {
  const totalSec = Math.max(0, Math.floor(msLeft / 1000));
  const hours = String(Math.floor(totalSec / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSec % 60).padStart(2, '0');
  return { hours, minutes, seconds, totalSec };
}

function updateRingProgress(totalSecLeft, totalDurationSec) {
  const elapsed = totalDurationSec - totalSecLeft;
  const ratio = Math.min(Math.max(elapsed / totalDurationSec, 0), 1);
  const offset = ringLength * (1 - ratio);
  ringProgress.style.strokeDashoffset = `${offset}`;
}

function startCountdown() {
  ringProgress.style.strokeDasharray = `${ringLength}`;

  const now = new Date();
  const target = buildTargetDate();
  const totalDurationSec = Math.max(1, Math.floor((target - now) / 1000));

  function tick() {
    const diff = target - new Date();
    const { hours, minutes, seconds, totalSec } = getTimeParts(diff);

    timerHH.textContent = hours;
    timerMM.textContent = minutes;
    timerSS.textContent = seconds;
    updateRingProgress(totalSec, totalDurationSec);

    if (diff <= 0 && !countdownFinished) {
      countdownFinished = true;
      timerHH.textContent = '00';
      timerMM.textContent = '00';
      timerSS.textContent = '00';

      triggerConfetti(true);
      setTimeout(() => showSection(1), 1200);
    }
  }

  tick();
  setInterval(tick, 1000);
}

function triggerConfetti(intense = false) {
  if (typeof confetti !== 'function') {
    return;
  }

  const colors = ['#0b3d91', '#5dade2', '#d6eaff', '#ffffff'];
  const baseCount = intense ? 240 : 120;

  confetti({
    particleCount: baseCount,
    spread: intense ? 90 : 70,
    startVelocity: intense ? 52 : 38,
    origin: { y: 0.62 },
    colors
  });

  setTimeout(() => {
    confetti({
      particleCount: intense ? 140 : 70,
      spread: 110,
      angle: 120,
      origin: { x: 0.14, y: 0.64 },
      colors
    });

    confetti({
      particleCount: intense ? 140 : 70,
      spread: 110,
      angle: 60,
      origin: { x: 0.86, y: 0.64 },
      colors
    });
  }, 220);
}

function moveNoButton() {
  const button = document.getElementById('ready-no');
  const zone = document.getElementById('ready-zone');
  const zoneRect = zone.getBoundingClientRect();
  const btnRect = button.getBoundingClientRect();

  const maxX = Math.max(10, zoneRect.width - btnRect.width - 4);
  const maxY = Math.max(10, zoneRect.height - btnRect.height - 4);

  button.style.position = 'absolute';
  button.style.left = `${Math.floor(Math.random() * maxX)}px`;
  button.style.top = `${Math.floor(Math.random() * maxY)}px`;
}

function moveTeaseButton() {
  const button = document.getElementById('tease-next');
  const panel = button.closest('.glass-panel');
  const panelRect = panel.getBoundingClientRect();
  const btnRect = button.getBoundingClientRect();

  const maxX = Math.max(18, panelRect.width - btnRect.width - 24);
  const maxY = Math.max(18, panelRect.height - btnRect.height - 24);

  button.style.position = 'absolute';
  button.style.left = `${Math.floor(Math.random() * maxX)}px`;
  button.style.top = `${Math.floor(Math.random() * maxY)}px`;
  button.style.transform = 'none';
}

function resetTeaseSequence() {
  const button = document.getElementById('tease-next');
  const teaseWrap = document.getElementById('tease-photo-wrap');
  const teaseImage = document.getElementById('tease-photo-img');

  teaseClickCount = 0;
  button.style.position = 'relative';
  button.style.left = 'auto';
  button.style.top = 'auto';
  button.style.transform = 'none';
  button.textContent = 'Continue ➜';

  teaseWrap.classList.add('hidden');
  teaseImage.src = teaseImage.dataset.teaseStage0 || teaseImage.src;
}

function openGiftPage(giftNumber) {
  const map = { 1: 8, 2: 9, 3: 10, 4: 11 };
  const target = map[giftNumber];

  if (typeof target === 'number') {
    showSection(target);
    triggerConfetti(false);
  }
}

function backToGiftGrid() {
  showSection(7);
}

function pauseAllGiftVideos() {
  allGiftVideoIds.forEach((id) => {
    const video = document.getElementById(id);
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  });
}

function clearGiftAutoplayTimer() {
  if (autoplayTimer) {
    clearTimeout(autoplayTimer);
    autoplayTimer = null;
  }
}

function scheduleGiftAutoplay(sectionIndex) {
  const map = {
    8: 'gift-video-1',
    9: 'gift-video-2'
  };

  const id = map[sectionIndex];
  const video = document.getElementById(id);

  if (!video) {
    return;
  }

  autoplayTimer = setTimeout(() => {
    video.muted = true;
    video.play().catch(() => {
      // Ignore autoplay policy failures.
    });
  }, 2000);
}

function renderBirthdayWave() {
  const wave = document.getElementById('birthday-word-wave');
  if (!wave) {
    return;
  }

  wave.innerHTML = '';
  birthdayWaveEmojis.forEach((emoji, index) => {
    const chip = document.createElement('span');
    chip.className = 'wave-chip';
    chip.textContent = `${emoji} ${birthdayWaveEmojis[(index + 2) % birthdayWaveEmojis.length]}`;
    chip.style.animationDelay = `${index * 0.18}s`;
    wave.appendChild(chip);
  });
}

function startLoveRotator() {
  const rotator = document.getElementById('love-rotator');
  if (!rotator) {
    return;
  }

  let index = 0;

  const render = () => {
    const slice = [0, 1, 2].map((offset) => loveRotatorPhrases[(index + offset) % loveRotatorPhrases.length]);
    rotator.innerHTML = slice
      .map((text, itemIndex) => `<span class="love-chip" style="animation-delay:${itemIndex * 0.2}s">${itemIndex % 2 === 0 ? '✿' : '💙'} ${text}</span>`)
      .join('');
  };

  if (loveRotatorTimer) {
    clearInterval(loveRotatorTimer);
  }

  render();
  loveRotatorTimer = setInterval(() => {
    index = (index + 1) % loveRotatorPhrases.length;
    render();
  }, 2200);
}

function setupTeaseSequence() {
  const button = document.getElementById('tease-next');
  const teaseWrap = document.getElementById('tease-photo-wrap');
  const teaseImage = document.getElementById('tease-photo-img');

  const teaseStages = [
    teaseImage.dataset.teaseStage0,
    teaseImage.dataset.teaseStage1,
    teaseImage.dataset.teaseStage2,
    teaseImage.dataset.teaseStage3,
    teaseImage.dataset.teaseStage4
  ].filter(Boolean);

  const showStage = (index) => {
    const src = teaseStages[index];
    if (!src) {
      return;
    }

    teaseWrap.classList.remove('hidden');
    teaseImage.src = src;
  };

  button.addEventListener('click', () => {
    if (teaseClickCount === 0) {
      showStage(0);
      button.textContent = 'Not yet 💙';
      teaseClickCount = 1;
      return;
    }

    if (teaseClickCount >= 1 && teaseClickCount <= 3) {
      showStage(teaseClickCount);
      teaseClickCount += 1;
      button.textContent = `Not yet ${'💙'.repeat(teaseClickCount)}`;
      moveTeaseButton();
      return;
    }

    if (teaseClickCount === 4) {
      showStage(4);
      button.style.position = 'relative';
      button.style.left = 'auto';
      button.style.top = 'auto';
      button.style.transform = 'none';
      button.textContent = 'Okay Fine, Continue';
      teaseClickCount = 5;
      return;
    }

    showSection(3);
  });
}

function runBirthdayRevealSequence() {
  birthdayRevealToken += 1;
  const token = birthdayRevealToken;

  const steps = [
    document.getElementById('wish-title'),
    document.getElementById('wish-line-1'),
    document.getElementById('wish-line-2'),
    document.getElementById('love-rotator'),
    document.getElementById('wish-image-wrap'),
    document.querySelector('[data-wish-redirect="true"]')
  ].filter(Boolean);

  steps.forEach((item) => item.classList.remove('show'));

  let delay = 120;
  steps.forEach((item, index) => {
    setTimeout(() => {
      if (token !== birthdayRevealToken) {
        return;
      }
      item.classList.add('show');
    }, delay + index * 520);
  });
}

function handleCakeBlow() {
  const frame = document.getElementById('cake-frame');
  if (frame && frame.contentWindow) {
    frame.contentWindow.postMessage({ type: 'blow-cake' }, '*');
  }
  triggerConfetti(false);
}

function startCakeSequence() {
  cakeFrameReady = false;
  const frame = document.getElementById('cake-frame');
  if (!frame || !frame.contentWindow) {
    return;
  }

  frame.contentWindow.postMessage({ type: 'start-cake' }, '*');
}

function handleCakeFinished() {
  showSection(13);
}

function runFinalTypewriter() {
  finalTypewriterToken += 1;
  const token = finalTypewriterToken;
  const lines = Array.from(document.querySelectorAll('#section-10 .typewriter-line'));

  lines.forEach((line) => {
    line.textContent = '';
    line.classList.remove('typing');
  });

  let delay = 120;
  lines.forEach((line) => {
    const text = line.dataset.text || '';
    setTimeout(() => {
      if (token !== finalTypewriterToken) {
        return;
      }

      line.classList.add('typing');
      let i = 0;
      const interval = setInterval(() => {
        if (token !== finalTypewriterToken) {
          clearInterval(interval);
          return;
        }

        line.textContent = text.slice(0, i + 1);
        i += 1;

        if (i >= text.length) {
          clearInterval(interval);
          line.classList.remove('typing');
        }
      }, 34);
    }, delay);

    delay += 860;
  });
}

function setupMusicToggle() {
  const audio = document.getElementById('bg-music');
  const button = document.getElementById('music-toggle');
  audio.volume = 0.12;

  const setState = (playing) => {
    button.classList.toggle('playing', playing);
    button.textContent = playing ? '🎵 Pause music' : '🎵 Play music';
  };

  button.addEventListener('click', async () => {
    if (audio.paused) {
      try {
        await audio.play();
        setState(true);
      } catch (err) {
        setState(false);
      }
    } else {
      audio.pause();
      setState(false);
    }
  });
}

function createParticles() {
  const layer = document.getElementById('particle-layer');
  for (let i = 0; i < 36; i += 1) {
    const dot = document.createElement('span');
    dot.className = 'particle';
    const size = 4 + Math.random() * 8;
    dot.style.width = `${size}px`;
    dot.style.height = `${size}px`;
    dot.style.left = `${Math.random() * 100}%`;
    dot.style.animationDuration = `${7 + Math.random() * 10}s`;
    dot.style.animationDelay = `${Math.random() * 8}s`;
    layer.appendChild(dot);
  }
}

function createFloatingHearts() {
  const layer = document.getElementById('heart-layer');
  const shades = ['#d6eaff', '#93c5fd', '#5dade2'];

  for (let i = 0; i < 24; i += 1) {
    const heart = document.createElement('span');
    heart.className = 'heart';
    heart.textContent = i % 5 === 0 ? '✿' : '💙';
    heart.style.fontSize = `${12 + Math.random() * 14}px`;
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.color = shades[Math.floor(Math.random() * shades.length)];
    heart.style.animationDuration = `${10 + Math.random() * 12}s`;
    heart.style.animationDelay = `${Math.random() * 12}s`;
    layer.appendChild(heart);
  }
}

function setupGiftNavigation() {
  document.querySelectorAll('[data-open-gift]').forEach((button) => {
    button.addEventListener('click', () => {
      const giftNumber = Number(button.dataset.openGift);
      openGiftPage(giftNumber);
    });
  });

  document.querySelectorAll('[data-back-to-gifts]').forEach((button) => {
    button.addEventListener('click', backToGiftGrid);
  });
}

function setupVideoPlayButtons() {
  document.querySelectorAll('.video-play-btn').forEach((button) => {
    const videoId = button.dataset.videoId;
    const video = document.getElementById(videoId);

    if (!video) {
      return;
    }

    video.volume = 1;
    video.muted = false;

    const updateButton = () => {
      if (video.paused) {
        button.textContent = '▶';
        button.classList.remove('playing');
      } else {
        button.textContent = '⏸';
        button.classList.add('playing');
      }
    };

    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', updateButton);
    video.addEventListener('pause', updateButton);

    updateButton();
  });
}

function setupVideoReplayButtons() {
  document.querySelectorAll('.video-replay-btn').forEach((button) => {
    const videoId = button.dataset.videoId;
    const video = document.getElementById(videoId);

    if (!video) {
      return;
    }

    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      video.currentTime = 0;
      video.play();
    });
  });
}

function setupInteractions() {
  document.getElementById('ready-yes').addEventListener('click', () => showSection(2));
  document.getElementById('ready-no').addEventListener('mouseenter', moveNoButton);

  document.getElementById('friend-yes').addEventListener('click', () => {
    document.getElementById('wrong-bear-wrap').classList.add('hidden');
    showSection(4);
  });

  document.getElementById('friend-no').addEventListener('click', () => {
    const status = document.getElementById('friend-status');
    const wrongWrap = document.getElementById('wrong-bear-wrap');
    const wrongImg = document.getElementById('wrong-bear-img');

    wrongAnswerClicks += 1;

    const lines = [
      'Wrong answer 😤',
      'Bestie protocol crashed. Pick YES.',
      'Bear council says NO is invalid today.',
      'Error 404: Bestie not found. Choose YES.',
    ];

    status.textContent = lines[Math.floor(Math.random() * lines.length)];
    wrongImg.src = wrongAnswerClicks % 2 === 1 ? '/image/wronganswerbear1.gif' : '/image/wronganswerbear.gif';
    wrongWrap.classList.remove('hidden');
  });

  document.getElementById('to-memory-intro').addEventListener('click', () => {
    showSection(5);
    setTimeout(() => showSection(6), 5000);
  });

  document.getElementById('to-highlight').addEventListener('click', () => {
    triggerConfetti(false);
    setTimeout(() => showSection(7), 380);
  });

  const toCakeButton = document.getElementById('to-cake');
  if (toCakeButton) {
    toCakeButton.addEventListener('click', () => showSection(12));
  }

  const blowButton = document.getElementById('blow-btn');
  if (blowButton) {
    blowButton.addEventListener('click', handleCakeBlow);
  }

  const cakeFrame = document.getElementById('cake-frame');
  if (cakeFrame) {
    cakeFrame.addEventListener('load', () => {
      cakeFrameReady = true;
      if (activeSection === 12) {
        startCakeSequence();
      }
    });
  }

  window.addEventListener('message', (event) => {
    if (event?.data?.type === 'cake-finished') {
      handleCakeFinished();
    }
  });

  setupGiftNavigation();
  setupVideoPlayButtons();
  setupVideoReplayButtons();
  setupTeaseSequence();
  resetTeaseSequence();
  renderBirthdayWave();
  startLoveRotator();
}

function initAOS() {
  if (window.AOS) {
    AOS.init({
      duration: 860,
      easing: 'ease-in-out',
      once: false,
      mirror: true
    });
  }
}

window.showSection = showSection;
window.startCountdown = startCountdown;
window.triggerConfetti = triggerConfetti;
window.moveNoButton = moveNoButton;

document.addEventListener('DOMContentLoaded', () => {
  createParticles();
  createFloatingHearts();
  initAOS();
  setupInteractions();
  setupMusicToggle();
  showSection(0);
  startCountdown();
});
