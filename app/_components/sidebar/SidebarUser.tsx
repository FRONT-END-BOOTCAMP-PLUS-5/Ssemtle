import Image from 'next/image';
import { LuLogOut } from 'react-icons/lu';
import { FaPen } from 'react-icons/fa6';
import { GiBookshelf } from 'react-icons/gi';
import { PiExamLight } from 'react-icons/pi';
import { FaCircleUser } from 'react-icons/fa6';
import Icon from './Icons';

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
        <Icon Icon={FaPen} />
        <Icon Icon={GiBookshelf} />
        <Icon Icon={PiExamLight} />
        <Icon Icon={FaCircleUser} />
        <Icon Icon={LuLogOut} />
      </div>
    </>
  );
};

export default SidebarWeb;
