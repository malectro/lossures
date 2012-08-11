var LS = (function () {

  var me = {},
      vid, pop, container, streetview;

  me.pause = function () {
    vid.pause();
    container.className = 'minimize';
    $('#video-pause').hide();
    $('#video-play').show();
    setTimeout(function () {
      document.getElementById('ls-pause-1').classList.add('fade-in');
    }, 1000);
    streetView.update(40.711626, -73.960094);  // TODO - dbow - update with dynamic latitude and longitude.
  };

  me.play = function () {
    container.className = 'maximize';
    $('#video-play').hide();
    $('#video-pause').show();
    vid.play();
    document.getElementById('ls-pause-1').classList.remove('fade-in');
    streetView.hide();
  };

  me.init = function () {
    vid = document.getElementById('vid');
    pop = Popcorn(vid);
    container = document.getElementById('source-container');
    streetView = me.streetView();

    vid.loop = false;
    vid.playbackRate = 1;

    streetView.create();

    pop.on('pause', function () {
      console.log(pop.currentTime());
    });

    pop.cue(6.58, function () {
      me.pause();
    });

    $('#video-pause').on('click', function () {
      me.pause();
    });

    $('#video-play').on('click', function () {
      me.play();
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
        panorama;

    return {

      create: function () {
        panorama = new google.maps.StreetViewPanorama(document.getElementById('background-container'),
                                                      panoramaOptions);
        panorama.setPosition(new google.maps.LatLng(40.711626, -73.960094));
        panorama.setVisible(false);
        $('#background-container').css('background-color', 'black');
      },

      update: function (lat, lng) {
        if (!positionCache['' + lat + lng]) {
          positionCache['' + lat + lng] = new google.maps.LatLng(lat, lng);
        }
        panorama.setPosition(positionCache['' + lat + lng]);
        panorama.setVisible(true);
      },

      hide: function () {
        panorama.setVisible(false);
        $('#background-container').css('background-color', 'black');
      }

    };

  };

  return me;

}());

