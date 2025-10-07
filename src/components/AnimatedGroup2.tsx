import { motion } from 'motion/react';
import svgPaths from "../imports/svg-96s3nvum5h";

function AnimatedButton() {
  return (
    <div className="absolute left-0 size-[39.994px] top-0" data-name="Button">
      <div className="absolute inset-[-30%_-40.01%_-50.01%_-40.01%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 72 72">
          <defs>
            {/* Original filter */}
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="71.9937" id="filter0_di_52_844" width="71.9937" x="0" y="0">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="4" />
              <feGaussianBlur stdDeviation="8" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0" />
              <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_52_844" />
              <feBlend in="SourceGraphic" in2="effect1_dropShadow_52_844" mode="normal" result="shape" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="1" />
              <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
              <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.1 0" />
              <feBlend in2="shape" mode="normal" result="effect2_innerShadow_52_844" />
            </filter>
            
            {/* Animated gradient for the fill effect */}
            <linearGradient id="animatedFillGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#DC2626" stopOpacity="1">
                <animate attributeName="offset" 
                  values="0%;0%;100%;100%" 
                  dur="3s" 
                  repeatCount="indefinite" />
              </stop>
              <stop offset="0%" stopColor="#DC2626" stopOpacity="0.8">
                <animate attributeName="offset" 
                  values="0%;30%;100%;100%" 
                  dur="3s" 
                  repeatCount="indefinite" />
              </stop>
              <stop offset="100%" stopColor="#262626" stopOpacity="0.3">
                <animate attributeName="offset" 
                  values="100%;100%;100%;0%" 
                  dur="3s" 
                  repeatCount="indefinite" />
              </stop>
            </linearGradient>

            {/* Mask for the animated fill */}
            <mask id="shapeMask">
              <path d={svgPaths.pc23f900} fill="white" />
              <path d={svgPaths.p2f778d00} fill="white" />
            </mask>
          </defs>
          
          <g filter="url(#filter0_di_52_844)" id="Button">
            {/* Base shape with original dark fill */}
            <path d={svgPaths.pc23f900} fill="#262626" fillOpacity="0.3" shapeRendering="crispEdges" />
            
            {/* Stroke */}
            <path d={svgPaths.p22a8fb80} shapeRendering="crispEdges" stroke="#262626" strokeWidth="0.5" />
            
            {/* Light vector (book icon) */}
            <path d={svgPaths.p2f778d00} fill="#FAFAFA" id="Vector" />
            
            {/* Animated fill overlay */}
            <motion.rect
              x="0"
              y="0"
              width="72"
              height="72"
              fill="url(#animatedFillGradient)"
              mask="url(#shapeMask)"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                repeatType: "loop"
              }}
              style={{ transformOrigin: "left center" }}
            />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <motion.div 
      className="absolute bg-[rgba(38,38,38,0.3)] left-0 pointer-events-none rounded-[1.75098e+07px] size-[39.994px] top-0" 
      data-name="Button"
      initial={{ borderColor: "rgba(119, 255, 133, 1)" }}
      animate={{ borderColor: ["rgba(119, 255, 133, 1)", "rgba(220, 38, 38, 1)", "rgba(119, 255, 133, 1)"] }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <motion.div 
        aria-hidden="true" 
        className="absolute border-[0.5px] border-solid inset-0 rounded-[1.75098e+07px] shadow-[0px_4px_16px_0px_rgba(0,0,0,0.15)]"
        animate={{
          borderColor: ["#77ff85", "#DC2626", "#77ff85"],
          boxShadow: [
            "0px_4px_16px_0px_rgba(119,255,133,0.15)",
            "0px_4px_16px_0px_rgba(220,38,38,0.15)",
            "0px_4px_16px_0px_rgba(119,255,133,0.15)"
          ]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="absolute inset-0 shadow-[0px_1px_0px_0px_inset_rgba(255,255,255,0.1)]"
        animate={{
          boxShadow: [
            "0px_1px_0px_0px_inset_rgba(255,255,255,0.1)",
            "0px_1px_0px_0px_inset_rgba(255,200,200,0.2)",
            "0px_1px_0px_0px_inset_rgba(255,255,255,0.1)"
          ]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.div>
  );
}

export default function AnimatedGroup2() {
  return (
    <motion.div 
      className="relative size-full"
      initial={{ scale: 0.9, opacity: 0.8 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        duration: 0.5,
        ease: "easeOut"
      }}
      whileHover={{
        scale: 1.05,
        transition: { duration: 0.2 }
      }}
    >
      <AnimatedButton />
      <Button1 />
    </motion.div>
  );
}