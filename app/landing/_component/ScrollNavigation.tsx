'use client';

import { motion } from 'framer-motion';
import { useScrollspy } from '@/hooks/useScrollspy';

export interface NavigationItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

export interface ScrollNavigationProps {
  sections: NavigationItem[];
  className?: string;
}

export function ScrollNavigation({
  sections,
  className = '',
}: ScrollNavigationProps) {
  const { activeSection, scrollToSection } = useScrollspy({
    sectionIds: sections.map((section) => section.id),
    offset: 100,
  });

  return (
    <nav className={`fixed top-1/2 right-8 z-50 -translate-y-1/2 ${className}`}>
      <div className="flex flex-col space-y-4 rounded-full bg-white/80 p-4 shadow-lg backdrop-blur-sm">
        {sections.map((section) => {
          const isActive = activeSection === section.id;

          return (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`group relative flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              aria-label={`Navigate to ${section.label}`}
            >
              {section.icon && <span className="text-lg">{section.icon}</span>}

              {!section.icon && (
                <span className="text-xs font-bold">
                  {section.id.slice(-1)}
                </span>
              )}

              <motion.div
                className="absolute top-1/2 -left-2 -translate-y-1/2 opacity-0 group-hover:opacity-100"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: isActive ? 1 : 0, x: isActive ? 0 : 10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="rounded-md bg-gray-900 px-2 py-1 text-xs text-white shadow-lg">
                  {section.label}
                  <div className="absolute top-1/2 right-[-4px] h-2 w-2 -translate-y-1/2 rotate-45 bg-gray-900"></div>
                </div>
              </motion.div>

              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-full ring-2 ring-blue-300"
                  layoutId="activeIndicator"
                  transition={{ duration: 0.3 }}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex justify-center">
        <div className="h-1 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
      </div>
    </nav>
  );
}
