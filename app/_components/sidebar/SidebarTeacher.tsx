import HeaderSizeObserver from './HeaderSizeObserver';
import Image from 'next/image';
import { FaUserGear } from 'react-icons/fa6';
import { LuLogOut } from 'react-icons/lu';
import Icons from './Icons';

const SidebarTeacher = () => {
  return (
    <>
      <div
        className="sticky top-[var(--header-h,0px)] flex w-30 shrink-0 flex-col items-center justify-start gap-10 bg-[var(--color-sidebar)] max-[431px]:hidden"
        style={{ height: 'calc(100vh - var(--header-h, 0px))' }}
      >
        <HeaderSizeObserver />
        <Image
          className="mt-10"
          src="/logos/Ssemtle_logo.png"
          alt="Ssemtle 로고"
          width={110}
          height={110}
        />
        <Icons Icon={FaUserGear} />
        <Icons Icon={LuLogOut} />
      </div>
    </>
  );
};

export default SidebarTeacher;
