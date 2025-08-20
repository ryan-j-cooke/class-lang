$(function () {
  $('#contact-us-form').submit(
    function (e) {
      e.preventDefault()

      try {
        var URL = 'https://pfpzgn99a3.execute-api.us-east-1.amazonaws.com/prod/api/send-contact-email'
        var form = this

        callAPI(URL, {
          name: $(form[0]).val(),
          email: $(form[1]).val(),
          message: $(form[2]).val()
        })
      } catch (e) {
        console.log('There was an error: ', e)
      }
    }
  )
})

function isEmail (email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(String(email).toLowerCase())
}

function callAPI (URL, data) {
  if (isEmail(data.email)) {
    $.ajax({
      type: 'POST',
      url: URL,
      dataType: 'json',
      crossDomain: 'true',
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify(data),

      success: function () {
        $('#modalContactForm').modal('show')

        $('#name').val('')
        $('#email').val('')
        $('#message').val('')
        $('#get-notified-email-input').val('')
      },
      error: function (e) {
        $('#modalContactForm').modal('show')

        throw JSON.stringify(e)
      }
    })
  }
}
