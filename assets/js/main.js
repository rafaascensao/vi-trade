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
           datamap.svg.selectAll('.datamaps-subunit').on('click', function(geography) {
               console.log(geography.properties.name);
               console.log(geography)
           });
       }
   });

  countries_map.arc([{
     origin: 'RUS',
     destination: 'USA',
     options: {
       greatArc: true,
       animationSpeed: 92000
     }
   }]);


  window.addEventListener('resize', function() {
    map.resize();
  });
});
