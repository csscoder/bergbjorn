$(document).ready(function(){

  var btnItem = $('#back-to-top');

  $(window).scroll(function () {
    if ($(this).scrollTop() > 100) {
      btnItem.fadeIn('fast');
    } else {
      btnItem.fadeOut();
    }
  });

  // scroll body to 0px on click
  var btnItem = $('#back-to-top');
  btnItem.click(function () {
    btnItem.tooltip('hide');
    $('body,html').animate({
      scrollTop: 0
    }, 800);
    return false;
  });
});
