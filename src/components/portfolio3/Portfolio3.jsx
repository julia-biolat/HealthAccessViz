import { useRef} from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import Sankey from "./Sankey"; // SankeyDiagram 가져오기
import "./portfolio3.scss";

const Portfolio3 = () => {

  const ref = useRef(null);
   
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const y = useTransform(scrollYProgress, [0, 1], [0, 300]);

  return (
    <div className="portfolio" ref={ref}>
      <div className="progress">
        <h1 className="jua-regular">연령대 vs 주요 질병</h1>
        <motion.div style={{ scaleX }} className="progressBar"></motion.div>
      </div>
      <section>
        <div className="container">
          <div className="wrapper">
            <motion.div className="textContainer" style={{ y }}>
             <Sankey />{/* Sankey 다이어그램 렌더링 */}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Portfolio3;
