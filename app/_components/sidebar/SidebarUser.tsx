import Image from 'next/image';
import { LuLogOut } from 'react-icons/lu';
import { FaPen } from 'react-icons/fa6';
import { GiBookshelf } from 'react-icons/gi';
import { PiExamLight } from 'react-icons/pi';
import { FaCircleUser } from 'react-icons/fa6';
const SidebarWeb = () => {
  return (
    <>
      <div className="flex h-screen w-30 flex-col items-center justify-start gap-10 bg-[var(--color-sidebar)]">
        <Image
          className="mt-10"
          src="/logos/Ssemtle_logo.png"
          alt="Ssemtle 로고"
          width={110}
          height={110}
        />
        <div className="flex h-15 w-15 items-center justify-center rounded-2xl bg-[var(--color-sidebar-button)]">
          <FaPen className="h-10 w-10 text-[var(--color-sidebar-icon)]" />
        </div>
        <div className="flex h-15 w-15 items-center justify-center rounded-2xl bg-[var(--color-sidebar-button)]">
          <GiBookshelf className="h-10 w-10 text-[var(--color-sidebar-icon)]" />
        </div>
        <div className="flex h-15 w-15 items-center justify-center rounded-2xl bg-[var(--color-sidebar-button)]">
          <PiExamLight className="h-10 w-10 text-[var(--color-sidebar-icon)]" />
        </div>
        <div className="flex h-15 w-15 items-center justify-center rounded-2xl bg-[var(--color-sidebar-button)]">
          <FaCircleUser className="h-10 w-10 text-[var(--color-sidebar-icon)]" />
        </div>
        <div className="flex h-15 w-15 items-center justify-center rounded-2xl bg-[var(--color-sidebar-button)]">
          <LuLogOut className="h-10 w-10 text-[var(--color-sidebar-icon)]" />
        </div>
      </div>
    </>
  );
};

export default SidebarWeb;
