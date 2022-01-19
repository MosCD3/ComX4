import React, {useContext, useEffect, useState} from 'react';
import {View, Alert} from 'react-native';
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
  CredentialRecord,
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
} from '@aries-framework/core';

import {agentDependencies} from '@aries-framework/react-native';

import axios from 'axios';
import {
  AgentEventTypes,
  AgentMessageProcessedEvent,
  AgentMessageReceivedEvent,
} from '@aries-framework/core/build/agent/Events';
import {Dts_Genesis, Vonx_Greenlight_Genesis} from '../Assets/Dts_Genesis';
import {
  AgentContextCommands,
  AgentStateType,
  ConnectionsStateType,
} from '../models';

import {useSettings} from './SettingsProvider';
import AppSettings from '../models/AppSettings';
import {LEDGERS, MediatorEndpoint} from '../Settings';

// const MEDIATOR_URL = 'https://63a0c82ee8fe.ngrok.io';

//Mediator URL
//Head to https://mediator.animo.id/invitation then copy the resulting code
//Head to https://indicio-tech.github.io/mediator/ then copy the resulting code
var MEDIATOR_URL = 'https://mediator.animo.id/invitation';
// var MEDIATOR_INVITE =
//   'http://mediator.community.animo.id:9001?c_i=eyJAdHlwZSI6ICJkaWQ6c292OkJ6Q2JzTlloTXJqSGlxWkRUVUFTSGc7c3BlYy9jb25uZWN0aW9ucy8xLjAvaW52aXRhdGlvbiIsICJAaWQiOiAiYTA0OTg5MzgtNzZiYS00MmQ5LWE1NWEtM2FkY2E4ZmQ5OTY3IiwgInJlY2lwaWVudEtleXMiOiBbIkF3TVl1UHJ4TWNSeUFpZmMxdTdnUkhaaUFyRVdNWnJ4bkprZ2ZwNDlmVkZ0Il0sICJsYWJlbCI6ICJBbmltbyBDb21tdW5pdHkgTWVkaWF0b3IiLCAic2VydmljZUVuZHBvaW50IjogImh0dHA6Ly9tZWRpYXRvci5jb21tdW5pdHkuYW5pbW8uaWQ6OTAwMSJ9';

var MEDIATOR_INVITE =
  'http://mediator3.test.indiciotech.io:3000?c_i=eyJAdHlwZSI6ICJkaWQ6c292OkJ6Q2JzTlloTXJqSGlxWkRUVUFTSGc7c3BlYy9jb25uZWN0aW9ucy8xLjAvaW52aXRhdGlvbiIsICJAaWQiOiAiYjE5YTM2ZjctZjhiZi00Mjg2LTg4ZjktODM4ZTIyZDI0ZjQxIiwgInJlY2lwaWVudEtleXMiOiBbIkU5VlhKY1pzaGlYcXFMRXd6R3RtUEpCUnBtMjl4dmJMYVpuWktTU0ZOdkE2Il0sICJzZXJ2aWNlRW5kcG9pbnQiOiAiaHR0cDovL21lZGlhdG9yMy50ZXN0LmluZGljaW90ZWNoLmlvOjMwMDAiLCAibGFiZWwiOiAiSW5kaWNpbyBQdWJsaWMgTWVkaWF0b3IifQ==';

const GENESIS_URL_INDICIO =
  'https://raw.githubusercontent.com/Indicio-tech/indicio-network/main/genesis_files/pool_transactions_testnet_genesis';
const GENESIS_URL_SOVRIN =
  'https://raw.githubusercontent.com/sovrin-foundation/sovrin/1.1.50-master/sovrin/pool_transactions_sandbox_genesis';

const GENESIS_URL_SOVRIN_LIVE =
  'https://raw.githubusercontent.com/sovrin-foundation/sovrin/master/sovrin/pool_transactions_live_genesis';

const GENESIS_URL_SOVRIN_BUILDER =
  'https://github.com/sovrin-foundation/sovrin/blob/master/sovrin/pool_transactions_builder_genesis';

//Settings
const fetchMediatorInviteFromUrl = false;
const randomiseWalletKeys = true;
// const GENESIS_URL_DTS = 'http://test.bcovrin.vonx.io/genesis';
// const GENESIS_URL_DTS_Dev = 'http://dev.greenlight.bcovrin.vonx.io/genesis';
const walletLabel = 'ComX';
const walletID = 'comx4-s';
const walletKey = 'comx4-walletkey10';
// const poolName = 'comx4-pool';

//Just change here
// const GENESIS_URL = GENESIS_URL_DTS_Dev;

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
  const credentials: CredentialRecord[] = await agent.credentials.getAll();

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
  appSettings: AppSettings,
): Promise<string> {
  console.log('Getting mediator url');
  if (fetchMediatorInviteFromUrl) {
    MEDIATOR_INVITE = await getMediatorInvite(MEDIATOR_URL);
    console.log('Mediator invitation:' + MEDIATOR_INVITE);
  }

  /*
  //Currently not used
  console.log('Downloading genesis');

  var genesisString = '';
  if (GENESIS_URL === GENESIS_URL_DTS) {
    genesisString = Dts_Genesis;
  } else {
    console.log(`Downloading genesis from :${GENESIS_URL}`);
    const genesis = await downloadGenesis(GENESIS_URL);
    if (!genesis) {
      Alert.alert('Error downloading genesis file from:' + GENESIS_URL);
      return 'Error download genesis';
    }
    console.log(`Genesis downloaded:${genesis}`);
    console.log('Saving genesis to file ..');
    genesisString = genesis;
  }
  */

  //Use that only if you want to download and save genesis to a local file once,
  //or maybe store genesis string in a local db or prefs and dont bother with storage permissions
  /*
  const genesisPath: string = await storeGenesis(genesisString, 'genesis.txn');

  if (!genesisPath) {
    return 'Error saving genesis';
  }
    console.log('Saved to:', genesisPath);
  */

  console.log('initing agent');
  //   await sleep(2000);
  //   console.log('agent init done');
  var timeNow = new Date();

  //Randomise wallet params each time, some mediators will not work on re-starting test with same pool id and other wallet keys

  //   const randomiseWalletKeys = false;
  // const GENESIS_URL_DTS = 'http://test.bcovrin.vonx.io/genesis';
  // const walletLabel = 'ComX';
  // const walletID = 'comx4-s';
  // const walletKey = 'comx4-walletkey10';
  // const poolName = 'comx4-pool';

  try {
    const agentConfig: InitConfig = {
      label: randomiseWalletKeys
        ? `${walletLabel}${timeNow.getTime()}`
        : walletLabel,
      mediatorConnectionsInvite: MEDIATOR_INVITE,
      mediatorPickupStrategy: MediatorPickupStrategy.Implicit,
      walletConfig: {
        id: randomiseWalletKeys ? `${walletID}${timeNow.getTime()}` : walletID,
        key: randomiseWalletKeys
          ? `${walletKey}${timeNow.getTime()}`
          : walletKey,
      },
      autoAcceptConnections: appSettings.agentAutoAcceptConnections,
      autoAcceptCredentials: AutoAcceptCredential.ContentApproved,
      autoAcceptProofs: AutoAcceptProof.ContentApproved,
      indyLedgers: LEDGERS,
      // genesisPath: genesisPath,
      logger: new ConsoleLogger(LogLevel.debug),
    };

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

    return null;
  } catch (error) {
    console.log(error);
    return error;
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
  const {setSettings, getSettings} = useSettings();
  const [agentState, setAgentState] = useState<AgentStateType>({
    agent: null,
    loading: false,
  });
  const [listnersSet, setListnersSet] = useState(false);

  const startAgentFunc = async () => {
    console.log(`Called to start agent`);
    if (agentState?.agent) {
      return 'Agent already running!';
    }

    return await initAgent(setAgentState, getSettings());
  };

  const isRedirecton = (url: string): boolean => {
    const queryParams = parseUrl(url).query;
    return !(queryParams['c_i'] || queryParams['d_m']);
  };

  const createConnection = async () => {
    let agent = agentState.agent;

    if (!agent) {
      Alert.alert('Agent not initialized');
      return;
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

    console.log(`>> Creating invite>>: ${invite}`);
    return invite;
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
    const connectionRecord = await agent.connections.receiveInvitationFromUrl(
      code,
      {
        autoAcceptConnection: getSettings().agentAutoAcceptConnections,
      },
    );
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
      event.payload.previousState === ConnectionState.Responded &&
      event.payload.connectionRecord.state === ConnectionState.Complete
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
    if (event.payload.connectionRecord.state === ConnectionState.Invited) {
      const message = `Accept connection with:${event.payload.connectionRecord.theirLabel}?`;
      Alert.alert('Attention!', message, [
        {
          text: 'Accept',
          onPress: () => {
            agentState.agent?.connections.acceptInvitation(
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
    if (event.payload.connectionRecord.state === ConnectionState.Responded) {
      console.log(
        '############################################=> Accept response',
      );
      agentState.agent?.connections.acceptResponse(
        event.payload.connectionRecord.id,
      );
    }

    if (event.payload.connectionRecord.state === ConnectionState.Complete) {
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

  const handleBasicMessageReceive = (event: BasicMessageReceivedEvent) => {
    Alert.alert(`message:${event.payload.message.content}`);

    console.log(
      `>> Basic Message Recieved OBJECT DUMP>>: ${JSON.stringify(event)}`,
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
      agentState?.agent.events.on<BasicMessageReceivedEvent>(
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
          processInvitationUrl: processInvitationUrlFunc,
          processMessage: processManualMessage,
          createConnection: createConnection,
        }}>
        {children}
      </AgentCommandsContext.Provider>
    </AgentContext.Provider>
  );
};

export default AgentProvider;
