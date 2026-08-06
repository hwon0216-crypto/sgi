import PhotoSwipeLightbox from 'https://cdn.jsdelivr.net/npm/photoswipe@5.4.4/dist/photoswipe-lightbox.esm.js';

const lightbox = new PhotoSwipeLightbox({
  gallery: '.instagram-grid',
  children: 'a.gallery-item',
  pswpModule: () => import('https://cdn.jsdelivr.net/npm/photoswipe@5.4.4/dist/photoswipe.esm.js'),
  bgOpacity: 0.96,
  showHideAnimationType: 'zoom',
  wheelToZoom: true,
  pinchToClose: true,
  closeOnVerticalDrag: true,
  preload: [1, 2]
});

lightbox.on('uiRegister', () => {
  lightbox.pswp.ui.registerElement({
    name: 'day-label',
    className: 'pswp__day-label',
    order: 4,
    appendTo: 'bar',
    onInit: (element, pswp) => {
      const updateDay = () => {
        const data = pswp.currSlide?.data;
        element.textContent = data?.element?.dataset?.dayLabel || '';
      };
      pswp.on('change', updateDay);
      updateDay();
    }
  });
});

lightbox.init();
