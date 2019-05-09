/* global $ */
$('.masthead')
  .visibility({
    once: false,
    onBottomPassed: () => {
      $('.fixed.menu').transition('fade in');
    },
    onBottomPassedReverse: () => {
      $('.fixed.menu').transition('fade out');
    },
  });
// create sidebar and attach to menu open
$('.ui.sidebar').sidebar('attach events', '.toc.item');
