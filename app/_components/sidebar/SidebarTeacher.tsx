import Image from 'next/image';
import { FaUserGear } from 'react-icons/fa6';
import { LuLogOut } from 'react-icons/lu';
import Icons from './Icons';

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
        <Icons Icon={FaUserGear} />
        <Icons Icon={LuLogOut} />
      </div>
    </>
  );
};

export default SidebarMobile;
