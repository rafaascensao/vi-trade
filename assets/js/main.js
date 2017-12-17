// Trade dataset
var dataset;
var countries_map;
var min_year = 1989, max_year = 2015;
var year = 2004;
var countries;
var products = ["Textiles and Clothing","Wood","Minerals","Food Products", "Chemicals", "Plastic or Rubber","Animal", "Fuels", "Mach and Elec"];
//var productfile = {"Textiles and Clothing", "Wood","Minerals","Food Products", "Chemicals", "Plastic or Rubber","Animal", "Fuels", "Mach and Elec"}
var globalProducts;
var countriesCodes = {};
var productsColors = [[42,147,0],[102,51,0],[102,204,255],[0,51,153],[255,255,0],[112,48,160],[192,0,0],[255,153,0],[255,153,255]]
//Include html
w3.includeHTML(computeValues);

// MAIN INSIDE THIS FUNCTION ONLY
function computeValues(){
  //Removes loading
  open();
  checkReady()

}

  var data =
[
    { category: "Textiles and Clothing", count: 57},
    { category: "Wood", count: 15},
    { category: "Minerals", count: 10},
    { category: "Food Products", count: 8},
    { category: "Chemicals", count: 5},
    { category: "Plastic or Rubber", count: 3},
    { category: "Animal", count: 1},
    { category: "Fuels", count: 1},
    { category: "Mach and Elec", count: 1}
];
var chart_options = {
     dot_radius : 12,
     no_of_circles_in_a_row: 40,
         dot_padding_left : 5,
         dot_padding_right : 5,
         dot_padding_top : 5,
         dot_padding_bottom : 5
 }
function startViews(){
  startTimeline()
  startMap()
  startBarchart()
  $('.description > div.selected').click()
  $('.timeline .buttons .toggle-button .options p:not(.hidden-class)').click()
  DotMatrixChart(data, chart_options)

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

function toggleFlowChoroplethMap(choropleth_map=false,flow_map=true){
  if(choropleth_map){
    if(countries_map == undefined){
      countries_map = new Datamap({
        scope:'world',
        element: document.getElementById('map'),
        responsive: true,
        fills: {
          defaultFill: 'rgb(129, 129, 130)' // Any hex, color name or rgb/rgba value
        },

        //projection: 'mercator',
        done: function(datamap) {
          interactFlowMap(datamap)
        }
      });
    }else{
      removeArcs(countries_map)
    }
  }else{
    if(countries_map == undefined){
      countries_map = new Datamap({
        scope:'world',
        element: document.getElementById('map'),
        responsive: true,
        //projection: 'mercator',
        done: function(datamap) {
          interactFlowMap(datamap)
        }
      });
      origin = 'PRT'
      destinations = ['HRV','SOM','LSO','BRA','USA','RUS','CHN','ESP']
      newArcs = createOriginDestinationList(origin, destinations)
      refreshArcs(countries_map, newArcs)
   	}else{
      origin = 'PRT'
      destinations = ['HRV','SOM','LSO','BRA','USA','RUS','CHN','ESP']
      newArcs = createOriginDestinationList(origin, destinations)
      refreshArcs(countries_map, newArcs)
   	}
  }


  /* FUNCTIONS OF MAPS GO HERE */

  function interactFlowMap(datamap){
    zoom = d3.behavior.zoom().scaleExtent([1, 30]).on("zoom",redraw)
    datamap.svg.call(zoom);
    function redraw() {
      console.log(d3.event.translate)
      if(d3.event.translate[0] > 0)
       	d3.event.translate[0] = -1
      if(d3.event.translate[1] > 0)
       	d3.event.translate[1] = -1
      /*console.log("COMPARING WITH "+ d3.event.translate[0] + " " + d3.event.scale)
      if(d3.event.translate[0] < d3.event.scale)
       d3.event.translate[0] = -1 * d3.event.scale
      if(d3.event.translate[1] < d3.event.scale)
       d3.event.translate[1] = -1 * d3.event.scale*/
      zoom.translate(d3.event.translate)
      if(d3.event)
      	datamap.svg.selectAll("g").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }
    datamap.svg.selectAll('.datamaps-subunit').on('click', function(geography) {
      console.log(geography.properties.name);
      console.log(geography)
    });
  }
  /* ARCS */
  function createOriginDestinationList(origin, destinations){
  	res = [];
  	destinations.forEach(function(el){
      res.push({ origin: origin, destination: el})
  	});
  	return res
  }

  function removeArcs(map){
  	map.svg.selectAll('path.datamaps-arc').remove()
  }

  function refreshArcs(map, newArcs){
  	removeArcs(map);
  	map.arc(newArcs, );
  }



  /* ZOOM */
  function zoomToArea(area,scale){
  	zoom.scale(scale).translate(area).event(countries_map.svg.selectAll("g"))
  }





}
function startMap(){
  toggleFlowChoroplethMap(true,false)
  window.addEventListener('resize', function() {
    countries_map.resize();
  });
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

/* generate cloropleth map */
function fillCloropleth(product){
  dic = { }

  step = computeQuintiles(product)

  x = []
  countries.forEach(function(count){
    if (count != " World" && count != "European Union"){
    x.push(parseFloat(globalProducts[product][count][year]))}
  })
  x = x.sort(function(a,b){ return a-b})
  no_zeros = x.filter(function(el){ return el != 0 })

  firstV = no_zeros[0]
  secondV = no_zeros[step-1]
  thirdV = no_zeros[(step-1)*2]
  fourthV = no_zeros[(step-1)*3]
  fifthV = no_zeros[no_zeros.length - 1]

  $('#bar-cloropleth > div:first-child').html("<p>Undefined</p>")
  $('#bar-cloropleth > div:nth-child(2)').html("<p>"+Math.floor(firstV/1000)+" - "+Math.floor(secondV/1000)+"</p>")
  $('#bar-cloropleth > div:nth-child(3)').html("<p>"+Math.floor(secondV/1000)+" - "+Math.floor(thirdV/1000)+"</p>")
  $('#bar-cloropleth > div:nth-child(4)').html("<p>"+Math.floor(thirdV/1000)+" - "+Math.floor(fourthV/1000)+"</p>")
  $('#bar-cloropleth > div:nth-child(5)').html("<p>"+Math.floor(fourthV/1000)+" - "+Math.floor(fifthV/1000)+"</p>")

  cor = productsColors[products.indexOf(product)]

  countries.forEach(function(count){
    if (count != " World" && count != "European Union"){
    value = parseFloat(globalProducts[product][count][year])
    if (value == 0){
      dic[countriesCodes[count]] = "rgba(129,129,130,1)"
    }
    else if(value <= secondV){
      dic[countriesCodes[count]] = "rgba(" +cor[0]+ "," +cor[1]+ "," +cor[2]+ ",0.4)"
    }

    else if(value >= secondV && value < thirdV){
      dic[countriesCodes[count]] = "rgba(" +cor[0]+ "," +cor[1]+ "," +cor[2]+ ",0.6)"
    }

    else if(value >= thirdV && value < fourthV){
      dic[countriesCodes[count]] = "rgba(" +cor[0]+ "," +cor[1]+ "," +cor[2]+ ",0.8)"
    }

    else if(value >= fourthV){
      dic[countriesCodes[count]] = "rgba(" +cor[0]+ "," +cor[1]+ "," +cor[2]+ ",1)"
    }
  }
  })

  opacity = 0.2
  $('#bar-cloropleth > div').each(function(){
    $(this).css('background',"rgba(" +cor[0]+ "," +cor[1]+ "," +cor[2]+ ","+opacity+")")
    opacity += 0.2
  })
  $('#bar-cloropleth > div:first-child').css('background','#818182');

  resetAllColors();
  countries_map.updateChoropleth(dic)


}
function resetAllColors(){
  d = { }
  Datamap.prototype.worldTopo.objects.world.geometries.forEach(function(element){
    d[element["id"]] = "rgba(129,129,130,1)";
  })
  countries_map.updateChoropleth(d)
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

function startBarchart(){
  var l = getCountryExport(15)
  categories = ['']
  dollars = []

  opacity = 1.0
  l.forEach(function(element){
    color = productsColors[products.indexOf(getSelectedProduct())]
    element.push(color)
    element.push(opacity-=0.02)
    element[1] = Math.floor(parseFloat(element[1])/1000000)
  });
  var colors = ['#0000b4','#0082ca','#0094ff','#0d4bcf','#0066AE','#074285','#00187B','#285964','#405F83','#416545','#4D7069','#6E9985','#7EBC89','#0283AF','#79BCBF','#99C19E'];

  var w = $('.bar-chart_container').width() - 10
  var h = $('.bar-chart_container').height()
  var padding_left = 70
  var padding_bottom = 15
  var xscale = d3.scale.linear()
                 .domain([0,l.length])
                 .range([0,h-padding_bottom])
  var hscale = d3.scale.linear()
                 .domain([0,l[0][1]])
                 .range([0,w-padding_left])

  var yaxis = d3.svg.axis()
                .orient('Bottom')
                .scale(hscale)
                .tickSize(1)
                .ticks(3)
              //  .tickValues(d3.range(4))

  var xaxis = d3.svg.axis()
                .orient('left')
                .scale(xscale)
                .tickSize(0)
                .tickFormat(function(d,i){ return l[i][0]; })
                .tickValues(d3.range(15));

  var svg, tooltip;
  var grid = [];

  if($(".bar-chart_container svg").length > 0){
    svg = d3.select(".bar-chart_container svg")
    tooltip = d3.select("body .toolTip")

    svg.select("#country_axis").call(xaxis)
    svg.select("#dollars_axis").call(yaxis)
    svg.selectAll("rect")
      .data(l)
       .attr("height",Math.floor(w/l.length)-1)
       .attr("fill",function(d,i){ return 'rgba('+d[2][0]+','+d[2][1]+','+d[2][2]+','+d[3]+')'; })
       .attr("y", function(d, i){ return xscale(i)})
       .attr("x", function(d){ return padding_left })
       .on("mousemove", function(d){
             val = d[1]
               tooltip
                 .style("left", d3.event.pageX - 50 + "px")
                 .style("top", d3.event.pageY - 70 + "px")
                 .style("display", "inline-block")
                 .html(val+" US($) Millions");
           })
       		.on("mouseout", function(d){ tooltip.style("display", "none");});

    svg.select("#dollars_axis").selectAll(".tick").each(function(element){
      var tick = d3.select(this)
      var translate = d3.transform(tick.attr("transform")).translate;
      grid.push(translate[0])
    })
    svg.select("#names_axis")
       .selectAll("rect")
       .remove()
    svg.select("#names_axis")
       .selectAll("rect")
        .data(grid)
          .enter().append("rect")
          .attr("height",h-(padding_bottom*1.5))
          .attr("width", "1")
          .attr("x" , function(d){ return d; })
          .style({'stroke':'#adadad','stroke-width':'1px'})
  }else{
    svg = d3.select(".bar-chart_container").append("svg")
                                           .attr("width",w)
                                           .attr("height",h);
    svg.append("g")
      .attr("transform","translate("+padding_left+","+(h-(padding_bottom*1.5))+")")
      .attr("id","dollars_axis")
      .call(yaxis)

    tooltip = d3.select("body").append("div").attr("class", "toolTip");

    svg.append("g")
      .attr("id","country_axis")
      .attr("transform", "translate("+padding_left+",11)")
      .call(xaxis)
        .selectAll("text")
        .attr("font-size","12px")

    svg.selectAll("rect")
      .data(l)
       .enter().append("rect")
       .attr("height",Math.floor(w/l.length)-1)
       .attr("width", 0)
       .attr("fill",function(d,i){ return 'rgba('+d[2][0]+','+d[2][1]+','+d[2][2]+','+d[3]+')'; })
       .attr("y", function(d, i){ return xscale(i)})
       .attr("x", function(d){ return padding_left })
       .on("mousemove", function(d){
             val = d[1]
               tooltip
                 .style("left", d3.event.pageX - 50 + "px")
                 .style("top", d3.event.pageY - 70 + "px")
                 .style("display", "inline-block")
                 .html(val+" US($) Millions");
           })
       		.on("mouseout", function(d){ tooltip.style("display", "none");});

    svg.select("#dollars_axis").selectAll(".tick").each(function(element){
      var tick = d3.select(this)
      var translate = d3.transform(tick.attr("transform")).translate;
      grid.push(translate[0])
    })
    svg.append("g")
       .attr("transform","translate("+padding_left+",0)")
       .attr("id","names_axis")
       .selectAll("rect")
        .data(grid)
          .enter().append("rect")
          .attr("height",h-(padding_bottom*1.5))
          .attr("width", "1")
          .attr("x" , function(d){ return d; })
          .style({'stroke':'#adadad','stroke-width':'1px'})
  }




  var transit_bars = svg.selectAll("rect")
    .data(l)
    .transition()
    .duration(500)
    .attr("width",function(d){ return hscale(d[1])});



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



function DotMatrixChart(data,options){
  var h = $('.dot_matrix_chart').height()
  var w = $('.dot_matrix_chart').width()
  var radius = options["dot_radius"]

  var padding_left = 40
  var padding_top = 60

  var xScale = d3.scale.linear().range([0,w])
  var yScale = d3.scale.linear().range([0,h])

  var svg = d3.select(".dot_matrix_chart")
              .append("svg")
              .attr("width", w)
              .attr("height", h)
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

  var circles = svg.select(".circles")
                  .selectAll("circle")
                  .data(generateCircleElement(data))
                    .enter()
                    .append("circle")
                    .attr("fill", function(d){ return "rgb("+productsColors[products.indexOf(d["category"])][0]+","+productsColors[products.indexOf(d["category"])][1]+","+productsColors[products.indexOf(d["category"])][2]+")" })
                    .attr("r",radius)
                    .attr("cx", function(d,i){
                       x = i / num_columns
                       y = parseInt(x)
                       final  =  x - y
                       return (final * num_columns) * (radius * 3) })
                    .attr("cy", function(d,i){
                       x = Math.floor(i / num_columns) - 1
                       return x * (radius * 3)
                    })
}
