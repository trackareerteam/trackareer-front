import FullLogo from '@/public/svg/logo/FullLogo.svg';
import AuthButtonSet from '@/src/components/common/header/AuthButtonSet';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-full flex flex-col items-center overflow-scroll">
      <div className="m-auto shrink-0 w-7xl h-full flex flex-col">
        <header className="w-full p-9 pb-3 flex flex-row justify-between items-center">
          <FullLogo width={216} height={36} />
          <AuthButtonSet />
        </header>
        {children}
      </div>
    </div>
  );
}
