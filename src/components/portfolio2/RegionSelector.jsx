import React from 'react';

const regions = ["강원", "경기", "경남", "경북", "광주", "대구", "대전", "부산", "서울", "세종시", "울산", "인천", "전남", "전북", "제주", "충남", "충북"];

const RegionChecklist = ({ onRegionChange }) => {
  const handleChange = (event) => {
    onRegionChange(event.target.value);
  };

  return (
    <div className="region-checklist">
      <h3>시도</h3>
      {regions.map((region) => (
        <div key={region}>
          <input type="radio" name="region" value={region} onChange={handleChange} />
          <label>{region}</label>
        </div>
      ))}
    </div>
  );
};

export default RegionChecklist;
