import { useRef, useState } from "react";
import "./portfolio2.scss";
import { motion, useScroll, useSpring } from "framer-motion";
import SliderAge from './SliderAge';
import RegionSelector from './RegionSelector';
import DiseaseSelector from './DiseaseSelector';
import Map from './Map';
import oldFormulaImage from './old수식.png';
import refinedFormulaImage from './refined수식.png';

const Portfolio2 = () => {
  const ref = useRef();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["end end", "start start"],
  });

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
  });

  const [selectedRegion, setSelectedRegion] = useState([]);
  const [selectedDiseases, setSelectedDiseases] = useState([]);
  const [correspondingSubjects, setCorrespondingSubjects] = useState([]);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState(null);

  const handleRegionChange = (region) => {
    setSelectedRegion(region);
  };

  const handleDiseaseChange = (diseases, subjects) => {
    setSelectedDiseases(diseases);
    setCorrespondingSubjects(subjects);
  };

  const handleAgeGroupChange = (ageGroup) => {
    setSelectedAgeGroup(ageGroup);
  };

  return (
    <div className="portfolio" ref={ref}>
      <div className="progress">
        <h1 className="jua-regular">의료 접근성 분석</h1>
        <motion.div style={{ scaleX }} className="progressBar"></motion.div>
      </div>
      <section>
      <div className="container">
          <div className="wrapper">
            <motion.div className="text-container">
              <h1 className="jua-regular">
              인구 특성을 고려하느냐 안 하느냐는 의료 접근성 지수 평가에 매우 중요한 요소이다.
              </h1>
            </motion.div>
            <div className="formula-container">
              <img src={oldFormulaImage} alt="Old Method Formula" />
              <h1 className="jua-regular">
                old method: 질병, 인구 특성을 고려하지 않는다
              </h1>
              <img src={refinedFormulaImage} alt="Refined Method Formula" />
              <h1 className="jua-regular">
                refined method:
                선택된 질병들에 대응할 수 있는 병원만 표시하여 질병 특성을 고려하고
                선택된 연령대의 인구만 활용하면서 연령대별 차이를 보인다
              </h1>
            </div>
          </div>
        </div>
      </section>
      <section>
        <div className="container">
          <div className="wrapper">
            <motion.div className="text-container">
            </motion.div>
            <div className="Controller">
              <SliderAge onAgeGroupChange={handleAgeGroupChange} />
              <RegionSelector onRegionChange={handleRegionChange} />
              <DiseaseSelector onDiseaseChange={handleDiseaseChange} />
            </div>
            <div className="maps-container">
              <div className="map-wrapper">
                <h4>Old Method</h4>
                <Map
                  selectedRegion={selectedRegion}
                  selectedAgeGroup={selectedAgeGroup}
                  selectedDiseases={selectedDiseases}
                  correspondingSubjects={correspondingSubjects}
                  method="oldMethod"
                />
              </div>
              <div className="map-wrapper">
                <h4>Refined Method</h4>
                <Map
                  selectedRegion={selectedRegion}
                  selectedAgeGroup={selectedAgeGroup}
                  selectedDiseases={selectedDiseases}
                  correspondingSubjects={correspondingSubjects}
                  method="refinedMethod"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Portfolio2;
