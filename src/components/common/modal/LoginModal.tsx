// "use client"

import Close from '@/public/svg/Close.svg';
import FullLogo from '@/public/svg/logo/FullLogo.svg';
import GoogleIcon from '@/public/svg/social/Google.svg';
import LoadingModal from '@/src/components/common/modal/LoadingModal';
import { useAuthStore } from '@/src/stores/authStore';
import Link from 'next/link';

type Props = {
  onClose: () => void;
};

export default function LoginModal({ onClose }: Props) {
  const { onLoading, loginWithGoogle } = useAuthStore();

  return (
    <>
      <div className="w-dvw h-dvh max-w-120 max-h-150 p-8">
        <header className="w-full relative flex flex-col justify-center items-center lg:h-[20%]">
          {/* 취소 버튼 */}
          <button
            className="flex items-center justify-center absolute right-0 top-0 w-10 h-10"
            aria-label="Close"
            onClick={onClose}
          >
            <Close />
          </button>
          <FullLogo className="max-w-38 lg:max-w-full" />
        </header>
        <div className="flex flex-col h-[80%]">
          <main className="flex flex-1 flex-col items-center justify-center">
            <article className="text-center mb-20">
              <p className="text-xl font-semibold leading-8 text-black select-none">
                3초만에 로그인하고
                <br />
                나만의 취준 비서를 이용해보세요.
              </p>
            </article>

            <button
              className="
        flex flex-row items-center
        w-75 h-12.5 p-3 pr-9 border border-muted
        rounded bg-white
      "
              type="button"
              onClick={loginWithGoogle}
              disabled={onLoading}
            >
              <GoogleIcon width={24} height={24} />
              <span className="flex-1 text-base font-medium text-text text-center">
                구글 계정으로 시작하기
              </span>
            </button>
          </main>

          <footer className="flex flex-col items-center text-sm text-muted mt-10">
            <Link
              href={process.env.NEXT_PUBLIC_NOTION_TERMS_URL || '#'}
              className="hover:text-black/30"
              target="_blank" // 새 창 열기
              rel="noreferrer" // 참조자 정보 누출 방지
            >
              이용 약관
            </Link>
            <Link
              href={process.env.NEXT_PUBLIC_NOTION_PRIVACY_URL || '#'}
              className="hover:text-black/30"
              target="_blank" // 새 창 열기
              rel="noreferrer" // 참조자 정보 누출 방지
            >
              개인 정보 처리 방침
            </Link>
          </footer>
        </div>
      </div>
      <LoadingModal isOpen={onLoading} />
    </>
  );
}
