<!DOCTYPE html>
<html>
<head>
  <meta charset=utf-8 />
  <title>Technocomm: EnviroSense</title>

  <meta name='viewport' content='initial-scale=1,maximum-scale=1,user-scalable=no' />
  <link rel="mask-icon" href="../favicon.svg" color="#df5e26">

  <script src='https://api.tiles.mapbox.com/mapbox-gl-js/v2.4.0/mapbox-gl.js'></script>
  <link href='https://api.tiles.mapbox.com/mapbox-gl-js/v2.4.0/mapbox-gl.css' rel='stylesheet' />

  <script src='./libraries/js/jquery/jquery-1.10.1.min.js'></script>
  <script src='./libraries/js/jquery/jquery-ui-1.11.4.custom/jquery-ui.min.js'></script>
  <link rel='stylesheet' href='./libraries/js/jquery/jquery-ui-1.11.4.custom/jquery-ui.min.css' type='text/css' />
  <script src='./libraries/js/taffydb/taffy-min.js'></script>
  <script src='./libraries/js/mustache/mustache.js'></script>
    <script src='./libraries/js/turf/turf.5.1.6.min.js'></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/proj4js/2.3.14/proj4-src.js"></script>

  <script type="text/javascript" src='./libraries/js/parallel/gl/panel_control_class.js'></script>
  <script type="text/javascript" src='./libraries/js/envirosense_map_config.js?'></script>
  <script type="text/javascript" src='./libraries/js/envirosense_map_control.js?'></script>
  <script type="text/javascript" src='./libraries/js/popup_functions.js?'></script>
  <script src="https://use.typekit.net/yqs3woa.js"></script>
  <script>try{Typekit.load({ async: true });}catch(e){}</script>

  <link href='./libraries/styles/gl_maps.css' rel='stylesheet' />
  <link href='./libraries/styles/envirosense.css' rel='stylesheet' />
  
</head>

<body>

<div id='map' style="height: 600px;">

  <div id="panel_control" class='overlay open'></div>

  <div id="info" class='overlay' style="padding-bottom: 12px;">
    <p style="font-size: 14px; font-weight: 600;">Technocomm: EnviroSense</p>
  </div>

</div>

<script>
  

  $(document).ready(function(){

    map_control.setup({})
  })
  
  
</script>

<script>
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-43709910-1', 'parallel.co.uk');
  ga('send', 'pageview');
</script>

</body>
</html>
