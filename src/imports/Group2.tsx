import svgPaths from "./svg-96s3nvum5h";

function Button() {
  return (
    <div className="absolute left-0 size-[39.994px] top-0" data-name="Button">
      <div className="absolute inset-[-30%_-40.01%_-50.01%_-40.01%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 72 72">
          <g filter="url(#filter0_di_52_844)" id="Button">
            <path d={svgPaths.pc23f900} fill="var(--fill-0, #262626)" fillOpacity="0.3" shapeRendering="crispEdges" />
            <path d={svgPaths.p22a8fb80} shapeRendering="crispEdges" stroke="var(--stroke-0, #262626)" strokeWidth="0.5" />
            <path d={svgPaths.p2f778d00} fill="var(--fill-0, #FAFAFA)" id="Vector" />
          </g>
          <defs>
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
          </defs>
        </svg>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="absolute bg-[rgba(38,38,38,0.3)] left-0 pointer-events-none rounded-[1.75098e+07px] size-[39.994px] top-0" data-name="Button">
      <div aria-hidden="true" className="absolute border-[#77ff85] border-[0.5px] border-solid inset-0 rounded-[1.75098e+07px] shadow-[0px_4px_16px_0px_rgba(0,0,0,0.15)]" />
      <div className="absolute inset-0 shadow-[0px_1px_0px_0px_inset_rgba(255,255,255,0.1)]" />
    </div>
  );
}

export default function Group2() {
  return (
    <div className="relative size-full">
      <Button />
      <Button1 />
    </div>
  );
}