Ico.SparkLine = Class.create(Ico.Base, {
  initialize: function (element, data, options) {
    this.element = element;
    this.data = data;

    this.options = {
      highlight:              false
    };
    Object.extend(this.options, options || { });

    this.step = this.calculateStep();
    this.paper = new Raphael(this.element, this.options.width, this.options.height);
    if (this.options.acceptable_range) {
      this.background = this.paper.rect(0, this.options.height - this.normalise(this.options.acceptable_range[1]),
                                        this.options.width, this.options.height - this.normalise(this.options.acceptable_range[0]));
    } else {
      this.background = this.paper.rect(0, 0, this.options.width, this.options.height);
    }
    this.background.attr({fill: this.options.background_colour, stroke: 'none' });
    this.draw();
  },

  calculateStep: function () {
    return this.options.width / (this.data.length - 1);
  },

  normalise: function (value) {
    return (this.options.height / this.data.max()) * value;
  },

  draw: function () {
    var data = this.normaliseData(this.data);
    this.drawLines('', this.options.colour, data);

    if (this.options.highlight) {
      this.showHighlight(data);
    }
  },

  drawLines: function (label, colour, data) {
    var line = this.paper.path().attr({ stroke: colour, "stroke-width" : this.options.stroke_width }).moveTo(0, this.options.height - data.first()),
        x = 0;

    data.slice(1).each(function (value) {
      x = x + this.step;
      line.lineTo(x, this.options.height - value);
    }.bind(this));
  },

  showHighlight: function (data) {
    var size = 2,
        x = this.options.width - size,
        i = this.options.highlight.index || data.length - 1,
        y = data[i] + (size / 2).round(),
        circle;

    // Find the x position if it's not the last value
    if (typeof this.options.highlight.index !== 'undefined') {
      x = this.step * this.options.highlight.index;
    }

    circle = this.paper.circle(x, this.options.height - y, size);
    circle.attr({ stroke: false, fill: this.options.highlight.colour});
  }
});

Ico.SparkBar = Class.create(Ico.SparkLine, {
  calculateStep: function () {
    return this.options.width / this.data.length;
  },
  drawLines: function (label, colour, data) {
    var lastcolor = this.options.bargraph_lastcolour,
        width = this.step > 2 ? this.step - 1 : this.step,
        x = width;


    data.each(function (value,index) {
      var colour2, line;
      if (lastcolor && index === data.length-1 ){
        colour2 = lastcolor;
      } else {
        colour2 = colour;
      }
      line = this.paper.path().attr({ stroke: colour2, 'stroke-width': width });
      line.moveTo(x, this.options.height - value);
      line.lineTo(x, this.options.height);
      x = x + this.step;
    }.bind(this));
  }
});

