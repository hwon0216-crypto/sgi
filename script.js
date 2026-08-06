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
function buildGallery(day){
  const grid=document.querySelector(`[data-day="${day}"]`);
  if(!grid)return;

  const items=Array.isArray(galleryData[day])?galleryData[day]:[];
  if(!items.length){
    grid.innerHTML='<div class="gallery-empty">사진 목록이 없습니다.<br>gallery-data.js를 다시 생성해 주세요.</div>';
    return;
  }

  items.forEach((item,index)=>{
    const link=document.createElement('a');
    link.className='gallery-item';
    link.href=item.full;
    link.dataset.pswpSrc=item.full;
    link.dataset.pswpWidth='2000';
    link.dataset.pswpHeight='2000';
    link.dataset.dayLabel=day.toUpperCase();
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

['day1','day2','day3','day4','day5'].forEach(buildGallery);

document.querySelectorAll('[data-download-day]').forEach(link=>{link.addEventListener('click',event=>{event.preventDefault();const day=link.dataset.downloadDay;const url=myboxLinks[day];if(url){window.open(url,'_blank','noopener,noreferrer')}else{alert(currentLanguage()==='ja'?'写真のダウンロードリンクは後日ご案内します。':'사진 다운로드 링크는 추후 안내될 예정입니다.')}})});
