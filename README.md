Rendercat Simple Example
========================

An example of using http://github.com/neilellis/rendercat - in this example we build a very, very simple snapshot example.

To try it out just visit http://rendercat-example-1.neilellis.cont.tutum.io/ . Or run it yourself locally using:

```bash
docker run -t -i -p 8080:80  neilellis/rendercat-example
```

Then just browse to http://localhost:8080 (or the ip address of the docker VM if you are using Boot2Docker).

The docker image is at: https://registry.hub.docker.com/u/neilellis/rendercat-example/


The code is basically just

```javascript
function render(rc) {
    rc.renderUsing(rc.req.query.url, 0, "en_GB", 1024, 768, 1024, 768, "png", "", function (result) {
            rc.res.redirect(result.replace("/app/public/", "/"));
            rc.res.end();
        });
}
exports.render = render;
```

This renders the website at 'url' query parameter then redirects to the location of the rendered image.


The HTML used to display a couple of examples is therefore

```html
<body>
<img src="/api/0.1/render/render?url=http://google.com"/>
<img src="/api/0.1/render/render?url=http://mashable.com"/>
</body>
```



