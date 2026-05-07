import type { moduleFederationPlugin } from '@module-federation/sdk';
export declare const getConfigPath: (userConfigPath?: string) => string;
export declare function readConfig(userConfigPath?: string): Promise<moduleFederationPlugin.ModuleFederationPluginOptions>;
