import "./hero.scss";
import { motion } from "framer-motion";

const textVariants = {
  initial: {
    x: -500,
    opacity: 0,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 1,
      staggerChildren: 0.1,
    },
  },
  scrollButton: {
    opacity: 0,
    y: 10,
    transition: {
      duration: 2,
      repeat: Infinity,
    },
  },
};
const sliderVariants = {
  initial: {
    x: 0,
  },
  animate: {
    x: "-220%",
    transition: {
      repeat: Infinity,
      repeatType:"mirror",
      duration: 20,
    },
  },
};

const Hero = () => {
  return (
    <div className="hero">
      <div className="wrapper">
        <motion.div
          className="textContainer"
          variants={textVariants}
          initial="initial"
          animate="animate"
        >
          <motion.h2 variants={textVariants}>문제 제기</motion.h2>
          <motion.h1 variants={textVariants}>
          "여러분은 지방에서 병원 접근성 부족으로 생명을 잃는 노인들이 얼마나 많은지 아십니까?"
          </motion.h1>
          <motion.h3 variants={textVariants}>병원에 도착하지 못해 생명을 잃는 분들의 숫자는 생각보다 많습니다. 이러한 현실을 바꾸기 위해, 그리고 모든 사람이 적절한 의료 서비스를 받을 수 있도록, 저희는 의료 접근성에 대한 심도 있는 분석을 통해 이 심각성을 전하려고 합니다. 지금부터 저희의 여정을 함께해 주세요.</motion.h3>
          <motion.img
            variants={textVariants}
            animate="scrollButton"
            src="/scroll.png"
            alt=""
          />
          
        </motion.div>
      </div>
      <motion.div
        className="slidingTextContainer"
        variants={sliderVariants}
        initial="initial"
        animate="animate"
      >
        Wacky Wombat
      </motion.div>

    </div>
  );
};

export default Hero;
