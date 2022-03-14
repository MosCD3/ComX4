import {
  Agent,
  ConnectionInvitationMessage,
  ConnectionRecord,
  ConnectionRecordProps,
} from '@aries-framework/core';
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
  connection: ConnectionRecord;
  invitationUrl: string;
};

export type AgentContextCommands = {
  startAgent?: () => string;
  getAgent: Agent;
  changeWalletKey: (
    oldKey: string,
    newKey: string,
  ) => Promise<string | undefined>;
  processInvitationUrl?: (code: string) => void;
  processMessage?: (code: string) => void;
  createConnection?: () => Promise<NewConnectionRecord>;
  deleteConnection?: (connectionId: string) => boolean;
  getConnection?: (id: string) => Promise<ConnectionRecord> | undefined;
  sendBasicMessage?: (toID: string, message: string) => void;
  subscribeToBasicMessages?: (
    fromId: string,
    callback: (id: string, message: string) => void,
  ) => void;
  unsubscribeToBasicMessages?: () => void;
};

export type StorageContextType = {
  setValue: (key: string, value: string) => void;
  getValue: (key: string) => Promise<string | null>;
};

export type SettingsContextType = {
  setSettings: (value: AppSettings) => void;
  getSettings: () => AppSettings;
};
