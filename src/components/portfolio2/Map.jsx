import { useEffect, useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.scss';
import SIDO_MAP from './SIDO_MAP_2022.json';
import * as d3 from 'd3';
import L from 'leaflet';

const ageGroups = ["0~9세", "10~19세", "20~29세", "30~39세", "40~49세", "50~59세", "60~69세", "70~79세", "80~89세", "90~99세", "100세 이상"];

const Map = ({ selectedRegion, selectedAgeGroup, selectedDiseases, correspondingSubjects, method }) => {
  const [geoData] = useState(SIDO_MAP);
  const [populationData, setPopulationData] = useState({});
  const [hospitalData, setHospitalData] = useState({});
  const [filteredScores, setFilteredScores] = useState({});
  const [minScore, setMinScore] = useState(0);
  const [maxScore, setMaxScore] = useState(0);
  const [key, setKey] = useState(0);

  const hasLoadedPopulationData = useRef(false);
  const hasLoadedHospitalData = useRef(false);
  const prevState = useRef({
    selectedRegion: [],
    selectedAgeGroup: '',
    selectedDiseases: [],
    correspondingSubjects: [],
    method: ''
  });

  // 인구 데이터 한 번만 가져오기
  useEffect(() => {
    if (!hasLoadedPopulationData.current) {
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
        hasLoadedPopulationData.current = true;
      });
    }
  }, []);

  // 병원 데이터 한 번만 가져오기
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
        hasLoadedHospitalData.current = true;
      }).catch(error => console.error('Error loading hospital data:', error));
    }
  }, []);

  const oldMethod = useCallback((region) => {
    if (!hospitalData[region] || !populationData[region]) {
      return 0;
    }

    const totalHospitals = Object.values(hospitalData[region]).reduce((a, b) => a + b, 0);
    const totalPopulation = populationData[region]['total'];
    return totalPopulation ? (totalHospitals / (totalPopulation / 100000)) : 0;
  }, [hospitalData, populationData]);

  const refinedMethod = useCallback((region, ageGroup, subjects) => {
    if (!hospitalData[region] || !populationData[region]) {
      return 0;
    }

    const relevantHospitals = Object.keys(hospitalData[region])
      .filter(subject => subjects.includes(subject))
      .reduce((sum, subject) => sum + hospitalData[region][subject], 0);
    const populationCount = populationData[region][ageGroup];
    return populationCount ? (relevantHospitals / (populationCount / 100000)) : 0;
  }, [hospitalData, populationData]);

  const calculateScore = useCallback((region, method, ageGroup, subjects) => {
    if (method === 'oldMethod') {
      return oldMethod(region);
    } else if (method === 'refinedMethod') {
      return refinedMethod(region, ageGroup, subjects);
    }
    return 0;
  }, [oldMethod, refinedMethod]);

  // 필요한 경우 점수 재계산
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

      // GeoJSON 컴포넌트를 재렌더링하기 위해 키를 변경
      setKey(prevKey => prevKey + 1);
    }
  }, [selectedRegion, selectedAgeGroup, selectedDiseases, correspondingSubjects, method, populationData, hospitalData, calculateScore]);

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

  const style = useCallback((feature) => {
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
  }, [filteredScores, selectedRegion, minScore, maxScore]);

  const onEachFeature = useCallback((feature, layer) => {
    const region = feature.properties.CTP_KOR_NM;
    const score = filteredScores[region] ? filteredScores[region] : 0;
    layer.bindTooltip(`${region}: ${score.toFixed(2)}`, { permanent: false, direction: 'auto' });
  }, [filteredScores]);

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
    }, [map, minScore, maxScore, getColor]);

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
          key={key} // 키를 변경하여 컴포넌트를 재렌더링
          data={geoData}
          style={style}
          onEachFeature={onEachFeature}
        />
        <Legend />
      </MapContainer>
    </div>
  );
};

export default Map;
