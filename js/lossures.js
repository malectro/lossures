var LS = (function () {

  var me = {},
      _scene = 1,
      _paused = false,
      vid, pop, container, streetview;

  me.nextScene = function () {
    _scene++;
  };

  me.pause = function () {
    vid.pause();
    container.className = 'minimize';
    $('#video-pause').hide();
    $('#video-play').show();
    setTimeout(function () {
      $('.ls-pause-' + _scene).addClass('fade-in');
    }, 1000);
    streetView.update(40.711626, -73.960094);  // TODO - dbow - update with dynamic latitude and longitude.
  };

  me.play = function () {
    container.className = 'maximize';
    $('#video-play').hide();
    $('#video-pause').show();
    vid.play();
    $('.ls-anno-box').removeClass('fade-in');
    streetView.hide();
  };

  me.breakpoint = function () {
    if (!_paused) {
      me.pause();
    }
    _paused = false;
    setTimeout(me.nextScene, 1500);
  };

  me.init = function () {

    var layerItemHtml = '<div class="layer">&mdash;</div>';

    vid = document.getElementById('vid');
    pop = Popcorn(vid);
    container = document.getElementById('source-container');
    streetView = me.streetView();

    vid.loop = false;
    vid.playbackRate = 1;

    // Hacky section to show the "layer indicators" at specific points.
    var layerConfigArray = [
        {
          start: 0,
          end: 1,
          numLayers: 2
        },
        {
          start: 1,
          end: 2,
          numLayers: 1
        },
        {
          start: 2,
          end: 6,
          numLayers: 5
        }
      ],
      layer,
      layerString = '';

    for (var i = 0, len = layerConfigArray.length; i < len; i++) {
      layer = layerConfigArray[i];
      pop.code({
        start: layer.start,
        end: layer.end,
        numLayers: layer.numLayers,
        onStart: function (options) {
          _(options.numLayers).times(function (){ layerString += layerItemHtml; });
          $('#layer-counter').html(layerString);
        },
        onEnd: function () {
          $('#layer-counter').html('');
          layerString = '';
        }
      });
    }

    streetView.create();

    pop.on('pause', function () {
      console.log(pop.currentTime());
    });

    pop.cue(6.58, me.breakpoint);
    pop.cue(35.5, me.breakpoint);
    pop.cue(46, me.breakpoint);

    $('#video-pause').on('click', function () {
      _paused = true;
      me.pause();
    });

    $('#video-play').on('click', function () {
      me.play();
    });



    vid.play();

    //light box
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

    $('.ls-anno-vid').each(function () {
      var pop = Popcorn(this);

      function stop() {
        pop.playing = false;
        pop.pause();
      }

      pop.on('ended', stop);

      $(this).click(function () {
        if (pop.playing) {
          return stop();
        }
        pop.playing = true;
        pop.play();
      });
    })
  };

  me.streetView = function () {

    var positionCache = {},
        panoramaOptions = {
          pov: {
            heading: 165,
            pitch: 0,
            zoom: 1
          },
          addressControl: false,
          clickToGo: false,
          disableDoubleClickZoom: true,
          linksControl: false,
          panControl: false,
          scrollwheel: false,
          zoomControl: false,
          enableCloseButton: false
        },
        panorama,
        interval;

    return {

      create: function () {
        panorama = new google.maps.StreetViewPanorama(document.getElementById('background-container'),
                                                      panoramaOptions);
        panorama.setPosition(new google.maps.LatLng(40.711626, -73.960094));
        panorama.setVisible(false);
        $('#background-container').css('background-color', 'black');
      },

      update: function (lat, lng) {
        var pov = panorama.getPov();
        if (!positionCache['' + lat + lng]) {
          positionCache['' + lat + lng] = new google.maps.LatLng(lat, lng);
        }
        panorama.setPosition(positionCache['' + lat + lng]);
        panorama.setVisible(true);
        // Slowly pan the street view background.
        interval = window.setInterval(function () {
          pov.heading += 0.1;
          panorama.setPov(pov);
        }, 30);
      },

      hide: function () {
        window.clearInterval(interval);
        panorama.setVisible(false);
        $('#background-container').css('background-color', 'black');
      }

    };

  };

  return me;

}());

