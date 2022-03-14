import {
  AutoAcceptCredential,
  AutoAcceptProof,
  ConsoleLogger,
  InitConfig,
  LogLevel,
  MediatorPickupStrategy,
} from '@aries-framework/core';
import {LEDGERS, MEDIATOR_INVITE} from '../Constants';

//This will return the default value for the config
export function getWalletConfig(): InitConfig {
  var timeNow = new Date();
  const agentConfig: InitConfig = {
    label: 'ComX TestBed',
    mediatorConnectionsInvite: MEDIATOR_INVITE,
    mediatorPickupStrategy: MediatorPickupStrategy.Implicit,
    walletConfig: {
      id: `comx4-${timeNow.getTime()}`,
      key: `comx4key-${timeNow.getTime()}`,
    },
    autoAcceptConnections: true,
    autoAcceptCredentials: AutoAcceptCredential.ContentApproved,
    autoAcceptProofs: AutoAcceptProof.ContentApproved,
    indyLedgers: LEDGERS,
    connectToIndyLedgersOnStartup: false,
    publicDidSeed: 'issuer20000000000000000000000000',
    // genesisPath: genesisPath,
    logger: new ConsoleLogger(LogLevel.debug),
  };

  return agentConfig;
}
