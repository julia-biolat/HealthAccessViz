import { motion } from "framer-motion";
import { useState } from "react";

const Test = () => {
  const [open, setOpen] = useState(false);

  const variants = {
    visible: (i)=>( {
      opacity: 1,
      x: 100,
      transition: { delay:i * 0.3 },
    }),
    hidden: { opacity: 0 },
  };


  return (
    <div className="course">
      
          <motion.h1>
            <p>Copyright 2022. All Rights Reserved</p>
          </motion.h1>
        
    </div>
  );
};

export default Test;
