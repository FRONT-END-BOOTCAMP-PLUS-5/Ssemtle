import type { IconType, IconBaseProps } from 'react-icons';

/**
 * 공통 사이드바 아이콘 래퍼 컴포넌트
 * - react-icons 컴포넌트를 prop으로 받아 공통 스타일과 속성(size, color 등)을 지정함
 * - wrapper와 icon 각각 className을 오버라이드할 수 있음
 */
interface IconsProps {
  Icon: IconType;
  wrapperClassName?: string;
  iconClassName?: string;
  size?: number | string;
  color?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  iconProps?: Omit<IconBaseProps, 'size' | 'color' | 'className'>;
}

const Icons = ({
  Icon,
  wrapperClassName,
  iconClassName,
  size,
  color,
  onClick,
  iconProps,
}: IconsProps) => {
  // 기본 wrapper 스타일과 사용자 지정 className 병합
  // wrapperClassName이 있으므로 null 값이 오는것을 방지하기 위해
  // filter와 join을 사용
  const wrapperClasses = [
    'flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-sidebar-button)]',
    wrapperClassName,
  ]
    .filter(Boolean)
    .join(' ');

  // 기본 아이콘 스타일과 사용자 지정 className 병합
  const mergedIconClassName = [
    'h-7 w-7 text-[var(--color-sidebar-icon)]',
    iconClassName,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapperClasses} onClick={onClick}>
      <Icon
        className={mergedIconClassName}
        size={size}
        color={color}
        {...iconProps}
      />
    </div>
  );
};

export default Icons;
