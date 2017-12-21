// Trade dataset
var dataset;
var countries_map;
var min_year = 1989, max_year = 2015;
var year = 2004;
var selectedCountry = "China"
var selectedCode = "CHN";
var countries;
var currentView = 'Product';
var products = ["Textiles and Clothing","Wood","Minerals","Food Products", "Chemicals", "Plastic or Rubber","Animal", "Fuels", "Mach and Elec"];
//var productfile = {"Textiles and Clothing", "Wood","Minerals","Food Products", "Chemicals", "Plastic or Rubber","Animal", "Fuels", "Mach and Elec"}
var globalProducts;
var countriesCodes = {};
var productsColors = [[42,147,0],[102,51,0],[102,204,255],[0,51,153],[255,255,0],[112,48,160],[192,0,0],[255,153,0],[255,153,255]]
var chart_options = {
     dot_radius : 12,
     no_of_circles_in_a_row: 40,
         dot_padding_left : 5,
         dot_padding_right : 5,
         dot_padding_top : 5,
         dot_padding_bottom : 5
 }
//Include html
w3.includeHTML(computeValues);

// MAIN INSIDE THIS FUNCTION ONLY
function computeValues(){
  //Removes loading
  open();
  checkReady()

}

function startViews(){
  startTimeline()
  mapObj = createMap()
  $('.description > div.selected').click()
  startBarchart()
  $('.timeline .buttons .toggle-button .options p:not(.hidden-class)').click()
  startDataDotMatrix(selectedCountry,chart_options)
  clevChart = clevelandDotPlot()
}

function checkReady(){
  if(globalProducts != null){
    startViews()
  }else{
    setTimeout(checkReady, 250)
  }
}

/* Open file and shit */
function open(){
  d3.csv("../../dataGather/exports.csv", function(data){
    dataset = data;
    generateCountriesList();   //set countries
    generateCodesDic();        //set countriesCodes[country]
    getSumProducts(products);  //set globalProducts
    $('.loader').addClass('hidden')
    $('.row').removeClass('hidden')
  })
}

//set countriesCodes[country]
function generateCodesDic(){
  var codes;
  d3.csv("../../dataGather/countryCodes.csv", function(data){
    codes = data;
    countries.forEach(function(country){
      code = codes.filter(function(el){ return el["Name"] == country})
      countriesCodes[country] = code[0]["Code"];
    })

  })
}

//set countries
function generateCountriesList(){
  x = []
  dataset.filter(function(element){
    if( x.indexOf(element["Reporter Name"]) < 0){
	  x.push(element["Reporter Name"])
    }
  })
  dataset.filter(function(element){
    if( x.indexOf(element["Partner Name"]) < 0){
	  x.push(element["Partner Name"])
    }
  })
  countries = x
}

function getSelectedProduct(){
  return $('.description > div.selected').attr('product')
}


function getSumProducts(listProducts){
  // QUERY
  all = {}
  var sums;
  d3.csv("../../dataGather/derived.csv", function(data){
  listProducts.forEach(function(product){
  	 console.log("Computing " + product)
  	 count = {}
  	 countries.forEach(function(country){
        results = data.filter(function(element){
          return element["Product Group"] == product && element["Reporter Name"] == country && element["Trade Flow"] == 'Export'; })
		    count[country] = {}
        for(i = min_year; i <= max_year; i++){
          count[country][i] = results[0][i]
        }
      })
    all[product] = count
  	})
  	globalProducts = all
  })
  }

function computeQuintiles(product){
  x = []
  countries.forEach(function(count){
    if (count != " World" && count != "European Union"){
    x.push(parseFloat(globalProducts[product][count][year]))}
  })

  x = x.sort(function(a,b){ return a-b})
  step = Math.floor(x.filter(function(el){ return el != 0 }).length*0.25)

  return step
}




function getCountryExport(top){
  //associative array=> country_key: export_value
  cur_product = getSelectedProduct()
  var country_export={};
  countries.forEach(function(c){
    if (c != " World" && c != "European Union"){
      country_export[c]=globalProducts[cur_product][c][year]
    }
  })
  //sorts the array by value
  var items = Object.keys(country_export).map(function(key) {
    return [key, country_export[key]];
});

// Sort the array based on the second element
items.sort(function(first, second) {
    return second[1] - first  [1];
});
  //returns the first 15 elements of an array
  return items.slice(0,top)
}

/* BARCHART */



/*Simple Bar Chart*/
function barchart() {
  var svg = d3.select("#bar_chart svg"),
      margin = {top: 20, right: 20, bottom: 30, left: 80},
      width = +svg.attr("width") - margin.left - margin.right,
      height = +svg.attr("height") - margin.top - margin.bottom;

  var tooltip = d3.select("body").append("div").attr("class", "toolTip");

  var x = d3.scale.linear().range([0, width]);
  var y = d3.ordinal().range([height, 0]);

  var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var data = globalProducts[getSelectedProduct()][year]
    data.sort(function(a, b) { return a.value - b.value; });

    x.domain([0, d3.max(data, function(d) { return d.value; })]);
    y.domain(data.map(function(d) { return d.area; })).padding(0.1);

    g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(5).tickFormat(function(d) { return parseInt(d / 1000); }).tickSizeInner([-height]));

    g.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y));

    g.selectAll(".bar")
        .data(data)
      .enter().append("rect")
        .attr("class", "bar")
        .attr("x", 0)
        .attr("height", y.bandwidth())
        .attr("y", function(d) { return y(d.area); })
        .attr("width", function(d) { return x(d.value); })
        .on("mousemove", function(d){
            tooltip
              .style("left", d3.event.pageX - 50 + "px")
              .style("top", d3.event.pageY - 70 + "px")
              .style("display", "inline-block")
              .html((d.area) + "<br>" + "£" + (d.value));
        })
        .on("mouseout", function(d){ tooltip.style("display", "none");});
};



function refreshBarChart(){
  //$('.bar-chart_container svg').remove();
  startBarchart()
}



function qwestartBarchart(){
 var l = getCountryExport(15)
 categories = ['']
 dollars = []
  l.forEach(function(element){
  	categories.push(element[0])
  	dollars.push(Math.floor(parseFloat(element[1])/1000000))
  });

//  var categories= ['','Accessories', 'Audiophile', 'Camera', 'Cell Phones', 'Computers','eBook Readers','Gadgets','GPS ','Home Audio','Office','Portable Audio','Portable Video','Security ','Service','Television ','Car & Vehicle'];
//  var dollars = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16];
  var colors = ['#0000b4','#0082ca','#0094ff','#0d4bcf','#0066AE','#074285','#00187B','#285964','#405F83','#416545','#4D7069','#6E9985','#7EBC89','#0283AF','#79BCBF','#99C19E'];

  /* Y2 ALTURA DO GRAFICO */
  var grid = d3.range(9).map(function(i){
    return {'x1':0,'y1':0,'x2':0,'y2':$('.bar-chart_container').height() - 10 };
  });

  var tickVals = grid.map(function(d,i){
    /*if(i>0){ return i*22; }
    else if(i===0){ return "100";}*/
    return i
  });


  /* DOMAIN [MININO , MAXIMO EXPORTADO]
     RANGE [0, LARGURA DA DIV]
  */
  var xscale = d3.scale.linear()
    .domain([1,dollars[0]])
    .range([0,$('.bar-chart_container').width() - 110]);


  /* DOMAIN [0, NUMERO PAISES]
     RANGE [0, ALTURA DA DIV]
  */
  var yscale = d3.scale.linear()
    .domain([0,categories.length])
    .range([0,$('.bar-chart_container').height() - 30]);


  var colorScale = d3.scale.quantize()
    .domain([0,categories.length])
    .range(colors);

  var canvas = d3.select('#bar_chart svg');
  var tooltip = d3.select("#bar_chart").append("div").attr("class", "toolTip");

  var grids = canvas.append('g')
    .attr('id','grid')
    .attr('transform','translate(100,10)')
    .selectAll('line')
    .data(grid)
    .enter()
    .append('line')
    .attr({'x1':function(d,i){ return i*30; },
      'y1':function(d){ return d.y1; },
      'x2':function(d,i){ return i*30; },
      'y2':function(d){ return d.y2 - 35; },
    })
    .style({'stroke':'#adadad','stroke-width':'1px'});

  lscale = d3.scale.linear()
    .domain([1,dollars[0]])
    .range([0,$('.bar-chart_container').width()]);

  var	xAxis = d3.svg.axis();
  xAxis
    .orient('bottom')
    .scale(lscale)
    .tickSize(2)
    .tickValues(tickVals);

  var	yAxis = d3.svg.axis();
  yAxis
    .orient('left')
    .scale(yscale)
    .tickSize(2)
    .tickFormat(function(d,i){ return categories[i]; })
    .tickValues(d3.range(17));


  var y_xis = canvas.append('g')
    .attr("transform", "translate(100,0)")
    .attr('id','yaxis')
    .call(yAxis);

  var x_xis = canvas.append('g')
    .attr("transform", "translate(100,450)")
    .attr('id','xaxis')
    .call(xAxis);

  color = productsColors[products.indexOf(getSelectedProduct())]
  opacity = 1.0
  //rgbacolor = 'rgba('+color[0]+','+color[1]+','+color[2]+','+(opacity-=0.05)+')'
  var chart = canvas.append('g')
    .attr("transform", "translate(100,0)")
    .attr('id','bars')
    .selectAll('rect')
    .data(dollars)
    .enter()
    .append('rect')
    .attr('height',19)
    .attr({'x':0,'y':function(d,i){ return yscale(i)+19; }})
    .style('fill',function(d,i){ return 'rgba('+color[0]+','+color[1]+','+color[2]+','+(opacity-=0.02)+')'; })
    .attr('width',function(d){ return 0; })
    .on("mousemove", function(d){
          val = Math.floor(parseFloat(getCountryExport(15)[dollars.indexOf(d)][1])/1000)
            tooltip
              .style("left", d3.event.pageX - 50 + "px")
              .style("top", d3.event.pageY - 70 + "px")
              .style("display", "inline-block")
              .html(val+" US($) Millions");
        })
    		.on("mouseout", function(d){ tooltip.style("display", "none");});;


  var transit = d3.select("svg").selectAll("rect")
    .data(dollars)
    .transition()
    .duration(1000)
    .attr("width", function(d) {return xscale(d); });

/*
  var transitext = d3.select('#bars')
    .selectAll('text')
    .data(dollars)
    .enter()
    .append('text')
    .attr({'x':function(d) {return xscale(d)-100; },'y':function(d,i){ return yscale(i)+35; } })
    .text(function(d){ return d+"$"; }).style({'fill':'#fff','font-size':'14px'});
*/

  d3.select('#bar_chart svg #yaxis').selectAll('text').attr('font-size','12px')

}

function convertColorToString(color){
  return "rgb("+color[0]+","+color[1]+","+color[2]+")"
}
/* DOT MATRIX CHART */
function DotMatrixChart(data,options){
  var h = $('.dot_matrix_chart').height()
  var w = $('.dot_matrix_chart').width()
  var radius = options["dot_radius"]

  var padding_left = 40
  var padding_top = 60

  var xScale = d3.scale.linear().range([0,w])
  var yScale = d3.scale.linear().range([0,h])
  var svg;
  if( $(".dot_matrix_chart svg").length == 0 ){
    svg = d3.select(".dot_matrix_chart")
                .append("svg")
                .attr("width", w)
                .attr("height", h)
  }else{
    var svg = d3.select(".dot_matrix_chart svg")
    svg.select(".circles").remove()
  }
  svg.append("g")
      .attr("class","circles")
      .attr("transform","translate("+padding_left+","+padding_top+")")

  function generateCircleElement(data){
    var l = []
    data.forEach(function(el){
      for(step = 0; step < el["count"] ; step++)
        l.push({ category: el["category"]})
    })
    return l
  }

  var num_columns = Math.ceil((w - padding_left) / (radius * 3))-1
  list = generateCircleElement(data)
  var circles = svg.select(".circles")
                  .selectAll("circle")
                  .data(list)
                    .enter()
                    .append("circle")
                    .attr("fill", function(d){ return "rgb("+productsColors[products.indexOf(d["category"])][0]+","+productsColors[products.indexOf(d["category"])][1]+","+productsColors[products.indexOf(d["category"])][2]+")" })
                    .attr("r",0)
                    .attr("cx", function(d,i){
                       x = i / num_columns
                       y = parseInt(x)
                       final  =  x - y
                       return (final * num_columns) * (radius * 3) })
                    .attr("cy", function(d,i){
                       x = Math.floor(i / num_columns) - 1
                       return x * (radius * 3)
                    })

  var transitions = svg.select(".circles")
                      .selectAll("circle")
                      .data(list)
                      .transition()
                      .duration(500)
                      .attr("r",radius)
}

function refreshDotMatrixChart(country, options){
  startDataDotMatrix(country,options)
}
function startDataDotMatrix(country,options) {
  var w = $('.dot_matrix_chart').width()
  var radius = options["dot_radius"]
  var padding_left = 40 // options["padding_left"]
  var padding_top = 60 // options["padding_left"]
  var num_columns = Math.ceil((w - padding_left) / (radius * 3))-1
  var num_lines = 7
  var entries = num_columns * num_lines
  var i = 0
  d3.csv("../../dataGather/derived.csv", function(data){
      var valuesDot = []
      var results;
      dot = computeDotValue(country, data, entries)
      products.forEach(function(product){
        results = data.filter(function(element){
          return element["Product Group"] == product && element["Reporter Name"] == country && element["Trade Flow"] == 'Export';
        })
        if(typeof results[0] === 'undefined'){
              countryName = getKeyByValue(countriesCodes, selectedCode)
              results = data.filter(function(element){
                return element["Product Group"] == product && element["Reporter Name"] == countryName && element["Trade Flow"] == 'Export';
              })
          }
        valuesDot.push({ 'category' : product ,
                         'count' : Math.round(results[0][year] / dot)})
      })
      valuesDot = valuesDot.sort(function(a,b){return b.count-a.count})
      //console.log(valuesDot)
      DotMatrixChart(valuesDot, options)
  })
}

function computeDotValue(country, data, entries) {
  sum = 0
  var results;
  products.forEach(function(product){
    results = data.filter(function(element){
      return element["Product Group"] == product && element["Reporter Name"] == country && element["Trade Flow"] == 'Export';
    })
    if(typeof results[0] === 'undefined'){
      console.log("im in")
      countryName = getKeyByValue(countriesCodes, selectedCode)
      console.log(countryName)
      results = data.filter(function(element){
          return element["Product Group"] == product && element["Reporter Name"] == countryName && element["Trade Flow"] == 'Export';
      })
      }
    sum = sum + parseInt(results[0][year])
  })
  return sum / entries
}

/* LINE CHART */

linechartSet = [ {"year":1980 , "Textiles and Clothing": 80 , "Wood": 100, "Minerals": 0, "Food Products": 10, "Chemicals": 40,"Plastic or Rubber": 80,"Animal": 220,"Fuels": 100,"Mach and Elec": 0},
            {"year":1981 , "Textiles and Clothing": 180 , "Wood": 123, "Minerals": 0, "Food Products": 30, "Chemicals": 10,"Plastic or Rubber": 80,"Animal": 220,"Fuels": 100,"Mach and Elec": 0},
            {"year":1982 , "Textiles and Clothing": 280 , "Wood": 213, "Minerals": 0, "Food Products": 60, "Chemicals": 30,"Plastic or Rubber": 80,"Animal": 220,"Fuels": 100,"Mach and Elec": 0},
            {"year":1983 , "Textiles and Clothing": 380 , "Wood": 136, "Minerals": 0, "Food Products": 80, "Chemicals": 60,"Plastic or Rubber": 80,"Animal": 220,"Fuels": 100,"Mach and Elec": 0},
            {"year":1984 , "Textiles and Clothing": 480 , "Wood": 174, "Minerals": 0, "Food Products": 30, "Chemicals": 40,"Plastic or Rubber": 80,"Animal": 220,"Fuels": 100,"Mach and Elec": 0},
            {"year":1985 , "Textiles and Clothing": 580 , "Wood": 102, "Minerals": 0, "Food Products": 20, "Chemicals": 70,"Plastic or Rubber": 80,"Animal": 220,"Fuels": 100,"Mach and Elec": 0},
            {"year":1986 , "Textiles and Clothing": 680 , "Wood": 98, "Minerals": 0, "Food Products": 10, "Chemicals": 10,"Plastic or Rubber": 80,"Animal": 220,"Fuels": 100,"Mach and Elec": 0},
            {"year":1987 , "Textiles and Clothing": 780 , "Wood": 210, "Minerals": 0, "Food Products": 6,  "Chemicals": 63,"Plastic or Rubber": 80,"Animal": 220,"Fuels": 100,"Mach and Elec": 0},
            {"year":1988 , "Textiles and Clothing": 880 , "Wood": 150, "Minerals": 0, "Food Products": 50, "Chemicals": 52,"Plastic or Rubber": 80,"Animal": 220,"Fuels": 100,"Mach and Elec": 0},
            {"year":1989 , "Textiles and Clothing": 980 , "Wood": 150, "Minerals": 0, "Food Products": 10, "Chemicals": 12,"Plastic or Rubber": 80,"Animal": 220,"Fuels": 100,"Mach and Elec": 0}

          ]
xName = "year"
yObjs = { 'Textiles and Clothing': {column: 'Textiles and Clothing' , color: productsColors[products.indexOf('Textiles and Clothing')]} ,
          'Wood': {column: 'Wood' , color: productsColors[products.indexOf('Wood')]} ,
          'Minerals': {column: 'Minerals' , color: productsColors[products.indexOf('Minerals')]} ,
          'Food Products': {column: 'Food Products' , color: productsColors[products.indexOf('Food Products')]},
          'Chemicals': {column: 'Chemicals' , color: productsColors[products.indexOf('Chemicals')]} ,
          'Plastic or Rubber': {column: 'Plastic or Rubber' , color: productsColors[products.indexOf('Plastic or Rubber')]} ,
          'Animal': {column: 'Animal' , color: productsColors[products.indexOf('Animal')]} ,
          'Fuels': {column: 'Fuels' , color: productsColors[products.indexOf('Fuels')]} ,
          'Mach and Elec': {column: 'Mach and Elec' , color: productsColors[products.indexOf('Mach and Elec')]}
        }
axisLables = {xAxis: 'Years', yAxis: 'Amount'}

function getLineData(country, initialYear, finalYear){
  var lineSet = []
  d3.csv("../../dataGather/derived.csv", function(data){
    var i = 0
    for(j = initialYear; j <= finalYear; j++){
      lineSet[i] = {}
      lineSet[i]["year"] = j
      var results;
      products.forEach(function(product){
        results = data.filter(function(element){
        return element["Product Group"] == product && element["Reporter Name"] == country && element["Trade Flow"] == 'Export';
      })
      if(typeof results[0] === 'undefined'){
            countryName = getKeyByValue(countriesCodes, selectedCode)
          results = data.filter(function(element){
            return element["Product Group"] == product && element["Reporter Name"] == countryName && element["Trade Flow"] == 'Export';
          })
      }
      lineSet[i][product] = parseInt(results[0][j] / 1000)
      })
    i++
    }
    makeLineChart(lineSet,xName,yObjs, axisLables)
  })

}

var chartObj = {};

function makeLineChart(dataset, xName, yObjs, axisLables){
  if( $('.line_chart .inner-wrapper').length > 0){
    chartObj.updateChart(dataset,xName,yObjs,axisLables)
    return chartObj;
  }

  chartObj.xAxisLable = axisLables.xAxis;
  chartObj.yAxisLable = axisLables.yAxis;

  chartObj.data = dataset;
  chartObj.margin = {top: 10, right: 30, bottom: 30, left: 50};
  chartObj.width = 650 - chartObj.margin.left - chartObj.margin.right;
  chartObj.height = 300 - chartObj.margin.top - chartObj.margin.bottom;

  // So we can pass the x and y as strings when creating the function
  chartObj.xFunct = function(d){return d[xName]};

  // For each yObjs argument, create a yFunction
  function getYFn(column) {
      return function (d) {
          return d[column];
      };
  }

  // Object instead of array
  chartObj.yFuncts = [];
  for (var y  in yObjs) {
      yObjs[y].name = y;
      yObjs[y].yFunct = getYFn(yObjs[y].column); //Need this  list for the ymax function
      chartObj.yFuncts.push(yObjs[y].yFunct);
  }

  //Formatter functions for the axes
  chartObj.formatAsNumber = d3.format(".0f");
  chartObj.formatAsDecimal = d3.format(".2f");
  chartObj.formatAsCurrency = d3.format("$.2f");
  chartObj.formatAsFloat = function (d) {
      if (d % 1 !== 0) {
          return d3.format(".2f")(d);
      } else {
          return d3.format(".0f")(d);
      }
  };

  chartObj.xFormatter = chartObj.formatAsNumber;
  chartObj.yFormatter = chartObj.formatAsFloat;

  chartObj.bisectYear = d3.bisector(chartObj.xFunct).left; //< Can be overridden in definition

  //Create scale functions
  chartObj.xScale = d3.scale.linear().range([0, chartObj.width]).domain(d3.extent(chartObj.data, chartObj.xFunct)); //< Can be overridden in definition

  // Get the max of every yFunct
  chartObj.max = function (fn) {
      return d3.max(chartObj.data, fn);
  };
  chartObj.yScale = d3.scale.linear().range([chartObj.height, 0]).domain([0, d3.max(chartObj.yFuncts.map(chartObj.max))]);

  chartObj.formatAsYear = d3.format("");

  //Create axis
  chartObj.xAxis = d3.svg.axis().scale(chartObj.xScale).orient("bottom").tickFormat(chartObj.xFormatter); //< Can be overridden in definition

  chartObj.yAxis = d3.svg.axis().scale(chartObj.yScale).orient("left").tickFormat(chartObj.yFormatter); //< Can be overridden in definition

  // Build line building functions
  function getYScaleFn(yObj) {
      return function (d) {
          return chartObj.yScale(yObjs[yObj].yFunct(d));
      };
  }
  for (var yObj in yObjs) {
      yObjs[yObj].line = d3.svg.line().interpolate("cardinal").x(function (d) {
          return chartObj.xScale(chartObj.xFunct(d));
      }).y(getYScaleFn(yObj));
  }

  chartObj.svg;

  // Change chart size according to window size
  chartObj.update_svg_size = function () {
    chartObj.width = (parseInt(chartObj.chartDiv.style("width"), 10) - (chartObj.margin.left + chartObj.margin.right)) ;
    chartObj.height = (parseInt(chartObj.chartDiv.style("height"), 10) - (chartObj.margin.top + chartObj.margin.bottom)) * 0.6 ;

    /* Update the range of the scale with new width/height */
    chartObj.xScale.range([0, chartObj.width]);
    chartObj.yScale.range([chartObj.height, 0]);

    if (!chartObj.svg) {return false;}

    /* Else Update the axis with the new scale */
    chartObj.svg.select('.x.axis').attr("transform", "translate(0," + chartObj.height + ")").call(chartObj.xAxis);
    chartObj.svg.select('.x.axis .label').attr("x", chartObj.width / 2);

    chartObj.svg.select('.y.axis').call(chartObj.yAxis);
    chartObj.svg.select('.y.axis .label').attr("x", -chartObj.height / 2);

    /* Force D3 to recalculate and update the line */
    for (var y  in yObjs) {
        yObjs[y].path.attr("d", yObjs[y].line);
    }


    d3.selectAll(".focus.line").attr("y2", chartObj.height);

    chartObj.chartDiv.select('svg').attr("width", chartObj.width + (chartObj.margin.left + chartObj.margin.right)).attr("height", chartObj.height + (chartObj.margin.top + chartObj.margin.bottom));

    chartObj.svg.select(".overlay").attr("width", chartObj.width).attr("height", chartObj.height);
    return chartObj;
  };

  chartObj.bind = function (selector) {
    chartObj.mainDiv = d3.select(selector);
    // Add all the divs to make it centered and responsive
    chartObj.mainDiv.append("div").attr("class", "inner-wrapper").append("div").attr("class", "outer-box").append("div").attr("class", "inner-box");
    chartSelector = selector + " .inner-box";
    chartObj.chartDiv = d3.select(chartSelector);
    d3.select(window).on('resize.' + chartSelector, chartObj.update_svg_size);
    chartObj.update_svg_size();
    return chartObj;
  };

  // Render the chart
  chartObj.render = function () {
    //Create SVG element
    chartObj.svg = chartObj.chartDiv.append("svg").attr("class", "chart-area").attr("width", chartObj.width + (chartObj.margin.left + chartObj.margin.right)).attr("height", chartObj.height + (chartObj.margin.top + chartObj.margin.bottom)).append("g").attr("transform", "translate(" + chartObj.margin.left + "," + chartObj.margin.top + ")");

    // Draw Lines
    for (var y  in yObjs) {
      stroke_color = "rgb("+productsColors[products.indexOf(y)][0]+","+productsColors[products.indexOf(y)][1]+","+productsColors[products.indexOf(y)][2]+")"
      yObjs[y].path = chartObj.svg.append("path").datum(chartObj.data).attr("class", "line").attr("d", yObjs[y].line).style("stroke", stroke_color /*productsColors[products.indexOf(y)]*/).style("stroke-width", "2px").attr("data-series", y).on("mouseover", function () {
          focus.style("display", null);
      }).on("mouseout", function () {
          focus.transition().delay(700).style("display", "none");
      }).on("mousemove", mousemove);
    }


    // Draw Axis
    chartObj.svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + chartObj.height + ")").call(chartObj.xAxis).append("text").attr("class", "label").attr("x", chartObj.width / 2).attr("y", 30).style("text-anchor", "middle").text(chartObj.xAxisLable);

    chartObj.svg.append("g").attr("class", "y axis").call(chartObj.yAxis).append("text").attr("class", "label").attr("transform", "rotate(-90)").attr("y", -42).attr("x", -chartObj.height / 2).attr("dy", ".71em").style("text-anchor", "middle").text(chartObj.yAxisLable);

    //Draw tooltips
    var focus = chartObj.svg.append("g").attr("class", "focus").style("display", "none");

    for (var y  in yObjs) {
      yObjs[y].tooltip = focus.append("g");
      yObjs[y].tooltip.append("circle").attr("r", 5);
      yObjs[y].tooltip.append("rect").attr("x", 8).attr("y","-5").attr("width",22).attr("height",'0.75em');
      yObjs[y].tooltip.append("text").attr("x", 9).attr("dy", ".35em");
    }

    // Year label
    focus.append("text").attr("class", "focus year").attr("x", 9).attr("y", 7);
    // Focus line
    focus.append("line").attr("class", "focus line").attr("y1", 0).attr("y2", chartObj.height);

    //Draw legend
    //var legend = chartObj.mainDiv.append('div').attr("class", "legend");
    //for (var y  in yObjs) {
    //  series = legend.append('div');
    //  series.append('div').attr("class", "series-marker").style("background-color", color(y));
    //  series.append('p').text(y);
    //  yObjs[y].legend = series;
    //}

    // Overlay to capture hover
    chartObj.svg.append("rect").attr("class", "overlay").attr("width", chartObj.width).attr("height", chartObj.height).on("mouseover", function () {
      focus.style("display", null);
    }).on("mouseout", function () {
      focus.style("display", "none");
    }).on("mousemove", mousemove);

    return chartObj;
    function mousemove() {
      var x0 = chartObj.xScale.invert(d3.mouse(this)[0]), i = chartObj.bisectYear(dataset, x0, 1), d0 = chartObj.data[i - 1], d1 = chartObj.data[i];
      try {
          var d = x0 - chartObj.xFunct(d0) > chartObj.xFunct(d1) - x0 ? d1 : d0;
      } catch (e) { return;}
      minY = chartObj.height;
      for (var y  in yObjs) {
          yObjs[y].tooltip.attr("transform", "translate(" + chartObj.xScale(chartObj.xFunct(d)) + "," + chartObj.yScale(yObjs[y].yFunct(d)) + ")");
          yObjs[y].tooltip.select("text").text(chartObj.yFormatter(yObjs[y].yFunct(d)));
          minY = Math.min(minY, chartObj.yScale(yObjs[y].yFunct(d)));
      }

      focus.select(".focus.line").attr("transform", "translate(" + chartObj.xScale(chartObj.xFunct(d)) + ")").attr("y1", minY);
      focus.select(".focus.year").text("Year: " + chartObj.xFormatter(chartObj.xFunct(d)));
    }
  };

  chartObj.updateChart = function(dataset,xName,yObjs,axisLables){
    chartObj.xAxisLable = axisLables.xAxis;
    chartObj.yAxisLable = axisLables.yAxis;

    chartObj.data = dataset;
    chartObj.margin = {top: 10, right: 5, bottom: 30, left: 80};
    chartObj.width = 650 - chartObj.margin.left - chartObj.margin.right;
    chartObj.height = 300 - chartObj.margin.top - chartObj.margin.bottom;

    // So we can pass the x and y as strings when creating the function
    chartObj.xFunct = function(d){return d[xName]};


    // Object instead of array
    chartObj.yFuncts = [];
    for (var y  in yObjs) {
        yObjs[y].name = y;
        yObjs[y].yFunct = getYFn(yObjs[y].column); //Need this  list for the ymax function
        chartObj.yFuncts.push(yObjs[y].yFunct);
    }

    //Formatter functions for the axes
    chartObj.formatAsNumber = d3.format(".0f");
    chartObj.formatAsDecimal = d3.format(".2f");
    chartObj.formatAsCurrency = d3.format("$.2f");


    chartObj.xFormatter = chartObj.formatAsNumber;
    chartObj.yFormatter = chartObj.formatAsFloat;

    chartObj.bisectYear = d3.bisector(chartObj.xFunct).left; //< Can be overridden in definition

    //Create scale functions
    chartObj.xScale = d3.scale.linear().range([0, chartObj.width]).domain(d3.extent(chartObj.data, chartObj.xFunct)); //< Can be overridden in definition

    // Get the max of every yFunct
    chartObj.max = function (fn) {
        return d3.max(chartObj.data, fn);
    };
    chartObj.yScale = d3.scale.linear().range([chartObj.height, 0]).domain([0, d3.max(chartObj.yFuncts.map(chartObj.max))]);

    chartObj.formatAsYear = d3.format("");

    //Create axis
    chartObj.xAxis = d3.svg.axis().scale(chartObj.xScale).orient("bottom").tickFormat(chartObj.xFormatter); //< Can be overridden in definition

    chartObj.yAxis = d3.svg.axis().scale(chartObj.yScale).orient("left").tickFormat(chartObj.yFormatter); //< Can be overridden in definition


    for (var yObj in yObjs) {
        yObjs[yObj].line = d3.svg.line().interpolate("cardinal").x(function (d) {
            return chartObj.xScale(chartObj.xFunct(d));
        }).y(getYScaleFn(yObj));
    }

    chartObj.svg;
    $('.inner-wrapper').remove()
    chartObj.bind(".line_chart")
    chartObj.render()
  }
  chartObj.bind(".line_chart")
  chartObj.render()
  return chartObj;
}
// http://bl.ocks.org/asielen/44ffca2877d0132572cb
function generateDataDot(country1, country2, year) {
  var dataDot = []
  var dataline={}
  products.forEach(function(p){
    if (parseFloat(globalProducts[p][country1][year])<=parseFloat(globalProducts[p][country2][year])) {
        dataDot.push({"name" : p, "min" : parseFloat(globalProducts[p][country1][year])/1000, "max" : parseFloat(globalProducts[p][country2][year])/1000, "min_country" : country1, "max_country" : country2})
    }
    else {
        dataDot.push({"name" : p, "min" : parseFloat(globalProducts[p][country2][year])/1000, "max" : parseFloat(globalProducts[p][country1][year])/1000, "min_country" : country2, "max_country" : country1})
    }
  })
  //dataDot[i] = {"name" : products[i] , productvaluecountry1 : 70 , "max" : productvaluecountry2 , "min_country" : country1 , "max_country" : country2 }
  return dataDot
}



function clevelandDotPlot(){
  clevChart = {}

  clevChart.appendChart = function(){
    clevChart.svg = d3.select(".cleveland_dot_plot")
                      .append("svg")
                      .attr("width", clevChart.width + clevChart.margin.left + clevChart.margin.right)
                      .attr("height", clevChart.height + clevChart.margin.top + clevChart.margin.bottom)
  }

  clevChart.update = function(data){
    clevChart.xAxisLable = "$"
    clevChart.yAxisLable = "Products"

    clevChart.data = data
    clevChart.margin = {top: 10, right: 30, bottom: 30, left: 50};
    clevChart.width = $('.cleveland_dot_plot').width() - clevChart.margin.left - clevChart.margin.right;
    clevChart.height = $('.cleveland_dot_plot').height() - clevChart.margin.top - clevChart.margin.bottom;
    clevChart.Xmax =  Math.max.apply(Math, clevChart.data.map(x => x["max"]))

    clevChart.xScale = d3.scale.linear()
                               .range([0, clevChart.width])
                               .domain([0, clevChart.Xmax])

    clevChart.yScale = d3.scale.ordinal()
                               .rangeRoundBands([ clevChart.margin.top, clevChart.height] , 0.2)
                               .domain(products)

    clevChart.xAxis = d3.svg.axis()
                            .scale(clevChart.xScale)
                            .orient("bottom")
                            .tickValues(d3.range(0,clevChart.Xmax, (clevChart.Xmax/10)))
                            .tickFormat(d3.format(".2s"))
    clevChart.yAxis = d3.svg.axis()
                            .scale(clevChart.yScale)
                            .orient("left")
                            .innerTickSize([0])

    if($('.cleveland_dot_plot svg').length > 0)
      clevChart.svg.remove()
    clevChart.appendChart()
    clevChart.render()
  }

  clevChart.render = function(){

    // Make the faint lines from y labels to highest dot
    clevChart.linesGrid = clevChart.svg.selectAll("lines.grid")
                                      .data(clevChart.data)
                                      .enter()
                                      .append("line")

    clevChart.linesGrid.attr("class", "grid")
                       .attr("x1", clevChart.margin.left)
                       .attr("y1", function(d){
                         return clevChart.yScale(d.name) + clevChart.yScale.rangeBand()/2; //  d.name = PRODUTO
                       })
                       .attr("x2", function(d){
                         return clevChart.margin.left + clevChart.xScale(+d.max) // MAIOR NUMERO FIXME
                       })
                       .attr("y2", function(d){
                         return clevChart.yScale(d.name) + clevChart.yScale.rangeBand()/2 // d.name = PRODUTO
                       })

    // Make the dotted lines between the dots
    clevChart.linesBetween = clevChart.svg.selectAll("lines.between")
    			.data(clevChart.data)
    			.enter()
    			.append("line");

    clevChart.linesBetween.attr("class", "between")
  				.attr("x1", function(d) {
  					return clevChart.margin.left + clevChart.xScale(+d.min); // MENOR NUMERO
  				})
  				.attr("y1", function(d) {
  					return clevChart.yScale(d.name) + clevChart.yScale.rangeBand()/2;
  				})
  				.attr("x2", function(d) {
  					return clevChart.margin.left +clevChart.xScale(d.max); // MAIOR NUMERO
  				})
  				.attr("y2", function(d) {
  					return clevChart.yScale(d.name) + clevChart.yScale.rangeBand()/2;
  				})
  				.attr("stroke-dasharray", "5,5")
  				.attr("stroke-width", function(d, i) {
  					if (i == 7) {
  						return "1";
  					} else {
  						return "0.5";
  					}
  				});

    // Make the minor dots
    clevChart.minorDots = clevChart.svg.selectAll("circle.y1990")
						.data(clevChart.data)
						.enter()
						.append("circle");

    clevChart.minorDots.attr("class", "y1990")
					.attr("cx", function(d) {
						return clevChart.margin.left + clevChart.xScale(+d.min); // MENOR ANO
					})
					.attr("r", clevChart.yScale.rangeBand()/4)
					.attr("cy", function(d) {
						return clevChart.yScale(d.name) + clevChart.yScale.rangeBand()/2;
					})
					.append("title")
					.text(function(d) {
						return d.name + " in 1990: " + d.min ; //MENOR NUMERO
					});

    // Make the dots for 2015

		clevChart.maxDots = clevChart.svg.selectAll("circle.y2015")
				.data(clevChart.data)
				.enter()
				.append("circle");

		clevChart.maxDots.attr("class", "y2015")
			.attr("cx", function(d) {
				return clevChart.margin.left + clevChart.xScale(+d.max); // MAX NUMERO
			})
			.attr("r", clevChart.yScale.rangeBand()/4)
			.attr("cy", function(d) {
				return clevChart.yScale(d.name) + clevChart.yScale.rangeBand()/2;
			})
			.append("title")
			.text(function(d) {
				return d.name + " in 2015: " + d.max ; // MAIOR NUMERO
			});


    // add the axes
    clevChart.svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(" + clevChart.margin.left + "," + clevChart.height + ")")
    .call(clevChart.xAxis);

    clevChart.svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + clevChart.margin.left + ",0)")
      .call(clevChart.yAxis);

    clevChart.svg.append("text")
      .attr("class", "xlabel")
      .attr("transform", "translate(" + (clevChart.margin.left + clevChart.width / 2) + " ," +
            (clevChart.height + clevChart.margin.bottom) + ")")
      .style("text-anchor", "middle")
      .attr("dy", "2")
      .text("Percent");

  }

  return clevChart
}

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}
