import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.scss';
import SIDO_MAP from './SIDO_MAP_2022.json';
import * as d3 from 'd3';
import L from 'leaflet';

const ageGroups = ["infants", "adolescents", "young", "middle", "seniors"];

const Map = ({ selectedRegion, selectedAgeGroup, selectedDiseases, correspondingSubjects, method }) => {
  const [geoData, setGeoData] = useState(SIDO_MAP);
  const [populationData, setPopulationData] = useState({});
  const [hospitalData, setHospitalData] = useState({});
  const [filteredScores, setFilteredScores] = useState({});
  const [minScore, setMinScore] = useState(0);
  const [maxScore, setMaxScore] = useState(0);

  const hasLoadedPopulationData = useRef(false);
  const hasLoadedHospitalData = useRef(false);
  const prevState = useRef({
    selectedRegion: [],
    selectedAgeGroup: '',
    selectedDiseases: [],
    correspondingSubjects: [],
    method: ''
  });

  useEffect(() => {
    if (!hasLoadedPopulationData.current) {
      d3.csv('/data/시도인구.csv').then(data => {
        const population = {};

        data.forEach(row => {
          const region = row['행정기관'];
          population[region] = {};

          ageGroups.forEach(ageGroup => {
            const populationCount = parseInt(row[ageGroup], 10) || 0;
            population[region][ageGroup] = populationCount;
          });
        });

        setPopulationData(population);
        console.log("Population data loaded:", population);
        hasLoadedPopulationData.current = true;
      }).catch(error => {
        console.error("Error fetching population data:", error);
      });
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedHospitalData.current) {
      d3.csv('/data/hospital_data.csv').then(data => {
        const hospitalCounts = {};
        data.forEach(row => {
          const region = row['지역'];
          const subject = row['진료과목'];
          const count = parseInt(row['병원수'], 10);
          if (!hospitalCounts[region]) {
            hospitalCounts[region] = {};
          }
          hospitalCounts[region][subject] = count;
        });
        setHospitalData(hospitalCounts);
        console.log("Hospital data loaded:", hospitalCounts);
        hasLoadedHospitalData.current = true;
      }).catch(error => console.error('Error loading hospital data:', error));
    }
  }, []);

  useEffect(() => {
    const shouldCalculateScores =
      JSON.stringify(prevState.current.selectedRegion) !== JSON.stringify(selectedRegion) ||
      prevState.current.selectedAgeGroup !== selectedAgeGroup ||
      JSON.stringify(prevState.current.selectedDiseases) !== JSON.stringify(selectedDiseases) ||
      JSON.stringify(prevState.current.correspondingSubjects) !== JSON.stringify(correspondingSubjects) ||
      prevState.current.method !== method;

    if (shouldCalculateScores && Object.keys(populationData).length > 0 && Object.keys(hospitalData).length > 0) {
      const scores = {};
      let minScr = Infinity;
      let maxScr = -Infinity;

      selectedRegion.forEach(region => {
        const score = calculateScore(region, method, selectedAgeGroup, correspondingSubjects);
        scores[region] = score;
        if (score < minScr) minScr = score;
        if (score > maxScr) maxScr = score;
      });

      setFilteredScores(scores);
      setMinScore(minScr === Infinity ? 0 : minScr);
      setMaxScore(maxScr === -Infinity ? 0 : maxScr);

      prevState.current = {
        selectedRegion,
        selectedAgeGroup,
        selectedDiseases,
        correspondingSubjects,
        method
      };
    }
  }, [selectedRegion, selectedAgeGroup, selectedDiseases, correspondingSubjects, method, populationData, hospitalData]);

  const calculateScore = (region, method, ageGroup, subjects) => {
    if (method === 'oldMethod') {
      return oldMethod(region);
    } else if (method === 'refinedMethod') {
      return refinedMethod(region, ageGroup, subjects);
    }
    return 0;
  };

  const oldMethod = (region) => {
    if (!hospitalData[region]) {
      console.error(`Missing hospital data for oldMethod calculation: ${region}`);
      return 0;
    }

    if (!populationData[region]) {
      console.error(`Missing population data for oldMethod calculation: ${region}`);
      return 0;
    }

    const totalHospitals = Object.values(hospitalData[region]).reduce((a, b) => a + b, 0);
    const totalPopulation = Object.values(populationData[region]).reduce((a, b) => a + b, 0);
    const score = totalPopulation ? (totalHospitals / (totalPopulation / 100000)) : 0;
    console.log(`Old Method - Region: ${region}, Total Hospitals: ${totalHospitals}, Total Population: ${totalPopulation}, Score: ${score}`);
    return score;
  };

  const refinedMethod = (region, ageGroup, subjects) => {
    if (!hospitalData[region]) {
      console.error(`Missing hospital data for refinedMethod calculation: ${region}`);
      return 0;
    }

    if (!populationData[region]) {
      console.error(`Missing population data for refinedMethod calculation: ${region}`);
      return 0;
    }

    const relevantHospitals = Object.keys(hospitalData[region])
      .filter(subject => subjects.includes(subject))
      .reduce((sum, subject) => sum + hospitalData[region][subject], 0);
    const populationCount = populationData[region][ageGroup];
    const score = populationCount ? (relevantHospitals / (populationCount / 100000)) : 0;
    console.log(`Refined Method - Region: ${region}, Age Group: ${ageGroup}, Relevant Hospitals: ${relevantHospitals}, Population Count: ${populationCount}, Score: ${score}`);
    return score;
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

  return (
    <div className="map-container">
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
            layer.bindPopup(`<b>${region}</b><br>Score: ${score.toFixed(2)}`);
          }}
        />
        <Legend />
      </MapContainer>
    </div>
  );
};

export default Map;

