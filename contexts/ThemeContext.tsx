import React, { createContext, useContext } from 'react';
import { ColorValue } from 'react-native';

interface ThemeContextType {
  colors: ColorScheme;
}

interface ColorScheme {
  // Background colors
  background: ColorValue;
  surface: ColorValue;
  cardBackground: ColorValue;
  
  // Header colors
  headerBackground: [ColorValue, ColorValue];
  headerText: ColorValue;
  headerSecondary: ColorValue;
  
  // Text colors
  text: ColorValue;
  textSecondary: ColorValue;
  textMuted: ColorValue;
  
  // Medical card colors
  heartRateBackground: ColorValue;
  spO2Background: ColorValue;
  temperatureBackground: ColorValue;
    // Icon colors
  heartRateIcon: [ColorValue, ColorValue];
  spO2Icon: [ColorValue, ColorValue];
  temperatureIcon: [ColorValue, ColorValue];
  
  // Emergency colors
  emergencyBackground: [ColorValue, ColorValue];
  
  // Border and shadow colors
  border: ColorValue;
  shadow: ColorValue;
}

const colors: ColorScheme = {
  background: '#f8fafc',
  surface: '#e2e8f0',
  cardBackground: '#fefefe',
  
  headerBackground: ['#334155', '#475569'],
  headerText: '#ffffff',
  headerSecondary: '#ffffff',
  
  text: '#1e293b',
  textSecondary: '#475569',
  textMuted: '#64748b',
  
  heartRateBackground: '#fefefe',
  spO2Background: '#fefefe',
  temperatureBackground: '#fefefe',
  
  heartRateIcon: ['#dc2626', '#b91c1c'],
  spO2Icon: ['#2563eb', '#1d4ed8'],
  temperatureIcon: ['#d97706', '#b45309'],
  
  emergencyBackground: ['#ff6b6b', '#ff8e53'],
  
  border: '#e2e8f0',
  shadow: '#64748b',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeContext.Provider value={{ colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
