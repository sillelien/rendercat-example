///<reference path="../../typings/node/node.d.ts"/>
///<reference path="../../typings/express/express.d.ts"/>
/*
* Copyright 2014-2015 Neil Ellis
*
*    Licensed under the Apache License, Version 2.0 (the "License");
*    you may not use this file except in compliance with the License.
*    You may obtain a copy of the License at
*
*        http://www.apache.org/licenses/LICENSE-2.0
*
*    Unless required by applicable law or agreed to in writing, software
*    distributed under the License is distributed on an "AS IS" BASIS,
*    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*    See the License for the specific language governing permissions and
*    limitations under the License.
*/
var fs = require('fs');
var iz = require('iz'), are = iz.are, validators = iz.validators;

var lastRequest = new Date();
var oneHour = 3600 * 1000;
var debugOn = false;
var graceTime = 4;

function closeSafely(o) {
    try  {
        o.close();
    } catch (e) {
        console.log(e);
    }
}

function debug(s) {
    console.log(s);
    //        fs.write(debugFile, s + "\n", "a");
}

function hello(rc) {
    rc.res.write('Hello World');
    rc.res.end();
}
exports.hello = hello;

function validate(rc) {
    rc.res.write('true');
    rc.res.end();
}
exports.validate = validate;

var screenMap = {
    hd1080: "1920x1080",
    hd720: "1280x720",
    desktop_s: "1024x768",
    desktop_m: "1280x800",
    desktop: "1280x800",
    desktop_l: "1920x1200",
    mobile: "320x480",
    mobile_landscape: "480x320",
    mobile_portrait: "320x480",
    iphone: "320x480",
    tablet: "768x1024",
    tablet_portrait: "768x1024",
    tablet_landscape: "1024x768",
    iphone5: "320x500"
};

var screenDeviceMap = {
    hd1080: "desktop",
    hd720: "desktop",
    desktop_s: "desktop",
    desktop_m: "desktop",
    desktop: "desktop",
    desktop_l: "desktop",
    mobile: "mobile",
    mobile_landscape: "mobile",
    mobile_portrait: "mobile",
    iphone: "mobile",
    tablet: "ipad",
    tablet_portrait: "ipad",
    tablet_landscape: "ipad",
    iphone5: "mobile"
};

function validationError(message) {
    return message;
}

var day = 24 * 60 * 60;
var month = 30 * day;

var cacheMap = {
    fresh: 0,
    'false': 0,
    'no': 0,
    recent: 15 * 60,
    cached: month,
    yes: month,
    'true': month,
    "-1": month,
    minute: 60,
    hour: 60 * 60,
    day: day,
    week: month,
    month: month
};

var sizeMap = {
    full: "1024x0",
    lc: "1024x768",
    mc: "800x640",
    sc: "320x240",
    tc: "80x50",
    th: "80x0"
};

function convertToActualSize(req) {
    var size = req.query.size;

    if (!size) {
        if (req.query.width && req.query.height) {
            return req.query.width + "x" + req.query.height;
        } else if (req.query.width) {
            return req.query.width + "x0";
        } else if (req.query.height) {
            return "0x" + req.query.height;
        } else {
            return sizeMap.full;
        }
    } else if (sizeMap[size]) {
        return sizeMap[size];
    } else {
        return size;
    }
}

function convertToViewportSize(req) {
    var screen = req.query.screen;

    if (!screen) {
        if (req.query.viewportWidth && req.query.viewportHeight) {
            return req.query.viewportWidth + "x" + req.query.viewportHeight;
        } else if (req.query.viewportWidth) {
            return req.query.viewportWidth + "x0";
        } else {
            return screenMap.desktop;
        }
    } else if (screenMap[screen]) {
        return screenMap[screen];
    } else {
        return screen;
    }
}

function convertToP2IDevice(req) {
    var screen = req.query.screen;
    var device = req.query.device;

    if (!device) {
        return screenDeviceMap[screen];
    } else {
        return device;
    }
}

function convertToP2IType(req) {
    if (typeof req.query.type === "undefined") {
        return "png";
    }
    if (req.query.type.toLowerCase() === "jpg" || req.query.type.toLowerCase() === "jpeg") {
        return "jpg";
    }
    if (req.query.type.toLowerCase() === "pdf") {
        return "pdf";
    }
    return "png";
}

function checkForErrors(req, resp) {
    if (!iz(req.query.url).required().valid) {
        return validationError("URL must be supplied");
    }
    if (!iz(req.query.delay).int().between(0, 25).valid) {
        return validationError("Delay is in seconds and must be an integer between 0 and 25");
    }
    if (req.query.type && !iz(req.query.type).inArray(["png", "jpg", "jpeg", "pdf"]).valid) {
        return validationError("Currently we only support png and jpg/jpeg as image types");
    }
    if (req.query.size && convertToActualSize(req).indexOf("x") < 0) {
        return validationError("Unrecognized size " + req.query.size);
    }
    if (req.query.screen && convertToViewportSize(req).indexOf("x") < 0) {
        return validationError("Unrecognized screen " + req.query.screen);
    }
    if (!cacheMap[req.query.freshness] && !iz(req.query.freshness).int().between(0, 86401 * 7).valid) {
        return validationError("Freshness should be either one of our presets or a value between 0 and " + 86400 * 7);
    }
    if (req.query.width && !iz(+req.query.width).int().valid) {
        return validationError("Image width (width) should be an integer value");
    }
    if (req.query.height && !iz(+req.query.height).int().valid) {
        return validationError("Image height (height) should be an integer value");
    }
    if (req.query.height && !iz(+req.query.viewportWidth).int().valid) {
        return validationError("Screen width (viewportWidth) should be an integer value");
    }
    if (req.query.height && !iz(+req.query.viewportHeight).int().valid) {
        return validationError("Screen height (viewportHeight) should be an integer value");
    }
}

function render(rc) {
    try  {
        var error = checkForErrors(rc.req, rc.res);
        if (error) {
            rc.res.send(400, error);
            rc.res.end();
        }

        var req = rc.req;

        //var viewPortHeight:number = +rc.req.query.viewPortHeight || 1024;
        //var viewPortWidth:number = +rc.req.query.viewPortWidth || 1280;
        ////var delay:number = +rc.req.query.delay || 0;
        //var done:boolean = false;
        //var lastActivity = new Date();
        var url = req.query.url;
        if (url && url.indexOf("http") != 0) {
            url = "http://" + url;
        }
        var delay = req.query.delay ? req.query.delay : 0;
        var size = convertToActualSize(req);
        var screen = convertToViewportSize(req);
        var device = convertToP2IDevice(req);
        var lang = req.query.lang || "en_US";
        var type = req.query.type || "png";

        var width = +size.split("x")[0];
        var height = +size.split("x")[1];
        var viewportWidth = +screen.split("x")[0];
        var viewportHeight = +screen.split("x")[1];

        if (width > viewportWidth && viewportWidth != 0) {
            width = viewportWidth;
        }
        if (height > viewportHeight && viewportHeight != 0) {
            height = viewportHeight;
        }

        rc.renderUsing(url, delay, lang, width, height, viewportWidth, viewportHeight, type, device, function (result) {
            rc.res.redirect(result.replace("/app/public/", "/"));
            rc.res.end();
        });
    } catch (e) {
        console.log(e);
        throw e;
    }
}
exports.render = render;

function renderOld(rc) {
    //page.settings.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:25.0) Gecko/20100101 Firefox/25.0';
    //page.customHeaders = {
    //    "Accept-Language": lang,
    //    "Referer": address + ";userApiKey=" + key + ",message='Please report abuse to support@snapito.com'"
    //};
    //page.viewportSize = { width: viewPortWidth, height: viewPortHeight};
    var req = rc.req;
    var address = rc.req.query.url;
    var viewPortHeight = +rc.req.query.viewPortHeight || 1024;
    var viewPortWidth = +rc.req.query.viewPortWidth || 1280;
    var delay = 0;

    //var delay:number = +rc.req.query.delay || 0;
    var done = false;
    var lastActivity = new Date();
    rc.inBrowser(function (ph) {
        ph.createPage(function (page) {
            page.open(address, function (status) {
                var requestTimeout = setTimeout(function () {
                    if (!done) {
                        done = true;
                        closeSafely(page);
                        debug("ERROR: Slimer/phantomjs timed out request for " + address);
                        rc.res.end();
                        ph.exit();
                    }
                }, (graceTime * 2 + (+delay)) * 1000);
                try  {
                    page.evaluate(function (width, height) {
                        document.body.style.width = width > 0 ? width + "px" : "auto";
                        document.body.style.height = height >= 0 ? height + "px" : "auto";
                    }, function () {
                    }, viewPortWidth, viewPortHeight);
                } catch (e) {
                    console.log(e);
                }

                try  {
                    page.clipRect = { top: 0, left: 0, width: viewPortWidth, height: viewPortHeight };
                } catch (e) {
                    console.log(e);
                }

                if (status != 'success') {
                    done = true;
                    closeSafely(page);
                    debug('ERROR: Unable to load the address ' + address);
                    clearTimeout(requestTimeout);
                    rc.res.write("Failed");
                    rc.res.end();
                    ph.exit();
                } else {
                    try  {
                        var renderStart = new Date();

                        page.set('onResourceRequested', function (request) {
                            lastActivity = new Date();
                        });

                        page.set('onResourceReceived', function (response) {
                            lastActivity = new Date();
                        });

                        debug("Rendering " + address);
                        debug("Delay used: " + delay + " ");
                        var renderWhenReady = function () {
                            try  {
                                var activityTimeDiff = new Date().getTime() - lastActivity.getTime();
                                var renderDuration = new Date().getTime() - renderStart.getTime();
                                if ((activityTimeDiff < 300 || renderDuration < 1000 * delay) && renderDuration < 1000 * (delay + graceTime)) {
                                    debug("ATD: " + activityTimeDiff + " RD: " + renderDuration);
                                    setTimeout(renderWhenReady, 100);
                                    return;
                                }
                                var image_file_name = address.replace(/\W/g, '_') + ".png";
                                var image_path = "/app/public/_rendered/" + image_file_name;
                                debug(image_path);
                                page.render(image_path, function () {
                                    // redirect to static image
                                    done = true;
                                    debug("Rendered okay " + image_path);
                                    rc.res.redirect('/_rendered/' + image_file_name);
                                    rc.res.end();

                                    //closeSafely(page);
                                    ph.exit();
                                });
                                debug("Render started");
                                clearTimeout(requestTimeout);
                            } catch (e) {
                                done = true;
                                closeSafely(page);
                                debug("ERROR: " + e);
                                debug(e);
                                ph.exit();
                            } finally {
                            }
                        };
                        setTimeout(renderWhenReady, 0);
                    } catch (e) {
                        done = true;
                        closeSafely(page);
                        debug("ERROR: " + e);
                        ph.exit();
                    }
                }
            });
        });
    });
}
exports.renderOld = renderOld;
//# sourceMappingURL=index.js.map
