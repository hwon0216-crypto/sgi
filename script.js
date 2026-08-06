const intro=document.getElementById('intro');
const introLanguageButtons=document.querySelectorAll('[data-intro-lang]');
const langButtons=document.querySelectorAll('.lang-btn');
const dayLinks=document.querySelectorAll('.day-nav a');
const galleryData=window.GALLERY_DATA||{};
const myboxLinks=window.MYBOX_LINKS||{};

function currentLanguage(){return document.documentElement.lang==='ko'?'ko':'ja'}
function changeLanguage(lang){
  document.documentElement.lang=lang;
  document.querySelectorAll('[data-ko][data-ja]').forEach(el=>{el.innerHTML=el.dataset[lang]});
  langButtons.forEach(btn=>btn.classList.toggle('active',btn.dataset.lang===lang));
  document.title=lang==='ja'?'2026 東日本・韓国 青年交流団':'2026 동일본·한국 청년교류단';
  refreshCurrentAreaLabels();
}
function enterAlbum(lang){changeLanguage(lang);intro.classList.add('hide');document.body.classList.remove('locked');setTimeout(()=>intro.remove(),700)}
introLanguageButtons.forEach(btn=>btn.addEventListener('click',()=>enterAlbum(btn.dataset.introLang)));
langButtons.forEach(btn=>btn.addEventListener('click',()=>changeLanguage(btn.dataset.lang)));
changeLanguage('ja');

const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>entry.isIntersecting&&entry.target.classList.add('visible')),{threshold:.08});
document.querySelectorAll('.section-reveal').forEach(el=>revealObserver.observe(el));
const dayObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){dayLinks.forEach(link=>link.classList.toggle('active',link.getAttribute('href')===`#${entry.target.id}`))}}),{rootMargin:'-35% 0px -55%'});
document.querySelectorAll('.day-section').forEach(section=>dayObserver.observe(section));

function createGalleryItem(item,index,label){
  const link=document.createElement('a');
  link.className='gallery-item';
  link.href=item.full;
  link.dataset.pswpSrc=item.full;
  link.dataset.pswpWidth='2000';
  link.dataset.pswpHeight='2000';
  link.dataset.dayLabel=label;
  link.dataset.index=index;
  link.target='_blank';
  link.rel='noopener';

  const img=document.createElement('img');
  img.src=item.thumb;
  img.alt='';
  img.loading='lazy';
  img.decoding='async';

  img.addEventListener('load',()=>{
    const width=img.naturalWidth||1;
    const height=img.naturalHeight||1;
    if(width>=height){
      link.dataset.pswpWidth='2000';
      link.dataset.pswpHeight=String(Math.max(1,Math.round(2000*height/width)));
    }else{
      link.dataset.pswpHeight='2000';
      link.dataset.pswpWidth=String(Math.max(1,Math.round(2000*width/height)));
    }
  });

  return {link,img};
}

function renderGallery(grid,items,label){
  grid.innerHTML='';
  if(!Array.isArray(items)||!items.length){
    grid.innerHTML='<div class="gallery-empty">사진 목록이 없습니다.<br>gallery-data.js를 다시 생성해 주세요.</div>';
    return;
  }

  items.forEach((item,index)=>{
    const {link,img}=createGalleryItem(item,index,label);
    img.addEventListener('error',()=>{
      link.remove();
      if(!grid.querySelector('.gallery-item')){
        grid.innerHTML='<div class="gallery-empty">사진 파일을 찾을 수 없습니다.<br><b>assets/gallery</b> 폴더가 GitHub에 올라갔는지 확인해 주세요.</div>';
      }
    });
    link.appendChild(img);
    grid.appendChild(link);
  });
}

function buildGallery(day){
  const grid=document.querySelector(`[data-day="${day}"]`);
  if(!grid)return;
  renderGallery(grid,Array.isArray(galleryData[day])?galleryData[day]:[],day.toUpperCase());
}

['day1','day2','day4','day5'].forEach(buildGallery);

const areaMeta={
  'north-seoul':{ko:'북서울',ja:'北ソウル',exchangeKo:'도호쿠 교류교환회',exchangeJa:'東北 交流交歓会'},
  'south-seoul':{ko:'남서울',ja:'南ソウル',exchangeKo:'도카이도 교류교환회',exchangeJa:'東海道 交流交歓会'},
  'gyeonggi':{ko:'경기',ja:'京畿',exchangeKo:'간토 교류교환회',exchangeJa:'関東 交流交歓会'},
  'gyeonggang':{ko:'경강',ja:'京江',exchangeKo:'신에쓰 교류교환회',exchangeJa:'信越 交流交歓会'},
  'gyeongin':{ko:'경인',ja:'京仁',exchangeKo:'총도쿄 교류교환회',exchangeJa:'総東京 交流交歓会'},
  'daejeon':{ko:'대전',ja:'大田',exchangeKo:'홋카이도 교류교환회',exchangeJa:'北海道 交流交歓会'},
  'daegu':{ko:'대구',ja:'大邱',exchangeKo:'도쿄 교류교환회',exchangeJa:'東京 交流交歓会'},
  'busan':{ko:'부산',ja:'釜山',exchangeKo:'주부 교류교환회',exchangeJa:'中部 交流交歓会'},
  'gwangju':{ko:'광주',ja:'光州',exchangeKo:'도쿄 교류교환회',exchangeJa:'東京 交流交歓会'}
};

let currentAreaKey='';
const areaSelector=document.getElementById('day3AreaSelector');
const areaView=document.getElementById('day3AreaView');
const areaGrid=document.querySelector('[data-day="day3-area"]');
const areaName=document.getElementById('day3AreaName');
const exchangeName=document.getElementById('day3ExchangeName');
const areaDownload=document.getElementById('day3AreaDownload');

function refreshCurrentAreaLabels(){
  if(!currentAreaKey)return;
  const meta=areaMeta[currentAreaKey];
  const lang=currentLanguage();
  areaName.textContent=meta[lang];
  exchangeName.textContent=lang==='ja'?meta.exchangeJa:meta.exchangeKo;
}

function openArea(areaKey){
  currentAreaKey=areaKey;
  const meta=areaMeta[areaKey];
  const items=galleryData.day3&&Array.isArray(galleryData.day3[areaKey])?galleryData.day3[areaKey]:[];
  const label=`DAY3 · ${currentLanguage()==='ja'?meta.ja:meta.ko}`;
  renderGallery(areaGrid,items,label);
  areaDownload.dataset.downloadArea=areaKey;
  refreshCurrentAreaLabels();
  areaSelector.hidden=true;
  areaView.hidden=false;
  document.getElementById('day3').scrollIntoView({behavior:'smooth',block:'start'});
}

function closeArea(){
  currentAreaKey='';
  areaGrid.innerHTML='';
  areaView.hidden=true;
  areaSelector.hidden=false;
  document.getElementById('day3').scrollIntoView({behavior:'smooth',block:'start'});
}

document.querySelectorAll('.area-card').forEach(button=>{
  button.addEventListener('click',()=>openArea(button.dataset.areaKey));
});

document.getElementById('day3AreaBack')?.addEventListener('click',closeArea);

document.querySelectorAll('[data-download-day]').forEach(link=>{
  link.addEventListener('click',event=>{
    event.preventDefault();
    const day=link.dataset.downloadDay;
    const url=myboxLinks[day];
    if(url){window.open(url,'_blank','noopener,noreferrer')}
    else{alert(currentLanguage()==='ja'?'写真のダウンロードリンクは後日ご案内します。':'사진 다운로드 링크는 추후 안내될 예정입니다.')}
  });
});

areaDownload?.addEventListener('click',event=>{
  event.preventDefault();
  const area=areaDownload.dataset.downloadArea;
  const url=(myboxLinks.day3&&typeof myboxLinks.day3==='object'&&myboxLinks.day3[area])||myboxLinks[`day3-${area}`];
  if(url){window.open(url,'_blank','noopener,noreferrer')}
  else{alert(currentLanguage()==='ja'?'この地域の写真ダウンロードリンクは後日ご案内します。':'이 광역의 사진 다운로드 링크는 추후 안내될 예정입니다.')}
});
