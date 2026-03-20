// MapComponent.js
import React, { useEffect, useState } from 'react';
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
import Point from 'ol/geom/Point';  // Import Point directly from 'ol'
// Add these imports to your MapComponent.js file
import 'ol/style/Style';
import 'ol/style/Fill';
import 'ol/style/Circle';
import Overlay from 'ol/Overlay';
import { axiosPrivate } from '../middleware/axios-api';
import '../../src/styles/pages/dashboard/dashboard.scss'
import images from '../../src/assets/images/locationplot.svg'
import { useNavigate } from 'react-router-dom';
import { NoonReportsDetailsUpdator } from '../redux/action';
import { useDispatch } from 'react-redux';

const MapComponent = ({ LocationDatas }: any) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const map: any = new Map({
            target: 'map',
            layers: [
                new TileLayer({
                    source: new OSM(),
                }),
            ],
            view: new View({
                center: [0, 0],
                zoom: 2,
            }),
        });

        // Create a vector source for markers
        const vectorSource = new VectorSource();
        const vectorLayer = new VectorLayer({
            source: vectorSource,
        });
        map.addLayer(vectorLayer);

        LocationDatas && LocationDatas.map((data: any) => {
            const marker = new Feature({
                geometry: new Point(fromLonLat([parseFloat(data.longitude), parseFloat(data.latitude)])),
                label: data.name,
                geometryName: data.vessel_id
            });

            // Style the marker
            marker.setStyle(
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
                        rotation: 5,
                        scale: 1,
                        rotateWithView: true,
                    }),

                })
            );
            // Add the marker to the vector source
            vectorSource.addFeature(marker);
        });

        let popupElement: any = document.createElement('div')
        popupElement.className = 'map-pointer-hover';
        popupElement.style.position = 'absolute';
        popupElement.style.backgroundColor = 'white';
        popupElement.style.padding = '5px';
        popupElement.style.borderRadius = '5px';
        popupElement.style.minWidth = '250px';
        popupElement.style.width = '260px';
        popupElement.style.height = 'auto';
        popupElement.style.bottom = '5px';
        popupElement.style.left = '0px';
        popupElement.style.margin = 'auto';
        popupElement.style.right = '0px';
        popupElement.style.zIndex = '20';
        popupElement.style.clipPath = 'polygon(0% 0%, 100% 0%, 100% 81%, 7% 81%, 0 100%, 0 87%, 0 66%)';

        const overlay: any = new Overlay({
            element: popupElement || undefined,
            autoPan: {
                animation: {
                    duration: 250,
                },
            },
        });

        map.addOverlay(overlay);
        map.on('pointermove', function (event: any) {
            const feature = map.forEachFeatureAtPixel(event.pixel, function (feature: any) {
                return feature;
            });

            if (feature) {
                const coordinates = feature.getGeometry().getCoordinates();
                const label = feature.get('label');
                const geometryName = feature.get('geometryName');
                overlay.setPosition(coordinates);
                const foundedObj: any = LocationDatas.find((Obj: any) => Obj.vessel_id
                    === geometryName);
                overlay.getElement().innerHTML = `
                    <div style="display:flex;align-items: center;justify-content: space-evenly;gap:5px;border:2px solid #002656;margin-bottom: 15px;border-radius:5px;color:#002656"> 
                        <div>
                            <img src="${foundedObj.country_code_A2 ? '/country-flags-main/png1000px/' + foundedObj.country_code_A2.toLowerCase() + '.png' : ''}" alt="" style="background-color: red; width: 50px; vertical-align: text-bottom; margin: 5px;box-shadow: 6px 5px 9px rgba(41, 82, 133, 0.3019607843)" />
                        </div>
                        <div>
                            <p style="margin:0;">Vessel : <b>${label}</b></p>
                          
                            <p style="margin:0;">IMO  : ${foundedObj.IMO_Number}</p>
                        </div>
                    </div>`;
            } else {
                overlay.setPosition(undefined);
            }
        });

        map.on('click', async function (event: any) {
            const feature = map.forEachFeatureAtPixel(event.pixel, function (feature: any) {
                return feature;
            });
            if (feature) {
                const geometryName = feature.get('geometryName');
                try {
                    const response = await axiosPrivate.post('/LocateVessel/current/voyage', { vessel_id: geometryName });
                    dispatch(NoonReportsDetailsUpdator(response.data.location));
                    navigate(`/locate-vessel`);
                } catch (error) {
                    console.log("geometryName", error)
                }
            }
        });

        // Add keydown event listeners for zoom in, zoom out, and moving
        const handleKeyDown = (event: KeyboardEvent) => {
            const mapView = map.getView();
            let mapZoom = mapView.getZoom();
            const panStep = 1000000; // Adjust this value for the desired moving distance
            let center = mapView.getCenter();

            switch (event.key) {
                case '+':
                    mapView.setZoom(mapZoom + 1);
                    break;
                case '-':
                    mapView.setZoom(mapZoom - 1);
                    break;
                case 'ArrowUp':
                    center = [center[0], center[1] + panStep];
                    mapView.setCenter(center);
                    break;
                case 'ArrowDown':
                    center = [center[0], center[1] - panStep];
                    mapView.setCenter(center);
                    break;
                case 'ArrowLeft':
                    center = [center[0] - panStep, center[1]];
                    mapView.setCenter(center);
                    break;
                case 'ArrowRight':
                    center = [center[0] + panStep, center[1]];
                    mapView.setCenter(center);
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            overlay.getElement().remove();
            map.setTarget(null);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [LocationDatas]);

    return (
        <div>
            <div id="map" style={{ width: '100%', height: '72vh' }}></div>
        </div>
    );
};

export default MapComponent;
