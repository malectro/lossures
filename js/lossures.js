var LS = (function () {

  var me = {},
      _scene = 1,
      _paused = false,
      vid, pop, container, streetview;

  var annotationData = {
    main_video: "main_vid.mp4",
    breakpoints: [
      {
        cue: 6.58,
        latitude: 40.709694,
        longitude: -73.954063,
        media: [
          {
            type: "video",
            src: "anno_vid1.mp4",
            width: 400,
            position: {
              x: 50,
              y: 20
            },
            video_position: {
              x: 70,
              y: 100
            }
          },
          {
            type: "text",
            caption: "I don’t find the need to leave williamsburg to move to another area... so that I can solve my problems.",
            width: 280,
            position: {
              x: 900,
              y: 20
            },
            video_position: {
              x: 200,
              y: 10
            }
          },
          {
            type: "zeega",
            src: "http://beta.zeega.org/41272",
            width: 200,
            position: {
              x: 550,
              y: 20
            },
            video_position: {
              x: 150,
              y: 250
            }
          }
        ]
      }
    ]
  };

  me.nextScene = function () {
    _scene++;
  };

  me.pause = function () {
    var sceneData = annotationData.breakpoints[_scene - 1];
    vid.pause();
    container.className = 'minimize';
    $('#video-pause').hide();
    $('#video-play').show();
    setTimeout(function () {
      $('.ls-pause-' + _scene).addClass('fade-in');
      me.canvas.show(_scene);
    }, 1000);
    streetView.update(sceneData.latitude, sceneData.longitude);
  };

  me.play = function () {
    container.className = 'maximize';
    $('#video-play').hide();
    $('#video-pause').show();
    vid.play();
    $('.ls-anno-box').removeClass('fade-in');
    streetView.hide();
    me.canvas.hideAll();
  };

  me.breakpoint = function () {
    if (!_paused) {
      me.pause();
    }
    _paused = false;
    setTimeout(me.nextScene, 1500);
  };

  me.mediaFactory = {
    video: function (medium) {
      var $medium = $('<video class="ls-anno-vid"/>');
      $medium[0].preload = 'auto';
      $medium[0].src = medium.src;
      return $medium;
    },
    text: function (medium) {
      var $medium = $('<div class="ls-anno-text"/>');
      return $medium.text(medium.caption);
    },
    img: function (medium) {
      var $image = $('<img class="ls-anno-img"/>');
      return $image.attr('src', medium.src);
    },
    zeega: function (medium) {
      var $zeega = $('<iframe class="ls-anno-zeega"/>');
      return $zeega.attr('src', medium.src);
    }
  };

  me.init = function () {

    var layerItemHtml = '<div class="layer"></div>';

    vid = document.getElementById('vid');
    container = document.getElementById('source-container');
    streetView = me.streetView();

    vid.src = annotationData.main_video;
    vid.loop = false;
    vid.playbackRate = 1;

    pop = Popcorn(vid);

    _.each(annotationData.breakpoints, function (breakpoint, i) {
      i++;
      var $wrapper = $('<div class="ls-anno-box faded ls-pause-' + i + '"/>');

      me.canvas.create(i);

      _.each(breakpoint.media, function (medium) {
        var $medium;

        if (me.mediaFactory[medium.type]) {
          $medium = me.mediaFactory[medium.type](medium);
        }
        else {
          $medium = $('<div/>').hide();
        }

        $medium.css({left: medium.position.x, top: medium.position.y, width: medium.width})
          .addClass('ls-anno-object').appendTo($wrapper);
      });

      me.canvas.drawLines(breakpoint.media, i);

      $('#main').append($wrapper);
      pop.cue(breakpoint.cue, me.breakpoint);
    });

    // Hacky section to show the "layer indicators" at specific points.
    var layerConfigArray = [
        {
          start: 0,
          end: 7,
          numLayers: 3
        },
        {
          start: 7,
          end: 36,
          numLayers: 2
        },
        {
          start: 36,
          end: 46,
          numLayers: 1
        }
      ],
      layer;

    for (var i = 0, len = layerConfigArray.length; i < len; i++) {
      layer = layerConfigArray[i];
      pop.code({
        start: layer.start,
        end: layer.end,
        numLayers: layer.numLayers,
        onStart: function (options) {
          $('#layer-counter').html('');
          _(options.numLayers).times(function (n){ $('#layer-counter').append($(layerItemHtml).css('bottom', n*12)); });
          $('.layer').addClass('glow');
        },
        onEnd: function () {
          $('#layer-counter').html('');
          layerString = '';
          $('.layer').removeClass('glow');
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
      var pop = Popcorn(this),
          $vid = $(this);

      function stop() {
        pop.playing = false;
        pop.pause();
      }

      pop.on('ended', function () {
        $vid.fadeOut(200);
        stop();
      });

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
        var firstBreak = annotationData && annotationData.breakpoints ? annotationData.breakpoints[0] : null,
            defaultLat = firstBreak ? firstBreak.latitude : 40.709694,
            defaultLong = firstBreak ? firstBreak.longitude : -73.954063;
        panorama = new google.maps.StreetViewPanorama(document.getElementById('background-container'),
                                                      panoramaOptions);
        panorama.setPosition(new google.maps.LatLng(defaultLat, defaultLong));
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

  me.canvas = (function () {

    return {

      create: function (index) {
        $('#canvas-container').append('<canvas id="line-canvas-' + index + '"></canvas>');
      },

      show: function (index) {
        $('#line-canvas-' + index).addClass('fade-in');
      },

      hideAll: function () {
        $('canvas').removeClass('fade-in');
      },

      drawLines: function (media, index) {

        var cvs = document.getElementById('line-canvas-' + index),
            ctx = cvs.getContext('2d'),
            minVidX,
            minVidY;

        cvs.width = $(window).width();
        cvs.height = $(window).height();

        minVidX = cvs.width*0.1;
        minVidY = cvs.height*0.6;

        ctx.lineWidth = 0.5;

        _.each(media, function (item, i) {

          var startX = Math.round(minVidX + item.video_position.x),
              startY = Math.round(minVidY + item.video_position.y),
              endX = Math.round(item.position.x + (item.width / 2)),
              endY = Math.round(item.position.y + 50);

          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.strokeStyle = '#fff';
          ctx.fillStyle = '#fff';
          ctx.stroke();

        });

      }

    };

  })();

  return me;

}());

