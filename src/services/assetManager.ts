/**
 * Client Asset Manager Service
 * Connects UI with Persistent Asset Management API and synchronizes custom assets.
 */

import initialManifest from '../data/customAssetManifest.json';

export interface CustomAssetManifest {
  dishes: Record<string, string>;
  countryFlags: Record<string, string>;
  countryBackgrounds: Record<string, string>;
}

class AssetManagerService {
  private manifest: CustomAssetManifest = {
    dishes: { ...(initialManifest.dishes || {}) },
    countryFlags: { ...(initialManifest.countryFlags || {}) },
    countryBackgrounds: { ...(initialManifest.countryBackgrounds || {}) },
  };

  private listeners: (() => void)[] = [];

  constructor() {
    this.fetchLatestManifest();
  }

  public subscribe(callback: () => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => cb());
  }

  public getManifest(): CustomAssetManifest {
    return this.manifest;
  }

  public getDishImage(dishId: string): string | null {
    return this.manifest.dishes[dishId] || null;
  }

  public getCountryFlagImage(countryId: string): string | null {
    return this.manifest.countryFlags[countryId] || null;
  }

  public getCountryBackgroundImage(countryId: string): string | null {
    return this.manifest.countryBackgrounds[countryId] || null;
  }

  public async fetchLatestManifest(): Promise<CustomAssetManifest> {
    try {
      const res = await fetch('/api/assets/manifest');
      if (res.ok) {
        const data = await res.json();
        this.manifest = {
          dishes: { ...(data.dishes || {}) },
          countryFlags: { ...(data.countryFlags || {}) },
          countryBackgrounds: { ...(data.countryBackgrounds || {}) },
        };
        this.notify();
      }
    } catch {
      // In standalone production, use bundled manifest
    }
    return this.manifest;
  }

  /**
   * Optimize and resize image before upload to keep assets clean and fast
   */
  public async processImageFile(file: File, maxWidth = 512, maxHeight = 512): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Maintain aspect ratio without distortion
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }

          // Crisp rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Export as PNG to preserve transparency
          resolve(canvas.toDataURL('image/png', 0.95));
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  public async uploadAsset(
    type: 'dish' | 'country_flag' | 'country_bg',
    id: string,
    file: File
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const isBg = type === 'country_bg';
      const dataUrl = await this.processImageFile(file, isBg ? 1280 : 512, isBg ? 720 : 512);

      const res = await fetch('/api/assets/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id, dataUrl }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Upload failed');
      }

      const json = await res.json();
      if (json.manifest) {
        this.manifest = json.manifest;
        this.notify();
      }

      return { success: true, url: json.url };
    } catch (err: any) {
      console.error('Failed to upload custom asset:', err);
      return { success: false, error: err.message || 'Upload error' };
    }
  }

  public async restoreDefault(
    type: 'dish' | 'country_flag' | 'country_bg',
    id: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch('/api/assets/restore-default', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Restore failed');
      }

      const json = await res.json();
      if (json.manifest) {
        this.manifest = json.manifest;
        this.notify();
      }

      return { success: true };
    } catch (err: any) {
      console.error('Failed to restore default asset:', err);
      return { success: false, error: err.message || 'Restore error' };
    }
  }
}

export const assetManager = new AssetManagerService();
