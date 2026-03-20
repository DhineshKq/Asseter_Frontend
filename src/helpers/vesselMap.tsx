// MapComponent.js
import { useEffect } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import { fromLonLat } from 'ol/proj';
import OSM from 'ol/source/OSM';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import 'ol/style/Style';
import 'ol/style/Fill';
import 'ol/style/Circle';
import '../../src/styles/pages/dashboard/dashboard.scss'
interface prop {
    privioussailedRoute: any[]
    currentPositionDetails: any
    startLocation: any
}
const VesselMap = ({ currentPositionDetails, startLocation, privioussailedRoute }: prop) => {
    useEffect(() => {
        // Initialize the map when the component mounts
        const map: any = new Map({
            target: "map",
            layers: [
                new TileLayer({
                    source: new OSM(),
                }),
            ],
            view: new View({
                center: [0, 3000000],
                zoom: 2,
            }),
        });

        // Create a vector source for markers
        const vectorSource = new VectorSource();
        const vectorLayer = new VectorLayer({
            source: vectorSource,
        });
        map.addLayer(vectorLayer);
        const currentPosition = new Feature({
            geometry: new Point(fromLonLat([parseFloat(currentPositionDetails.longitude), parseFloat(currentPositionDetails.latitude)])),
            label: "Current Location",
            geometryName: "Current Location"
        });

        // Style the marker
        currentPosition.setStyle(
            new Style({
                image: new CircleStyle({
                    radius: 12,
                    fill: new Fill({
                        color: '#efc648',
                    }),
                    stroke: new Stroke({
                        color: '#002656',
                        width: 4,
                        lineDash: [7.5, 1, 7.5, 7.5],
                        lineCap: 'square',
                        lineDashOffset: 10,
                        lineJoin: "round",
                        miterLimit: 1000
                    }),
                }),
            })
        );

        // Add the marker to the vector source
        vectorSource.addFeature(currentPosition);

        const startPosition = new Feature({
            geometry: new Point(fromLonLat([parseFloat(startLocation.longitude), parseFloat(startLocation.latitude)])),
            label: "Start Location",
            geometryName: "Start Location"
        });

        // Style the marker
        startPosition.setStyle(
            new Style({
                image: new CircleStyle({
                    radius: 6,
                    fill: new Fill({
                        color: '#efc648',
                    }),
                    stroke: new Stroke({
                        color: '#002656',
                        width: 2,
                    }),
                }),
            })
        );

        // Add the marker to the vector source
        vectorSource.addFeature(startPosition);

        // privioussailedRoute.map((previous: any) => {
        //     // Add a marker to the vector source
        //     const marker = new Feature({
        //         geometry: new Point(fromLonLat([parseFloat(previous.longitude), parseFloat(previous.latitude)])),
        //         label: "LABEL",
        //         geometryName: previous.noonReportId
        //     });

        //     // Style the marker
        //     marker.setStyle(
        //         new Style({
        //             image: new CircleStyle({
        //                 radius: 2,
        //                 fill: new Fill({
        //                     color: 'white',
        //                 }),
        //                 stroke: new Stroke({
        //                     color: 'blue',
        //                     // width: 1,
        //                 }),
        //             }),
        //         })
        //     );
        //     // Add the marker to the vector source
        //     vectorSource.addFeature(marker);
        // });
        (privioussailedRoute || []).map((previous: any) => {
            // Add a marker to the vector source
            const marker = new Feature({
                geometry: new Point(fromLonLat([parseFloat(previous.longitude), parseFloat(previous.latitude)])),
                label: "LABEL",
                geometryName: previous.noonReportId
            });

            // Style the marker
            marker.setStyle(
                new Style({
                    image: new CircleStyle({
                        radius: 2,
                        fill: new Fill({
                            color: 'white',
                        }),
                        stroke: new Stroke({
                            color: 'blue',
                            // width: 1,
                        }),
                    }),
                })
            );
            // Add the marker to the vector source
            vectorSource.addFeature(marker);
        });

        return () => {
            map.setTarget(null);
        };
    }, [currentPositionDetails]);

    return (
        <div>
            <div id="map" style={{
                width: '100%',
                height: 'calc(100vh - 400px)',
                borderRadius: "4px"
            }}></div>
        </div>
    );
};

export default VesselMap;