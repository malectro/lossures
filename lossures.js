var LS = (function () {
  var me = {};

  me.init = function () {
    var vid = document.getElementById('vid');

    vid.loop = true;
    vid.playbackRate = 0.1;
    vid.play();
    setTimeout(function () {
      vid.playbackRate = 1;
    }, 10000);
  };

  return me;
}());

