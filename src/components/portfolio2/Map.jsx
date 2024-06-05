import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.scss';
import SIDO_MAP from './SIDO_MAP_2022.json';  // Ensure the path is correct
import * as d3 from 'd3';

const Map = () => {
  const [geoData, setGeoData] = useState(SIDO_MAP);
  const [populationData, setPopulationData] = useState({});
  const [selectedRegion, setSelectedRegion] = useState(null);

  useEffect(() => {
    d3.csv('/data/시도01-09.csv').then(data => {
      const population = {};

      data.forEach(row => {
        const region = row['행정기관'];
        const totalPopulation = Object.keys(row)
          .filter(key => key.includes('세'))
          .reduce((sum, key) => sum + parseInt(row[key], 10), 0);

        if (!population[region]) {
          population[region] = 0;
        }
        population[region] += totalPopulation;
      });

      setPopulationData(population);
    });
  }, []);

  const getColor = (d) => {
    return d > 1000000 ? '#800026' :
           d > 500000  ? '#BD0026' :
           d > 200000  ? '#E31A1C' :
           d > 100000  ? '#FC4E2A' :
           d > 50000   ? '#FD8D3C' :
           d > 20000   ? '#FEB24C' :
           d > 10000   ? '#FED976' :
                         '#FFEDA0';
  };

  const style = (feature) => {
    const region = feature.properties.CTP_KOR_NM;
    const population = populationData[region] ? populationData[region] : 0;
    return {
      fillColor: getColor(population),
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7
    };
  };

  const onEachFeature = (feature, layer) => {
    layer.on({
      click: () => {
        setSelectedRegion(feature);
      }
    });
  };

  return (
    <div className="map">
      <div className='button'>
        <button className='modebutton'>기존 방식</button>
        <button className='modebutton'>새로운 방식</button>
      </div>
      <MapContainer center={[36.5, 127.5]} zoom={7} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <GeoJSON data={geoData} style={style} onEachFeature={onEachFeature}>
          {selectedRegion && (
            <Popup
              position={[
                selectedRegion.geometry.coordinates[0][0][1],
                selectedRegion.geometry.coordinates[0][0][0],
              ]}
            >
              <div>
                <h4>{selectedRegion.properties.CTP_KOR_NM}</h4>
                <p>Population: {populationData[selectedRegion.properties.CTP_KOR_NM] || 0}</p>
              </div>
            </Popup>
          )}
        </GeoJSON>
      </MapContainer>
    </div>
  );
};

export default Map;
