import React, { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import geojson from './SIDO_MAP_2022.json'; // Make sure the path is correct

const Map = () => {
  useEffect(() => {
    const map = L.map('map').setView([36.5, 127.8], 7); // Centered on South Korea

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.geoJSON(geojson).addTo(map);

    return () => {
      map.remove();
    };
  }, []);

  return (
    <div id="map" style={{ width: '100%', height: '100%' }}></div>
  );
};

export default Map;
