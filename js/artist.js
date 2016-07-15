/**
 * @function
 * @returns {number} Where each value in the arguments array is a number the average is returned of all those numbers
 */
Math.average = function() {
  if (!Array.prototype.every.apply(arguments, [function(elem) {
      return typeof elem == 'number';
    }])) {
    throw new TypeError("Method only takes number arguments")
  } else {
    var summed = 0;
    Array.prototype.forEach.apply(arguments, [function(elem) {
      summed += elem
    }]);
    return this.floor(summed / arguments.length);
  }
};


/**
 * @function
 * @param {string} ri resourse identifier the ajax GET will request
 * @param {object} response function object that gets called in the event of a successful ajax request
 * Makes get request for a particular resource using Ajax.
 */
function makeAjaxGet(ri, response) {
  var req = new XMLHttpRequest();
  req.onreadystatechange = function() {
    if (req.readyState == 4 && req.status == 200) {
      response(ri);
    }
    req.open("GET", ri, true);
    req.send();
  };
}

/**
 * @function
 * @param {string|object} img Either a image object or a string which is set as the source of a newly generated image object
 * @specs {array} specs array of position and size specifications used to draw the desired image in the right place and with the right size
 * Specifies an image, where to draw it and at what size and draws the image in a canvas.
 */
function drawImage(img, specs) {
  var image,
    that = this;
  if (typeof img == "string") {
    image = new Image();
    image.src = img;
  }
  image.onload = function() {
    that.ctx.drawImage.apply(that.ctx, [image].concat(specs));
  }
}

/**
 * @function
 * @param {Uint8clampedarr} imageData
 * Takes image data and averages rgb values of each pixel.
 */
function grayScaleSimple(imageData) {
  for (var i = 0; i < imageData.length; i += 4) {
    var newPixVal = Math.average.apply(Math, [imageData[i], imageData[i + 1], imageData[i + 2]]);
    imageData[i] = imageData[i + 1] = imageData[i + 2] = newPixVal;
  }
}

/**
 * @function
 * @param {Uint8clampedarr} imageData
 * Removes color from an image whilst accounting for the human eyes differing sensitivity to red green and blue.
 */
function grayScale(imageData) {
  for (var i = 0; i < imageData.length; i += 4) {
    var gray = Math.ceil(imageData[i] * 0.3 + imageData[i + 1] * 0.59 + imageData[i + 2] * 0.11);
    imageData[i] = imageData[i + 1] = imageData[i + 2] = gray;
  }
}

/**
 * @function
 * @param {Uint8clampedarr} imageData
 * @param {number} n Upper bound on the number of shades of gray that can be found in the processed image.
 * Removes color from an image and replaces those colors with one of n shades of gray.
 */
function NGraysScale(imageData, n) {
  attractor = 255 / (n - 1);
  for (var i = 0; i < imageData.length; i += 4) {
    var gray = Math.ceil((imageData[i] * 0.3 + imageData[i + 1] * 0.59 + imageData[i + 2] * 0.11) / attractor) * attractor;
    imageData[i] = imageData[i + 1] = imageData[i + 2] = gray;
  }
}

/**
 * @function
 * @param {Uint8clampedarr} imageData
 * Replaces the color value of each pixal in an image with the value of that pixal's color value's compliment.
 */
function invertColors(imageData) {
  for (var i = 0; i < imageData.length / 4; i++) {
    imageData[0 + i * 4] = 225 - imageData[0 + i * 4];
    imageData[1 + i * 4] = 225 - imageData[1 + i * 4];
    imageData[2 + i * 4] = 225 - imageData[2 + i * 4];
  }
}

/**
 * @constructor
 * @param {object} context CanvasRenderingContext2D object used to manipulate the canvas.
 * Painter provides canvas element manipulation functionality.
 */
function Painter(context) {
  if (context) {
    this.ctx = context;
  }
}
Painter.prototype.makeAjaxGet = makeAjaxGet;
Painter.prototype.drawImage = drawImage;
Painter.prototype.getContext = function(context) {
  if (context) {
    this.ctx = context;
  }
};

/**
 * @function
 * @param {string} ri String to be passed to a Ajax GET request as a identifier of a resource to be fetched from the server.
 * @param {object} response Function object to be invoked in the event of a successful get request for the resource with the identifier ri.
 * @param {array} specs Array with specification information for the drawing and positioning of an image on the canvas.
 * Makes a Ajax GET request for a resource and attempts to draw that resource on a canvas.
 */
Painter.prototype.GETAndDraw = function(ri, response, specs) {
  this.drawImage(ri, specs);
  this.makeAjaxGet(ri, response);
}

/**
 * @function
 * @param {number} sx X axis position of the upper left corner of the image data which will be operated on.
 * @param {number} sy Y axis position of the upper left corner of the image data which will be operated on.
 * @param {number} sw Width of the image which the image being operated on.
 * @param {number} sh Height of the image which the image being operated on.
 * @param {number} n If present the number of shades of gray that will at most comprise the image.
 * Removes color of some portion of a canvas and replaces it with some corresponding shade of gray.
 */
Painter.prototype.grayScaleCanvas = function(sx, sy, sw, sh, n) {
  var imageData = this.ctx.getImageData(sx, sy, sw, sh);
  switch (typeof n) {
    case "undefined":
      imageData.data = grayScale(imageData.data);
      break;
    case "number":
      imageData.data = NGraysScale(imageData.data, n);
  }
  this.ctx.putImageData(imageData, 0, 0);
}

/**
 * @function
 * @param {number} sx X axis position of the upper left corner of the image data which will be operated on.
 * @param {number} sy Y axis position of the upper left corner of the image data which will be operated on.
 * @param {number} sw Width of the image which the image being operated on.
 * @param {number} sh Height of the image which the image being operated on.
 * Replaces the color value of each pixal with the color value's compliment
 */
Painter.prototype.invertColorsCanvas = function(sx, sy, sw, sh) {
  var imageData = this.ctx.getImageData(sx, sy, sw, sh);
  invertColors(imageData.data);
  this.ctx.putImageData(imageData, sx, sy);
}

//instances
var Degas = new Painter();

