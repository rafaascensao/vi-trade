function startTimeline(){
  /*
    Calls:
      fillCloropleth(product)
      refreshBarChart()
      toggleFlowChoroplethMap(bool choropleth_map,bool flow_map)
    Defines:
      toggleButtons()
      selectProduct()
  */
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
      refreshDotMatrixChart(selectedCountry,chart_options)
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

      // ISTO SO FICA ASSIM PARA ESTA ENTREGA, DEPOIS
      // ESTE CANCRO DESAPARECE DAQUI
      $('.country_view').removeClass('hide');
      $('.cleveland_dot_plot').removeClass('hide');
      $('.bar-chart_container').addClass('hide')
      $('#bar_chart svg > *').remove();

      $('.description').addClass('country-view')
    }else if ($(this).parent().find('p:not(.hidden-class)').text() == "Product") {
      toggleFlowChoroplethMap(true,false);
      refreshBarChart();


      // ISTO SO FICA ASSIM PARA ESTA ENTREGA, DEPOIS
      // ESTE CANCRO DESAPARECE DAQUI
      $('.country_view').addClass('hide');
      $('.cleveland_dot_plot').addClass('hide');
      $('.bar-chart_container').removeClass('hide')


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
