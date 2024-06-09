import { useState, useEffect } from 'react';
import "./regionSelector.scss"

const RegionSelector = ({ onRegionChange }) => {
  const [selectedRegions, setSelectedRegions] = useState([]);

  const regions = ["강원", "경기", "경남", "경북", "광주", "대구", "대전", "부산", "서울", "세종", "울산", "인천", "전남", "전북", "제주", "충남", "충북"];

  const handleCheckboxChange = (event) => {
    const value = event.target.value;
    setSelectedRegions(prevState => 
      prevState.includes(value) 
        ? prevState.filter(region => region !== value) 
        : [...prevState, value]
    );
  };

  useEffect(() => {
    onRegionChange(selectedRegions);
  }, [selectedRegions, onRegionChange]);

  return (
    <div>
      <div className='regiontitle'>
        <h3>시도</h3>
      </div>
      <div className="region-checklist">
        <div className="checklist" style={{ columnCount: 2 }}>
          {regions.map((region) => (
            <div key={region} className="checkbox-wrapper">
              <input
                type="checkbox"
                id={region}
                value={region}
                onChange={handleCheckboxChange}
                checked={selectedRegions.includes(region)}
              />
              <label htmlFor={region}>{region}</label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RegionSelector;
