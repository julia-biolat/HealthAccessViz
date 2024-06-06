import { useRef, useState } from "react";
import "./portfolio2.scss";
import { motion, useScroll, useSpring } from "framer-motion";
import SliderAge from './SliderAge';
import RegionSelector from './RegionSelector';
import DiseaseSelector from './DiseaseSelector';
import Map from './Map';

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
              인구 특성을 고려하느냐 안 하느냐는 의료 접근성 지수 평가에 매우 중요한 요소이다.
            </motion.div>
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
