export interface Preset {
  name: string;
  template: string;
}

export interface Config {
  mailDomain: string;
  defaultTemplate: string;
  presets: Preset[];
  counter: number;
  shortcutEnabled: boolean;
}

export const DEFAULT_CONFIG: Config = {
  mailDomain: '',
  defaultTemplate: '{{domain}}-{{date:yyyyMMdd}}@{{mailDomain}}',
  presets: [],
  counter: 1,
  shortcutEnabled: false,
};

export interface TemplateContext {
  domain: string;
  counter: number;
  mailDomain: string;
}

export interface PlaceholderHandler {
  resolve(arg: string | undefined, ctx: TemplateContext): string;
}
