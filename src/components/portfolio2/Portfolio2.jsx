import { useRef } from "react";
import "./portfolio2.scss";
import { motion, useScroll, useSpring } from "framer-motion";
import Page1 from "./Page1";
import Page2 from "./Page2";
import Page3 from "./Page3";

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

  return (
    <div className="portfolio" ref={ref}>
      <div className="progress">
        <h1>의료 접근성 분석</h1>
        <motion.div style={{ scaleX }} className="progressBar"></motion.div>
      </div>
      <Page1 />
      <Page2 />
      <Page3 />
    </div>
  );
};

export default Portfolio2;
