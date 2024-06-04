import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import * as d3 from "d3";
import SliderComponent from "./SliderComponent";
import StackedBarChart from "./StackedBarChart";
import RankChangeChart from "./RankChangeChart";
import Sankey from "./Sankey"; // SankeyDiagram 가져오기
import Modal from "./Modal"; // Modal 컴포넌트 가져오기
import "./portfolio1.scss";

const Portfolio1 = () => {
  const [selectedData, setSelectedData] = useState([]);
  const [previousData, setPreviousData] = useState([]);
  const [stackOrder, setStackOrder] = useState('male-first');
  const [selectedItem, setSelectedItem] = useState(null); // 모달창을 위한 상태 추가
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
          .slice(0, 12)
          .map((d, index) => ({
            연령층: ageGroup.title,
            순위: index,
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
        <h1>인구특성별 질병</h1>
        <motion.div style={{ scaleX }} className="progressBar"></motion.div>
      </div>
      <section>
        <div className="container">
          <div className="wrapper">
            <motion.div className="textContainer" style={{ y }}>
              <div className="controls">
                <SliderComponent onAgeGroupChange={handleAgeGroupChange} />
              </div>
              <div className="buttons">
                <button onClick={() => handleStackOrderChange('male-first')}>남</button>
                <button onClick={() => handleStackOrderChange('female-first')}>여</button>
              </div>
              <div className="charts">
                <StackedBarChart data={selectedData} stackOrder={stackOrder} onBarClick={setSelectedItem} />
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
             <Sankey />{/* Sankey 다이어그램 렌더링 */}
            </motion.div>
          </div>
        </div>
      </section>
      {selectedItem && <Modal selectedItem={selectedItem} onClose={() => setSelectedItem(null)} />}
    </div>
  );
};

export default Portfolio1;
