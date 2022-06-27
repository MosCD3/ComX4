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

  const isRedirecton = (url: string): boolean => {
    const queryParams = parseUrl(url).query;
    return !(queryParams['c_i'] || queryParams['d_m']);
  };

  // ####### Provider Hooks Functions ###############
  const createConnection: Promise<NewConnectionRecord> = async () => {
    let agent = agentState.agent;

    if (!agent) {
      Alert.alert('Agent not initialized');
      return null;
    }

    const {invitation, connectionRecord} =
      await agent.connections.createConnection();
    console.log(`>> Connection Created, ID>>: ${connectionRecord.id}`);
    console.log(`>> Invitation, DUMP>>: ${JSON.stringify(invitation)}`);
    console.log(
      `>> Connection Record, DUMP>>: ${JSON.stringify(connectionRecord)}`,
    );
    console.log(
      `>> Creating connection invite, Endpoint>>: ${MediatorEndpoint}`,
    );

    const invite = invitation.toUrl({domain: MediatorEndpoint});

    console.log(`>> Created invite>>: ${invite}`);
    return {invitationUrl: invite, connection: connectionRecord};
  };

  const deleteConnection: Promise<boolean> = async (connectionId: string) => {
    let agent = agentState.agent;

    if (!agent) {
      Alert.alert('Agent not initialized');
      return null;
    }

    try {
      await agent.connections.deleteById(connectionId);
      return true;
    } catch (e) {
      console.log(`Exception deleting connection:${e}`);
    }
    return false;
  };

  const getConnection = async (id: string) => {
    let agent = agentState.agent;

    if (!agent) {
      Alert.alert('Agent not initialized');
      return null;
    }

    return agent.connections.getById(id);
  };

  const processInvitationUrlFunc = async (code: string) => {
    let agent = agentState.agent;

    if (!agent) {
      Alert.alert('Agent not initialized');
      return;
    }

    if (isRedirecton(code)) {
      console.log(`Processing connectionless invitation message:${code}`);

      const res = await fetch(code, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      const message = await res.json();
      console.log(`Json data to process:${message}`);
      await agent.receiveMessage(message);
      return;
    }

    console.log('Decoding connection Invitation from URL:', code);
    const decodedInvitation = await ConnectionInvitationMessage.fromUrl(code);

    console.log('New Invitation:', decodedInvitation);
    //One way to do it
    // const connectionRecord = await agent.connections.receiveInvitation(
    //   decodedInvitation,
    //   {
    //     autoAcceptConnection: autoAcceptConnections,
    //   },
    // );
    const connectionRecord = await agent.oob.receiveInvitationFromUrl(code, {
      autoAcceptConnection: getSettings().agentAutoAcceptConnections,
    });
    console.log(`Recieved invitation connection record:${connectionRecord}`);
  };

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
    if (getSettings().agentAutoAcceptConnections) {
      return;
    }

    //accepting connection invitation by sending request
    //TODO: add logic to prevent displaying accept promot for connections created by ME
    if (
      event.payload.connectionRecord.state ===
      DidExchangeState.InvitationReceived
    ) {
      const message = `Accept connection with:${event.payload.connectionRecord.theirLabel}?`;
      Alert.alert('Attention!', message, [
        {
          text: 'Accept',
          onPress: () => {
            agentState.agent?.oob.acceptInvitation(
              event.payload.connectionRecord.id,
            );
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

    //Sending ping trust to complete connection
    if (
      event.payload.connectionRecord.state === DidExchangeState.ResponseSent
    ) {
      console.log(
        '############################################=> Accept response',
      );
      agentState.agent?.connections.acceptResponse(
        event.payload.connectionRecord.id,
      );
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
    console.log(
      `>> Credential state changed: ${event.payload.credentialRecord.id}, previous state -> ${event.payload.previousState} new state: ${event.payload.credentialRecord.state}`,
    );

    console.log(`>===========================================>`);
    console.log(`>> Credential OBJECT DUMP>>: ${JSON.stringify(event)}`);
    console.log(`>===========================================>`);
    if (
      event.payload.credentialRecord.state === CredentialState.OfferReceived
    ) {
      console.log(`>> Recieved offer, should display credentail to user`);
      console.log(`>> AUTO ACCEPTING OFFER`);

      //TODO: Move some where else
      const previewAttributes: CredentialPreviewAttribute[] =
        event.payload.credentialRecord.offerMessage?.credentialPreview
          .attributes || [];
      var counter = 0;
      var message = '>> Offer Recieved <<\n';
      for (const credAttribute of previewAttributes) {
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
          onPress: () => {
            agentState.agent?.credentials.acceptOffer(
              event.payload.credentialRecord.id,
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
    } else if (event.payload.credentialRecord.state === CredentialState.Done) {
      //Currently not being triggered
      console.log('Donae saving credentials');
      Alert.alert('Credentail Saved');
    } else if (event.payload.credentialRecord.state === 'credential-received') {
      //No need for that step
      console.log('>> Recieved Credentail');
      // await agent.credentials.acceptCredential(event.payload.credentialRecord.id); //no need for that if you use
      // console.log('ALL DONE - CREDENTAIL ACCEPTED');
      // Alert.alert('ALL DONE - CREDENTAIL ACCEPTED');
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
