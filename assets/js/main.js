// Trade dataset
var dataset;
var countries_map;
var min_year = 1989, max_year = 2015;
var year = 2004;
var countries;
var products = ["Textiles and Clothing","Wood","Minerals","Food Products", "Chemicals", "Plastic or Rubber","Animal", "Fuels", "Mach and Elec"];
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
    x.push(globalProducts[product][count][year])})

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
    x.push(globalProducts[product][count][year])})
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

  cor = productsColors[products.indexOf(product)]

  countries.forEach(function(count){
    value = globalProducts[product][count][year]
    if (value == 0){
      dic[countriesCodes[count]] = "rgba(129,129,130,1)"
    }else if(value < secondV){
      dic[countriesCodes[count]] = "rgba(" +cor[0]+ "," +cor[1]+ "," +cor[2]+ ",0.4)"
    }

    else if(value < thirdV){
      dic[countriesCodes[count]] = "rgba(" +cor[0]+ "," +cor[1]+ "," +cor[2]+ ",0.6)"
    }

    else if(value < fourthV){
      dic[countriesCodes[count]] = "rgba(" +cor[0]+ "," +cor[1]+ "," +cor[2]+ ",0.8)"
    }

    else if(value < fifthV){
      dic[countriesCodes[count]] = "rgba(" +cor[0]+ "," +cor[1]+ "," +cor[2]+ ",1)"
    }
  })

  opacity = 0.2
  $('#bar-cloropleth > div').each(function(){
    $(this).css('background',"rgba(" +cor[0]+ "," +cor[1]+ "," +cor[2]+ ","+opacity+")")
    opacity += 0.2
  })
  $('#bar-cloropleth > div:first-child').css('background','#818182');

  countries_map.updateChoropleth(dic)
}
















/* BARCHART */
function startBarchart(){
  var categories= ['','Accessories', 'Audiophile', 'Camera & Photo', 'Cell Phones', 'Computers','eBook Readers','Gadgets','GPS & Navigation','Home Audio','Office Electronics','Portable Audio','Portable Video','Security & Surveillance','Service','Television & Video','Car & Vehicle'];
  var dollars = [213,209,190,179,156,209,190,179,213,209,190,179,156,209,190,190];
  var colors = ['#0000b4','#0082ca','#0094ff','#0d4bcf','#0066AE','#074285','#00187B','#285964','#405F83','#416545','#4D7069','#6E9985','#7EBC89','#0283AF','#79BCBF','#99C19E'];

  var grid = d3.range(25).map(function(i){
    return {'x1':0,'y1':0,'x2':0,'y2':'480'};
  });

  var tickVals = grid.map(function(d,i){
    if(i>0){ return i*10; }
    else if(i===0){ return "100";}
  });

  var xscale = d3.scale.linear()
    .domain([10,250])
    .range([0,722]);

  var yscale = d3.scale.linear()
    .domain([0,categories.length])
    .range([0,480]);

  var colorScale = d3.scale.quantize()
    .domain([0,categories.length])
    .range(colors);

  var canvas = d3.select('#bar_chart svg');

  var grids = canvas.append('g')
    .attr('id','grid')
    .attr('transform','translate(50,10)')
    .selectAll('line')
    .data(grid)
    .enter()
    .append('line')
    .attr({'x1':function(d,i){ return i*30; },
      'y1':function(d){ return d.y1; },
      'x2':function(d,i){ return i*30; },
      'y2':function(d){ return d.y2; },
    })
    .style({'stroke':'#adadad','stroke-width':'1px'});

  var	xAxis = d3.svg.axis();
  xAxis
    .orient('bottom')
    .scale(xscale)
    .tickValues(tickVals);

  var	yAxis = d3.svg.axis();
  yAxis
    .orient('left')
    .scale(yscale)
    .tickSize(2)
    .tickFormat(function(d,i){ return categories[i]; })
    .tickValues(d3.range(17));

  var y_xis = canvas.append('g')
    .attr("transform", "translate(50,0)")
    .attr('id','yaxis')
    .call(yAxis);

  var x_xis = canvas.append('g')
    .attr("transform", "translate(50,480)")
    .attr('id','xaxis')
    .call(xAxis);

  var chart = canvas.append('g')
    .attr("transform", "translate(50,0)")
    .attr('id','bars')
    .selectAll('rect')
    .data(dollars)
    .enter()
    .append('rect')
    .attr('height',19)
    .attr({'x':0,'y':function(d,i){ return yscale(i)+19; }})
    .style('fill',function(d,i){ return colorScale(i); })
    .attr('width',function(d){ return 0; });


  var transit = d3.select("svg").selectAll("rect")
    .data(dollars)
    .transition()
    .duration(1000)
    .attr("width", function(d) {return xscale(d); });

  var transitext = d3.select('#bars')
    .selectAll('text')
    .data(dollars)
    .enter()
    .append('text')
    .attr({'x':function(d) {return xscale(d)-200; },'y':function(d,i){ return yscale(i)+35; }})
    .text(function(d){ return d+"$"; }).style({'fill':'#fff','font-size':'14px'});



}
