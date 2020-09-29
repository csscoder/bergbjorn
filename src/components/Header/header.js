$(document).ready(function(){
  $("#sticker").sticky({topSpacing: -20});

  $('.js-goto').click(function(event) {
    event.preventDefault();
    var link = this;
    $.smoothScroll({
      offset: -80,
      scrollTarget: link.hash
    });
  });
});
