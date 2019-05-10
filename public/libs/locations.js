/* global $,document,createPaging,Swal,ajaxFailHandler */
$(document).ready(() => {
  const $form = $('#locationAddForm');
  const $formEdit = $('#lModalEdit');
  const $locationAdd = $('#locationAdd');
  function deleteLocation() {
    const $el = $(this);
    $el.addClass('disabled loading');
    const id = $el.data('locationid');

    Swal.fire({
      title: 'Are you sure?',
      text: 'Location will be deleted!',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.value) {
        return $.ajax({
          type: 'DELETE',
          url: `/locations/${id}`,
        })
          .done((res) => {
            if (res.status) {
              getLocations();
            }
          })
          .fail(ajaxFailHandler)
          .always(() => {
            $el.removeClass('disabled loading');
          });
      }
      return $el.removeClass('disabled loading');
    });
  }
  function editLocation() {
    const $el = $(this);
    const id = $el.data('locationid');
    const value = $el.data('location');
    $('#locationEditForm [name="name"]').val(value);
    $formEdit.form('validate form');
    $('#lModalEdit').find('.button').removeClass('disabled loading');
    $('#lModalEdit').modal({
      blurring: true,
      closable: false,
      onApprove: ($aprove) => {
        if ($formEdit.form('validate form')) {
          $('#lModalEdit').find('.button').addClass('disabled');
          $aprove.addClass('loading');
          const data = $form.serialize();
          $.ajax({
            data,
            type: 'Post',
            url: '/locations',
          }).done((res) => {
            if (res.status) {
              $form.form('reset');
              return getLocations();
            }
            return Swal.fire({
              type: 'error',
              title: 'An Error Occurred',
              text: res.message,
            });
          })
            .fail(ajaxFailHandler)
            .always(() => {
              $locationAdd.removeClass('disabled loading');
            });
        }
        return false;
      },
    }).modal('show');
  }
  function getLocations(page = 1, quantity = 10) {
    $('#locationLoading').addClass('active');
    $.ajax({
      type: 'GET',
      url: `/locations/list/${page}?quantity=${quantity}`,
    }).done((res) => {
      $('#locationLoading').removeClass('active');
      const $locationList = $('#locationList');
      if (!res.status) {
        const el = `<div class="ui negative message">
                  <p>${res.message}</p>
                  </div>`;
        return $locationList.append(el);
      }
      let list = '';
      for (let i = 0; i < res.locations.length; i += 1) {
        list += `<div class="item">
                <div class="right floated content">
                  <div
                    class="ui primary right labeled icon button locationEdit"
                    data-locationid="${res.locations[i].id}"
                    data-location="${res.locations[i].name}">
                    <i class="right edit outline icon"></i>
                    Edit
                  </div>
                  <div
                    class="ui negative right labeled icon button locationDelete"
                    data-locationid="${res.locations[i].id}">
                    <i class="right trash alternate outline icon"></i>
                    Delete
                  </div>
                </div>
                <div class="content">${res.locations[i].name}</div>
              </div>`;
      }
      $locationList.empty();
      $locationList.append(list);
      $('.ui.button.locationDelete').click(deleteLocation);
      $('.ui.button.locationEdit').click(editLocation);
      function loadPage() {
        getLocations($(this).data('page'));
      }
      return createPaging($locationList, page, Math.ceil(res.totalCount / quantity), loadPage);
    })
      .fail(ajaxFailHandler);
  }
  function saveLocation(event) {
    event.preventDefault();
    if ($form.form('validate form')) {
      $locationAdd.addClass('disabled loading');
      const data = $form.serialize();
      $.ajax({
        data,
        type: 'Post',
        url: '/locations',
      }).done((res) => {
        if (res.status) {
          $form.form('reset');
          return getLocations();
        }
        return Swal.fire({
          type: 'error',
          title: 'An Error Occurred',
          text: res.message,
        });
      })
        .fail(ajaxFailHandler)
        .always(() => {
          $locationAdd.removeClass('disabled loading');
        });
    }
  }

  $form.submit(saveLocation);
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
  $formEdit.form({
    fields: {
      name: {
        identifier: 'name',
        rules: [
          {
            type: 'empty',
            prompt: 'Please enter a location name',
          },
        ],
      },
    },
  });

  $locationAdd.click(saveLocation);

  getLocations();
});
