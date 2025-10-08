import imgRubatarLogo from "figma:asset/9568d55e4870699a55c3b8ec166b4f40c9cb4e3e.png";

interface LanguageSelectionScreenProps {
  onLanguageSelect: (language: 'fa' | 'en') => void;
}

function RubatarLogo() {
  return (
    <div className="absolute bottom-[-69px] left-[-117px] top-0 w-[948px]" data-name="RubatarLogo">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute h-[127.74%] left-[-13.67%] max-w-none top-[-10.86%] w-[134.88%]" src={imgRubatarLogo} />
      </div>
    </div>
  );
}

function Overlay() {
  return <div className="absolute bg-[rgba(0,0,0,0.4)] h-[932px] left-0 top-0 w-[743px]" data-name="Overlay" />;
}

function Container() {
  return (
    <div className="h-[932px] overflow-clip relative shrink-0 w-full" data-name="Container" style={{ backgroundImage: "linear-gradient(90deg, rgb(0, 0, 0) 0%, rgb(0, 0, 0) 100%), linear-gradient(90deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.5) 100%)" }}>
      <RubatarLogo />
      <Overlay />
    </div>
  );
}

function Heading1() {
  return (
    <div className="content-stretch flex h-[35.99px] items-start relative shrink-0 w-full" data-name="Heading 1">
      <p className="basis-0 font-['Inter:Regular',_'Noto_Sans_Arabic:Regular',_sans-serif] font-normal grow leading-[36px] min-h-px min-w-px not-italic relative shrink-0 text-[30px] text-center text-white tracking-[0.3955px]" dir="auto">
        انتخاب زبان
      </p>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="relative shrink-0 w-full" data-name="Paragraph">
      <div className="flex flex-col items-center justify-center size-full">
        <div className="box-border content-stretch flex flex-col gap-[10px] items-center justify-center px-[101px] py-0 relative w-full">
          <p className="font-['Inter:Regular',_sans-serif] font-normal leading-[28px] not-italic relative shrink-0 text-[18px] text-[rgba(255,255,255,0.6)] text-center text-nowrap tracking-[-0.4395px] whitespace-pre" dir="auto">
            Choose language
          </p>
        </div>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex flex-col gap-[7.999px] h-[71.989px] items-start relative shrink-0 w-full" data-name="Container">
      <Heading1 />
      <Paragraph />
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex flex-col font-['Inter:Regular',_'Noto_Sans_Arabic:Regular',_sans-serif] font-normal gap-[3.995px] h-[55.983px] items-center not-italic relative shrink-0 text-nowrap text-center w-full whitespace-pre" data-name="Container">
      <p className="leading-[32px] relative shrink-0 text-[24px] text-white tracking-[0.0703px] w-full" dir="auto">
        فارسی
      </p>
      <p className="leading-[20px] relative shrink-0 text-[14px] text-[rgba(255,255,255,0.6)] tracking-[-0.1504px] w-full" dir="auto">
        شعر کلاسیک
      </p>
    </div>
  );
}

function Button({ onClick }: { onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="bg-[rgba(0,0,0,0.4)] h-[105.019px] relative rounded-[16px] shrink-0 w-full cursor-pointer transition-all duration-200 active:scale-95 hover:bg-[rgba(0,0,0,0.5)]" 
      data-name="Button"
    >
      <div className="flex flex-col items-center overflow-clip rounded-[inherit] size-full">
        <div className="box-border content-stretch flex flex-col h-[105.019px] items-center pb-[0.522px] pt-[24.518px] px-[24.518px] relative w-full">
          <Container2 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.522px] border-[rgba(255,255,255,0.1)] border-solid inset-0 pointer-events-none rounded-[16px]" />
    </button>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col font-['Inter:Regular',_sans-serif] font-normal gap-[3.995px] h-[55.983px] items-center not-italic relative shrink-0 text-nowrap text-center w-full whitespace-pre" data-name="Container">
      <p className="leading-[32px] relative shrink-0 text-[24px] text-white tracking-[0.0703px] w-full">English</p>
      <p className="leading-[20px] relative shrink-0 text-[14px] text-[rgba(255,255,255,0.6)] tracking-[-0.1504px] w-full">Translated Poetry</p>
    </div>
  );
}

function Button1({ onClick }: { onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="bg-[rgba(0,0,0,0.4)] h-[105.019px] relative rounded-[16px] shrink-0 w-full cursor-pointer transition-all duration-200 active:scale-95 hover:bg-[rgba(0,0,0,0.5)]" 
      data-name="Button"
    >
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="box-border content-stretch flex flex-col h-[105.019px] items-center pb-[0.522px] pt-[24.518px] px-[24.518px] relative w-full">
          <Container3 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.522px] border-[rgba(255,255,255,0.1)] border-solid inset-0 pointer-events-none rounded-[16px]" />
    </button>
  );
}

function Container4({ onFarsiClick, onEnglishClick }: { onFarsiClick: () => void; onEnglishClick: () => void }) {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Container">
      <Button onClick={onFarsiClick} />
      <Button1 onClick={onEnglishClick} />
    </div>
  );
}

function Frame8() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="flex flex-col items-center justify-center size-full">
        <div className="box-border content-stretch flex flex-col font-normal gap-[10px] items-center justify-center leading-[16px] not-italic p-[10px] relative text-[12px] text-[rgba(255,255,255,0.4)] text-center text-nowrap w-full whitespace-pre">
          <p className="font-['Inter:Regular',_'Noto_Sans_Arabic:Regular',_sans-serif] relative shrink-0" dir="auto">
            می‌توانید این را هر زمان تغییر دهید
          </p>
          <p className="font-['Inter:Regular',_sans-serif] relative shrink-0">You can change this anytime</p>
        </div>
      </div>
    </div>
  );
}

function LanguageSelectionContent({ onFarsiClick, onEnglishClick }: { onFarsiClick: () => void; onEnglishClick: () => void }) {
  return (
    <div className="absolute box-border content-stretch flex flex-col gap-[47.992px] inset-[286px_19px_251.99px_18px] items-start px-[23.996px] py-0" data-name="LanguageSelectionScreen">
      <Container1 />
      <Container4 onFarsiClick={onFarsiClick} onEnglishClick={onEnglishClick} />
      <Frame8 />
    </div>
  );
}

export function LanguageSelectionScreen({ onLanguageSelect }: LanguageSelectionScreenProps) {
  return (
    <div className="language-selection-container bg-black content-stretch flex flex-col gap-[10px] items-center justify-center relative size-full fixed inset-0 z-[9999]" data-name="WelcomeScreen">
      <Container />
      <p className="absolute bottom-[722px] leading-[48px] left-[calc(50%-86.5px)] text-[48px] text-neutral-50 text-nowrap top-[162px] tracking-[0.0508px] whitespace-pre" dir="auto" style={{ fontFamily: "'Noto Nastaliq Urdu', Tahoma, Arial, sans-serif" }}>
        رباعی وتار
      </p>
      <LanguageSelectionContent 
        onFarsiClick={() => onLanguageSelect('fa')} 
        onEnglishClick={() => onLanguageSelect('en')} 
      />
    </div>
  );
}
