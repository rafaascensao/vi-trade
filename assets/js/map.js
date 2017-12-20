function startMap(){
  toggleFlowChoroplethMap(true,false)
  window.addEventListener('resize', function() {
    countries_map.resize();
  });
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
      selectedCountry = geography.properties.name
      refreshDotMatrixChart(selectedCountry,chart_options)
      getLineData(selectedCountry,min_year,max_year)
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
/*
  console.log(firstV)
  console.log(secondV)
  console.log(thirdV)
  console.log(fourthV)
  console.log(fifthV)*/
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
