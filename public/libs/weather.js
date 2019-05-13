/* global window,$,document,createPaging,Swal,ajaxFailHandler */
$(document).ready(() => {
  const $form = $('#getWeatherForm');
  const $getWeather = $('#getWeather');

  function loadLocations() {
    $('.ui.dropdown').addClass('loading');
    $.ajax({
      type: 'GET',
      url: '/locations/list',
    }).done((res) => {
      if (!res.status) {
        return Swal.fire({
          type: 'error',
          title: 'An Error Occurred',
          text: res.message,
        });
      }
      const values = res.locations.map(l => ({ value: l.id, text: l.name, name: l.name }));
      $('.ui.dropdown').dropdown('change values', values);
      $('.ui.dropdown').removeClass('loading');
      return null;
    });
  }
  function getWeather(event) {
    event.preventDefault();
    if ($form.form('validate form')) {
      const $loading = $('#weatherLoading');
      const location = $('#getWeatherForm [name="location"]').val();
      $loading.addClass('active');
      $.ajax({
        type: 'GET',
        url: `/weather/${location}`,
      }).done((res) => {
        $loading.removeClass('active');
        const $weatherHolder = $('#weatherHolder');
        if (!res.status) {
          const el = `<div class="ui negative message">
                  <p>${res.message}</p>
                  </div>`;
          $weatherHolder.empty(el);
          return $weatherHolder.append(el);
        }
        const data = JSON.parse(res.data);
        const card = `
          <div class="ui card">
            <div class="image">
              <img src="${data.current.condition.icon}">
            </div>
            <div class="content">
              <a class="header">${data.location.name}</a>
              <div class="description">
                <div>Temp: ${data.current.temp_c} &#8451;</div>
                <div>Condition: ${data.current.condition.text}</div>
                <div>Humidity: %${data.current.humidity}</div>
              </div>
            </div>
          </div>`;
        $weatherHolder.empty();
        return $weatherHolder.append(card);
      })
        .fail(ajaxFailHandler);
    }
  }

  $('.ui.dropdown').dropdown();
  $form.form({
    on: 'blur',
    fields: {
      username: {
        identifier: 'location',
        rules: [
          {
            type: 'empty',
            prompt: 'Please select a location',
          },
        ],
      },
    },
  });
  $form.submit(getWeather);
  $getWeather.click(getWeather);
  loadLocations();
});
