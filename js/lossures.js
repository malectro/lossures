var LS = (function () {

  var me = {};

  me.init = function () {

    var vid = document.getElementById('vid'),
        pop = Popcorn(vid),
        container = document.getElementById('source-container');

    vid.loop = false;
    vid.playbackRate = 1;

    $('#video-pause').on('click', function () {
      vid.pause();
      container.className = 'minimize';
      $('#video-pause').hide();
      $('#video-play').show();
      setTimeout(function () {
        document.getElementById('ls-pause-1').classList.add('fade-in');
      }, 1000);
    });

    $('#video-play').on('click', function () {
      container.className = 'maximize';
      $('#video-play').hide();
      $('#video-pause').show();
      vid.play();
      document.getElementById('ls-pause-1').classList.remove('fade-in');
    });

    //vid.play();
    $('.ls-anno-img').toggle(function () {
      var $el = $(this).addClass('large'),
          $w = $(window),
          $img = $('img', $el),
          top = ($w.height() - $img.height()) / 2,
          left = ($w.width() - $img.width()) / 2;

      if (top < 0) {
        top = 0;
      }
      if (left < 0) {
        left = 0;
      }

      $img.css({top: top, left: left});
    }, function () {
      $(this).removeClass('large');
    });
  };

  return me;

}());

