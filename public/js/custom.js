/*
 * Copyright 2013-2015 Neil Ellis & Eric Grodt
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* Add here all your JS customizations */
"use strict";
var border = 60;
var apiKey = "spu-ea68c8-ogi2-3cwn3bmfojjlb56e";
var urlParams;
if (window.location.hash) {
    if (window.location.search.length > 0) {
        window.location.search = "";
    } else {
        var windowHash = window.location.hash;
        urlParams = URI.parseQuery("?" + (
                windowHash.charAt(0) === "#" ? windowHash.slice(1) : windowHash
        ));
    }
} else {
    urlParams = URI.parseQuery("?" + window.location.search);
}
var cookieName = "usageCookie";
var cookieValue = $.cookie(cookieName);
if (cookieValue && cookieValue != "NaN") {
    cookieValue = parseInt(cookieValue);
} else {
    cookieValue = 0;
}
$.cookie(cookieName, ++cookieValue, {expires: 7}, {path: '/'});

$('#snap-box').css("opacity", 0);
expandSnapBoxArea(function () {
    $('#snap-box').animate({opacity: 1});

});

function setDefaults() {

    if (urlParams.url) {
        $("#snap-url").val(urlParams.url);
    }
    if (urlParams.delay) {
        $("#delay").val(urlParams.delay);
    }
    if (urlParams.screen) {
        $("#screen").val(urlParams.screen);
    }
    if (urlParams.size) {
        $("#size").val(urlParams.size);
    }
    if (urlParams.type) {
        $("#type").val(urlParams.type);
    }
    if (urlParams.freshness) {
        $("#freshness").val(urlParams.freshness);
    }
}

function buildParams() {
    var params = {

        url: $("#snap-url").val(),
        size: $("#size").val(),             // 0 for non-cropped
        screen: $("#screen").val(),             // 0 for non-cropped
        delay: $("#delay").val(),                 // in seconds
        type: "png",         // jpg
        freshness: $("#latest").is(':checked') ? "0" : "cached",                // fresh
        quality: "high"
    };
    return params;
}

function buildUrl() {
    var params = buildParams();

    var apiUrl = "/api/0.1/render/render/?" + $.param(params);
    return apiUrl;
}

function animateSnapshot() {
    $('#snap-url').focus();
    $('#wait-message').fadeOut("slow", function () {
//        $(".hidden-initially").slideDown("slow", function () {
        $('#snap-result-surround').fadeIn("slow");
        if ($('#camera-sound-toggle').hasClass('active')) {
            $('#camera-sound')[0].play();
        }
//        })
    });

    $('#snap-box').css("opacity", 1);
//    $('#snap-box').css("background-color", "black");
//    $('#snap-result').animate({opacity: 0}, 20, function () {
    $('#snap-box').css("background", "none");
//        $('#snap-result').animate({opacity: 1}, 1000, function () {
//        });
//    });

}

var snapBoxExpanded = false;

function expandSnapBoxArea(onComplete) {

    $('#snap-url').focus();
    $('#snap-button').parent().css("opacity", 0).show();
    $("body").css("height", "auto");
    $(".card-container").animate({

                                     top: "+=4000"
                                 }, 2000, function () {
    });
    $('#first-body .main').animate({
                                       opacity: 0
                                   }, 3000);

    $('#snap-box')
            .css('background', 'none')
            .css('box-shadow', 'none')
            .css("height", "auto")
            .css("position", "relative")
            .css("border-radius", 0)
            .animate({top: "0px", left: "0px", width: "100%", "margin-top": "40px"},
                     500, function () {
                $('#clear-text').css('display',
                                     'inline');
                $('#snap-extra, #digital-ocean-index').show();
                $('#snap-button').parent().animate({opacity: 1},
                                                   290);
                $('#snap-extra').animate({opacity: 1},
                                         50,
                                         function () {
                                             snapBoxExpanded = true;
                                             if (onComplete) {
                                                 onComplete();
                                             }
                                         });
            });

    $('#snap-input-area').animate({width: "100%"});
    $('#snap-box-inner').animate({top: "30px", left: "0", width: "100%"}, 400).css("height", "auto").css("position",
                                                                                                         "relative");
    $('#snap-snap-result').show(500);
    $("#intro").animate({opacity: 0}, 1000, function () {
        $("#first-body").detach();
        $("#second-body").animate({opacity: "1"}, 1000);
    });
    var learnMorePos = $('#learn-more').offset();
    $('#learn-more').appendTo("body").css('position', 'absolute');
    $('#learn-more').css({
                             top: learnMorePos.top,
                             right: $(document).width() - learnMorePos.left,
                             opacity: 0.9
                         }).find('a').css('color', '#4EB25C');
    $('#learn-more').animate({top: '0px', right: '25px'}, 700).animate({opacity: 0.1}, 500).animate({opacity: 0.9},
                                                                                                    1000);

}

function submitSnap() {
    $("html,body").animate({scrollTop: 0}, 400);
    $("#snap-error").slideUp();
    $('#snap-url').focus().select();
    $('#clipboard_text').val('');
    $("#snap-result-surround").fadeOut('fast');
    $("#short-url-surround").hide();
    $('.hidden-initially').hide();
    $('#snap-form').data('action', 'submit').submit();
    window.location.hash = new URI(window.location.href).search("").fragment($.param(buildParams())).fragment();

}

function expandAndSnap() {

    if (snapBoxExpanded) {
        submitSnap();
    } else {
        expandSnapBoxArea(submitSnap);
    }
    return false;
}

$(document).ready(function () {
//    var clip = new ZeroClipboard(document.getElementById("url-clip-button"));
    setDefaults();
    $("#snap-box").show();
    if (urlParams.url) {
        expandAndSnap();
    } else {
        $("#first-body").show();
    }

    function extractResponseResult(data) {
        var parsed = $.parseJSON(data);
        if (typeof(
                        parsed.result
                ) != 'undefined') {
            return parsed.result == true;
        } else {
            return parsed.error;
        }
    }

    function shuffle(array) {
        var m = array.length, t, i;
        // While there remain elements to shuffle…
        while (m) {
            // Pick a remaining element…
            i = Math.floor(Math.random() * m--);
            // And swap it with the current element.
            t = array[m];
            array[m] = array[i];
            array[i] = t;
        }
        return array;
    }

    var imageLoad;
    var $validator = $("#snap-form")
            .validate({
                          invalidHandler: function (event, validator) {
                              // 'this' refers to the form
                              var errors = validator.numberOfInvalids();
                              if (errors) {
                                  $(".spinner").slideUp();
                                  $("#snap-error").slideDown('fast');
                                  $("#snap-result-surround").hide();
                                  $('#short-url-surround').hide();
                                  if (pinterestWindow) {
                                      pinterestWindow.close();
                                  }
                                  $('#snap-url').focus().select();
                                  window.analytics.track('Snap Form Errors');
                              } else {
                                  $("#snap-error").hide();

                              }
                          },
                          submitHandler: function (form) {
                              $("#snap-error").slideUp();
                              switch ($('#snap-form').data('action')) {
                                  case 'snap-download':
                                      window.analytics.track('Snap Download');
                                      window.location.href = buildUrl() + "&filename=image.png";
                                      break;
                                  case 'snap-pin-crop':
                                      window.analytics.track('Snap Pin Crop');
                                      pin(false);
                                      break;
                                  case 'snap-pin-full':

                                      window.analytics.track('Snap Pin Full');
                                      pin(true);
                                      break;
                                  default :
                                      $('#clipboard_text').val('');
                                      $("#snap-result-surround").hide();
                                      $("#short-url-surround").hide();
//                    $('#wait-message').slideDown("slow");
                                      $('#wait-message').slideDown("slow").find('em').text("Give us a moment to take your snapshot...");
                                      $("#snap-result-image").attr("src", "");
                                      $("#snap-result-image").attr("src", buildUrl());
                                      var imageLoadCounter = 0, messageArrayCounter = 0, lateMessageCounter = 0, message = "";
                                      var firstMessage = ["Cleaning the camera lens...", "Putting a new flash bulb in the camera...", "Getting a new roll of film...", "Adjusting the tripod..."];
                                      var waitMessages = shuffle(["Tick-tock"]);

                                      var lateMessages = ["Sorry for the delay...", "...complex or large web pages can take longer to render.", "Or there may be network or other delays.", "Let's hold out a little bit longer...", "...maybe there was a spike in requests", "OK, that's too long. You're welcome to wait a little longer or you may want to try again."];
                                      if (imageLoad) {
                                          clearInterval(imageLoad);
                                      }
                                      imageLoad = setInterval(function () {
                                          if ((
                                                      imageLoadCounter
                                              ) % 2 === 0) {
                                              if (imageLoadCounter === 0) {
                                                  var message = firstMessage[Math.floor(Math.random() * (
                                                          firstMessage.length
                                                  ))];
                                              } else if (imageLoadCounter > 4) {
                                                  message = lateMessages[lateMessageCounter];
                                                  lateMessageCounter++;
                                              } else {
                                                  message = waitMessages[messageArrayCounter];
                                                  messageArrayCounter++;

                                              }
//                            console.log(lateMessageCounter + " length=" + lateMessages.length);
                                              if (lateMessageCounter <= lateMessages.length) {
                                                  $('#wait-message').fadeOut("slow").queue(function (next) {
//                                    console.log("imageLoadCounter=" + imageLoadCounter + " message= " + message);

                                                      $(this).find("em").text(message);
                                                      next();
                                                  }).fadeIn("slow");
                                              }
                                          }
                                          imageLoadCounter++;
                                      }, 3000);
                              }
                              $("#snap-result-image").load(function () {
                                  clearInterval(imageLoad);
                                  animateSnapshot();
                              });

                          },
                          rules: {
                              delay: {
                                  min: -1,
                                  number: true,
                                  required: true
                              },
                              url: {
                                  required: true,
                                  remote: {
                                      url: "/api/0.1/render/validate",
                                      data: {
                                          url: function () {
                                              return $('#snap-url').val()
                                          }
                                      }
                                  }
                              }

                          },
                          errorClass: "url-error",
                          errorLabelContainer: "#snap-error-container",
                          wrapper: "h4",
                          messages: {
                              delay: "Invalid delay",
                              url: {
                                  required: "Please enter a website address",
                                  remote: "Website address is invalid or currently unavailable"
                              }

                          },
                          onkeyup: false,
                          onfocusout: false,
                          onclick: false
                      });

    $('#clear-text').on('click', function () {
        $('#snap-url').val("http://").focus();
        $("#snap-error").slideUp();
    });

    $('#snap-url').keypress(function (e) {
        $("#snap-error").slideUp();
        if (e.which == 13) {
            return expandAndSnap();
        }
    });
    $("#snap-result-image").error(function () {
        window.analytics.track('Snap Image Load Error', buildParams());
    });

    $('#snap-url').click(function () {
        $("#snap-error").slideUp();
        if (snapBoxExpanded) {
//            animateLoading();
        } else {
            expandSnapBoxArea();
        }
    });
    $('#snap-button').click(function (e) {
        e.preventDefault();
        submitSnap();
    });
    $('#camera-sound-toggle').on("click", function () {
        $($(this).find('i')).removeClass().toggleClass(function () {
//        $('#camera-sound-toggle i').removeClass().toggleClass(function () {
            if ($(this).parent().is('.active')) {
                return 'icon-volume-off';
            } else {
                return 'icon-volume-up';
            }
        })
    });
//    $('#camera-sound-toggle').trigger('click');

    $('#snap-extras').on('click', function () {
        $(this).hasClass('active') ? $('#advanced-options').slideUp('fast') : $('#advanced-options').slideDown('fast');
    });
    $('.card img').css('cursor', 'pointer').on('click', function () {
        var cardURL = URI.parseQuery(URI.parse($(this).attr("src")).query);
        $('#snap-url').val(cardURL.url);
        expandAndSnap();
    })
});