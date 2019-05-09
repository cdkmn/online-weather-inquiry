/* global $ */
const $form = $('#locationAddForm');
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

$form.form({
  fields: {
    location: {
      identifier: 'location',
      rules: [
        {
          type: 'empty',
          prompt: 'Please enter a location name',
        },
      ],
    },
  },
});

const $locationAdd = $('#locationAdd');
$locationAdd.click((e) => {
  e.preventDefault();
  if ($form.form('validate form')) {
    $locationAdd.addClass('disabled loading');
    const data = $form.serialize();
    $.ajax({
      data,
      type: 'Post',
      url: '/locations/add',
    }).done((res) => {
      console.log(res);
    })
      .fail(err => console.log(err))
      .always(() => {
        $locationAdd.removeClass('disabled loading');
      });
  }
});

createList();
