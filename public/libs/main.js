/* global $,document,Swal */
$(document).ready(() => {
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
});

function pages(currentPage, totalPage, pageRange = 3, marginPages = 1) {
  const items = {};

  const setPageItem = (index) => {
    const content = index + 1;
    const selected = index === currentPage;
    const page = {
      index,
      content,
      selected,
      breakView: false,
    };
    items[index] = page;
  };

  const setBreakView = (index) => {
    const breakView = { breakView: true, content: '...' };
    items[index] = breakView;
  };

  if (totalPage <= pageRange) {
    for (let index = 0; index < totalPage; index += 1) {
      setPageItem(index);
    }
  } else {
    const halfPageRange = Math.floor(this.pageRange / 2);
    // 1st - loop thru low end of margin pages
    for (let i = 0; i < marginPages; i += 1) {
      setPageItem(i);
    }

    // 2nd - loop thru selected range
    let selectedRangeLow = 0
    if (currentPage - halfPageRange > 0) {
      selectedRangeLow = currentPage - halfPageRange;
    }

    let selectedRangeHigh = selectedRangeLow + pageRange - 1;
    if (selectedRangeHigh >= totalPage) {
      selectedRangeHigh = totalPage - 1;
      selectedRangeLow = selectedRangeHigh - pageRange + 1;
    }

    for (let i = selectedRangeLow; i <= selectedRangeHigh && i <= totalPage - 1; i += 1) {
      setPageItem(i);
    }

    // Check if there is breakView in the left of selected range
    if (selectedRangeLow > marginPages) {
      setBreakView(selectedRangeLow - 1);
    }

    // Check if there is breakView in the right of selected range
    if (selectedRangeHigh + 1 < totalPage - marginPages) {
      setBreakView(selectedRangeHigh + 1);
    }

    // 3rd - loop thru high end of margin pages
    for (let i = totalPage - 1; i >= totalPage - marginPages; i -= 1) {
      setPageItem(i);
    }
  }
  return items;
}

function createPaging($el, currentPage, totalPage, loadPage) {
  const items = pages(currentPage, totalPage);
  const menu = document.createElement('div');
  menu.className = 'ui pagination menu';
  const prevEl = document.createElement('a');
  prevEl.className = `${totalPage < 2 || currentPage === 1 ? 'disabled  ' : ''}item`;
  prevEl.setAttribute('data-page', currentPage - 1);
  prevEl.addEventListener('click', loadPage);
  const prevIcon = document.createElement('i');
  prevIcon.className = 'chevron left icon';
  prevEl.appendChild(prevIcon);
  menu.appendChild(prevEl);
  const keys = Object.keys(items);
  for (let j = 0; j < keys.length; j += 1) {
    const page = items[keys[j]].content;
    const isActive = currentPage === page;
    const item = document.createElement('a');
    item.className = `${isActive ? 'active ' : ''}item`;
    item.setAttribute('data-page', page);
    item.addEventListener('click', loadPage);
    item.innerText = page;
    menu.appendChild(item);
  }
  const nextEl = document.createElement('a');
  nextEl.className = `${totalPage < 2 || currentPage !== totalPage ? 'disabled  ' : ''}item`;
  nextEl.setAttribute('data-page', currentPage + 1);
  nextEl.addEventListener('click', loadPage);
  const nextIcon = document.createElement('i');
  nextIcon.className = 'chevron right icon';
  nextEl.appendChild(nextIcon);
  menu.appendChild(nextEl);
  $el.next().remove();
  $el.after(menu);
}

function ajaxFailHandler(res) {
  console.log(res);
  switch (res.status) {
    case 400:
      Swal.fire({
        type: 'error',
        title: 'An Error Occurred',
        text: 'Bad request.',
      });
      break;
    case 500:
      Swal.fire({
        type: 'error',
        title: 'An Error Occurred',
        text: 'An error occurred while processing request',
      });
      break;
    default:
      break;
  }
}
