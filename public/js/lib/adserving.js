AFCrender = function(gads, slot) {
    if (gads.length == 0) {
        return;
    }
    var html = '';

    switch (gads[0].type) {
        case 'image':
            var ir = new AFCImageRender();
            ir.adData = gads[0];
            html = ir.render();
            break;

        case 'flash':
            var fr = new AFCFlashRender();
            fr.adData = gads[0];
            html = fr.render();
            break;

        case 'text':
        case 'text/wide':
        case 'text/narrow':
            var cr = new AFCTextRender();
            cr.adData = gads;
            html = cr.render();
            break;

        default:
            return;
    }
    $('#' + slot).html(html);
}

AFCImageRender = function() {}
AFCImageRender.prototype = {
    html: '<a href="#url#" target="_blank" title="#visibleurl#">' +
          '<img src="#imgurl#" width="#imgwidth#" height="#imgheight#" alt="#visibleurl#" />' +
          '</a>',

    render: function() {
        return this.html.replace(/#url#/g, this.adData.url)
                        .replace(/#visibleurl#/g, this.adData.visible_url)
                        .replace(/#imgurl#/g, this.adData.image_url)
                        .replace(/#imgwidth#/g, this.adData.image_width)
                        .replace(/#imgheight#/g, this.adData.image_height);
    }
};

AFCFlashRender = function() {}
AFCFlashRender.prototype = {
    html: '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"' +
          ' codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,0,0"' +
          ' width="#moviewidth#" height="#movieheight#">'+
          '<param name="movie" value="#movieurl#">' +
          '<param name="quality" value="high">' +
          '<param name="wmode" value="opaque">' +
          '<param name="AllowScriptAccess" value="never">' +
          '<embed wmode="opaque" src="#movieurl#" width="#moviewidth#"' +
          ' height="#movieheight#" type="application/x-shockwave-flash"' +
          ' allowscriptaccess="never" ' +
          ' pluginspage="http://www.macromedia.com/go/getflashplayer">' +
          '</embed>' +
          '</object>',

    render: function() {
        return this.html.replace(/#movieurl#/g, this.adData.image_url)
                        .replace(/#moviewidth#/g, this.adData.image_width)
                        .replace(/#movieheight#/g, this.adData.image_height);
    }
};

AFCTextRender = function() {}
AFCTextRender.prototype = {
    html: '<ul>#list#</ul>',
    template: '<li>' +
              '<a class="ads-afc-title" href="#url#">#title#</a>' +
              '<span class="ads-afc-desc">#desc1#</span>' +
              '<span class="ads-afc-desc">#desc2#</span>' +
              '<a class="ads-afc-link" href="#url#">#link#</a>' +
              '</li>',

    render: function () {
        var templates = '';

        for (var n = 0; n < this.adData.length; n++) {
            templates += this.template.replace(/#url#/g, this.adData[n].url)
                                      .replace(/#title#/g, this.adData[n].line1)
                                      .replace(/#desc1#/g, this.adData[n].line2)
                                      .replace(/#desc2#/g, this.adData[n].line3)
                                      .replace(/#link#/g, this.adData[n].visible_url);
        }

        return this.html.replace(/#list#/g, templates);
    }
};
