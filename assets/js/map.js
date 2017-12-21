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
    x.push(parseFloat(globalProducts[flow][product][count][year]))}
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
    value = parseFloat(globalProducts[flow][product][count][year])
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




function createMap(type){
  mapObj = {}

  mapObj.type = type

  mapObj.map = new Datamap({
    scope: 'world',
    element: document.getElementById('map'),
    responsive: true,
    fills: {
      defaultFill: 'rgb(129,129,129)'
    },
    done: function(datamap){
      interactMap(datamap)
    }
  });

  mapObj.updateMap = function(type){
    mapObj.type = type
    mapObj.resetAllColors()
    if( type == "Country" ){
      // SELECT COUNTRY
      d = {}
      d[selectedCode] = "rgba(55,174,174,1)"
      setTimeout(function(){mapObj.map.updateChoropleth(d)},50)
    }else{
      mapObj.fillCloropleth(getSelectedProduct())
    }
  }

  function interactMap(datamap){
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
      selectedCode = geography.properties.iso
      refreshDotMatrixChart(selectedCountry,chart_options)
      getLineData(selectedCountry,min_year,max_year)
      origin = geography.properties.iso
      destinations = ['HRV','SOM','LSO','BRA','USA','RUS','CHN','ESP']
      mapObj.refreshArcs(mapObj.createOriginDestinationList(origin, destinations))
      console.log("generating datadot with selectedCountry: "+selectedCountry)
      clevChart.update(generateDataDot(selectedCountry, "Portugal",year))
      if(currentView == 'Product'){
        currentView = 'Country';
        // REFRESH DOT MATRIX PLOT
        toggleViews()
      }
      mapObj.updateMap(currentView)


    //  console.log(geography.properties.name);
    //  console.log(geography)
    });
  }
  /* ARCS */
  mapObj.createOriginDestinationList = function(origin, destinations){
  	res = [];
  	destinations.forEach(function(el){
      res.push({ origin: origin, destination: el})
  	});
  	return res
  }

  mapObj.removeArcs = function(){
  	mapObj.map.svg.selectAll('path.datamaps-arc').remove()
  }

  mapObj.refreshArcs = function(newArcs){
  	mapObj.removeArcs();
    stroke_width = 6;
    i = 0

    newArcs.forEach(function(el){
      el.options = { strokeWidth: stroke_width -= 0.5 ,
                      strokeColor: convertColorToString(productsColors[i])}
      i++;
    })
  	mapObj.map.arc(newArcs, );
  }
  /* ZOOM */
  mapObj.zoomToArea = function(area,scale){
    zoom.scale(scale).translate(area).event(mapObj.map.svg.selectAll("g"))
  }

  // RESET COLORS COUNTRIES
  mapObj.resetAllColors = function(){
    d = { }
    Datamap.prototype.worldTopo.objects.world.geometries.forEach(function(element){
      d[element["id"]] = "rgba(129,129,130,1)";
    })
    mapObj.map.updateChoropleth(d)
  }

  mapObj.fillCloropleth = function(product){
    dic = { }
    step = computeQuintiles(product)
    x = []
    countries.forEach(function(count){
      if (count != " World" && count != "European Union"){
      x.push(parseFloat(globalProducts[flow][product][count][year]))}
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
      value = parseFloat(globalProducts[flow][product][count][year])
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

    mapObj.resetAllColors();
    mapObj.map.updateChoropleth(dic)
  }



  return mapObj;
}
