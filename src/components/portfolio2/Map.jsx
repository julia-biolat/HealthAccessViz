import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.scss';
import SIDO_MAP from './SIDO_MAP_2022.json';  // Ensure the path is correct
import * as d3 from 'd3';
import L from 'leaflet';

const Map = ({ selectedRegion, selectedAgeGroup, selectedDiseases, correspondingSubjects }) => {
  const [geoData, setGeoData] = useState(SIDO_MAP);
  const [populationData, setPopulationData] = useState({});
  const [filteredPopulationData, setFilteredPopulationData] = useState({});
  const [minPopulation, setMinPopulation] = useState(0);
  const [maxPopulation, setMaxPopulation] = useState(0);

  useEffect(() => {
    d3.csv('/data/시도01-09.csv').then(data => {
      const population = {};

      data.forEach(row => {
        const region = row['행정기관'];
        population[region] = {};

        ageGroups.forEach(ageGroup => {
          population[region][ageGroup] = parseInt(row[ageGroup], 10) || 0;
        });
      });

      setPopulationData(population);
    });
  }, []);

  useEffect(() => {
    if (populationData && selectedAgeGroup) {
      const filteredData = {};
      let minPop = Infinity;
      let maxPop = -Infinity;

      Object.keys(populationData).forEach(region => {
        const population = populationData[region][selectedAgeGroup] || 0;
        filteredData[region] = population;
        if (selectedRegion.includes(region)) {
          if (population < minPop) minPop = population;
          if (population > maxPop) maxPop = population;
        }
      });

      setFilteredPopulationData(filteredData);
      setMinPopulation(minPop === Infinity ? 0 : minPop);
      setMaxPopulation(maxPop === -Infinity ? 0 : maxPop);
    }
  }, [populationData, selectedAgeGroup, selectedRegion]);

  const getColor = (d) => {
    const range = maxPopulation - minPopulation;
    return d > minPopulation + 0.9 * range ? '#006837' :
           d > minPopulation + 0.7 * range ? '#31a354' :
           d > minPopulation + 0.5 * range ? '#78c679' :
           d > minPopulation + 0.3 * range ? '#c2e699' :
           d > minPopulation + 0.1 * range ? '#ffffcc' :
           d > minPopulation + 0.05 * range ? '#fed976' :
           d > minPopulation + 0.01 * range ? '#feb24c' :
                                              '#fd8d3c';
  };

  const style = (feature) => {
    const region = feature.properties.CTP_KOR_NM;
    const population = filteredPopulationData[region] ? filteredPopulationData[region] : 0;
    const fillColor = selectedRegion.includes(region) ? getColor(population) : '#d3d3d3';

    return {
      fillColor: fillColor,
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7
    };
  };

  const Legend = () => {
    const map = useMap();

    useEffect(() => {
      const legend = L.control({ position: 'bottomleft' });

      legend.onAdd = () => {
        const div = L.DomUtil.create('div', 'info legend');
        const grades = [
          minPopulation,
          minPopulation + 0.01 * (maxPopulation - minPopulation),
          minPopulation + 0.05 * (maxPopulation - minPopulation),
          minPopulation + 0.1 * (maxPopulation - minPopulation),
          minPopulation + 0.3 * (maxPopulation - minPopulation),
          minPopulation + 0.5 * (maxPopulation - minPopulation),
          minPopulation + 0.7 * (maxPopulation - minPopulation),
          minPopulation + 0.9 * (maxPopulation - minPopulation)
        ];
        const labels = [];

        div.innerHTML += '<h4>Population</h4>';

        for (let i = 0; i < grades.length; i++) {
          div.innerHTML +=
            '<i style="background:' + getColor(grades[i]) + '"></i> ' +
            grades[i].toFixed(0) + (grades[i + 1] ? '&ndash;' + grades[i + 1].toFixed(0) + '<br>' : '+');
        }
        return div;
      };

      legend.addTo(map);

      return () => {
        legend.remove();
      };
    }, [map, minPopulation, maxPopulation]);

    return null;
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
        <GeoJSON
          data={geoData}
          style={style}
          onEachFeature={(feature, layer) => {
            layer.bindTooltip(
              `<div>
                <h4>${feature.properties.CTP_KOR_NM}</h4>
                
              </div>`, {
                direction: 'auto',
                className: 'leaflet-tooltip'
              }
            );
          }}
        />
        <Legend />
      </MapContainer>
    </div>
  );
};

const ageGroups = ["0~9세", "10~19세", "20~29세", "30~39세", "40~49세", "50~59세", "60~69세", "70~79세", "80~89세", "90~99세", "100세 이상"];

export default Map;
