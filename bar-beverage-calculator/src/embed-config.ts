export interface EmbedConfig {
  theme: 'light' | 'dark';
  primaryColor: string;
  ctaText: string;
  ctaUrl?: string;
  showCost?: boolean;
  orgId?: string;
}

const DEFAULT_CONFIG: EmbedConfig = {
  theme: 'light',
  primaryColor: '#6b21a8',
  ctaText: 'Get Glassware & Bar Rental Quote',
  showCost: true,
};

export function getEmbedConfig(root: HTMLElement): EmbedConfig {
  return {
    ...DEFAULT_CONFIG,
    theme: (root.dataset.theme as 'light' | 'dark') || DEFAULT_CONFIG.theme,
    primaryColor: root.dataset.primaryColor || DEFAULT_CONFIG.primaryColor,
    ctaText: root.dataset.ctaText || DEFAULT_CONFIG.ctaText,
    ctaUrl: root.dataset.ctaUrl,
    showCost: root.dataset.showCost !== 'false',
    orgId: root.dataset.orgId,
  };
}
