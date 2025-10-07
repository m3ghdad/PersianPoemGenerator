import svgPaths from "./svg-1ebf8vx3an";

function Play() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Play">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Play">
          <path d={svgPaths.p29890330} fill="var(--fill-0, #FAFAFA)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

export default function Button() {
  return (
    <div className="bg-[rgba(38,38,38,0.3)] relative rounded-[1.75098e+07px] size-full" data-name="Button">
      <div aria-hidden="true" className="absolute border-[0.522px] border-neutral-800 border-solid inset-0 pointer-events-none rounded-[1.75098e+07px] shadow-[0px_4px_16px_0px_rgba(0,0,0,0.15)]" />
      <div className="flex flex-row items-center justify-center size-full">
        <div className="box-border content-stretch flex items-center justify-center pl-[0.53px] pr-[0.522px] py-[0.522px] relative size-full">
          <Play />
        </div>
      </div>
      <div className="absolute inset-0 pointer-events-none shadow-[0px_1px_0px_0px_inset_rgba(255,255,255,0.1)]" />
    </div>
  );
}