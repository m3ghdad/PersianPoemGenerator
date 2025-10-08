import { motion } from 'motion/react';
import svgPaths from "../imports/svg-441bt5q2um";

export default function AnimatedGroup() {
  return (
    <div className="relative size-full flex items-center justify-center">
      <svg className="block size-full" fill="none" preserveAspectRatio="xMidYMid meet" viewBox="0 0 125 67">
        <g id="Group 1">
          {/* Lighter background vector */}
          <path 
            d={svgPaths.p20a9b990} 
            id="Vector 1" 
            stroke="white" 
            strokeOpacity="0.7"
          />
          {/* Darker filling vector with animation */}
          <motion.path 
            d={svgPaths.p3cc63780} 
            id="Vector 2" 
            stroke="black" 
            strokeOpacity="0.87"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ 
              duration: 2,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse",
              repeatDelay: 0.5
            }}
          />
        </g>
      </svg>
    </div>
  );
}