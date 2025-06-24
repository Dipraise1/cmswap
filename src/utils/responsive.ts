import { Dimensions, PixelRatio } from 'react-native';

export interface ScreenDimensions {
  width: number;
  height: number;
  scale: number;
  fontScale: number;
}

export interface ResponsiveValues {
  small: number;
  medium: number;
  large: number;
  xlarge: number;
}

class ResponsiveManager {
  private dimensions: ScreenDimensions;
  private listeners: Array<(dimensions: ScreenDimensions) => void> = [];

  constructor() {
    this.dimensions = this.getCurrentDimensions();
    this.setupListener();
  }

  private getCurrentDimensions(): ScreenDimensions {
    const { width, height } = Dimensions.get('window');
    return {
      width,
      height,
      scale: PixelRatio.get(),
      fontScale: PixelRatio.getFontScale(),
    };
  }

  private setupListener() {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      this.dimensions = {
        width: window.width,
        height: window.height,
        scale: PixelRatio.get(),
        fontScale: PixelRatio.getFontScale(),
      };
      
      this.listeners.forEach(listener => listener(this.dimensions));
    });
  }

  public subscribe(listener: (dimensions: ScreenDimensions) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public getDimensions(): ScreenDimensions {
    return this.dimensions;
  }

  public getScreenType(): 'small' | 'medium' | 'large' | 'xlarge' {
    const { width } = this.dimensions;
    
    if (width < 400) return 'small';
    if (width < 768) return 'medium';
    if (width < 1024) return 'large';
    return 'xlarge';
  }

  public isTablet(): boolean {
    const { width, height } = this.dimensions;
    const minDimension = Math.min(width, height);
    const maxDimension = Math.max(width, height);
    
    return minDimension >= 600 && maxDimension >= 960;
  }

  public isLandscape(): boolean {
    return this.dimensions.width > this.dimensions.height;
  }

  public getResponsiveValue(values: Partial<ResponsiveValues>): number {
    const screenType = this.getScreenType();
    
    if (values[screenType] !== undefined) {
      return values[screenType]!;
    }
    
    // Fallback logic
    const fallbackOrder: Array<keyof ResponsiveValues> = ['medium', 'small', 'large', 'xlarge'];
    for (const key of fallbackOrder) {
      if (values[key] !== undefined) {
        return values[key]!;
      }
    }
    
    return 0;
  }

  public scale(size: number): number {
    const { width } = this.dimensions;
    const baseWidth = 375; // iPhone X width as base
    return (width / baseWidth) * size;
  }

  public moderateScale(size: number, factor: number = 0.5): number {
    return size + (this.scale(size) - size) * factor;
  }

  public verticalScale(size: number): number {
    const { height } = this.dimensions;
    const baseHeight = 812; // iPhone X height as base
    return (height / baseHeight) * size;
  }

  public getGridColumns(): number {
    const screenType = this.getScreenType();
    const isLandscape = this.isLandscape();
    
    switch (screenType) {
      case 'small':
        return isLandscape ? 3 : 2;
      case 'medium':
        return isLandscape ? 4 : 2;
      case 'large':
        return isLandscape ? 5 : 3;
      case 'xlarge':
        return isLandscape ? 6 : 4;
      default:
        return 2;
    }
  }

  public getActionButtonSize(): number {
    return this.getResponsiveValue({
      small: 50,
      medium: 56,
      large: 64,
      xlarge: 72,
    });
  }

  public getFontSize(baseSize: number): number {
    const scaleFactor = Math.min(this.dimensions.fontScale, 1.3); // Cap at 1.3x
    return baseSize * scaleFactor;
  }

  public getSpacing(baseSpacing: number): number {
    return this.moderateScale(baseSpacing, 0.3);
  }

  public getPadding(): {
    horizontal: number;
    vertical: number;
    small: number;
    medium: number;
    large: number;
  } {
    const screenType = this.getScreenType();
    
    return {
      horizontal: this.getResponsiveValue({
        small: 16,
        medium: 20,
        large: 24,
        xlarge: 32,
      }),
      vertical: this.getResponsiveValue({
        small: 12,
        medium: 16,
        large: 20,
        xlarge: 24,
      }),
      small: this.getResponsiveValue({
        small: 8,
        medium: 10,
        large: 12,
        xlarge: 14,
      }),
      medium: this.getResponsiveValue({
        small: 12,
        medium: 16,
        large: 20,
        xlarge: 24,
      }),
      large: this.getResponsiveValue({
        small: 20,
        medium: 24,
        large: 32,
        xlarge: 40,
      }),
    };
  }

  public getCardSize(): {
    borderRadius: number;
    padding: number;
    margin: number;
  } {
    return {
      borderRadius: this.getResponsiveValue({
        small: 12,
        medium: 16,
        large: 20,
        xlarge: 24,
      }),
      padding: this.getResponsiveValue({
        small: 16,
        medium: 20,
        large: 24,
        xlarge: 28,
      }),
      margin: this.getResponsiveValue({
        small: 8,
        medium: 12,
        large: 16,
        xlarge: 20,
      }),
    };
  }

  public getIconSize(baseSize: number): number {
    return this.getResponsiveValue({
      small: baseSize * 0.8,
      medium: baseSize,
      large: baseSize * 1.2,
      xlarge: baseSize * 1.4,
    });
  }

  public getMaxWidth(): number {
    return this.getResponsiveValue({
      small: this.dimensions.width,
      medium: this.dimensions.width,
      large: Math.min(this.dimensions.width, 800),
      xlarge: Math.min(this.dimensions.width, 1200),
    });
  }

  public shouldUseTabletLayout(): boolean {
    return this.isTablet() || this.getScreenType() === 'xlarge';
  }

  public getActionButtonLayout(): {
    itemsPerRow: number;
    buttonSize: number;
    spacing: number;
  } {
    const screenType = this.getScreenType();
    const isLandscape = this.isLandscape();
    
    return {
      itemsPerRow: this.getResponsiveValue({
        small: isLandscape ? 5 : 4,
        medium: 5,
        large: isLandscape ? 6 : 5,
        xlarge: isLandscape ? 8 : 6,
      }),
      buttonSize: this.getActionButtonSize(),
      spacing: this.getResponsiveValue({
        small: 8,
        medium: 12,
        large: 16,
        xlarge: 20,
      }),
    };
  }

  public getTokenListLayout(): {
    showGrid: boolean;
    columns: number;
    itemHeight: number;
  } {
    const shouldUseGrid = this.shouldUseTabletLayout();
    
    return {
      showGrid: shouldUseGrid,
      columns: shouldUseGrid ? this.getGridColumns() : 1,
      itemHeight: this.getResponsiveValue({
        small: 70,
        medium: 80,
        large: 90,
        xlarge: 100,
      }),
    };
  }
}

export const responsive = new ResponsiveManager();

// Utility functions for easy access
export const scale = (size: number) => responsive.scale(size);
export const verticalScale = (size: number) => responsive.verticalScale(size);
export const moderateScale = (size: number, factor?: number) => responsive.moderateScale(size, factor);
export const getResponsiveValue = (values: Partial<ResponsiveValues>) => responsive.getResponsiveValue(values);
export const isTablet = () => responsive.isTablet();
export const isLandscape = () => responsive.isLandscape();
export const getScreenType = () => responsive.getScreenType();

export default responsive; 