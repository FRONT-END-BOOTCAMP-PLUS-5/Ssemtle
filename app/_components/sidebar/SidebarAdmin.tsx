import Image from 'next/image';
import Icons from './Icons';
import { FaUserGear } from 'react-icons/fa6';
import { BsFillGridFill } from 'react-icons/bs';
import { LuLogOut } from 'react-icons/lu';

const SidebarAdmin = () => {
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
        <Icons Icon={BsFillGridFill} />
        <Icons Icon={LuLogOut} />
      </div>
    </>
  );
};

export default SidebarAdmin;
