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
      repeatType: "mirror",
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
          <motion.h2 className="jua-regular" variants={textVariants}>문제 제기</motion.h2>
          <motion.h1 className="black-han-sans-regular" variants={textVariants}>
            "여러분은 현재의 의료 접근성 평가 방식이 과연 정확하다고 생각하시나요?"
          </motion.h1>
          <motion.h3 className="noto-sans-kr-regular" variants={textVariants}>
            현재의 의료 접근성 평가 방식은 인구 100만 명당 병원 수를 기준으로 삼고 있습니다. 그러나 이러한 방식은 몇 가지 중요한 문제점을 가지고 있습니다. 첫째, 병원의 종류를 고려하지 않습니다. 예를 들어, 고령화가 많이 진행된 지역에 산부인과나 소아과 병원이 많아도, 병원 수만으로는 의료 접근성이 높다고 잘못 평가될 수 있습니다. 둘째, 인구의 연령 구조를 반영하지 않습니다. 고령화 지역에서는 노인들이 주로 이용하는 의료 서비스가 더 필요합니다. 따라서 우리는 이러한 문제를 해결하고 지역 의료 접근성을 더욱 세심하게 평가하기 위해 두 가지 보완점을 제시하려 합니다.
          </motion.h3>
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
