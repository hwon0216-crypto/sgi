const intro=document.getElementById('intro');
const introLanguageButtons=document.querySelectorAll('[data-intro-lang]');
const langButtons=document.querySelectorAll('.lang-btn');
const dayLinks=document.querySelectorAll('.day-nav a');
const galleryData=window.GALLERY_DATA||{};
const myboxLinks=window.MYBOX_LINKS||{};

function currentLanguage(){return document.documentElement.lang==='ko'?'ko':'ja'}
function changeLanguage(lang){document.documentElement.lang=lang;document.querySelectorAll('[data-ko][data-ja]').forEach(el=>{el.innerHTML=el.dataset[lang]});langButtons.forEach(btn=>btn.classList.toggle('active',btn.dataset.lang===lang));document.title=lang==='ja'?'2026 東日本・韓国 青年交流団':'2026 동일본·한국 청년교류단'}
function enterAlbum(lang){changeLanguage(lang);intro.classList.add('hide');document.body.classList.remove('locked');setTimeout(()=>intro.remove(),700)}
introLanguageButtons.forEach(btn=>btn.addEventListener('click',()=>enterAlbum(btn.dataset.introLang)));
langButtons.forEach(btn=>btn.addEventListener('click',()=>changeLanguage(btn.dataset.lang)));
changeLanguage('ja');

const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>entry.isIntersecting&&entry.target.classList.add('visible')),{threshold:.08});
document.querySelectorAll('.section-reveal').forEach(el=>revealObserver.observe(el));
const dayObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){dayLinks.forEach(link=>link.classList.toggle('active',link.getAttribute('href')===`#${entry.target.id}`))}}),{rootMargin:'-35% 0px -55%'});
document.querySelectorAll('.day-section').forEach(section=>dayObserver.observe(section));

const galleries={};
function buildGallery(day){const grid=document.querySelector(`[data-day="${day}"]`);if(!grid)return;const items=Array.isArray(galleryData[day])?galleryData[day]:[];galleries[day]=[];if(!items.length){grid.innerHTML='<div class="gallery-empty">사진 목록이 없습니다.<br>gallery-data.js를 다시 생성해 주세요.</div>';return}items.forEach((item,index)=>{const button=document.createElement('button');button.type='button';button.className='gallery-item';button.dataset.full=item.full;button.dataset.thumb=item.thumb;button.dataset.index=index;const img=document.createElement('img');img.src=item.thumb;img.alt='';img.loading='lazy';img.decoding='async';img.addEventListener('error',()=>{button.remove();if(!grid.querySelector('.gallery-item'))grid.innerHTML='<div class="gallery-empty">사진 파일을 찾을 수 없습니다.<br><b>assets/gallery</b> 폴더가 GitHub에 올라갔는지 확인해 주세요.</div>'});button.appendChild(img);button.addEventListener('click',()=>openLightbox(day,index));grid.appendChild(button);galleries[day].push(button)})}
['day1','day2','day3','day4','day5'].forEach(buildGallery);

document.querySelectorAll('[data-download-day]').forEach(link=>{link.addEventListener('click',event=>{event.preventDefault();const day=link.dataset.downloadDay;const url=myboxLinks[day];if(url){window.open(url,'_blank','noopener,noreferrer')}else{alert(currentLanguage()==='ja'?'写真のダウンロードリンクは後日ご案内します。':'사진 다운로드 링크는 추후 안내될 예정입니다.')}})});

const lightbox=document.getElementById('lightbox');const lightboxImage=document.getElementById('lightboxImage');const lightboxCounter=document.getElementById('lightboxCounter');const lightboxDay=document.getElementById('lightboxDay');const imagePan=document.getElementById('imagePan');const thumbStrip=document.getElementById('thumbStrip');const zoomValue=document.getElementById('zoomValue');let currentDay='day1',currentIndex=0,scale=1,tx=0,ty=0,touchX=0,touchY=0,dragging=false;
function applyTransform(){imagePan.style.transform=`translate3d(${tx}px,${ty}px,0) scale(${scale})`;zoomValue.textContent=`${Math.round(scale*100)}%`}
function setZoom(next){scale=Math.max(1,Math.min(4,next));if(scale===1){tx=0;ty=0}applyTransform()}
function renderThumbs(){thumbStrip.innerHTML='';(galleries[currentDay]||[]).forEach((item,i)=>{const b=document.createElement('button');b.className='viewer-thumb'+(i===currentIndex?' active':'');b.innerHTML=`<img src="${item.dataset.thumb}" alt="">`;b.onclick=()=>showImage(i);thumbStrip.appendChild(b)});thumbStrip.querySelector('.active')?.scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'})}
function showImage(index){const list=galleries[currentDay]||[];if(!list.length)return;currentIndex=(index+list.length)%list.length;setZoom(1);const item=list[currentIndex];lightboxImage.src=item.dataset.full;lightboxCounter.textContent=`${currentIndex+1} / ${list.length}`;lightboxDay.textContent=currentDay.toUpperCase();renderThumbs();[-1,1].forEach(offset=>{const p=new Image();p.src=list[(currentIndex+offset+list.length)%list.length].dataset.full})}
function openLightbox(day,index){currentDay=day;lightbox.classList.add('open');lightbox.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';showImage(index)}
function closeLightbox(){lightbox.classList.remove('open');lightbox.setAttribute('aria-hidden','true');document.body.style.overflow='';lightboxImage.src=''}
document.querySelector('.lightbox-close')?.addEventListener('click',closeLightbox);document.querySelector('.lightbox-nav.prev')?.addEventListener('click',()=>showImage(currentIndex-1));document.querySelector('.lightbox-nav.next')?.addEventListener('click',()=>showImage(currentIndex+1));document.getElementById('zoomIn')?.addEventListener('click',()=>setZoom(scale+.25));document.getElementById('zoomOut')?.addEventListener('click',()=>setZoom(scale-.25));document.getElementById('zoomReset')?.addEventListener('click',()=>setZoom(1));
const stage=document.getElementById('lightboxStage');stage?.addEventListener('dblclick',()=>setZoom(scale>1?1:2));stage?.addEventListener('touchstart',e=>{touchX=e.touches[0].clientX;touchY=e.touches[0].clientY;dragging=scale>1},{passive:true});stage?.addEventListener('touchmove',e=>{if(!dragging)return;const x=e.touches[0].clientX,y=e.touches[0].clientY;tx+=x-touchX;ty+=y-touchY;touchX=x;touchY=y;applyTransform()},{passive:true});stage?.addEventListener('touchend',e=>{if(scale>1){dragging=false;return}const dx=(e.changedTouches[0]?.clientX||touchX)-touchX;if(Math.abs(dx)>45)showImage(currentIndex+(dx<0?1:-1))});document.addEventListener('keydown',e=>{if(!lightbox.classList.contains('open'))return;if(e.key==='Escape')closeLightbox();if(e.key==='ArrowLeft')showImage(currentIndex-1);if(e.key==='ArrowRight')showImage(currentIndex+1)});
