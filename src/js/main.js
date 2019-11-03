/* global d3 */
import debounce from 'lodash.debounce';
import isMobile from './utils/is-mobile';
import graphic from './graphic';
import Reveal from './Reveal';
// import footer from './footer';

const $body = d3.select('body');
let previousWidth = 0;

function resize() {
  // only do resize on width changes, not height
  // (remove the conditional if you want to trigger on height change)
  const width = $body.node().offsetWidth;
  if (previousWidth !== width) {
    previousWidth = width;
    graphic.resize();
  }
}

// function setupStickyHeader() {
//   const $header = $body.select('header');
//   if ($header.classed('is-sticky')) {
//     const $menu = $body.select('.header__menu');
//     const $toggle = $body.select('.header__toggle');
//     $toggle.on('click', () => {
//       const visible = $menu.classed('is-visible');
//       $menu.classed('is-visible', !visible);
//       $toggle.classed('is-visible', !visible);
//     });
//   }
// }

function init() {
  // add mobile class to body tag
  $body.classed('is-mobile', isMobile.any());
  // setup resize event
  window.addEventListener('resize', debounce(resize, 150));
  Reveal.addEventListener('resize', () => {
    debounce(resize, 150);
  });

  Reveal.addEventListener('slidechanged', function (event) {
    // event.previousSlide, event.currentSlide, event.indexh, event.indexv
    // // Manually refire render to get height calculations to work
    // if (event.indexh === 3) {
    //   console.log('triggered');
    //   graphic.simulation1();
    // }
  });
  // setup sticky header menu
  // setupStickyHeader();
  // kick off graphic code
  graphic.init();
  // load footer stories
  // footer.init();
}

init();
