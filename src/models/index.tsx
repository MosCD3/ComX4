import {Agent, ConnectionRecord, OutOfBandRecord} from '@aries-framework/core';
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

export type NewConnectionRecord = {
  connection: OutOfBandRecord;
  invitationUrl: string;
};

export type AgentContextCommands = {
  startAgent?: () => string;
  getAgent: Agent;
  changeWalletKey: (
    oldKey: string,
    newKey: string,
  ) => Promise<string | undefined>;
  processInvitationUrl: (code: string) => Promise<void>;
  processMessage: (code: string) => void;
  createConnection: () => Promise<NewConnectionRecord | undefined>;
  deleteConnection: (connectionId: string) => Promise<boolean | undefined>;
  getConnection: (id: string) => Promise<ConnectionRecord | undefined>;
  sendBasicMessage: (toID: string, message: string) => void;
  subscribeToBasicMessages: (
    fromId: string,
    callback: (id: string, message: string) => void,
  ) => void;
  unsubscribeToBasicMessages: () => void;
};

export type StorageContextType = {
  setValue: (key: string, value: string) => void;
  getValue: (key: string) => Promise<string | null>;
};

export type SettingsContextType = {
  setSettings: (value: AppSettings) => void;
  getSettings: () => AppSettings;
};
