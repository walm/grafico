/**
 * Grafico - SVG graphing library - linegraph, areagraph and stacked areagraph file
 *
 * Copyright (c) 2009 Kilian Valkhof (kilianvalkhof.com) - Originally developed by Alex Young (http://alexyoung.org)
 * Visit grafico.kilianvalkhof.com for more information and changelogs.
 * Licensed under the MIT license. http://www.opensource.org/licenses/mit-license.php
 *
 */
"use strict";
Grafico.LineGraph = Class.create(Grafico.BaseGraph, {
  chartDefaults: function () {
    return{
      line : true,
      start_at_zero : true,
      stroke_width : 5,
      curve_amount : 10
    };
  },
  setChartSpecificOptions: function () {
  },
  calculateStep: function () {
    return (this.graph_width - (this.options.plot_padding * 2)) / (this.data_size - 1);
  },
  startPlot: function (cursor, x, y, color) {
    cursor.moveTo(x, y);
  },
  drawPlot: function (index, cursor, x, y, color, coords, datalabel, element, graphindex) {

    if (index === 0) {
      return this.startPlot(cursor, x-0.5, y, color);
    }

    if (this.options.curve_amount) {
      cursor.cplineTo(x, y, this.options.curve_amount);
    } else {
      cursor.lineTo(x, y);
    }

    if (this.options.markers === 'circle') {
      this.drawGraphMarkers(index, x, y, color, datalabel, element);
    } else if (this.options.markers === 'value') {
      this.drawGraphValueMarkers(index, x, y, color, datalabel, element, graphindex);
    }
  },
  drawGraphMarkers: function (index, x, y, color, datalabel, element) {
    var circle = this.paper.circle(x, y, this.options.marker_size),
        old_marker_size = this.options.marker_size,
        color2 = this.options.hover_color || color,
        new_marker_size = parseInt(1.7*old_marker_size, 10);
    circle.attr({ 'stroke-width': '1px', stroke: this.options.background_color, fill: color });
    this.globalMarkerSet.push(circle);

    circle.hover(function (event) {
      circle.animate({r : new_marker_size,fill : color2}, 200);
    }, function (event) {
      circle.animate({r : old_marker_size, fill : color}, 200);
    });

  },
  drawGraphValueMarkers: function (index, x, y, color, datalabel, element, graphindex) {

    index += this.options.odd_horizontal_offset>1 ? this.options.odd_horizontal_offset : 0;
    index -= this.options.stacked_fill || this.options.area ? 1 : 0;

    var currentset = this.options.stacked ? this.real_data : this.data_sets,
        currentvalue = currentset.collect(function (data_set) {return data_set[1][index];})[graphindex];

    if (currentvalue) {
      currentvalue = ""+currentvalue.toString().split('.');
      if (currentvalue[1]) {
        currentvalue[1] = currentvalue[1].truncate(3, '');
      }
    }
    if (
      (this.options.line||this.options.stacked) || //if the option is a line graph
      ((this.options.stacked_fill||this.options.area) && index != -1) && //if it's stacked or an area and it's not the first
      typeof currentvalue != "undefined") { //if there is a current value

      var rectx = x-(this.step/2),
          recty = this.options.stacked ? y-(this.graph_height/18): y-(this.graph_height/6),
          rectw = this.step,
          recth = this.options.stacked ? this.graph_height/9     : this.graph_height/3,
          circle = this.paper.circle(x, y, this.options.marker_size).attr({ 'stroke-width': '1px', stroke: this.options.background_color, fill: color,opacity:0}),
          block = this.paper.rect(rectx, recty, rectw, recth).attr({fill:color, 'stroke-width': 0, stroke : color,opacity:0});

      if (this.options.datalabels) {datalabel = datalabel+": "+currentvalue;
      } else {                      datalabel = ""+currentvalue;
      }
      datalabel += this.options.vertical_label_unit ? " "+this.options.vertical_label_unit:"";

      var hoverSet = this.paper.set(),
          textpadding = 4,
          text = this.paper.text(circle.attrs.cx, circle.attrs.cy-(this.options.font_size*1.5)-2*textpadding, datalabel).attr({'font-size': this.options.font_size, fill:this.options.hover_text_color,opacity: 1}),
          textbox = text.getBBox(),
          roundRect= this.drawRoundRect(text, textbox, textpadding),
          nib = this.drawNib(text, textbox, textpadding);

      hoverSet.push(circle,roundRect,nib,text).attr({opacity:0});
      this.checkHoverPos({rect:roundRect,set:hoverSet,marker:circle,nib:nib,textpadding:textpadding});
      this.globalHoverSet.push(hoverSet);
      this.globalBlockSet.push(block);

      block.hover(function (event) {
        hoverSet.animate({opacity:1},200);
      }, function (event) {
        hoverSet.animate({opacity:0},200);
      });
    }
  }
});

Grafico.AreaGraph = Class.create(Grafico.LineGraph, {
  chartDefaults: function () {
    return {
      area:true,
      area_opacity:false,
      stroke_width : 0
    };
  },
  setChartSpecificOptions: function () {
    if (typeof this.options.curve_amount === 'undefined') {
      this.options.curve_amount = 10;
    }
  },
  drawPlot: function (index, cursor, x, y, color, coords, datalabel, element, graphindex, dontdraw) {
    var filltype = this.options.area||this.options.stacked_fill;

    if(!dontdraw) {
      if(filltype === true) {
        if (index !== 0 && index !== coords.length-1) {
          if (this.options.markers === 'circle') {
            this.drawGraphMarkers(index, x, y, color, datalabel, element);
          } else if (this.options.markers === 'value') {
            this.drawGraphValueMarkers(index, x, y, color, datalabel, element, graphindex);
          }
        }
      } else {
        if (this.options.markers === 'circle') {
          this.drawGraphMarkers(index, x, y, color, datalabel, element);
        } else if (this.options.markers === 'value') {
          this.drawGraphValueMarkers(index, x, y, color, datalabel, element, graphindex);
        }
      }
    }
    x -= 0.5;
    if (index === 0) {
      return this.startPlot(cursor, x, y, color);
    }

    if (this.options.curve_amount && index > 1 && (index < coords.length-1)) {
      cursor.cplineTo(x, y, this.options.curve_amount);
    } else if (this.options.curve_amount && !filltype && (index = 1 || (index = coords.length-1))) {
      cursor.cplineTo(x, y, this.options.curve_amount);
    } else {
      cursor.lineTo(x, y);
    }
  }
});

Grafico.StackGraph = Class.create(Grafico.AreaGraph, {
  chartDefaults: function () {
    return {
      stacked:true,
      stacked_fill:true,
      stroke_width : 0
    };
  },
  normaliserOptions: function () {
  },
  stackData: function (stacked_data) {
    this.stacked_data = stacked_data.collect(
      function (data_set) {
        return data_set[1];
      });

    this.stacked_data.reverse();
    for (var i=1;i<this.stacked_data.length;i++) {
      for(var j=0;j<this.stacked_data[0].length; j++) {
        this.stacked_data[i][j] += this.stacked_data[i-1][j];
      }
    }
    this.stacked_data.reverse();
    return this.stacked_data;
  }
});

