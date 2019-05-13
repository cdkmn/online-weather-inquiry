/* global window,$,document,createPaging,Swal,ajaxFailHandler */
$(document).ready(() => {
  const $form = $('#userAddForm');
  const $formEdit = $('#userEditForm');
  const $userAdd = $('#userAdd');
  function deleteUser() {
    const $el = $(this);
    $el.addClass('disabled loading');
    const id = $el.data('userid');

    Swal.fire({
      title: 'Are you sure?',
      text: 'User will be deleted!',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.value) {
        return $.ajax({
          type: 'DELETE',
          url: `/users/${id}`,
        })
          .done((res) => {
            if (res.status) {
              getUsers();
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
  function editUser() {
    const $el = $(this);
    const $buttons = $('#uModalEdit').find('.button');
    const id = $el.data('userid');
    const username = $el.data('username');
    const role = $el.data('role');
    $('#userEditForm [name="username"]').val(username);
    $('#userEditForm [name="role"]').dropdown('set selected', role);
    $formEdit.form('validate form');
    $('#uModalEdit').modal({
      blurring: true,
      closable: false,
      onApprove: ($aprove) => {
        if ($formEdit.form('validate form')) {
          $buttons.addClass('disabled');
          $aprove.addClass('loading');
          const data = $formEdit.serialize();
          $.ajax({
            data,
            type: 'PUT',
            url: `/users/${id}`,
          }).done((res) => {
            if (res.status) {
              $('#uModalEdit').modal('hide');
              return getUsers();
            }
            return Swal.fire({
              type: 'error',
              title: 'An Error Occurred',
              text: res.message,
            });
          })
            .fail(ajaxFailHandler)
            .always(() => {
              $buttons.removeClass('disabled loading');
            });
        }
        return false;
      },
    }).modal('show');
  }
  function getUsers(page = 1, quantity = 10) {
    const $loading = $('#userLoading');
    $loading.addClass('active');
    $.ajax({
      type: 'GET',
      url: `/users/list/${page}?quantity=${quantity}`,
    }).done((res) => {
      $loading.removeClass('active');
      const $userList = $('#userList');
      if (typeof res !== 'object') {
        window.location.href = '/';
        return null;
      }
      if (!res.status) {
        const el = `<div class="ui negative message">
                  <p>${res.message}</p>
                  </div>`;
        return $userList.append(el);
      }
      let list = '';
      for (let i = 0; i < res.users.length; i += 1) {
        list += `<div class="item">
                <div class="right floated content">
                  <div
                    class="ui primary right labeled icon button userEdit"
                    data-userid="${res.users[i].id}"
                    data-username="${res.users[i].username}"
                    data-role="${res.users[i].role}">
                    <i class="right edit outline icon"></i>
                    Edit
                  </div>
                  <div
                    class="ui negative right labeled icon button userDelete"
                    data-userid="${res.users[i].id}">
                    <i class="right trash alternate outline icon"></i>
                    Delete
                  </div>
                </div>
                <div class="content">${res.users[i].username} (${res.users[i].role})</div>
              </div>`;
      }
      $userList.empty();
      $userList.append(list);
      $('.ui.button.userDelete').click(deleteUser);
      $('.ui.button.userEdit').click(editUser);
      function loadPage() {
        getUsers($(this).data('page'));
      }
      return createPaging($userList, page, Math.ceil(res.totalCount / quantity), loadPage);
    })
      .fail(ajaxFailHandler);
  }
  function saveUser(event) {
    event.preventDefault();
    if ($form.form('validate form')) {
      $userAdd.addClass('disabled loading');
      const data = $form.serialize();
      $.ajax({
        data,
        type: 'Post',
        url: '/users',
      }).done((res) => {
        if (res.status) {
          $form.form('reset');
          return getUsers();
        }
        return Swal.fire({
          type: 'error',
          title: 'An Error Occurred',
          text: res.message,
        });
      })
        .fail(ajaxFailHandler)
        .always(() => {
          $userAdd.removeClass('disabled loading');
        });
    }
  }

  $('select.dropdown').dropdown();
  $form.submit(saveUser);
  $form.form({
    fields: {
      username: {
        identifier: 'username',
        rules: [
          {
            type: 'empty',
            prompt: 'Please enter an username',
          },
          {
            type: 'not[root]',
            prompt: 'Username can\'t be \'root\'',
          },
        ],
      },
      password: {
        identifier: 'password',
        rules: [
          {
            type: 'empty',
            prompt: 'Please enter a location name',
          },
          {
            type: 'minLength[4]',
            prompt: 'Your password must be at least {ruleValue} characters',
          },
        ],
      },
      _password: {
        identifier: '_password',
        rules: [
          {
            type: 'match[password]',
            prompt: 'Password did\'t match',
          },
        ],
      },
    },
  });
  $formEdit.form({
    fields: {
      username: {
        identifier: 'username',
        rules: [
          {
            type: 'empty',
            prompt: 'Please enter an username',
          },
          {
            type: 'not[root]',
            prompt: 'Username can\'t be \'root\'',
          },
        ],
      },
    },
  });

  $userAdd.click(saveUser);

  getUsers();
});
