import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';

const DiseaseSelector = ({ onDiseaseChange }) => {
  const [data, setData] = useState([]);
  const [uniqueDiseases, setUniqueDiseases] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDiseases, setFilteredDiseases] = useState([]);
  const [selectedDiseases, setSelectedDiseases] = useState([]);

  useEffect(() => {
    const loadDiseases = async () => {
      try {
        const data = await d3.csv('/data/질병병원.csv');
        const diseases = Array.from(new Set(data.map(d => d.질병)));
        setData(data);
        setUniqueDiseases(diseases);
        setFilteredDiseases(diseases);
      } catch (error) {
        console.error("Error loading diseases:", error);
      }
    };

    loadDiseases();
  }, []);

  useEffect(() => {
    setFilteredDiseases(
      uniqueDiseases.filter(disease =>
        disease.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, uniqueDiseases]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleCheckboxChange = (event) => {
    const value = event.target.value;
    setSelectedDiseases(prevState =>
      prevState.includes(value)
        ? prevState.filter(disease => disease !== value)
        : [...prevState, value]
    );
  };

  useEffect(() => {
    const selectedDepartments = data.filter(d =>
      selectedDiseases.includes(d.질병)
    ).map(d => d.진료과목);
    onDiseaseChange(selectedDiseases, selectedDepartments);
  }, [selectedDiseases, data, onDiseaseChange]);

  return (
    <div>
      <div className='diseasetitle'>
        <h>질병 선택</h>
      </div>
      <div className="disease-selector">
        <div className='Input'>
          <input
            type="text"
            placeholder="Search disease..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        
        <div className="checklist" style={{ overflowY: 'scroll', maxHeight: '200px' }}>
          {filteredDiseases.map((disease) => (
            <div key={disease} className="checkbox-wrapper">
              <input
                type="checkbox"
                id={disease}
                value={disease}
                onChange={handleCheckboxChange}
                checked={selectedDiseases.includes(disease)}
              />
              <label htmlFor={disease}>{disease}</label>
            </div>
          ))}
        </div>
      </div>
    </div>
    
  );
};

export default DiseaseSelector;
