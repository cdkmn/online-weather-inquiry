/* global $ */
function createList(page = 1, quantity = 20) {
  $('#locationLoading').addClass('active');
  $.ajax({
    type: 'GET',
    url: `/locations/list/${page}?quantity=${quantity}`,
  }).done((res) => {
    console.log(res);
    $('#locationLoading').removeClass('active');
    if (!res.status) {
      const el = `<div class="ui negative message">
                  <p>${res.message}</p>
                  </div>`;
      return $('#locationList').append(el);
    }
    return null;
  })
    .fail(err => console.log(err));
}

$('#locationAdd').click((e) => {
  e.preventDefault();
  console.log('add');
});

createList();
