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

/**
 * Created by neil on 01/08/2014.
 */
var frisby = require('frisby');
var querystring = require('querystring');

var key = 'free';
var baseURL = 'http://ocalhost:8080/api/0.1/render/render';
var urls = ["http://time.is/", "example.com", "https://google.com"];
//var url= ["www.ultrasounds.com","www.nasa.gov", "mashable.com", "http://news.bbc.co.uk"];
//var url= ["http://www.webthrower.com/portfolio/narnia.htm"];       // flash site
var sizes = ["sc", "tc", "full", "lc", "mc", "sc", "100x200"]
var freshness = [0, "recent", "cached", "day", 300];
//var freshness = [0, "recent", "cached", "day", 300];
var imageTypes = ["png", "jpeg"];
var delays = ["0", "2"];
var screens = ["desktop", "600x200", "iphone"];
var qualities = ["low", "medium", "high"];

frisby.globalSetup({
    timeout: (60 * 1000)

});

function buildImageURL(params) {
    return  baseURL + '?' + querystring.stringify(params);
}

frisby.create('Basic Image Test')
    .get(buildImageURL({url: "http://google.com", width: 200}))
    .expectStatus(200)
    .expectHeaderContains('Content-Type', 'png')
    .toss();

for (var i = 0; i < urls.length; i++) {
    frisby.create('URL: ' + urls[i])
        .get(buildImageURL({url: urls[i]}))
        .expectStatus(200)
        .expectHeaderContains('Content-Type', 'png')
        .toss();

}

for (var i = 0; i < sizes.length; i++) {
    frisby.create('Size: ' + sizes[i])
        .get(buildImageURL({url: "http://google.com", size: sizes[i]}))
        .expectStatus(200)
        .expectHeaderContains('Content-Type', 'png')
        .toss();

}

for (var i = 0; i < screens.length; i++) {
    frisby.create('Screen: ' + screens[i])
        .get(buildImageURL({url: "http://google.com", screen: screens[i]}))
        .expectStatus(200)
        .expectHeaderContains('Content-Type', 'png')
        .toss();

}


for (var i = 0; i < qualities.length; i++) {
    frisby.create('Quality: ' + qualities[i])
        .get(buildImageURL({url: "http://google.com", quality: qualities[i]}))
        .expectStatus(200)
        .toss();

}

frisby.create('Low Quality')
    .get(buildImageURL({url: "http://google.com", quality: "low"}))
    .expectStatus(200)
    .expectHeaderContains('Content-Type', 'jpeg')
    .toss();

frisby.create('Medium Quality')
    .get(buildImageURL({url: "http://google.com", quality: "medium"}))
    .expectStatus(200)
    .expectHeaderContains('Content-Type', 'jpeg')
    .toss();

frisby.create('High Quality')
    .get(buildImageURL({url: "http://google.com", quality: "high"}))
    .expectStatus(200)
    .expectHeaderContains('Content-Type', 'png')
    .toss();

for (var i = 0; i < freshness.length; i++) {
    frisby.create('Freshness: ' + freshness[i])
        .get(buildImageURL({url: "http://google.com", freshness: freshness[i]}))
        .expectStatus(200)
        .expectHeaderContains('Content-Type', 'png')
        .toss();

}


for (var i = 0; i < imageTypes.length; i++) {
    frisby.create('Type: ' + imageTypes[i])
        .get(buildImageURL({url: "http://google.com", type: imageTypes[i]}))
        .expectStatus(200)
        .expectHeaderContains('Content-Type', imageTypes[i])
        .toss();

}


for (var i = 0; i < delays.length; i++) {
    frisby.create('Delay: ' + delays[i])
        .get(buildImageURL({url: "http://google.com", delay: delays[i]}))
        .expectStatus(200)
        .expectHeaderContains('Content-Type', 'png')
        .toss();

}



