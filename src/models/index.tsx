import {Agent, ConnectionRecord} from '@aries-framework/core';
import AppSettings from './AppSettings';
export type ListItemType = {
  id: string;
  title: string;
};

export type ModalContextType = {
  setModal: (props: ModalProps) => void;
};
export type ModalProps = {
  children: any;
  isVisible: boolean;
};
export type AgentStateType = {
  agent: Agent | null;
  loading: boolean;
};

export type AgentContextCommands = {
  startAgent?: () => string;
  processInvitationUrl?: (code: string) => void;
  processMessage?: (code: string) => void;
};

export type StorageContextType = {
  setValue: (key: string, value: string) => void;
  getValue: (key: string) => Promise<string | null>;
};

export type SettingsContextType = {
  setSettings: (value: AppSettings) => void;
  getSettings: () => AppSettings;
};
