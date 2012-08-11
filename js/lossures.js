var LS = (function () {

  var me = {};

  me.init = function () {

    var vid = document.getElementById('vid');

    vid.loop = true;
    vid.playbackRate = 1;
    vid.play();

    $('#video-pause').on('click', function () {
      vid.pause();
      vid.className = 'minimize';
      $('#video-pause').hide();
      $('#video-play').show();
    });

    $('#video-play').on('click', function () {
      vid.play();
      vid.className = 'maximize';
      $('#video-play').hide();
      $('#video-pause').show();
    });

  };

  return me;

}());

