//Include html
w3.includeHTML();

// MAIN INSIDE THIS FUNCTION ONLY
$(document).ready(function(){
  //Removes loading
  $('.loader').addClass('hidden')


  countries_map = new Datamap({
     scope:'world',
     element: document.getElementById('map'),
     responsive: true,
     //projection: 'mercator',
     done: function(datamap) {
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
   });


  window.addEventListener('resize', function() {
    countries_map.resize();
  });
  refreshArcs(countries_map, newArcs)
});


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

origin = 'PRT'
destinations = ['HRV','SOM','LSO','BRA','USA','RUS','CHN','ESP']
newArcs = createOriginDestinationList(origin, destinations)


/* ZOOM */
function zoomToArea(area,scale){
  zoom.scale(scale).translate(area).event(countries_map.svg.selectAll("g"))
}
