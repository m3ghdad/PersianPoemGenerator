function ThemedGrabber() {
  return (
    <div className="bg-[#a1a1a1] h-[5.993px] relative rounded-[1.75098e+07px] shrink-0 w-[39.994px]" data-name="ThemedGrabber">
      <div aria-hidden="true" className="absolute border-[0.522px] border-[rgba(161,161,161,0.2)] border-solid inset-0 pointer-events-none rounded-[1.75098e+07px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[5.993px] w-[39.994px]" />
    </div>
  );
}

function Container() {
  return (
    <div className="h-[15.998px] relative shrink-0 w-[120.674px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[15.998px] relative w-[120.674px]">
        <p className="absolute font-['Inter:Regular',_'Noto_Sans_Arabic:Regular',_sans-serif] font-normal leading-[16px] left-0 not-italic text-[12px] text-[rgba(161,161,161,0.5)] text-nowrap top-[0.52px] whitespace-pre" dir="auto">
          بکشید تا تغییر اندازه دهید
        </p>
      </div>
    </div>
  );
}

export default function DraggableProfileSheet() {
  return (
    <div className="box-border content-stretch flex flex-col gap-[11.994px] items-center justify-center pb-[0.522px] pt-[3.995px] px-0 relative size-full" data-name="DraggableProfileSheet">
      <div aria-hidden="true" className="absolute border-[0px_0px_0.522px] border-[rgba(38,38,38,0.5)] border-solid inset-0 pointer-events-none" />
      <ThemedGrabber />
      <Container />
    </div>
  );
}