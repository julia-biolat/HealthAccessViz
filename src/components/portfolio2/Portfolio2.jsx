import { useCallback, useRef, useState } from "react";
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

  const handleRegionChange = useCallback((region) => {
    setSelectedRegion(region);
  }, []);

  const handleDiseaseChange = useCallback((diseases, subjects) => {
    setSelectedDiseases(diseases);
    setCorrespondingSubjects(subjects);
  }, []);

  const handleAgeGroupChange = useCallback((ageGroup) => {
    setSelectedAgeGroup(ageGroup);
  }, []);

  return (
    <div className="portfolio" ref={ref}>
      <div className="progress">
        <h1 className="jua-regular">의료 접근성 분석</h1>
        <motion.div style={{ scaleX }} className="progressBar"></motion.div>
      </div>
      <section>
      <div className="container">
          <div className="wrapper">
            <motion.div className="text-container2">
              <h1 className="jua-regular2">
                앞서 살펴보았듯이, 다양한 인구 특성을 적절히 반영하는 것은 의료 접근성 지수 평가에 매우 중요한 요소이다. 
                <br></br>이에, 본 프로젝트에서는 아래와 같이 수정된 의료 접근성 수식을 제시한다.
              </h1>
            </motion.div>
            <div className="formula-container">
              <div className="explanation">
                <img src={oldFormulaImage} alt="Old Method Formula" />
                <h2 className="jua-regular">
                  * <span className="strong">old method</span>: 질병, 인구 특성을 고려하지 않는다
                </h2>
              </div>
              <div className="explanation">
                <img src={refinedFormulaImage} alt="Refined Method Formula" />
                <h2 className="jua-regular">
                  * <span className="strong">refined method</span>:
                  선택된 질병들에 대응할 수 있는 병원만 표시하여 질병 특성을 고려하고
                  <br></br>선택된 연령대의 인구만 활용하면서 연령대별 차이를 보인다
                </h2>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section>
        <div className="container">
          <div className="wrapper">
            <motion.div className="text-container2">
            </motion.div>
            <div className="controller">
              <SliderAge onAgeGroupChange={handleAgeGroupChange} />
              <div className="selector-container">
                <RegionSelector onRegionChange={handleRegionChange} />
                <DiseaseSelector onDiseaseChange={handleDiseaseChange} />
              </div>
            </div>
            <div className="maps-container">
              <div className="map-wrapper">
                <h4 className="strong">Old Method</h4>
                <Map
                  selectedRegion={selectedRegion}
                  selectedAgeGroup={selectedAgeGroup}
                  selectedDiseases={selectedDiseases}
                  correspondingSubjects={correspondingSubjects}
                  method="oldMethod"
                />
              </div>
              <div className="map-wrapper">
                <h4 className="strong">Refined Method</h4>
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
