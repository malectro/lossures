var LS = (function () {

  var me = {},
      _scene = 1,
      _paused = false,
      vid, pop, container, streetView;

  var annotationData = {
    main_video: "main_vid.mp4",
    breakpoints: [
      {
        cue: 6.58,
        latitude: 40.709694,
        longitude: -73.954063,
        background_audio: '',
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
              x: 550,
              y: 240
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
              x: 950,
              y: 620
            },
            video_position: {
              x: 150,
              y: 250
            }
          }
        ]
      },
      {
        cue: 35.5,
        latitude: 40.711841,
        longitude: -73.947004,
        background_audio: '',
        media: [
          {
            type: "video",
            src: "cemetary.mov",
            width: 400,
            position: {
              x: 150,
              y: 120
            },
            video_position: {
              x: 10,
              y: 10
            }
          },
          {
            type: "text",
            caption: "I’m gonna deal with my problems here.\nI think for the kids they would have to choose. If they want to live in this neighborhood... or they wanna get out.  AND if they gonna live in the neighborhood, what-ta they gonna do to make it better. And If they’re going to get out, how they gonna prepare themselves to get out of it.... because it is very hard.",
            width: 280,
            position: {
              x: 800,
              y: 220
            },
            video_position: {
              x: 10,
              y: 10
            }
          }
        ]
      }
    ]
  };

  me.nextScene = function () {
    if (annotationData.breakpoints[_scene]) {
      _scene++;
      me.calcLayers();
    }
  };

  me.drawPassthroughs = function () {
    $('.passer').remove();
    $('.passthrough').each(function () {
      var $el = $(this),
          pos = $el.offset(),
          $passer = $('<div/>');

      if (!$el.parent().hasClass('fade-in')) {
        return;
      }

      pos.width = $el.width() * 0.8;
      pos.height = $el.height() * 0.8;
      pos.padding = $el.css('padding');

      $passer.addClass('passer').css(pos).hover(function () {
        console.log('passer hover');
        $el.mouseenter();
      }, function () {
        $el.mouseleave();
      }).click(function () {
        $el.click();
      }).appendTo('body');
    });
  };

  me.pause = function () {
    var sceneData = annotationData.breakpoints[_scene - 1];
    vid.pause();
    container.className = 'minimize';
    $('#video-pause').hide();
    $('#video-play').show();
    console.log(_scene);
    $('.ls-anno-box').hide();
    setTimeout(function () {
      $('.ls-pause-' + _scene).show().addClass('fade-in');
      me.canvas.show(_scene);
      $('#logo').addClass('fade-in');
    }, 1000);
    streetView.update(sceneData.latitude, sceneData.longitude);
    me.music.play(_scene - 1);
    $('#layer-boxes').hide();
    $("body").addClass('paused');
  };

  me.fullscreen = function () {
    if (!$('body').hasClass('paused')) {
      $('.ls-anno-box').hide();
      _.delay(function () {
        $('#layer-boxes').fadeIn();
      }, 1000);
      return;
    }
    container.className = 'maximize';
    $('#video-play').hide();
    $('#video-pause').show();
    $('.ls-anno-box').removeClass('fade-in');
    $('#logo').removeClass('fade-in');
    if (streetView) {
      streetView.hide();
    }
    _.delay(function () {
      $('.ls-anno-box').hide();
      $('#layer-boxes').fadeIn();
    }, 1000);
    me.canvas.hideAll();
    me.music.stop(_scene - 1);
    $("body").removeClass('paused');
  };

  me.play = function () {
    me.fullscreen();
    vid.play();
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
      return $medium.html(medium.caption.replace("\n", "<br/>"));
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

  me.calcLayers = function () {
    var layerCount = annotationData.breakpoints[_scene - 1].media.length,
        $boxes = $('#layer-boxes').html('').css({
          width: 768,
          height: 576,
          left: '50%',
          marginLeft: -384,
        });
    _.times(layerCount, function (i) {
      i++;
      $('<div class="box"/>').css({top: i * 5, left: i * 5}).appendTo($boxes);
    });
  };

  me.reset = function () {
    _scene = 1;

    vid = document.getElementById('vid');
    container = document.getElementById('source-container');

    vid.src = '';
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
          .addClass('ls-anno-object passthrough').appendTo($wrapper);

      });


      $('#main').append($wrapper);
      me.calcLayers();
      pop.cue(breakpoint.cue, me.nextScene);
      $('.ls-pause-' + i).children().each(function (i, obj) {
        breakpoint.media[i].height = $(obj).height();
      });
      me.canvas.drawLines(breakpoint.media, i);

    });

    $('.ls-anno-object').hover(function () {
      me.canvas.fadeOut();
      $(this).css('-webkit-transform', 'scale(1)');
    }, function () {
      //hax
      if ($('body').hasClass('paused')) {
        me.canvas.fadeIn(_scene);
      }
      $(this).css('-webkit-transform', 'scale(0.8)');
    });

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

      $(this).hover(function () {
        pop.playing = true;
        pop.play();
      }, stop);
    });

    me.play();
  };

  me.init = function () {

    var layerItemHtml = '<div class="layer"></div>';

    me.reset();
    streetView = me.streetView();

    streetView.create();
    me.music.init();

    /*
    pop.cue(6.58, me.breakpoint);
    pop.cue(35.5, me.breakpoint);
    pop.cue(46, me.breakpoint);
    */

    $('#video-pause').on('click', function () {
      _paused = true;
      me.pause();
    });

    $('#video-play').on('click', function () {
      me.play();
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

  me.music = (function () {

    var _context,
        _audioBuffers = [],
        _source,
        soundReady = [];

    return {

      init: function () {

        try {
          _context = new webkitAudioContext();
        }
        catch(e) {
            alert('Web Audio API is not supported in this browser');
        }

        function loadTrack (url, index) {

          var request = new XMLHttpRequest();

          request.open('GET', url, true);
          request.responseType = 'arraybuffer';

          // Decode asynchronously
          request.onload = function() {
            _context.decodeAudioData(request.response, function (buffer) {
              _audioBuffers[index] = buffer;
              soundReady[index] = true;
            });
          }
          request.send();

        }

        for (var i = 0, len = annotationData.breakpoints.length; i < len; i++) {
          if (annotationData && annotationData.breakpoints[i].background_audio) {
            loadTrack(annotationData.breakpoints[i].background_audio, i);
          }
        }

      },

      play: function (index) {

        if (soundReady[index]) {
          _source = _context.createBufferSource();
          _source.buffer = _audioBuffers[index];
          _source.connect(_context.destination);
          _source.noteOn(0);
        }

      },

      stop: function (index) {

        if (soundReady[index]) {
          _source.noteOff(0);
        }

      }

    };

  })();

  me.canvas = (function () {

    return {

      create: function (index) {
        $('#canvas-container').append('<canvas id="line-canvas-' + index + '"></canvas>');
      },

      show: function (index) {
        $('#line-canvas-' + index).fadeIn();
      },

      hideAll: function () {
        $('canvas').hide();
      },

      fadeOut: function () {
        $('canvas').fadeOut();
      },

      fadeIn: function (index) {
        $('#line-canvas-' + index).fadeIn();
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

        _.each(media, function (item, i) {

          var startX = Math.round(minVidX + item.video_position.x),
              startY = Math.round(minVidY + item.video_position.y),
              endX = item.position.x + item.width*0.1,
              endY = item.position.y + item.height*0.95,
              radius = 7,
              distX = endX - startX,
              distY = endY - startY,
              hypotenuse = Math.sqrt(distX*distX + distY*distY),
              ratio = radius / hypotenuse;

          ctx.beginPath();
          ctx.lineWidth = 4;
          ctx.arc(startX, startY, radius, 0, Math.PI*2, true);
          ctx.strokeStyle = '#00AEEF';
          ctx.fillStyle = '#000';
          ctx.stroke();
          ctx.globalAlpha = 0.2;
          ctx.fill();
          ctx.globalAlpha = 1;
          ctx.lineWidth = 1;
          ctx.moveTo(startX + distX*ratio, startY + distY*ratio);
          ctx.lineTo(endX, endY);
          ctx.strokeStyle = '#00AEEF';
          ctx.stroke();
        });

      }

    };

  })();

  me.openForm = function () {
    $('.edit-form textarea').val(JSON.stringify(annotationData, null, "  "));
    $('.edit-form').fadeIn();
  };

  $('.edit-form').submit(function () {
    annotationData = JSON.parse($('textarea', this).val());
    $('.ls-anno-box').remove();
    $(this).fadeOut();
    me.init();
    return false;
  }).keypress(function (event) {
    event.stopPropagation();
  });

  $('body').keypress(function (event) {
    console.log(event.which);
    if (event.which === 'e'.charCodeAt(0)) {
      me.openForm();
    }
  });

  return me;

}());

