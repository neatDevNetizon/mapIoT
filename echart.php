<!doctype html>
<html>
    <head>
        <meta charset="utf-8">
                 <title>3D map histogram-mapbox</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
        <meta name="apple-mobile-web-app-capable" content="yes"> <!-- Fullscreen Landscape on iOS -->
        <!-- <link rel="stylesheet" href="./common.css"> -->
    </head>
    <body>
        <div id="main" style="width: 100%; height: 500px;"></div>
        <script src="./js/echarts.js"></script>
        <script src="./js/echarts-gl.js"></script>

        <script src="https://api.tiles.mapbox.com/mapbox-gl-js/v2.4.0/mapbox-gl.js"></script>
        <link
          href="https://api.tiles.mapbox.com/mapbox-gl-js/v2.4.0/mapbox-gl.css"
          rel="stylesheet"
        />
        <script src="https://code.jquery.com/jquery-1.11.1.min.js"></script>
        <!-- <script src="./data/capitals.js"></script> -->
        <script src="https://cdn.jsdelivr.net/npm/maptalks/dist/maptalks.min.js"></script>
        <script src="js/commonUI.js"></script>
        <script>
            mapboxgl.accessToken ='pk.eyJ1IjoibWFsLXdvb2QiLCJhIjoiY2oyZ2t2em50MDAyMzJ3cnltMDFhb2NzdiJ9.X-D4Wvo5E5QxeP7K_I3O8w';
            var chart = echarts.init(document.getElementById('main'));
            // var map = new mapboxgl.Map({
            //     container: 'main',
            //     style: 'mapbox://styles/mapbox/dark-v10',
            //     center: [-79.999732, 40.4374],
            //     zoom: 11
            //   });
            $.getJSON('./population.json', function (data) {

                data = data.filter(function (dataItem) {
                    return dataItem[2] > 0;
                }).map(function (dataItem) {
                    return [dataItem[0], dataItem[1], dataItem[2]];
                });

                chart.setOption({
                    visualMap: {
                        show: false,
                        max: 1000,
                        calculable: true,
                        realtime: false,
                        inRange: {
                            color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
                        },
                        outOfRange: {
                            colorAlpha: 0
                        }
                    },
                    mapbox3D: {
                        center: [-83,76.5],
                        zoom: 3,
                        pitch: 50,
                        bearing: -10,
                        boxHeight: 50,
                        // altitudeScale: 1e2,
                        postEffect: {
                            enable: true,
                            screenSpaceAmbientOcclusion: {
                                enable: true,
                                radius: 2
                            }
                        },
                        light: {
                            main: {
                                intensity: 2,
                                shadow: true,
                                shadowQuality: 'high'
                            },
                            ambient: {
                                intensity: 0.
                            },
                            ambientCubemap: {
                                // texture: 'asset/canyon.hdr',
                                exposure: 2,
                                diffuseIntensity: 0.5
                            }
                        }
                    },
                    series: [{
                        type: 'bar3D',
                        coordinateSystem: 'mapbox3D',
                        shading: 'lambert',
                        minHeight: 0.1,
                        barSize: 0.1,
                        data: data,
                        silent: true,
                    }]
                });
            });

            window.addEventListener('resize', function () {
                chart.resize();
            });

 
        </script>
    </body>
</html>