function Mask() {
  return (
    <div className="absolute bg-white inset-[-50px]" data-name="Mask">
      <div className="absolute bg-black inset-[76px] rounded-[34px]" data-name="Shape" />
    </div>
  );
}

function Blur() {
  return <div className="absolute backdrop-blur-2xl backdrop-filter bg-[rgba(0,0,0,0.1)] blur-[20px] filter inset-[31px_26px_21px_26px] mix-blend-hard-light rounded-[34px]" data-name="Blur" />;
}

function Blur1() {
  return (
    <div className="absolute inset-[-26px]" data-name="Blur">
      <Mask />
      <Blur />
    </div>
  );
}

function Fill() {
  return (
    <div className="absolute inset-0 opacity-[0.67] rounded-[34px]" data-name="Fill">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[34px]">
        <div className="absolute bg-[#cccccc] inset-0 mix-blend-color-burn rounded-[34px]" />
        <div className="absolute inset-0 rounded-[34px]" style={{ backgroundImage: "linear-gradient(90deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.03) 100%), linear-gradient(90deg, rgba(0, 0, 0, 0.33) 0%, rgba(0, 0, 0, 0.33) 100%)" }} />
      </div>
    </div>
  );
}

function GlassEffect() {
  return <div className="absolute bg-[rgba(0,0,0,0)] inset-0 rounded-[34px]" data-name="Glass Effect" />;
}

function LiquidGlassMedium() {
  return (
    <div className="absolute inset-0" data-name="Liquid Glass - Medium">
      <Blur1 />
      <Fill />
      <GlassEffect />
    </div>
  );
}

function Checkmark() {
  return (
    <div className="css-nmki5e h-[22px] relative shrink-0 w-[24px]" data-name="Checkmark">
      <div className="absolute flex flex-col font-['SF_Pro:Semibold',_sans-serif] font-[590] justify-center leading-[0] left-[12px] text-[17px] text-center text-white top-[11px] translate-x-[-50%] translate-y-[-50%] w-[24px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[22px]">􀆅</p>
      </div>
    </div>
  );
}

function LabelAndSubtitle1() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0" data-name="Label and Subtitle">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[2px] items-start pl-[4px] pr-0 py-[9px] relative w-full">
          <div className="css-ceipwd flex flex-col font-['SF_Pro:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[15px] text-white tracking-[0.2px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[18px]">Farsi</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Item1() {
  return (
    <div className="relative shrink-0 w-full" data-name="Item">
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex gap-[4px] items-center px-[8px] py-0 relative w-full">
          <Checkmark />
          <LabelAndSubtitle1 />
        </div>
      </div>
    </div>
  );
}

function Checkmark1() {
  return <div className="css-nmki5e h-[22px] shrink-0 w-[24px]" data-name="Checkmark" />;
}

function LabelAndSubtitle2() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0" data-name="Label and Subtitle">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[2px] items-start pl-[4px] pr-0 py-[9px] relative w-full">
          <div className="css-ceipwd flex flex-col font-['SF_Pro:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[15px] text-white tracking-[0.2px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[18px]">English</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Item2() {
  return (
    <div className="relative shrink-0 w-full" data-name="Item">
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex gap-[4px] items-center px-[8px] py-0 relative w-full">
          <Checkmark1 />
          <LabelAndSubtitle2 />
        </div>
      </div>
    </div>
  );
}

function MenuItems() {
  return (
    <div className="relative shrink-0 w-full" data-name="Menu Items">
      <div className="flex flex-col items-center size-full">
        <div className="box-border content-stretch flex flex-col items-center px-[8px] py-0 relative w-full">
          <Item1 />
          <Item2 />
        </div>
      </div>
    </div>
  );
}

export default function MenuIPadActions() {
  return (
    <div className="box-border content-stretch flex flex-col items-center px-0 py-[10px] relative size-full" data-name="Menu - iPad - Actions">
      <LiquidGlassMedium />
      <MenuItems />
    </div>
  );
}