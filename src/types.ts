export interface StorageData {
  buttonText: string;
}

export const DEFAULT_BUTTON_TEXT = 'LGTM👍';

export const STORAGE_KEYS = {
  BUTTON_TEXT: 'buttonText',
} as const;
