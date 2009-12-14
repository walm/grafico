Ico.BarGraph = Class.create(Ico.BaseGraph, {
  chartDefaults: function () {
    return { plot_padding: 0 };
  },
  normaliserOptions: function () {
    return { start_value: 0 };
  },
  setChartSpecificOptions: function () {
    this.bar_padding = 5;
    this.bar_width = this.calculateBarWidth();
    this.options.plot_padding = (this.bar_width / 2);
    this.step = this.calculateStep();
    this.grid_start_offset = this.bar_padding - 1;
  },

  calculateBarWidth: function () {
    return (this.graph_width / this.data_size) - this.bar_padding;
  },

  calculateStep: function () {
    return (this.graph_width - (this.options.plot_padding * 2) - (this.bar_padding * 2)) / (this.data_size - 1);
  },

  drawPlot: function (index, cursor, x, y, colour, coords, datalabel, element) {
    var start_y = this.options.height - this.y_padding_bottom,
        lastcolor = this.options.bargraph_lastcolour,
        colour2;
    x = x + this.bar_padding;

    if (lastcolor && index === coords.length-1){
      colour2 = lastcolor;
    } else {
      colour2 = colour;
    }

    var bargraph = this.paper.rect(x-(this.bar_width/2), start_y-(this.options.height-y-this.y_padding_bottom), this.bar_width, (this.options.height-this.y_padding_bottom)-y);
    bargraph.attr({fill: colour2, 'stroke-width': 0, stroke : colour2});


    if (this.options.datalabels) {
      var hover_colour = this.options.hover_colour || colour,
          hoverSet = this.paper.set(),
          text,
          hoverbar = this.paper.rect(x-(this.bar_width/2), this.y_padding_top, this.bar_width, this.options.height);

      datalabel = datalabel[index].toString();
      text = this.paper.text(bargraph.attrs.x+(this.bar_width/2), bargraph.attrs.y-(this.options.font_size*1.5), datalabel),
      hoverbar.attr({fill: colour2, 'stroke-width': 0, stroke : colour2,opacity:0});
      text.attr({'font-size': this.options.font_size, fill:this.options.background_colour,opacity: 1});

      var textbox = text.getBBox(),
          textpadding = 4,
          roundRect= this.paper.rect(
            text.attrs.x-(textbox.width/2)-textpadding,
            text.attrs.y-(textbox.height/2)-textpadding,
            textbox.width+(textpadding*2),
            textbox.height+(textpadding*2),
            textpadding*1.5);
      roundRect.attr({fill: this.options.label_colour,opacity: 1});

      var nib = this.paper.path();
      nib.attr({fill: this.options.label_colour,opacity: 1});
      nib.moveTo(hoverbar.attrs.x+(this.bar_width/2)-textpadding,text.attrs.y+(textbox.height/2)+textpadding+0.5);
      nib.lineTo(hoverbar.attrs.x+(this.bar_width/2),text.attrs.y+(textbox.height/2)+(textpadding*2)+0.5);
      nib.lineTo(hoverbar.attrs.x+(this.bar_width/2)+textpadding,text.attrs.y+(textbox.height/2)+textpadding+0.5);
      nib.andClose();

      text.toFront();
      hoverSet.push(roundRect,nib,text).attr({opacity:0}).toFront();
      hoverbar.toFront();
      this.checkHoverPos({rect:roundRect,set:hoverSet,nib:nib});
      this.globalHoverSet.push(hoverSet);
      if (roundRect.attrs.y < 0) {
        hoverSet.translate(0,1+(roundRect.attrs.y*-1));
      }

      hoverbar.node.onmouseover = function (e) {
        bargraph.animate({fill: hover_colour,stroke:hover_colour}, 200);
        hoverSet.animate({opacity:1}, 200);
      }.bind(this);

      hoverbar.node.onmouseout = function (e) {
        bargraph.animate({fill: colour2,stroke:colour2}, 200);
        hoverSet.animate({opacity:0}, 200);
      };
    }

    x = x + this.step;
    this.options.count++;
  },
  drawHorizontalLabels: function () {
  /* Change the standard options to correctly offset against the bars */
    var x_start = this.bar_padding + this.options.plot_padding;
    this.drawMarkers(this.options.labels, [1, 0], this.step, x_start, [0, (this.options.font_size + 7) * -1]);
  }
});

Ico.HorizontalBarGraph = Class.create(Ico.BarGraph, {
  setChartSpecificOptions: function () {
    // Approximate the width required by the labels
    this.x_padding_left = 20 + this.longestLabel() * (this.options.font_size / 2);
    this.bar_padding = 5;
    this.bar_width = this.calculateBarHeight();
    this.options.plot_padding = 0;
    this.step = this.calculateStep();

    this.options.horizontalbar_grid = true;
    this.options.horizontalbar_padding = true;
    this.graph_width = this.options.width - this.x_padding_right - this.x_padding_left;
  },
  normalise: function (value) {
    var offset = this.x_padding_left;
    return ((value / this.range) * (this.graph_width - offset));
  },

  longestLabel: function () {
    return $A(this.options.labels).sort(function (a, b) { return a.toString().length < b.toString().length; }).first().toString().length;
  },

  /* Height */
  calculateBarHeight: function () {
    return (this.graph_height / this.data_size) - this.bar_padding;
  },

  calculateStep: function () {
    return (this.graph_height - (this.options.plot_padding * 2)) / this.data_size;
  },
  drawLines: function (label, colour, data, datalabel, element) {
    var x = this.x_padding_left + this.options.plot_padding,
        y = this.y_padding_top+(this.bar_width/2)+(this.bar_padding/2),
        lastcolor = this.options.bargraph_lastcolour;

    $A(data).each(function (value, index) {
      var colour2,
          horizontal_rounded = this.options.horizontal_rounded ? this.bar_width/2 : 0,
          cursor = this.paper.rect(x, (y-this.bar_width/2), x + value - this.normalise(this.start_value), this.bar_width, horizontal_rounded);

      if (lastcolor && index === $A(data).length-1){
        colour2 = lastcolor;
      } else {
        colour2 = colour;
      }

      cursor.attr({fill: colour2, 'stroke-width': 0, stroke : colour2});
      if (horizontal_rounded){
        var cursor2 = this.paper.rect(x, (y-this.bar_width/2)-0.5, x + value - this.normalise(this.start_value)-this.bar_width/2, this.bar_width+0.5);
            cursor2.attr({fill: colour2, 'stroke-width': 0, stroke : colour2});
        cursor.toFront();
        cursor.secondnode = cursor2;
      }

      y = y + this.step;

    }.bind(this));
  },

  /* Horizontal version */
  drawFocusHint: function () {
    var length = 5,
        x = this.x_padding_left + (this.step * 2),
        y = this.options.height - this.y_padding_bottom;
    var cursor = this.paper.path().attr({stroke: this.options.label_colour, 'stroke-width': 2});

    cursor.moveTo(x, y);
    cursor.lineTo(x - length, y + length);
    cursor.moveTo(x - length, y);
    cursor.lineTo(x - (length * 2), y + length);
  },

  drawVerticalLabels: function () {
    var y_start = (this.step / 2);
    this.drawMarkers(this.options.labels.reverse(), [0, -1], this.step, y_start, [-8, -(this.options.font_size / 5)], { "text-anchor": 'end' });
  },

  drawHorizontalLabels: function () {
    var x_step = this.graph_width / this.y_label_count,
        x_labels = this.makeValueLabels(this.y_label_count);

        if (this.options.vertical_label_unit) {
          for(var i=0;i<x_labels.length;i++) {
            x_labels[i] += this.options.vertical_label_unit;
          }
        }
    this.drawMarkers(x_labels, [1, 0], x_step, x_step, [0, (this.options.font_size + 7) * -1]);
  }
});

