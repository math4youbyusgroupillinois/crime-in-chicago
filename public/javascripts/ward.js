var Ward = {};
Ward.create = function(number, year, selector) {
  identity = function(number, year) {
    ward = $("#ward-"+number+"-"+year);
    if (ward.exists()) {
      ward.attr("data-year", year);
      ward.attr("data-ward", number);
      ward.year = ward.attr("data-year");
      ward.number = ward.attr("data-ward");
    }
    return ward;
  }

  ward = identity(number, year);
  if (ward.missing()) {
    $.get("/wards/"+number+"/"+year+"/partials/timeline", function(data) {
      $(selector).prepend(data);
      ward = identity(number, year);

      ward.find(".remove").click(function() {
        $('a[data-ward|="'+ward.number+'"]').parent().attr('class', '');
        $(this).parent().remove();
        return false;
      });

      ward.find("h2 a").click(function() {
        timeline = $(this).parents(".timeline");
        $(this).toggleClass("expanded");
        timeline.find(".statistics").slideToggle(function(){
          timeline.find(".handle").height(timeline.outerHeight());
        });
        return false;
      });

      Ward.calendar(ward, "#calendar-"+ward.number+"-"+ward.year, false);

      Ward.statistics.sparkline(ward);
      Ward.statistics.crime(ward);
      Ward.statistics.category(ward);
    });
  }
}

Ward.statistics = {};
Ward.statistics.sparkline = function(ward) {
  $.get("/wards/"+ward.number+"/"+ward.year+"/partials/statistics/sparkline", function(data) {
    ward.find(".sparkline").html(data.trim());

    spark_data = ward.find(".sparkline-day")
    spark_data.sparkline("html", {
      chartRangeMin: 0, fillColor: "#ddf2fb",
      height: "31px", lineColor: "#518fc9",
      lineWidth: 1, minSpotColor: "#0b810b",
      maxSpotColor: "#c10202", spotColor: false,
      spotRadius: 2, width: "138px"
    });
  });
}

Ward.statistics.crime = function(ward) {
  $.get("/wards/"+ward.number+"/"+ward.year+"/partials/statistics/crime", function(data) {
    ward.find(".crime").html(data);
  });
}

Ward.statistics.category = function(ward) {
  $.get("/wards/"+ward.number+"/"+ward.year+"/partials/statistics/category", function(data) {
    ward.find(".category").html(data);
  });
}

var WardDetail = {};
WardDetail.create = function(number, year, selector) {
  identity = function(number, year) {
    ward = $("#ward-"+number+"-"+year);
    if (ward.exists()) {
      ward.attr("data-year", year);
      ward.attr("data-ward", number);
      ward.year = ward.attr("data-year");
      ward.number = ward.attr("data-ward");
    }
    return ward;
  }

  ward = identity(number, year);
  $.get("/wards/"+number+"/"+year+"/partials/timeline-history", function(data) {
    $(selector).append(data);
    ward = identity(number, year);

    Ward.calendar(ward, "#calendar-"+ward.number+"-"+ward.year, true);
  });
}

WardDetail.subcategories = function(number, primary_type) {
  $.get("/wards/"+number+"/"+primary_type+"/partials/subcategories", function(data) {
    $(data).insertAfter('#expanded-' + primary_type + '-chart');
  });
}

var CategoryChart = {};
CategoryChart.create = function(number, primary_type) {
  
  //fetch data from data attribute on link and convert to array of ints
  var dataSeries = $("#category-" + primary_type + " a").attr("data-values").split(',');
  for(var i=0; i<dataSeries.length; i++) { dataSeries[i] = parseInt(dataSeries[i], 10); }

  //build high chart
  chart = new Highcharts.Chart({
    chart: {
      defaultSeriesType: "area",
      renderTo: 'expanded-' + primary_type + '-chart',
      spacingBottom: 0,
      spacingLeft: 0,
      zoomType: "x"
    },
    credits: { enabled: false },
    title: { text: "" },
    legend: { enabled: false },
    plotOptions: {
      series: {
        lineWidth: 2,
        marker: {
          fillColor: "#518fc9",
          radius: 0,
          states: {
            hover: {
              enabled: true,
              radius: 5
            }
          }
        },
        pointInterval: 30 * 24 * 3600 * 1000,
        pointStart: Date.UTC(2002, 4, 1),
        shadow: false,
        states: {
           hover: {
              lineWidth: 2
           }
        }
      }
    },
    series: [{
      color: "#ddf2fb",
      data: dataSeries,
      /*data: [40, 96, 110, 88, 115, 99, 174, 116, 96, 127, 135, 156, 136, 138, 105, 96, 103, 114, 136, 154, 130, 147, 139, 166, 125, 130, 108, 93, 104, 103, 122, 206, 150,
        {
          marker: {
            fillColor: "#c10202",
            radius: 4
          },
          y: 225
        },
        142, 168, 150, 143, 169, 154, 144, 144, 162, 135, 194, 171, 94, 138, 148, 153, 145, 138, 126, 136, 138, 114, 125, 167, 131, 119, 142, 130, 91, 81, 96, 87, 78, 81, 88, 123, 111, 126, 149, 134, 91, 86, 106, 138, 157, 135, 119, 115, 56, 89, 67, 58, 44, 65, 53, 51, 43, 31, 51, 53, 50, 45, 47, 34, 31, 29, 31, 31, 26, 24, 28, 29, 23, 43, 27, 30, 32, 37, 26, 21, 28, 19,
        {
          marker: {
            fillColor: "#0b810b",
            radius: 4
          },
          y: 11
        }
      ],*/
      lineColor: "#518fc9",
      name: "Crimes"
    }],
    tooltip: {
      borderColor: "#518fc9",
      formatter: function() {
        var s = "<strong>" + Highcharts.dateFormat("%B %Y", this.x) + "</strong>";
        $.each(this.points, function(i, point) {
          s += "<br />" + point.series.name + ": " + Highcharts.numberFormat(point.y, 0);
        });
        return s;
      },
      shared: true
    },
    xAxis: {
      dateTimeLabelFormats: { year: "%Y" },
      gridLineColor: "#ddd",
      gridLineWidth: 1,
      tickLength: 0,
      type: "datetime"
    },
    yAxis: {
      lineWidth: 1,
      title: { text: "" },
      min: Math.min.apply( Math, dataSeries ),
      max: Math.max.apply( Math, dataSeries )
    }
  });
}


Ward.calendar = function(ward, selector, isHistory) {

  if (isHistory) {
    var m = [0, 0, 0, 0], // top right bottom left margin
      w = 590 - m[1] - m[3], // width
      h = 95 - m[0] - m[2], // height
      z = 10.65; // cell size
  }
  else {
    var m = [0, 0, 0, 0], // top right bottom left margin
        w = 770 - m[1] - m[3], // width
        h = 104 - m[0] - m[2], // height
        z = 14.5; // cell size
  }

  var data = new Object();

  var day = d3.time.format("%w"),
      week = d3.time.format("%U"),
      percent = d3.format(".1%"),
      format = d3.time.format("%Y-%m-%d");

  function monthPath(t0) {
    var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
        d0 = +day(t0), w0 = +week(t0),
        d1 = +day(t1), w1 = +week(t1);
    return "M" + (w0 + 1) * z + "," + d0 * z
        + "H" + w0 * z + "V" + 7 * z
        + "H" + w1 * z + "V" + (d1 + 1) * z
        + "H" + (w1 + 1) * z + "V" + 0
        + "H" + (w0 + 1) * z + "Z";
  }

  d3.json("/api/"+ward.year+"/wards/"+ward.number+"/crime/calendar", function(json) {
    data["crime_counts"] = [];
    data["crimes_sum"] = 0;
    data["crimes_max"] = json[0]["crime_max"]
    json.forEach(function(obj, index) {
      data[json[index]["date"]] = json[index]["crime_count"];
      data["crime_counts"][data["crime_counts"].length] = json[index]["crime_count"];
      data["crimes_sum"] = data["crimes_sum"] + json[index]["crime_count"];
    });

    var crimes_max = data["crimes_max"];

    ward.find(".summary_count").html("<strong>"+data["crimes_sum"]+"</strong>");

    var color = d3.scale.quantize()
        .domain([0, crimes_max])
        .range(d3.range(9));

    var svg = d3.select(selector).selectAll("svg")
        .data(d3.range(parseInt(ward.year), parseInt(ward.year) + 1))
      .enter().append("svg")
        .attr("width", w + m[1] + m[3])
        .attr("height", h + m[0] + m[2])
        .attr("class", "Blues")
      .append("g")
        .attr("transform", "translate(0, 1)");

    var rect = svg.selectAll("rect.day")
        .data(function(d) { return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
      .enter().append("rect")
        .attr("class", "day")
        .attr("width", z)
        .attr("height", z)
        .attr("x", function(d) { return week(d) * z; })
        .attr("y", function(d) { return day(d) * z; })
        .map(format);

    rect.append("title")
        .text(function(d) { return d; });

    svg.selectAll("path.month")
        .data(function(d) { return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
      .enter().append("path")
        .attr("class", "month")
        .attr("d", monthPath);

    rect.filter(function(d) { return d in data; })
        .attr("class", function(d) { return "day q" + color(data[d]) + "-9"; })
      .select("title")
        .text(function(d) { return "[" + d + "]" + ": " + data[d] + " crimes listed"; });
  });
}

Ward.draggable = function(selector) {
  $(selector).hover(
    function(){ $(this).find(".handle").height($(this).outerHeight()); },
    function(){ $(this).find(".handle").height(0); }
  );
}

Ward.sortable = function(selector) {
  $(selector).sortable({
    handle: ".handle",
    revert: true
  });
}

Ward.tooltips = function(selector) {
  $(selector).tooltip({
    delay: 0,
    fade: 250,
    showBody: " - ",
    showURL: false,
    track: true
  });
}
