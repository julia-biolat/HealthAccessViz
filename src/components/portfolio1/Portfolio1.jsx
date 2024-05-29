import { useEffect, useRef, useState } from "react";
import "./portfolio1.scss";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import * as d3 from 'd3';
import * as d3Slider from 'd3-simple-slider';
import SlideChart from "./SlideChart";

const items = [
  {
    id: 1,
    title: "Infants",
    path: "../../../data/infants.csv"
  },
  {
    id: 2,
    title: "Adolescents",
    path: "../../../data/adolescents.csv"
  },
  {
    id: 3,
    title: "Middle-aged",
    path: "../../../data/middle.csv"
  },
  {
    id: 4,
    title: "Young Adults",
    path: "../../../data/young.csv"
  },
  {
    id: 5,
    title: "Seniors",
    path: "../../../data/seniors.csv"
  }
];

const Portfolio1 = () => {
  const ref = useRef();
  const sliderRef = useRef();
  const isSliderInitialized = useRef(false); // 슬라이더 초기화 여부를 저장

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["end end", "start start"],
  });

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 300]);

  const [chartData, setChartData] = useState([]);
  const [selectedPath, setSelectedPath] = useState(items[0].path); // Default to the first path

  useEffect(() => {
    // CSV 데이터를 불러와서 상태로 설정
    d3.csv(selectedPath).then((data) => {
      // 데이터 변환: value를 숫자로 변환
      data.forEach(d => {
        d.value = +d.value;
      });
      setChartData(data);
    });
  }, [selectedPath]); // selectedPath가 변경될 때마다 재실행

  useEffect(() => {
    if (!isSliderInitialized.current) {
      const slider = d3Slider.sliderBottom()
        .min(0)
        .max(items.length - 1)
        .step(1)
        .width(400)
        .tickFormat(i => items[i].title)
        .ticks(items.length)
        .default(0)
        .on('onchange', val => {
          setSelectedPath(items[val].path);
        });

      d3.select(sliderRef.current)
        .append('svg')
        .attr('width', 500)
        .attr('height', 100)
        .append('g')
        .attr('transform', 'translate(30,30)')
        .call(slider);

      isSliderInitialized.current = true; // 슬라이더가 초기화되었음을 표시
    }
  }, [items]);

  return (
    <div className="portfolio" ref={ref}>
      <div className="progress">
        <h1>연령대별 질병 분석</h1>
        <motion.div style={{ scaleX }} className="progressBar"></motion.div>
      </div>
      <section>
        <div className="container">
          <div className="wrapper">
            <motion.div className="textContainer" style={{ y }}>
              <SlideChart data={chartData} />
              <div ref={sliderRef}></div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Portfolio1;