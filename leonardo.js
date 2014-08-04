(function() {
  leonardo = {

    createCanvas: function createCanvas(width, height) {
      var canvas;
      if (typeof document !== "undefined") {
        canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
      } else if (typeof Canvas !== 'undefined') {
         canvas = new Canvas(width, height);
      } else {
        throw "No canvas implementation vailable";
      }
      return canvas;
    },

    "applyFilter": function(image, filterName) {
      var ctx, cv, filter, filtered, fun, imageData;
      for (var i=0, l = this.filters.length; i<l; ++i) {
        if (this.filters[i].name === filterName) {
          filter = this.filters[i];
          break;
        }
      }
      if (!filter) throw "No such filter: " + filterName;
      cv = this.createCanvas(image.width, image.height);
      ctx = cv.getContext('2d');
      ctx.drawImage(image, 0, 0);
      imageData = ctx.getImageData(0, 0, image.width, image.height);
      if (filter.matrix != null) {
        filtered = this.filterFromMatrix(filter.matrix, imageData);
      } else if (fun = this.functions[filter.name]) {
        filtered = fun(imageData);
      } else {
        throw "Bad filter: " + JSON.stringify(filter);
      }
      ctx.putImageData(filtered, 0, 0);
      return cv;
    },

    filterFromMatrix: function(m, pixels) {
      var a, b, g, i, r, d = pixels.data;
      for (i = 0, len = d.length; i < len; i += 4) {
        r = m[0] * d[i] + m[1] * d[i + 1] + m[2] * d[i + 2] + m[3] * d[i + 3] + m[4] * 255|0;
        g = m[5] * d[i] + m[6] * d[i + 1] + m[7] * d[i + 2] + m[8] * d[i + 3] + m[9] * 255|0;
        b = m[10] * d[i] + m[11] * d[i + 1] + m[12] * d[i + 2] + m[13] * d[i + 3] + m[14] * 255|0;

        if (m.length > 15) {
          a = m[15] * d[i] + m[16] * d[i + 1] + m[17] * d[i + 2] + m[18] * d[i + 3] + m[19] * 255;
          d[i + 3] = a;
        }

        d[i    ] = r/1000|0;
        d[i + 1] = g/1000|0;
        d[i + 2] = b/1000|0;
      }
      return pixels;
    },

    functions: {
      /*// Unstable Andy Warhol popart
      popart: function(pixels) {
        var i, j, q, x, y,
            d = pixels.data,
            w = pixels.width,
            h = pixels.height,
            orig = new Uint8ClampedArray(d);
        for (i = 0, len = d.length; i < len; i += 4) {
          x = (i / 4) % w;
          y = (i / 4) / w | 0;
          q = (x > w / 2) + 2 * (y > h / 2);
          j = 4 * ((x % (w / 2 | 0) * 2) + w * (y % (h / 2 | 0) * 2));
          d[i] = (orig[j + (q + 0) % 3] > 128) * 255;
          d[i + 1] = (orig[j + (q + 1) % 3 + (q === 3)] > 128) * 255;
          d[i + 2] = (orig[j + (q + 2) % 3 - (q === 3)] > 128) * 255;
          d[i + 3] = orig[j + 3];
        }
        return pixels;
      }
      */
    },

    filters: [
      {
        name: "greyscale",
        matrix: [.2126, .7152, .0722, 0, 0,
                 .2126, .7152, .0722, 0, 0,
                 .2126, .7152, .0722, 0, 0]
      }, {
        name: "sepia",
        matrix: [.393, .769, .189, 0, 0,
                 .349, .686, .168, 0, 0,
                 .272, .534, .131, 0, 0]
      },/* {
        name: "popart"
      }, */{
        name: "vivid",
        matrix: [ 1.2, -.1, -.1, 0, 0,
                 -0.1, 1.2, -.1, 0, 0,
                 -0.1, -.1, 1.2, 0, 0]
      }, {
        name: "polaroid",
        matrix: [1.438, -.122, -.016, 0, -.03,
                 -.062, 1.378, -.016, 0,  .05,
                 -.062, -.122, 1.483, 0, -.02]
      }
    ]
  };

  // In the browser
  if (typeof window !== "undefined") window['leonardo'] = leonardo;
  // In node
  if (typeof module !== "undefined") {
    var Canvas = require('canvas');
    module.exports = leonardo;
  }
})();

