import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as d3Slider from 'd3-simple-slider';
import './sliderComponent.scss'; // 슬라이더 스타일을 위한 CSS 파일 임포트

const data = [
  { id: 1, title: "유아(0-9)", path: "/data/infants.csv" },
  { id: 2, title: "청소년(10-19)", path: "/data/adolescents.csv" },
  { id: 3, title: "청년(20-39)", path: "/data/middle.csv" },
  { id: 4, title: "중년(40-59)", path: "/data/young.csv" },
  { id: 5, title: "노년(60이상)", path: "/data/seniors.csv" }
];

const SliderComponent = ({ onAgeGroupChange }) => {
  const sliderRef = useRef(null);
  const isSliderInitialized = useRef(false);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState(data[0]);

  useEffect(() => {
    if (!isSliderInitialized.current) {
      const slider = d3Slider.sliderBottom()
        .min(0)
        .max(data.length - 1)
        .step(1)
        .width(600)
        .tickFormat(i => data[i].title)
        .ticks(data.length)
        .default(0)
        .handle(
          d3.symbol()
            .type(d3.symbolCircle)
            .size(200)
        )
        .on('onchange', val => {
          setSelectedAgeGroup(data[val]);
          onAgeGroupChange(data[val]);
        });

      d3.select(sliderRef.current)
        .append('svg')
        .attr('width', 700)
        .attr('height', 100)
        .append('g')
        .attr('transform', 'translate(50,30)')
        .call(slider);

      isSliderInitialized.current = true;
      onAgeGroupChange(data[0]);
    }
  }, [onAgeGroupChange]);

  return (
    <div className="slider-container">
      <h3>선택된 연령층: {selectedAgeGroup.title}</h3>
      <div ref={sliderRef}></div>
    </div>
  );
};

export default SliderComponent;
