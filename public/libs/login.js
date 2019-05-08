/* global document,$ */
$(document)
  .ready(() => {
    $('.ui.form')
      .form({
        fields: {
          username: {
            identifier: 'username',
            rules: [
              {
                type: 'empty',
                prompt: 'Please enter your username',
              },
            ],
          },
          password: {
            identifier: 'password',
            rules: [
              {
                type: 'empty',
                prompt: 'Please enter your password',
              },
              {
                type: 'length[4]',
                prompt: 'Your password must be at least 4 characters',
              },
            ],
          },
        },
      });
  });
