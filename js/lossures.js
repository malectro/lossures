var LS = (function () {

  var me = {};

  me.init = function () {

    var vid = document.getElementById('vid'),
        container = document.getElementById('source-container');

    vid.loop = true;
    vid.playbackRate = 1;
    vid.play();

    $('#video-pause').on('click', function () {
      vid.pause();
      container.className = 'minimize';
      $('#video-pause').hide();
      $('#video-play').show();
    });

    $('#video-play').on('click', function () {
      container.className = 'maximize';
      $('#video-play').hide();
      $('#video-pause').show();
      vid.play();
    });

  };

  return me;

}());

