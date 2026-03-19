/**
 * Tema tanımları - Her tema için renk paleti.
 * Extension'ın NoCode modundaki görsel kimliğini belirler.
 */

import { ThemeName, ThemePalette } from './types';

const THEMES: Readonly<Record<ThemeName, ThemePalette>> = {
  midnight: {
    primary: '#6c5ce7',
    secondary: '#a29bfe',
    background: '#0a0a1a',
    surface: '#16162a',
    text: '#e8e8f0',
    accent: '#fd79a8',
    border: '#2d2d5e',
  },
  ocean: {
    primary: '#0984e3',
    secondary: '#74b9ff',
    background: '#0a1628',
    surface: '#132743',
    text: '#dfe6e9',
    accent: '#00cec9',
    border: '#1e3a5f',
  },
  sunset: {
    primary: '#e17055',
    secondary: '#fab1a0',
    background: '#1a0a0a',
    surface: '#2d1515',
    text: '#ffeaa7',
    accent: '#fdcb6e',
    border: '#4a2020',
  },
  forest: {
    primary: '#00b894',
    secondary: '#55efc4',
    background: '#0a1a0a',
    surface: '#152d15',
    text: '#dfe6e9',
    accent: '#ffeaa7',
    border: '#1e4a1e',
  },
  minimal: {
    primary: '#636e72',
    secondary: '#b2bec3',
    background: '#0d0d0d',
    surface: '#1a1a1a',
    text: '#dfe6e9',
    accent: '#74b9ff',
    border: '#2d3436',
  },
};

/** Tema paletini isimle getirir. Geçersiz isimde midnight döner. */
export function getThemePalette(name: ThemeName): ThemePalette {
  return THEMES[name] ?? THEMES.midnight;
}

/** Tüm kullanılabilir tema isimlerini döner */
export function getAvailableThemes(): ReadonlyArray<ThemeName> {
  return Object.keys(THEMES) as ThemeName[];
}
