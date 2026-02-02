export interface EmbedConfig {
  theme: 'light' | 'dark';
  primaryColor: string;
  ctaText: string;
  ctaUrl?: string;
  showPricing?: boolean;
  orgId?: string;
}

const DEFAULT_CONFIG: EmbedConfig = {
  theme: 'light',
  primaryColor: '#1976d2',
  ctaText: 'Get Your Quote',
  showPricing: false,
};

export function getEmbedConfig(root: HTMLElement): EmbedConfig {
  return {
    ...DEFAULT_CONFIG,
    theme: (root.dataset.theme as 'light' | 'dark') || DEFAULT_CONFIG.theme,
    primaryColor: root.dataset.primaryColor || DEFAULT_CONFIG.primaryColor,
    ctaText: root.dataset.ctaText || DEFAULT_CONFIG.ctaText,
    ctaUrl: root.dataset.ctaUrl,
    showPricing: root.dataset.showPricing === 'true',
    orgId: root.dataset.orgId,
  };
}
