import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.scss';
import SIDO_MAP from './SIDO_MAP_2022.json';
import * as d3 from 'd3';
import L from 'leaflet';

const ageGroupToCSV = {
  "0~9세": "young.csv",
  "10~19세": "adolescents.csv",
  "20~29세": "infants.csv",
  "30~39세": "middle.csv",
  "40~49세": "middle.csv",
  "50~59세": "middle.csv",
  "60~69세": "seniors.csv",
  "70~79세": "seniors.csv",
  "80~89세": "seniors.csv",
  "90~99세": "seniors.csv",
  "100세 이상": "seniors.csv"
};

const ageGroups = ["0~9세", "10~19세", "20~29세", "30~39세", "40~49세", "50~59세", "60~69세", "70~79세", "80~89세", "90~99세", "100세 이상"];

const Map = ({ selectedRegion, selectedAgeGroup, selectedDiseases, correspondingSubjects }) => {
  const [geoData, setGeoData] = useState(SIDO_MAP);
  const [populationData, setPopulationData] = useState({});
  const [hospitalData, setHospitalData] = useState({});
  const [filteredScores, setFilteredScores] = useState({});
  const [minScore, setMinScore] = useState(0);
  const [maxScore, setMaxScore] = useState(0);
  const [scoreMethod, setScoreMethod] = useState('oldMethod');
  const [selectedRegionData, setSelectedRegionData] = useState(null);

  useEffect(() => {
    d3.csv('/data/시도01-09.csv').then(data => {
      const population = {};

      data.forEach(row => {
        const region = row['행정기관'];
        population[region] = {};

        let totalPopulation = 0;
        ageGroups.forEach(ageGroup => {
          const populationCount = parseInt(row[ageGroup], 10) || 0;
          population[region][ageGroup] = populationCount;
          totalPopulation += populationCount;
        });
        population[region]['total'] = totalPopulation;
      });

      setPopulationData(population);
    });
  }, []);

  useEffect(() => {
    selectedRegion.forEach(region => {
      d3.csv(`/data/시도/${region}.csv`).then(data => {
        setHospitalData(prevData => ({
          ...prevData,
          [region]: data
        }));
      });
    });
  }, [selectedRegion]);

  useEffect(() => {
    if (populationData && hospitalData && selectedAgeGroup && selectedRegion.length > 0) {
      const scores = {};
      let minScr = Infinity;
      let maxScr = -Infinity;

      selectedRegion.forEach(region => {
        const score = calculateScore(region, scoreMethod, selectedAgeGroup, correspondingSubjects);
        scores[region] = score;
        if (score < minScr) minScr = score;
        if (score > maxScr) maxScr = score;
      });


      setFilteredScores(scores);
      setMinScore(minScr === Infinity ? 0 : minScr);
      setMaxScore(maxScr === -Infinity ? 0 : maxScr);
    }
  }, [populationData, hospitalData, selectedAgeGroup, selectedRegion, scoreMethod, correspondingSubjects]);

  const calculateScore = (region, method, ageGroup, subjects) => {
    if (method === 'oldMethod') {
      return oldMethod(region);
    } else if (method === 'refinedMethod') {
      return refinedMethod(region, ageGroup, subjects);
    }
    return 0;
  };

  const oldMethod = (region) => {
    if (!hospitalData[region] || !populationData[region]) {
      console.error(`Missing data for oldMethod calculation: ${region}`); // Debugging
      return 0;
    }

    const totalHospitals = hospitalData[region].length;
    const totalPopulation = populationData[region]['total'];
    console.log(`Old Method - Region: ${region}, Total Hospitals: ${totalHospitals}, Total Population: ${totalPopulation}`); // Debugging
    return totalPopulation ? (totalHospitals / totalPopulation) * 1000 : 0;
  };

  const refinedMethod = (region, ageGroup, subjects) => {
    if (!hospitalData[region] || !populationData[region]) {
      console.error(`Missing data for refinedMethod calculation: ${region}`); // Debugging
      return 0;
    }

    const relevantHospitals = hospitalData[region].filter(hospital => subjects.includes(hospital['진료과목코드명'])).length;
    const populationCount = populationData[region][ageGroup];
    console.log(`Refined Method - Region: ${region}, Relevant Hospitals: ${relevantHospitals}, Population Count: ${populationCount}`); // Debugging
    return populationCount ? (relevantHospitals / populationCount) * 1000 : 0;
  };

  const getColor = (d) => {
    const range = maxScore - minScore;
    return d > minScore + 0.9 * range ? '#006837' :
           d > minScore + 0.7 * range ? '#31a354' :
           d > minScore + 0.5 * range ? '#78c679' :
           d > minScore + 0.3 * range ? '#c2e699' :
           d > minScore + 0.1 * range ? '#ffffcc' :
           d > minScore + 0.05 * range ? '#fed976' :
           d > minScore + 0.01 * range ? '#feb24c' :
                                          '#fd8d3c';
  };

  const style = (feature) => {
    const region = feature.properties.CTP_KOR_NM;
    const score = filteredScores[region] ? filteredScores[region] : 0;
    const fillColor = selectedRegion.includes(region) ? getColor(score) : '#d3d3d3';

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
          minScore,
          minScore + 0.01 * (maxScore - minScore),
          minScore + 0.05 * (maxScore - minScore),
          minScore + 0.1 * (maxScore - minScore),
          minScore + 0.3 * (maxScore - minScore),
          minScore + 0.5 * (maxScore - minScore),
          minScore + 0.7 * (maxScore - minScore),
          minScore + 0.9 * (maxScore - minScore)
        ];

        div.innerHTML += '<h4>Score</h4>';

        for (let i = 0; i < grades.length; i++) {
          div.innerHTML +=
            '<i style="background:' + getColor(grades[i]) + '"></i> ' +
            grades[i].toFixed(2) + (grades[i + 1] ? '&ndash;' + grades[i + 1].toFixed(2) + '<br>' : '+');
        }
        return div;
      };

      legend.addTo(map);

      return () => {
        legend.remove();
      };
    }, [map, minScore, maxScore]);

    return null;
  };

  const handleFeatureClick = (feature, layer) => {
    const region = feature.properties.CTP_KOR_NM;
    const population = populationData[region] ? populationData[region].total : 0;
    const hospitals = hospitalData[region] || [];
    const hospitalCounts = {};

    correspondingSubjects.forEach(subject => {
      hospitalCounts[subject] = hospitals.filter(hospital => hospital['진료과목코드명'] === subject).length;
    });

    console.log(`Region: ${region}, Population: ${population}, Hospital Counts:`, hospitalCounts); // Debugging

    setSelectedRegionData({
      region,
      population,
      hospitalCounts
    });
    console.log(selectedRegionData)
  };

  return (
    <div className="map-container">
      <div className="method-buttons">
      <button onClick={() => setScoreMethod('oldMethod')}>Old Method</button>
        <button onClick={() => setScoreMethod('refinedMethod')}>Refined Method</button>
      </div>
      <MapContainer center={[36.5, 127.5]} zoom={7} className="leaflet-container">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <GeoJSON
          data={geoData}
          style={style}
          onEachFeature={(feature, layer) => {
            const region = feature.properties.CTP_KOR_NM;
            const score = filteredScores[region] ? filteredScores[region] : 0;
            layer.bindTooltip(
              `<div>
                <h4>${region}</h4>
                <p>Score: ${score.toFixed(2)}</p>
              </div>`, {
                direction: 'auto',
                className: 'leaflet-tooltip'
              }
            );

            layer.on({
              click: () => handleFeatureClick(feature, layer)
            });
          }}
        />
        <Legend />
      </MapContainer>
      {selectedRegionData && (
        <div className="report-box">
          <h4>Report for {selectedRegionData.region}</h4>
          <p>Population: {selectedRegionData.population.toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Number of Hospitals</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(selectedRegionData.hospitalCounts).map(([subject, count]) => (
                <tr key={subject}>
                  <td>{subject}</td>
                  <td>{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Map;

