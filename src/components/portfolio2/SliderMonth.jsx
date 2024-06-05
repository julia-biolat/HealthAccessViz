import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import * as d3Slider from 'd3-simple-slider';

const SliderMonth = ({ onDateChange }) => {
  const sliderRef = useRef(null);  
  const isSliderInitialized = useRef(false);
  const months = ["2023.03", "2023.06", "2023.09", "2023.12"];

  useEffect(() => {
    if (!isSliderInitialized.current){
        const slider = d3Slider.sliderBottom()
        .min(0)
        .max(months.length - 1)
        .step(1)
        .width(400)
        .tickFormat(i => months[i])
        .ticks(months.length)
        .default(0)
        .on('onchange', val => {
            onDateChange(months[val]);
        });

        d3.select(sliderRef.current)
        .append('svg')
        .attr('width', 500)
        .attr('height', 100)
        .append('g')
        .attr('transform', 'translate(30,30)')
        .call(slider);
        isSliderInitialized.current = true;
        onDateChange(months[0]); // Initialize with the first month
    }
  }, [onDateChange]);

  return (
    <div>
      <h4>Selected Month</h4>
      <div ref={sliderRef}></div>
    </div>
  );
};

export default SliderMonth;
