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

  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedDiseases, setSelectedDiseases] = useState([]);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState(null);


  const handleRegionChange = (region) => {
    setSelectedRegion(region);
  };

  const handleDiseaseChange = (diseases) => {
    setSelectedDiseases(diseases);
  };

  const handleAgeGroupChange = (ageGroup) => {
    setSelectedAgeGroup(ageGroup);
  };

  return (
    <div className="portfolio" ref={ref}>
      <div className="progress">
        <h1>의료 접근성 분석</h1>
        <motion.div style={{ scaleX }} className="progressBar"></motion.div>
      </div>

      <section className>
        <div className="container">
          <div className="wrapper">
          <motion.div className="text-container">
            </motion.div>
            <div className="Sliders">
              <SliderAge onAgeGroupChange={handleAgeGroupChange} />
            </div>

            <div className="Selectors">
              <RegionSelector onRegionChange={handleRegionChange} />
              <DiseaseSelector onDiseaseChange={handleDiseaseChange} />
            </div>
          </div>
          
          <div className="map-container">
          <motion.div className="text-container">
            </motion.div>
            <div className="map-section">
              <Map  />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Portfolio2;
