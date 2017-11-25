// Trade dataset
var dataset;
var countries_map;
//Include html
w3.includeHTML(startViews);

// MAIN INSIDE THIS FUNCTION ONLY
function startViews(){
  //Removes loading
  $('.loader').addClass('hidden')
//  open();
  startTimeline()

  startMap()



}



/* Open file and shit */
function open(){
  d3.csv("../../dataGather/exports.csv", function(data){
    console.log(data[0]);
    dataset = data;
  })
}
function startTimeline(){
  $('.timeline .options p').click(toggleButtons);

  $( ".timeline .slider .slide" ).slider({
      range: "max",
      min: 1989,
      max: 2015,
      value: 2,
      slide: function( event, ui ) {
        $( "#amount" ).val( ui.value );
        if(ui.value == 1989 || ui.value == 2015)
          $('.timeline .slider .slide span .year').text('')
        else
          $('.timeline .slider .slide span .year').text(ui.value);

      }
    });
    $('.timeline .slider .slide').append("<div class='left-slide'><div class='min-max-year'>1989</div></div><div class='right-slide'><div class='min-max-year'>2015</div></div>")
    $('.timeline .slider .slide span').append("<div class='year'></div>")
    $( "#amount" ).val( $( "#slider-range-max" ).slider( "value" ) );


  function toggleButtons(){
    $(this).parent().find('p').toggleClass('hidden-class')
    if($(this).parent().find('p:not(.hidden-class)').text() == "Country"){
      toggleFlowChoroplethMap(false,true);
    }else if ($(this).parent().find('p:not(.hidden-class)').text() == "Product") {
      toggleFlowChoroplethMap(true,false);
    }
  }

}


function toggleFlowChoroplethMap(choropleth_map=false,flow_map=true){
  if(choropleth_map){
    if(countries_map == undefined){
      countries_map = new Datamap({
         scope:'world',
         element: document.getElementById('map'),
         responsive: true,
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
