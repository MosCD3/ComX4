import React, {useContext, useEffect, useRef, useState} from 'react';
import {Alert} from 'react-native';
import {parseUrl} from 'query-string';

import RNFS from 'react-native-fs';
import {
  Agent,
  AutoAcceptCredential,
  AutoAcceptProof,
  BasicMessageEventTypes,
  ConnectionEventTypes,
  ConnectionInvitationMessage,
  ConnectionRecord,
  ConnectionStateChangedEvent,
  ConsoleLogger,
  CredentialEventTypes,
  CredentialPreviewAttribute,
  CredentialExchangeRecord,
  CredentialState,
  CredentialStateChangedEvent,
  HttpOutboundTransport,
  WsOutboundTransport,
  InitConfig,
  LogLevel,
  MediatorPickupStrategy,
  ProofEventTypes,
  ProofState,
  ProofStateChangedEvent,
  ConnectionState,
  BasicMessageStateChangedEvent,
  DidExchangeState,
  OutOfBandRecord,
  CredentialPreviewAttributeOptions,
} from '@aries-framework/core';

import {agentDependencies} from '@aries-framework/react-native';

import axios from 'axios';
import {
  AgentEventTypes,
  AgentMessageProcessedEvent,
} from '@aries-framework/core/build/agent/Events';
import {
  AgentContextCommands,
  AgentStateType,
  NewConnectionRecord,
} from '../models';

import {useSettings} from './SettingsProvider';
import AppSettings from '../models/AppSettings';
import {getWalletConfig} from '../services/wallet.service';
import {MediatorEndpoint} from '../Constants';

type MessageRecievedCallback = (id: string, message: string) => void;

//Settings
const fetchMediatorInviteFromUrl = false;

//just a helper function to simulate call
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

//Download genesis file
async function getMediatorInvite(url: string) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (e) {
    console.log('EXCEPTION> downloadGenesis:', e);
    return null;
  }
}

//Download genesis file
async function downloadGenesis(genesisUrl: string) {
  try {
    const response = await axios.get(genesisUrl);
    return response.data;
  } catch (e) {
    console.log('EXCEPTION> downloadGenesis:', e);
    return null;
  }
}

//Storing genesis file
async function storeGenesis(
  genesis: string,
  fileName: string,
): Promise<string> {
  try {
    const genesisPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
    await RNFS.writeFile(genesisPath, genesis, 'utf8');
    return genesisPath;
  } catch (e) {
    console.log('EXCEPTION> storeGenesis:', e);
    return '';
  }
}

//Handle Custom Message Input
const processCustomMessage = async (agent: Agent, message: string) => {
  console.log(`===>Processing custom message:${message}`);
  await agent.receiveMessage(message);
};

/*  INIT FUNCTIONS */
//Get all connections
const getAllConnections = async (agent: Agent) => {
  const connections: ConnectionRecord[] = await agent.connections.getAll();
  console.log(`[] All Connections ${JSON.stringify(connections)}`);
};

//Get all credentails
const getAllCredentials = async (agent: Agent) => {
  const credentials: CredentialExchangeRecord[] =
    await agent.credentials.getAll();

  if (credentials?.length <= 0) {
    Alert.alert('No credentails found');
    return false;
  }

  var message = `>> Total Credentaols:${credentials?.length}<<\n`;
  var message = `>> Showing last credential<<\n`;

  //Will take only first credential
  var lastCredentailRecord = credentials[credentials.length - 1];

  //TODO: Move some where else
  const previewAttributes: CredentialPreviewAttribute[] =
    lastCredentailRecord.offerMessage?.credentialPreview.attributes || [];

  var counter = 0;

  for (const credAttribute of previewAttributes) {
    //Just not to bloat the alert with all values, limit to 5 only for demo purpose
    counter += 1;
    if (counter < 5) {
      message += `${credAttribute.name}: ${credAttribute.value}\n`;
    }

    // attributes[previewAttributes[index].name] =
    //   previewAttributes[index].value;
  }

  Alert.alert(message);

  console.log(`[] All Credentials ${JSON.stringify(credentials)}`);
};

/*
Main Function Init Agent
*/
async function initAgent(
  setAgentFunc,
  agentConfig: InitConfig,
): Promise<string | undefined> {
  // console.log('Getting mediator url');
  // if (fetchMediatorInviteFromUrl) {
  //   MEDIATOR_INVITE = await getMediatorInvite(MEDIATOR_URL);
  //   console.log('Mediator invitation:' + MEDIATOR_INVITE);
  // }

  console.log('initing agent');
  try {
    const agent = new Agent(agentConfig, agentDependencies);
    const httpOutboundTransporter = new HttpOutboundTransport();
    const wsOutboundTransporter = new WsOutboundTransport();
    agent.registerOutboundTransport(httpOutboundTransporter);
    agent.registerOutboundTransport(wsOutboundTransporter);

    // Make sure to initialize the agent before using it.
    console.log('Processing agent init..');
    await agent.initialize();
    console.log('Initialized agent!');
    setAgentFunc({agent: agent, loading: false});
  } catch (error) {
    console.log(error);
    return `${error}`;
  }
}
export const AgentContext = React.createContext<any>({});
export const AgentCommandsContext = React.createContext<any>({});
export const ConnectionsContext = React.createContext<any>({});

//********* Hooks *************
//**************************** */
export const getAgent = (): AgentStateType => {
  return useContext(AgentContext);
};

export const useAgent = (): AgentContextCommands => {
  return useContext(AgentCommandsContext);
};

//********* End Hooks *************

//**************************** */
//**************************** */
//**************************** */
//**************************** */
//Main Component
//**************************** */
//**************************** */
//**************************** */
//**************************** */
//**************************** */
const AgentProvider = ({children}) => {
  //Hooks
  const {getSettings, getDeviceLabel} = useSettings();

  //State
  const [agentState, setAgentState] = useState<AgentStateType>({
    agent: null,
    loading: false,
  });
  const [listnersSet, setListnersSet] = useState(false);
  const [agentConfig, setAgentConfig] = useState<InitConfig>();
  const [basicMessageListner, setBasicMessageListner] =
    useState<MessageRecievedCallback>();
  // var basicMessageListner: MessageRecievedCallback;
  const [basicMessageListnerId, setBasicMessageListnerId] = useState();
  const stateRef = useRef();
  stateRef.current = basicMessageListner;

  //Init methods
  const startAgentFunc = async () => {
    console.log(`Called to start agent`);
    if (agentState?.agent) {
      return 'Agent already running!';
    }

    let _agentConfig: InitConfig;
    let _appSettings = getSettings();
    if (!agentConfig) {
      _agentConfig = getWalletConfig();
      if (_appSettings.walletLabel) {
        _agentConfig = {
          ..._agentConfig,
          label: _appSettings.walletLabel,
        };
      }

      if (
        !_appSettings.walletRotateKeys &&
        _appSettings.walletID &&
        _appSettings.walletKey
      ) {
        _agentConfig = {
          ..._agentConfig,
          walletConfig: {
            id: _appSettings.walletID,
            key: _appSettings.walletKey,
          },
        };
      }
      setAgentConfig(_agentConfig);
      console.log(`Agent config final:`, JSON.stringify(_agentConfig));
    } else {
      _agentConfig = agentConfig;
    }
    return await initAgent(setAgentState, _agentConfig);
  };

  // ####### Provider Hooks Functions ###############
  const createConnection = async (): Promise<
    NewConnectionRecord | undefined
  > => {
    let agent = agentState.agent;

    if (!agent) {
      throw new Error('Agent not initialized');
    }
    try {
      const {outOfBandRecord, invitation} =
        await agent.oob.createLegacyInvitation({
          autoAcceptConnection: true,
        });
      console.log(`>> An OOB Connection Created, ID>>: ${outOfBandRecord.id}`);
      console.log(`>> OOB Invitation, DUMP>>: ${JSON.stringify(invitation)}`);
      console.log(
        `>> OOB Connection Record, DUMP>>: ${JSON.stringify(outOfBandRecord)}`,
      );
      console.log(
        `>> Creating connection invite, Endpoint>>: ${MediatorEndpoint}`,
      );

      const invite = invitation.toUrl({domain: MediatorEndpoint});

      console.log(`>> Created invite>>: ${invite}`);
      const ncc: NewConnectionRecord = {
        invitationUrl: invite,
        connection: outOfBandRecord,
      };
      return ncc;
    } catch (error) {
      throw new Error(`Error[299] ${error}`);
    }
  };

  const deleteConnection = async (
    connectionId: string,
  ): Promise<boolean | undefined> => {
    let agent = agentState.agent;

    if (!agent) {
      throw new Error('Agent not initialized');
    }

    try {
      await agent.connections.deleteById(connectionId);
      return true;
    } catch (error) {
      throw new Error(`Exception deleting connection:${error}`);
    }
  };

  const getConnection = async (
    id: string,
  ): Promise<ConnectionRecord | undefined> => {
    let agent = agentState.agent;

    if (!agent) {
      throw new Error('Agent not initialized');
    }

    try {
      return agent.connections.getById(id);
    } catch (error) {
      throw new Error(`Error[335]:${error}`);
    }
  };

  const processInvitationUrlFunc = async (code: string): Promise<void> => {
    let agent = agentState.agent;

    if (!agent) {
      throw new Error('Agent not initialized');
    }

    try {
      console.log('Decoding connection Invitation from URL:', code);
      const decodedInvitation = await ConnectionInvitationMessage.fromUrl(code);

      console.log(
        'New OOB Invitation Dump:',
        JSON.stringify(decodedInvitation),
      );

      const acceptInv = async () => {
        const {outOfBandRecord, connectionRecord} =
          await agent!.oob.receiveInvitationFromUrl(code, {
            reuseConnection: true,
          });
        console.log(
          `Accepted invitation connection record dump :${JSON.stringify(
            connectionRecord,
          )}`,
        );
        console.log(
          `Accepted  OOB invitation connection record dump:${JSON.stringify(
            outOfBandRecord,
          )}`,
        );
      };

      if (getSettings().agentAutoAcceptConnections) {
        await acceptInv();
      } else {
        const message = `Accept connection with:${decodedInvitation.label}?`;
        Alert.alert('Attention!', message, [
          {
            text: 'Accept',
            onPress: async () => {
              await acceptInv();
            },
          },
          {
            text: 'Reject',
            onPress: () => {
              console.log('User rejected');
            },
          },
        ]);
      }
    } catch (error) {
      throw new Error(`Error[335]:${error}`);
    }
  };

  //TODO: route through OOB module
  const processManualMessage = async (message: string) => {
    console.log(`called agent to process:${message}`);
    if (!agentState?.agent) {
      Alert.alert('Agent not initialized');
      return;
    }
    agentState?.agent?.receiveMessage(message);
  };

  //Send basic message to a connection. used in the chat module
  const sendBasicMessage = async (toID: string, message: string) => {
    let agent = agentState.agent;

    if (!agent) {
      Alert.alert('Agent not initialized');
      return;
    }
    try {
      console.log(`Sending basic message to id:${toID}/Message:${message}`);
      await agent.basicMessages.sendMessage(toID, message);
    } catch (e) {
      Alert.alert(e);
    }
  };

  const subscribeToBasicMessages = (
    fromId: string,
    callback: MessageRecievedCallback,
  ) => {
    setBasicMessageListnerId(fromId);
    setBasicMessageListner(callback);

    // basicMessageListner = callback;
    console.log('Basic message listenr SETTTTT');
  };

  const changeWalletKey = async (
    oldKey: string,
    newKey: string,
  ): Promise<string | undefined> => {
    let agent = agentState.agent;

    if (!agent) {
      return 'Agent not initialized';
    }

    try {
      if (agent.isInitialized) {
        console.log('Wallet is running, shutting down');
        await agent.shutdown();
        console.log('Wallet closed');
      }
    } catch (e) {
      console.log('Exception[440] changinf wallet key:', e);
      return `${e}`;
    }
  };

  /**   EVENT HANDLERS **/
  /**********************/
  /**  CONNECTION EVENTS **/
  const handleConnectionStateChange = (event: ConnectionStateChangedEvent) => {
    let agent = agentState.agent;

    if (!agent) {
      Alert.alert('ERR[430]: Agent not initialized');
      return;
    }

    console.log(
      `>> Connection event for: ${event.payload.connectionRecord.id}, previous state -> ${event.payload.previousState} new state: ${event.payload.connectionRecord.state}`,
    );
    console.log(`>> Connection OBJECT DUMP>>: ${JSON.stringify(event)}`);

    //No need to bother if auto accepting incoming connections
    //Connection event for: 599f6d47-3038-4425-8214-4e2537f1565b, previous state -> responded new state: complete
    if (
      event.payload.previousState === DidExchangeState.ResponseReceived &&
      event.payload.connectionRecord.state === DidExchangeState.Completed
    ) {
      Alert.alert(
        `Connection with ${event.payload.connectionRecord.theirLabel} completed`,
      );
      return;
    }

    if (event.payload.connectionRecord.state === DidExchangeState.Completed) {
      Alert.alert(
        `New connection with:${event.payload.connectionRecord.theirLabel} established`,
      );
    }
  };

  const handleProcessedMessageReceive = (event: AgentMessageProcessedEvent) => {
    //This is to silence mediator polling messages
    // if (event.payload.connection?.theirLabel?.includes('Animo Mediator')) return;
    console.log(
      `>> Processed Message From:${
        event.payload.connection?.theirLabel
      } \nRecieved OBJECT DUMP>>: ${JSON.stringify(event)}`,
    );
  };

  const handleBasicMessageReceive = (event: BasicMessageStateChangedEvent) => {
    // Alert.alert(`message:${event.payload.message.content}`);

    console.log(
      `>> Basic Message Recieved OBJECT DUMP>>: ${JSON.stringify(event)}`,
    );

    const fromId = event.payload.basicMessageRecord.connectionId;
    console.log(`>> Message from>>: ${fromId}`);

    if (!basicMessageListner) {
      console.log('ERROR: basicMessageListner undefined!');
    }
    basicMessageListner?.(
      event.payload.message.id,
      event.payload.message.content,
    );
  };

  /**  Credentials Handler */
  const handleCredentialStateChange = async (
    event: CredentialStateChangedEvent,
  ) => {
    if (!agentState.agent) {
      console.log('Error[517] Agent undefined');
      process.exit(0);
    }
    console.log(
      `>> Credential state changed: ${event.payload.credentialRecord.id}, previous state -> ${event.payload.previousState} new state: ${event.payload.credentialRecord.state}`,
    );

    console.log(`>===========================================>`);
    console.log(`>> Credential OBJECT DUMP>>: ${JSON.stringify(event)}`);
    console.log(`>===========================================>`);

    const acceptOffer = async () => {
      await agentState.agent?.credentials.acceptOffer({
        credentialRecordId: event.payload.credentialRecord.id,
      });
    };
    switch (event.payload.credentialRecord.state) {
      case CredentialState.OfferReceived:
        console.log('received a credential');
        // grab attributes
        const formatData = await agentState.agent.credentials.getFormatData(
          event.payload.credentialRecord.id,
        );
        const attributes = formatData.offerAttributes;
        if (!attributes) {
          Alert.alert('Offer received with no attributes!');
          return;
        }
        var counter = 0;
        var message = '>> Offer Recieved <<\n';
        for (const credAttribute of attributes) {
          //Just not to bloat the alert with all values, limit to 5 only for demo purpose
          counter += 1;
          if (counter < 5) {
            message += `${credAttribute.name}: ${credAttribute.value}\n`;
          }

          // attributes[previewAttributes[index].name] =
          //   previewAttributes[index].value;
        }

        Alert.alert('Attention!', message, [
          {
            text: 'Accept',
            onPress: async () => {
              await acceptOffer();
            },
          },
          {
            text: 'Reject',
            onPress: () => {
              console.log('User rejected offer');
            },
          },
        ]);
        break;
      case CredentialState.Done:
        console.log(
          `Credential for credential id ${event.payload.credentialRecord.id} is accepted`,
        );
        Alert.alert('Credentail Saved');
        break;
    }
  };

  /**  Proof State **/
  const handleProofStateChange = async (event: ProofStateChangedEvent) => {
    console.log(
      `>> Proof state changed: ${event.payload.proofRecord.id}, previous state -> ${event.payload.previousState} new state: ${event.payload.proofRecord.state}`,
    );

    const proofRecord = event.payload.proofRecord;
    if (!proofRecord) {
      Alert.alert('Error[492] Proof record undefined!');
      return;
    }

    const agent = agentState.agent;
    if (!agent) {
      Alert.alert('Error[498] Agent undefined!');
      return;
    }

    // previous state -> presentation-sent new state: done
    if (
      event.payload.previousState === ProofState.PresentationSent &&
      proofRecord.state === ProofState.Done
    ) {
      console.log('Done proving credentials');
      Alert.alert('Credential Proved!');
      return;
    }
    if (proofRecord.state === ProofState.RequestReceived) {
      const proofRequest = proofRecord.requestMessage?.indyProofRequest;
      if (!proofRequest) {
        console.log('Error: Proof request undefined');
        return;
      }
      // const presentationPreview =
      //   proofRecord.proposalMessage?.presentationProposal;

      //Retrieve credentials
      const retrievedCredentials =
        await agent.proofs.getRequestedCredentialsForProofRequest(
          proofRecord.id,
          {
            filterByPresentationPreview: true,
          },
        );
      // const retrievedCredentials =
      //   await agentState.agent?.proofs.getRequestedCredentialsForProofRequest(
      //     proofRecord.id,
      //     {filterByPresentationPreview: true},
      //   );
      const requestedCredentials =
        agent.proofs.autoSelectCredentialsForProofRequest(retrievedCredentials);

      var message = '>> Proof Request Recieved <<\n';
      message += `To prove:${proofRequest?.name}\n`;
      message += 'Attributes to prove:\n';

      console.log(`======== Proof Object Dump ==============`);
      console.log(JSON.stringify(proofRequest));

      Object.values(proofRequest.requestedAttributes).forEach(attr => {
        message += `${attr.name}\n`;
      });

      message += `Accept proof request?`;

      Alert.alert('Attention!', message, [
        {
          text: 'Accept',
          onPress: () => {
            agentState.agent?.proofs.acceptRequest(
              event.payload.proofRecord.id,
              requestedCredentials,
            );
          },
        },
        {
          text: 'Reject',
          onPress: () => {
            console.log('User rejected offer');
          },
        },
      ]);
    }
  };

  //After initializing agent, attach listners
  useEffect(() => {
    if (agentState?.agent && !listnersSet) {
      console.log('AgentInit: Setting event listners');
      agentState?.agent.events.on<BasicMessageStateChangedEvent>(
        BasicMessageEventTypes.BasicMessageStateChanged,
        event => {
          handleBasicMessageReceive(event);
        },
      );

      agentState?.agent.events.on<AgentMessageProcessedEvent>(
        AgentEventTypes.AgentMessageProcessed,
        event => {
          handleProcessedMessageReceive(event);
        },
      );

      agentState?.agent.events.on<CredentialStateChangedEvent>(
        CredentialEventTypes.CredentialStateChanged,
        event => {
          handleCredentialStateChange(event);
        },
      );

      agentState?.agent.events.on<ProofStateChangedEvent>(
        ProofEventTypes.ProofStateChanged,
        event => {
          handleProofStateChange(event);
        },
      );
      agentState?.agent.events.on<ConnectionStateChangedEvent>(
        ConnectionEventTypes.ConnectionStateChanged,
        event => {
          handleConnectionStateChange(event);
        },
      );
      console.log('AgentInit: Event listners set');
      setListnersSet(true);
    }
  }, [agentState]);

  return (
    <AgentContext.Provider value={agentState}>
      <AgentCommandsContext.Provider
        value={{
          startAgent: startAgentFunc,
          getAgent: agentState.agent,
          processInvitationUrl: processInvitationUrlFunc,
          processMessage: processManualMessage,
          createConnection: createConnection,
          deleteConnection: deleteConnection,
          getConnection: getConnection,
          sendBasicMessage: sendBasicMessage,
          subscribeToBasicMessages: subscribeToBasicMessages,
        }}>
        {children}
      </AgentCommandsContext.Provider>
    </AgentContext.Provider>
  );
};

export default AgentProvider;
