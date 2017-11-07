//Include html
w3.includeHTML();

// MAIN INSIDE THIS FUNCTION ONLY
$(document).ready(function(){
  //Removes loading
  $('.loader').addClass('hidden')


  var map = new Datamap({
     element: document.getElementById('map'),
     responsive: true
   });
   map.arc([{
     origin: {
       latitude: 61,
       longitude: -149
     },
     destination: {
       latitude: -22,
       longitude: -43
     }
   }], {
     greatArc: true,
     animationSpeed: 2000
   });


  window.addEventListener('resize', function() {
    map.resize();
  });




});
