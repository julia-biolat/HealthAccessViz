import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import * as d3 from "d3";
import SliderComponent from "./SliderComponent";
import StackedBarChart from "./StackedBarChart";
import RankChangeChart from "./RankChangeChart";
import SankeyDiagram from "./SankeyDiagram"; // SankeyDiagram 가져오기
import "./portfolio1.scss";

const Portfolio1 = () => {
  const [selectedData, setSelectedData] = useState([]);
  const [previousData, setPreviousData] = useState([]);
  const [stackOrder, setStackOrder] = useState('male-first');
  const ref = useRef(null);
  let beforeData = [];

  const sortData = (data, order) => {
    return data.sort((a, b) => d3.descending(+a[order], +b[order]));
  };

  const handleAgeGroupChange = (ageGroup) => {
    fetch(ageGroup.path)
      .then((response) => response.text())
      .then((csvData) => {
        let parsedData = d3.csvParse(csvData);

        let sortedData = sortData(parsedData, stackOrder === 'male-first' ? '남' : '여');

        const topItems = sortedData
          .slice(0, 15)
          .map((d) => ({
            항목: d["항목"],
            남: +d["남"],
            여: +d["여"],
            총: +d["총"],
            비율: (+d["비율(%)"]).toFixed(2)
          }));

        setPreviousData(beforeData);
        setSelectedData(topItems);
        beforeData = parsedData;
      })
      .catch((error) => console.error("Error loading data:", error));
  };

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const y = useTransform(scrollYProgress, [0, 1], [0, 300]);

  const handleStackOrderChange = (order) => {
    setStackOrder(order);
    setPreviousData(selectedData);
    setSelectedData(sortData([...selectedData], order === 'male-first' ? '남' : '여'));
  };

  useEffect(() => {
    if (selectedData.length === 0) {
      setPreviousData([]);
    }
  }, [selectedData]);

  return (
    <div className="portfolio" ref={ref}>
      <div className="progress">
        <h1>Age Group Disease Analysis</h1>
        <motion.div style={{ scaleX }} className="progressBar"></motion.div>
      </div>
      <section>
        <div className="container">
          <div className="wrapper">
            <motion.div className="textContainer" style={{ y }}>
              <SliderComponent onAgeGroupChange={handleAgeGroupChange} />
              <div className="controls">
                <button onClick={() => handleStackOrderChange('male-first')}>남자 기준</button>
                <button onClick={() => handleStackOrderChange('female-first')}>여자 기준</button>
              </div>
              <div className="charts">
                <StackedBarChart data={selectedData} stackOrder={stackOrder} />
                <RankChangeChart data={selectedData} previousData={previousData} />
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <section>
        <div className="container">
          <div className="wrapper">
            <motion.div className="textContainer" style={{ y }}>
              <SankeyDiagram /> {/* Sankey 다이어그램 렌더링 */}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Portfolio1;