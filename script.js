const introLanguageButtons = document.querySelectorAll('[data-intro-lang]');
const intro = document.getElementById('intro');
const photoLink = document.getElementById('photoLink');
const langButtons = document.querySelectorAll('.lang-btn');
const dayLinks = document.querySelectorAll('.day-nav a');

function currentLanguage() {
  return document.documentElement.lang === 'ko' ? 'ko' : 'ja';
}

function changeLanguage(lang) {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-ko][data-ja]').forEach((el) => {
    el.innerHTML = el.dataset[lang];
  });
  langButtons.forEach((button) => button.classList.toggle('active', button.dataset.lang === lang));
  document.title = lang === 'ja' ? '2026 東日本・韓国 青年交流団' : '2026 동일본·한국 청년교류단';
  localStorage.setItem('album-language', lang);
}
langButtons.forEach((button) => button.addEventListener('click', () => changeLanguage(button.dataset.lang)));

function enterAlbum(lang) {
  changeLanguage(lang);
  intro.classList.add('hide');
  document.body.classList.remove('locked');
  setTimeout(() => { intro.style.display = 'none'; }, 1000);
}

introLanguageButtons.forEach((button) => {
  button.addEventListener('click', () => enterAlbum(button.dataset.introLang));
});

// 언어 선택 전 화면의 기본 표기는 일본어입니다.
changeLanguage('ja');

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
}, { threshold: 0.12 });
document.querySelectorAll('.section-reveal').forEach((el) => observer.observe(el));

const dayObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    dayLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
  });
}, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
document.querySelectorAll('.day-section[id]').forEach((section) => dayObserver.observe(section));

// 사진 데이터로 격자 갤러리 자동 생성
const galleryData = window.GALLERY_DATA || {};
Object.entries(galleryData).forEach(([day, photos]) => {
  const grid = document.querySelector(`.instagram-grid[data-day="${day}"]`);
  if (!grid) return;
  const dayNumber = day.replace('day', '');
  photos.forEach((photo, index) => {
    const button = document.createElement('button');
    button.className = 'gallery-item';
    button.type = 'button';
    button.dataset.full = photo.full;
    button.dataset.thumb = photo.thumb;
    button.dataset.day = day;
    button.setAttribute('aria-label', `${dayNumber}일차 사진 ${index + 1} 확대`);

    const img = document.createElement('img');
    img.src = photo.thumb;
    img.alt = `${dayNumber}일차 사진 ${index + 1}`;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.addEventListener('error', () => button.remove());
    button.appendChild(img);
    grid.appendChild(button);
  });
});

// MYBOX 링크: 링크가 없을 때는 안내, 링크가 생기면 자동 이동
const myboxLinks = window.MYBOX_LINKS || {};
function pendingMessage() {
  return currentLanguage() === 'ja'
    ? '写真のダウンロードリンクは後日ご案内します。'
    : '사진 다운로드 링크는 추후 안내될 예정입니다.';
}
document.querySelectorAll('[data-download-day]').forEach((button) => {
  const day = button.dataset.downloadDay;
  button.removeAttribute('hidden');
  button.addEventListener('click', (event) => {
    const link = (window.MYBOX_LINKS || {})[day];
    if (!link) {
      event.preventDefault();
      alert(pendingMessage());
      return;
    }
    button.href = link;
  });
  if (myboxLinks[day]) button.href = myboxLinks[day];
});
if (photoLink) {
  photoLink.removeAttribute('hidden');
  photoLink.addEventListener('click', (event) => {
    const link = (window.MYBOX_LINKS || {}).all;
    if (!link) {
      event.preventDefault();
      alert(pendingMessage());
      return;
    }
    photoLink.href = link;
  });
  if (myboxLinks.all) photoLink.href = myboxLinks.all;
}

// 고급 전체 화면 뷰어
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxCounter = document.getElementById('lightboxCounter');
const lightboxDay = document.getElementById('lightboxDay');
const lightboxStage = document.getElementById('lightboxStage');
const imagePan = document.getElementById('imagePan');
const thumbStrip = document.getElementById('thumbStrip');
const zoomValue = document.getElementById('zoomValue');
let currentGallery = [];
let currentIndex = 0;
let currentDay = 'day1';
let scale = 1;
let translateX = 0;
let translateY = 0;
let touchStartX = 0;
let touchStartY = 0;
let dragStartX = 0;
let dragStartY = 0;
let dragging = false;
let uiTimer;

function resetTransform() {
  scale = 1;
  translateX = 0;
  translateY = 0;
  applyTransform();
}
function applyTransform() {
  imagePan.style.transform = `translate3d(${translateX}px,${translateY}px,0) scale(${scale})`;
  zoomValue.textContent = `${Math.round(scale * 100)}%`;
  lightbox.classList.toggle('is-zoomed', scale > 1.01);
}
function setZoom(nextScale) {
  scale = Math.min(4, Math.max(1, nextScale));
  if (scale === 1) { translateX = 0; translateY = 0; }
  applyTransform();
}
function preloadAround(index) {
  [-2, -1, 1, 2].forEach((offset) => {
    if (!currentGallery.length) return;
    const target = currentGallery[(index + offset + currentGallery.length) % currentGallery.length];
    const image = new Image();
    image.src = target.dataset.full;
  });
}
function renderThumbStrip() {
  thumbStrip.innerHTML = '';
  currentGallery.forEach((item, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'viewer-thumb';
    button.dataset.index = index;
    button.setAttribute('aria-label', `${index + 1}번째 사진`);
    const img = document.createElement('img');
    img.src = item.dataset.thumb || item.querySelector('img')?.src || '';
    img.alt = '';
    img.loading = 'lazy';
    button.appendChild(img);
    button.addEventListener('click', () => showLightboxImage(index));
    thumbStrip.appendChild(button);
  });
}
function updateActiveThumb() {
  thumbStrip.querySelectorAll('.viewer-thumb').forEach((thumb, index) => {
    thumb.classList.toggle('active', index === currentIndex);
  });
  thumbStrip.querySelector('.viewer-thumb.active')?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
}
function showControls() {
  lightbox.classList.remove('controls-hidden');
  clearTimeout(uiTimer);
  uiTimer = setTimeout(() => {
    if (lightbox.classList.contains('open') && !dragging) lightbox.classList.add('controls-hidden');
  }, 2600);
}
function showLightboxImage(index) {
  if (!currentGallery.length) return;
  currentIndex = (index + currentGallery.length) % currentGallery.length;
  const item = currentGallery[currentIndex];
  resetTransform();
  lightbox.classList.add('loading');
  lightboxImage.onload = () => lightbox.classList.remove('loading');
  lightboxImage.onerror = () => lightbox.classList.remove('loading');
  lightboxImage.src = item.dataset.full;
  lightboxImage.alt = item.getAttribute('aria-label') || '';
  lightboxCounter.textContent = `${currentIndex + 1} / ${currentGallery.length}`;
  lightboxDay.textContent = currentDay.replace('day', 'DAY');
  updateActiveThumb();
  preloadAround(currentIndex);
  showControls();
}
function openLightbox(item) {
  const grid = item.closest('.instagram-grid');
  currentGallery = [...grid.querySelectorAll('.gallery-item')];
  currentIndex = currentGallery.indexOf(item);
  currentDay = grid.dataset.day || 'day1';
  renderThumbStrip();
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.classList.add('lightbox-open');
  showLightboxImage(currentIndex);
}
function closeLightbox() {
  lightbox.classList.remove('open', 'loading', 'controls-hidden', 'is-zoomed');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('lightbox-open');
  lightboxImage.src = '';
  clearTimeout(uiTimer);
  resetTransform();
}

document.addEventListener('click', (event) => {
  const item = event.target.closest('.gallery-item');
  if (item) openLightbox(item);
});
document.querySelector('.lightbox-close')?.addEventListener('click', closeLightbox);
document.querySelector('.lightbox-nav.prev')?.addEventListener('click', () => showLightboxImage(currentIndex - 1));
document.querySelector('.lightbox-nav.next')?.addEventListener('click', () => showLightboxImage(currentIndex + 1));
document.getElementById('zoomIn')?.addEventListener('click', () => setZoom(scale + 0.25));
document.getElementById('zoomOut')?.addEventListener('click', () => setZoom(scale - 0.25));
document.getElementById('zoomReset')?.addEventListener('click', () => setZoom(1));
lightbox?.addEventListener('click', showControls);
lightboxStage?.addEventListener('dblclick', () => setZoom(scale > 1 ? 1 : 2));
lightboxStage?.addEventListener('wheel', (event) => {
  event.preventDefault();
  setZoom(scale + (event.deltaY < 0 ? 0.2 : -0.2));
}, { passive: false });

document.addEventListener('keydown', (event) => {
  if (!lightbox?.classList.contains('open')) return;
  if (event.key === 'Escape') closeLightbox();
  if (event.key === 'ArrowLeft') showLightboxImage(currentIndex - 1);
  if (event.key === 'ArrowRight') showLightboxImage(currentIndex + 1);
  if (event.key === '+' || event.key === '=') setZoom(scale + 0.25);
  if (event.key === '-') setZoom(scale - 0.25);
});

lightboxStage?.addEventListener('pointerdown', (event) => {
  showControls();
  dragging = true;
  dragStartX = event.clientX - translateX;
  dragStartY = event.clientY - translateY;
  touchStartX = event.clientX;
  touchStartY = event.clientY;
  lightboxStage.setPointerCapture?.(event.pointerId);
});
lightboxStage?.addEventListener('pointermove', (event) => {
  if (!dragging || scale <= 1) return;
  translateX = event.clientX - dragStartX;
  translateY = event.clientY - dragStartY;
  applyTransform();
});
lightboxStage?.addEventListener('pointerup', (event) => {
  if (!dragging) return;
  dragging = false;
  const dx = event.clientX - touchStartX;
  const dy = event.clientY - touchStartY;
  if (scale <= 1 && Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) {
    showLightboxImage(currentIndex + (dx < 0 ? 1 : -1));
  }
  showControls();
});
lightboxStage?.addEventListener('pointercancel', () => { dragging = false; });
