import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { HomeDesign1 } from './HomeDesign1';
import { HomeDesign2 } from './HomeDesign2';
import { HomeDesign3 } from './HomeDesign3';

export const HomePage: React.FC = () => {
  const { homeVariant } = useTheme();

  return (
    <div className="relative">
      {/* Active Homepage Design Selected by Administrator */}
      {homeVariant === 'design1' && <HomeDesign1 />}
      {homeVariant === 'design2' && <HomeDesign2 />}
      {homeVariant === 'design3' && <HomeDesign3 />}
    </div>
  );
};
