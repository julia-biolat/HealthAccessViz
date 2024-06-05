import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';

const DiseaseSelector = ({ onDiseaseChange }) => {
  const [diseases, setDiseases] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDiseases, setFilteredDiseases] = useState([]);

  useEffect(() => {
    const loadDiseases = async () => {
      try {
        const data = await d3.csv('/data/질병병원.csv');
        const uniqueDiseases = [...new Set(data.map(item => item.질병))];
        setDiseases(data);
        setFilteredDiseases(data);
      } catch (error) {
        console.error("Error loading diseases:", error);
      }
    };

    loadDiseases();
  }, []);

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredDiseases(diseases);
    } else {
      setFilteredDiseases(
        diseases.filter(disease =>
          disease.질병.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, diseases]);

  const handleChange = (event) => {
    const selectedOptions = Array.from(event.target.selectedOptions).map(option => option.value);
    onDiseaseChange(selectedOptions);
  };

  return (
    <div className="disease-selector">
      <h3>질병 선택</h3>
      <input
        type="text"
        placeholder="Search disease..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <select multiple={true} onChange={handleChange} size={10} style={{ overflowY: 'scroll' }}>
        {filteredDiseases.map((disease) => (
          <option key={disease.질병} value={disease.질병}>{disease.질병}</option>
        ))}
      </select>
    </div>
  );
};

export default DiseaseSelector;
