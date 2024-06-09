import { useState, useEffect } from 'react';
import * as d3 from 'd3';
import "./diseaseSelector.scss"

const DiseaseSelector = ({ onDiseaseChange }) => {
  const [data, setData] = useState([]);
  const [uniqueDiseases, setUniqueDiseases] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDiseases, setFilteredDiseases] = useState([]);
  const [selectedDiseases, setSelectedDiseases] = useState([]);
  const [correspondingSubjects, setCorrespondingSubjects] = useState([]);

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
    ).map(d => d.진료과목명);
    const Subjects = Array.from(new Set(selectedDepartments));
    setCorrespondingSubjects(Subjects);
    onDiseaseChange(selectedDiseases, selectedDepartments);
  }, [selectedDiseases, data, onDiseaseChange]);

  return (
    <div>
      <div className='disease-subject'>
        <div className='disease-selector'>
          <div className='diseasetitle'>
            <h5 className="jua-regular3">질병 선택</h5>
          </div>
            <input
              className='inputs'
              type="text"
              placeholder="알고싶은 질병을 검색하세요"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          <div className="checklist">
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
        <div className='subject-selector'>
          <div className='diseasetitle'>
            <h5 className="jua-regular3">진료 과목</h5>
          </div>
          <div className="subject-list">
            {correspondingSubjects.map((subject, index) => (
              <div key={subject} className="subject-item" style={{ backgroundColor: getColor(index), color: 'white' }}>
                {subject}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const getColor = (index) => {
  const colors = ['#FFDDC1', '#FFABAB', '#FFC3A0', '#FF677D', '#D4A5A5', '#392F5A', '#31A2AC', '#61C0BF', '#6B4226', '#D9BF77'];
  return colors[index % colors.length];
};

export default DiseaseSelector;
