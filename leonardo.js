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
        r = m[0][0] * d[i] + m[0][1] * d[i + 1] + m[0][2] * d[i + 2] + m[0][3] * d[i + 3] + m[0][4] * 255;
        g = m[1][0] * d[i] + m[1][1] * d[i + 1] + m[1][2] * d[i + 2] + m[1][3] * d[i + 3] + m[1][4] * 255;
        b = m[2][0] * d[i] + m[2][1] * d[i + 1] + m[2][2] * d[i + 2] + m[2][3] * d[i + 3] + m[2][4] * 255;

        if (m[3]) {
          a = m[3][0] * d[i] + m[3][1] * d[i + 1] + m[3][2] * d[i + 2] + m[3][3] * d[i + 3] + m[3][4] * 255;
          d[i + 3] = a;
        }

        d[i    ] = r;
        d[i + 1] = g;
        d[i + 2] = b;
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
        matrix: [[.2126, .7152, .0722, 0, 0],
                 [.2126, .7152, .0722, 0, 0],
                 [.2126, .7152, .0722, 0, 0]]
      }, {
        name: "sepia",
        matrix: [[.393, .769, .189, 0, 0],
                 [.349, .686, .168, 0, 0],
                 [.272, .534, .131, 0, 0]]
      },/* {
        name: "popart"
      }, */{
        name: "vivid",
        matrix: [[ 1.2, -.1, -.1, 0, 0],
                 [-0.1, 1.2, -.1, 0, 0],
                 [-0.1, -.1, 1.2, 0, 0]]
      }, {
        name: "polaroid",
        matrix: [[1.438, -.122, -.016, 0, -.03],
                 [-.062, 1.378, -.016, 0,  .05],
                 [-.062, -.122, 1.483, 0, -.02]]
      }
    ]
  };

  // In node
  if (typeof module !== "undefined") {
    module.exports = leonardo;
  } else {
    // In the browser
    if (typeof window !== "undefined") window['leonardo'] = leonardo;
  }

})();

