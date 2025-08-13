import Image from 'next/image';
import { FaUserGear } from 'react-icons/fa6';
import { BsFillGridFill } from 'react-icons/bs';
import { LuLogOut } from 'react-icons/lu';
const SidebarMobile = () => {
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
          <FaUserGear className="ml-1 h-10 w-10 text-[var(--color-sidebar-icon)]" />
        </div>
        <div className="flex h-15 w-15 items-center justify-center rounded-2xl bg-[var(--color-sidebar-button)]">
          <BsFillGridFill className="h-10 w-10 text-[var(--color-sidebar-icon)]" />
        </div>
        <div className="flex h-15 w-15 items-center justify-center rounded-2xl bg-[var(--color-sidebar-button)]">
          <LuLogOut className="h-10 w-10 text-[var(--color-sidebar-icon)]" />
        </div>
      </div>
    </>
  );
};

export default SidebarMobile;
