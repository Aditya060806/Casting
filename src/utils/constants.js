// Shared constants for Casting.

export const CONFIG_FILE_NAME = 'casting.json';

// Splits user-provided name input (e.g. "Box Card Modal") into individual names.
export const WHITESPACE_REGEX = /\s+/;

// Public JSON schema used for editor autocomplete/validation in casting.json.
export const SCHEMA_URL
  = 'https://raw.githubusercontent.com/Aditya060806/Harvest/main/schema/casting.schema.json';

// Default component block written into a fresh config.
export const DEFAULT_COMPONENT_CONFIG = {
  path: 'src/components',
  withStyle: true,
  withTest: true,
  withStory: false,
  withLazy: false,
};
