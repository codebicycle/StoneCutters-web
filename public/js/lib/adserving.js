var _ = require('underscore');

var templateSettings = {
  interpolate: /\{\{\=(.+?)\}\}/g,
  evaluate: /\{\{(.+?)\}\}/g,
  escape: /\{\{\-(.+?)\}\}/g
};

window.AFCrender = function AFCrender(gads, slotname, boxTitle) {
    if (gads.length == 0) {
        return;
    }
    var render;

    switch (gads[0].type) {
        case 'image':
            render = new AFCImageRender();
            render.options = {
              adData : gads[0]
            }
            break;
        case 'flash':
            render = new AFCFlashRender();
            render.options = {
              adData : gads[0]
            }
            break;
        case 'text':
        case 'text/wide':
        case 'text/narrow':
            render = new AFCTextRender();
            render.options = {
              adData : gads,
              boxTitle: boxTitle
            }
            break;
        default:
            return;
    }
    $('#' + slotname).html(render.render());
};

function AFCImageRender() {};

AFCImageRender.prototype.html = [
    '<a href="{{= url }}" target="_blank" title="{{= visible_url }}">',
    '<img src="{{= image_url }}" width="{{= image_width }}" height="{{= image_height }}" alt="{{= visible_url }}" />',
    '</a>'
].join('');

AFCImageRender.prototype.render = function render() {
    return _.template(this.html, this.options.adData, templateSettings);
};

function AFCFlashRender() {};

AFCFlashRender.prototype.html = [
    '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,0,0" width="{{= image_width }}" height="{{= image_height }}">',
    '<param name="movie" value="{{= image_url }}">',
    '<param name="quality" value="high">',
    '<param name="wmode" value="opaque">',
    '<param name="AllowScriptAccess" value="never">',
    '<embed wmode="opaque" src="{{= image_url }}" width="{{= image_width }}"',
    ' height="{{= image_height }}" type="application/x-shockwave-flash"',
    ' allowscriptaccess="never" ',
    ' pluginspage="http://www.macromedia.com/go/getflashplayer">',
    '</embed>',
    '</object>'
].join('');

AFCFlashRender.prototype.render = function render() {
    return _.template(this.html, this.options.adData, templateSettings);
};

function AFCTextRender() {}

AFCTextRender.prototype.html = [
    '<span class="ads-afc-box-title">{{= boxTitle }}</span>',
    '<ul>',
    '{{ for (var item in list) { item = list[item]; }}',
    ' <li><a class="ads-afc-title" href="{{= item.url }}" target="_blank">{{= item.line1 }}</a>',
    ' <span class="ads-afc-desc">{{= item.line2 }}</span>',
    ' <span class="ads-afc-desc">{{= item.line3 }}</span>',
    ' <a class="ads-afc-link" href="{{= item.url }}" target="_blank">{{= item.visible_url }}</a></li>',
    '{{ } }}',
    '</ul>'
].join('');

AFCTextRender.prototype.render = function render() {
    return _.template(this.html, {
        boxTitle: this.options.boxTitle,
        list: this.options.adData
    }, templateSettings);
};
