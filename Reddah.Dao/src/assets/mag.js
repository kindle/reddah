! function(t) {
    "use strict";
    t.jfMagnify = function(e, n) {
        function i() {
            f.css({
                "transform-origin": "top left",
                "-ms-transform-origin": "top left",
                "-webkit-transform-origin": "top left",
                "-moz-transform-origin": "top left",
                transform: "scale(" + d.settings.scale + "," + d.settings.scale + ")",
                "-ms-transform": "scale(" + d.settings.scale + "," + d.settings.scale + ")",
                "-webkit-transform": "scale(" + d.settings.scale + "," + d.settings.scale + ")",
                "-moz-transform": "scale(" + d.settings.scale + "," + d.settings.scale + ")",
                top: "0",
                width: c.get(0).getBoundingClientRect().width,
                height: c.get(0).getBoundingClientRect().height
            });
            var t = c.get(0).getBoundingClientRect().width,
                e = f.get(0).getBoundingClientRect().width,
                n = c.get(0).getBoundingClientRect().height,
                i = f.get(0).getBoundingClientRect().height;
            g = s(t, e), o = s(n, i), d.settings.center && (h = f.parent().outerWidth() / 2, p = f.parent().outerHeight() / 2, y = r.outerWidth() / 2, v = r.outerWidth() / 2), d.update()
        }

        function s(t, e) {
            var n;
            return n = t > e ? e / t : t / e
        }

        function a(t) {
            var e = -1 * t;
            return e
        }
        var g, o, r, f, l, c, d = this,
            m = t(e),
            u = m.data(),
            h = 0,
            p = 0,
            y = 0,
            v = 0,
            w = {
                center: !0,
                scale: 2,
                containment: e,
                magnifyGlass: ".magnify_glass",
                magnifiedElement: ".magnified_element",
                magnifiedZone: ".magnify_glass",
                elementToMagnify: ".element_to_magnify"
            };
        d.settings = {}, d.init = function() {
            d.settings = t.extend({}, w, n, u), t(window).bind("resize", i), r = m.find(d.settings.magnifyGlass), l = m.find(d.settings.magnifiedZone), c = m.find(d.settings.elementToMagnify);
            var e = c.clone(!0);
            f = t(e).removeAttr("id").addClass(d.settings.magnifiedElement.slice(1)), l.append(f), r.draggable({
                containment: d.settings.containment,
                drag: function() {
                    d.update(), r.is(":animated") && r.stop()
                }
            }), t("img").attr("draggable", !1), i()
        }, d.update = function() {
            var t = a((r.position().left + y) / g),
                e = a((r.position().top + v) / o);
            f.css({
                left: t + h,
                top: e + p
            })
        }, d.destroy = function() {
            t(window).unbind("resize", i), r.draggable("destroy"), f.remove(), m.removeData("jfMagnify", d), d = null
        }, d.scaleMe = function(t) {
            d.settings.scale = t, i()
        }, d.init()
    }, t.fn.jfMagnify = function(e) {
        return this.each(function() {
            if (void 0 === t(this).data("jfMagnify")) {
                var n = new t.jfMagnify(this, e);
                t(this).data("jfMagnify", n)
            }
        })
    }
}(jQuery);

$(document).ready(function() {
    var scaleNum = 2;
    $(".magnify").jfMagnify();
    $('.plus').click(function() {
        scaleNum += 1;
        if (scaleNum >= 10) {
            scaleNum = 10;
        };
        $(".magnify").data("jfMagnify").scaleMe(scaleNum);
    });
    $('.minus').click(function() {
        scaleNum -= 1;
        if (scaleNum <= 2) {
            scaleNum = 2;
        };
        $(".magnify").data("jfMagnify").scaleMe(scaleNum);
    });
    $('.magnify_glass').animate({
        'top': '60%',
        'left': '50%'
    }, {
        duration: 2000,
        progress: function() {
            $(".magnify").data("jfMagnify").update();
        },
        easing: "easeOutElastic"
    });
});