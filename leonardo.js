(function() {
  this.App.Model.filter = {
    applyFilter: function(image, filter) {
      var ctx, cv, filtered, fun, imageData;
      cv = document.createElement("canvas");
      cv.setAttribute("width", image.width);
      cv.setAttribute("height", image.height);
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
      var a, b, d, g, i, r, _i, _ref;
      d = pixels.data;
      for (i = _i = 0, _ref = d.length; _i < _ref; i = _i += 4) {
        r = m[0][0] * d[i] + m[0][1] * d[i + 1] + m[0][2] * d[i + 2] + m[0][3] * d[i + 3] + m[0][4] * 255;
        g = m[1][0] * d[i] + m[1][1] * d[i + 1] + m[1][2] * d[i + 2] + m[1][3] * d[i + 3] + m[1][4] * 255;
        b = m[2][0] * d[i] + m[2][1] * d[i + 1] + m[2][2] * d[i + 2] + m[2][3] * d[i + 3] + m[2][4] * 255;
        if (m[3]) {
          a = m[3][0] * d[i] + m[3][1] * d[i + 1] + m[3][2] * d[i + 2] + m[3][3] * d[i + 3] + m[3][4] * 255;
        }
        d[i] = r;
        d[i + 1] = g;
        d[i + 2] = b;
        if (a != null) {
          d[i + 3] = a;
        }
      }
      return pixels;
    },
    functions: {
      popart: function(pixels) {
        var d, h, i, j, orig, q, w, x, y, _i, _ref, _ref1;
        _ref = [pixels.data, pixels.width, pixels.height], d = _ref[0], w = _ref[1], h = _ref[2];
        orig = new Uint8ClampedArray(d);
        for (i = _i = 0, _ref1 = d.length; _i < _ref1; i = _i += 4) {
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
    },
    filters: [
      {
        name: "greyscale",
        matrix: [[.2126, .7152, .0722, 0, 0], [.2126, .7152, .0722, 0, 0], [.2126, .7152, .0722, 0, 0]]
      }, {
        name: "sepia",
        matrix: [[.393, .769, .189, 0, 0], [.349, .686, .168, 0, 0], [.272, .534, .131, 0, 0]]
      }, {
        name: "popart"
      }, {
        name: "vivid",
        matrix: [[1.2, -0.1, -0.1, 0, 0], [-0.1, 1.2, -0.1, 0, 0], [-0.1, -0.1, 1.2, 0, 0]]
      }, {
        name: "polaroid",
        matrix: [[1.438, -0.122, -0.016, 0, -.03], [-0.062, 1.378, -0.016, 0, .05], [-0.062, -0.122, 1.483, 0, -.02]]
      }
    ]
  };

}).call(this);

