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
w3.includeHTML(startViews);

// MAIN INSIDE THIS FUNCTION ONLY
function startViews(){
  //Removes loading
  open();
  startTimeline()

  startMap()



}



/* Open file and shit */
function open(){
  d3.csv("../../dataGather/exports.csv", function(data){
    dataset = data;
    generateCountriesList();
    generateCodesDic();
    getSumProducts(products);
    $('.loader').addClass('hidden')
    $('.row').removeClass('hidden')
  })
}
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
function startTimeline(){
  $('.timeline .options p').click(toggleButtons);
  $('.description > div').click(selectProduct);
  $( ".timeline .slider .slide" ).slider({
    range: "max",
    min: 1989,
    max: 2015,
    value: year,
    slide: function( event, ui ) {
      $( "#amount" ).val( ui.value );
      if(ui.value == 1989 || ui.value == 2015)
        $('.timeline .slider .slide span .year').text('')
      else
        $('.timeline .slider .slide span .year').text(ui.value);
      year = ui.value
      fillCloropleth(getSelectedProduct())
      refreshBarChart()
    }
  });
  $('.timeline .slider .slide').append("<div class='left-slide'><div class='min-max-year'>1989</div></div><div class='right-slide'><div class='min-max-year'>2015</div></div>")
  $('.timeline .slider .slide span').append("<div class='year'></div>")
  $( "#amount" ).val( $( "#slider-range-max" ).slider( "value" ) );
  $('.timeline .slider .slide span .year').text(year+'')

  function toggleButtons(){
    $(this).parent().find('p').toggleClass('hidden-class')
    if($(this).parent().find('p:not(.hidden-class)').text() == "Country"){
      toggleFlowChoroplethMap(false,true);
      $('.description').addClass('country-view')
    }else if ($(this).parent().find('p:not(.hidden-class)').text() == "Product") {
      toggleFlowChoroplethMap(true,false);
      $('.description').removeClass('country-view')
    }
  }
  function selectProduct(){
    $(this).parent().children().removeClass('selected')
    $(this).addClass('selected')
    fillCloropleth($(this).attr('product'))
    refreshBarChart()
  }

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
    x.push(globalProducts[product][count][year])}
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
    x.push(globalProducts[product][count][year])}
  })
  x = x.sort(function(a,b){ return a-b})
  no_zeros = x.filter(function(el){ return el != 0 })

  firstV = no_zeros[0]
  secondV = no_zeros[step-1]
  thirdV = no_zeros[(step-1)*2]
  fourthV = no_zeros[(step-1)*3]
  fifthV = no_zeros[no_zeros.length - 1]

  console.log(firstV)
  console.log(secondV)
  console.log(thirdV)
  console.log(fourthV)
  console.log(fifthV)
  $('#bar-cloropleth > div:first-child').html("<p>Undefined</p>")
  $('#bar-cloropleth > div:nth-child(2)').html("<p>"+Math.floor(firstV/1000)+" - "+Math.floor(secondV/1000)+"</p>")
  $('#bar-cloropleth > div:nth-child(3)').html("<p>"+Math.floor(secondV/1000)+" - "+Math.floor(thirdV/1000)+"</p>")
  $('#bar-cloropleth > div:nth-child(4)').html("<p>"+Math.floor(thirdV/1000)+" - "+Math.floor(fourthV/1000)+"</p>")
  $('#bar-cloropleth > div:nth-child(5)').html("<p>"+Math.floor(fourthV/1000)+" - "+Math.floor(fifthV/1000)+"</p>")

  cor = productsColors[products.indexOf(product)]

  countries.forEach(function(count){
    if (count != " World" && count != "European Union"){
    value = globalProducts[product][count][year]
    if (value == 0){
      dic[countriesCodes[count]] = "rgba(129,129,130,1)"
    }
    else if(value < secondV){
      dic[countriesCodes[count]] = "rgba(" +cor[0]+ "," +cor[1]+ "," +cor[2]+ ",0.4)"
    }

    else if(value < thirdV){
      dic[countriesCodes[count]] = "rgba(" +cor[0]+ "," +cor[1]+ "," +cor[2]+ ",0.6)"
    }

    else if(value < fourthV){
      dic[countriesCodes[count]] = "rgba(" +cor[0]+ "," +cor[1]+ "," +cor[2]+ ",0.8)"
    }

    else if(value > fourthV){
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
  $('#bar_chart svg > *').remove();
  startBarchart()
}

function startBarchart(){
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
  var grid = d3.range(8).map(function(i){
    return {'x1':0,'y1':0,'x2':0,'y2':$('.bar-chart_container').height() - 10 };
  });

  var tickVals = grid.map(function(d,i){
    /*if(i>0){ return i*22; }
    else if(i===0){ return "100";}*/
    return 0
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

  var	xAxis = d3.svg.axis();
  xAxis
    .orient('bottom')
    .scale(xscale)
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
