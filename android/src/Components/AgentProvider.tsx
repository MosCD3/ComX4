import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  Button,
  SafeAreaView,
} from 'react-native';

import RNFS from 'react-native-fs';
import {
  Agent,
  ConnectionEventTypes,
  ConnectionInvitationMessage,
  ConnectionRecord,
  ConnectionStateChangedEvent,
  ConsoleLogger,
  CredentialEventTypes,
  CredentialRecord,
  CredentialState,
  CredentialStateChangedEvent,
  HttpOutboundTransport,
  InitConfig,
  LogLevel,
} from '@aries-framework/core';

import {agentDependencies} from '@aries-framework/react-native';

import axios from 'axios';

import QRCodeScanner from './QRCodeScanner';
import {AgentEventTypes} from '@aries-framework/core/build/agent/Events';
import Dts_Genesis from '../Assets/Dts_Genesis';

// const MEDIATOR_URL = 'https://63a0c82ee8fe.ngrok.io';

//Mediator URL
//Head to https://mediator.animo.id/invitation then copy the resulting code
//Head to https://indicio-tech.github.io/mediator/ then copy the resulting code
const MEDIATOR_INVITE =
  'https://mediator.animo.id/invitation?c_i=eyJAdHlwZSI6Imh0dHBzOi8vZGlkY29tbS5vcmcvY29ubmVjdGlvbnMvMS4wL2ludml0YXRpb24iLCJAaWQiOiJkZTE5MDZlNS0xNDJiLTQxNDktYTg5Ny1kODVkMGY3ODAxZjMiLCJsYWJlbCI6IkFuaW1vIE1lZGlhdG9yIiwicmVjaXBpZW50S2V5cyI6WyJHc3g3ZW9nVGNlbWR2TDZBajU5NVFDM1NEdGdINFdwRjZ0N2ExbzN4Q2JGZCJdLCJzZXJ2aWNlRW5kcG9pbnQiOiJodHRwczovL21lZGlhdG9yLmFuaW1vLmlkIiwicm91dGluZ0tleXMiOltdfQ';
const GENESIS_URL_INDICIO =
  'https://raw.githubusercontent.com/Indicio-tech/indicio-network/main/genesis_files/pool_transactions_testnet_genesis';
const GENESIS_URL_SOVRIN =
  'https://raw.githubusercontent.com/sovrin-foundation/sovrin/1.1.50-master/sovrin/pool_transactions_sandbox_genesis';

const GENESIS_URL_SOVRIN_LIVE =
  'https://raw.githubusercontent.com/sovrin-foundation/sovrin/master/sovrin/pool_transactions_live_genesis';

const GENESIS_URL_SOVRIN_BUILDER =
  'https://github.com/sovrin-foundation/sovrin/blob/master/sovrin/pool_transactions_builder_genesis';

const GENESIS_URL_DTS = 'http://test.bcovrin.vonx.io/genesis';

//Just change here
const GENESIS_URL = GENESIS_URL_DTS;

//just a helper function to simulate call
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

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

/*  EVENT HANDLERS */

//Handling an invitation to connect
const handleQRCodeScanned = async (agent: Agent, code: string) => {
  console.log('Decoding connection Invitation from URL:', code);
  const decodedInvitation = await ConnectionInvitationMessage.fromUrl(code);

  console.log('New Invitation:', decodedInvitation);
  const connectionRecord = await agent.connections.receiveInvitation(
    decodedInvitation,
    {
      autoAcceptConnection: true,
    },
  );
  console.log(`Recieve invitation connection record:${connectionRecord}`);
};

const handleConnectionStateChange = (
  agent: Agent,
  event: ConnectionStateChangedEvent,
) => {
  console.log(
    `>> Connection event for: ${event.payload.connectionRecord.id}, previous state -> ${event.payload.previousState} new state: ${event.payload.connectionRecord.state}`,
  );
  console.log(`>> Connection OBJECT DUMP>>: ${event}`);
};

const handleCredentialStateChange = async (
  agent: Agent,
  event: CredentialStateChangedEvent,
) => {
  console.log(
    `>> Credential state changed: ${event.payload.credentialRecord.id}, previous state -> ${event.payload.previousState} new state: ${event.payload.credentialRecord.state}`,
  );
  console.log(`>> Credential OBJECT DUMP>>: ${event}`);
  console.log(`>===========================================>`);
  if (event.payload.credentialRecord.state === 'offer-received') {
    console.log(`>> Recieved offer, should display credentail to user`);
    // console.log(`>> AUTO ACCEPTING OFFER`);
    agent.credentials.acceptOffer(event.payload.credentialRecord.id);
  } else if (event.payload.credentialRecord.state === CredentialState.Done) {
    Alert.alert('ALL DONE - CREDENTAIL ACCEPTED');
  }
  // } else if (event.payload.credentialRecord.state === 'credential-received') {
  //   console.log('>> Recieved Credentail');
  //   await agent.credentials.acceptCredential(event.payload.credentialRecord.id);
  //   console.log('ALL DONE - CREDENTAIL ACCEPTED');
  //   Alert.alert('ALL DONE - CREDENTAIL ACCEPTED');
  // }
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
  console.log(`[] All Credentials ${JSON.stringify(credentials)}`);
};

/*
Main Function Init Agent
*/
async function initAgent(setAgentFunc): Promise<string> {
  console.log('Downloading genesis');

  var genesisString = '';
  if (GENESIS_URL === GENESIS_URL_DTS) {
    genesisString = Dts_Genesis;
  } else {
    const genesis = await downloadGenesis(GENESIS_URL_INDICIO);
    if (!genesis) {
      return 'Error download genesis';
    }
    console.log('Genesis downloaded ..');
    console.log('Saving genesis to file ..');
    genesisString = genesis;
  }

  const genesisPath: string = await storeGenesis(genesisString, 'genesis.txn');

  if (!genesisPath) {
    return 'Error saving genesis';
  }
  console.log('Saved to:', genesisPath);

  console.log('initing agent');
  //   await sleep(2000);
  //   console.log('agent init done');
  var timeNow = new Date();

  try {
    const agentConfig: InitConfig = {
      label: `my-agent9-${timeNow.getTime()}`,
      mediatorConnectionsInvite: MEDIATOR_INVITE,
      walletConfig: {
        id: `walletId11-${timeNow.getTime()}`,
        key: `testkey023048230482304230424-${timeNow.getTime()}`,
      },
      autoAcceptConnections: true,
      poolName: `test-194-${timeNow.getTime()}`,
      genesisPath,
      logger: new ConsoleLogger(LogLevel.debug),
    };

    const agent = new Agent(agentConfig, agentDependencies);
    const httpOutboundTransporter = new HttpOutboundTransport();
    agent.registerOutboundTransport(httpOutboundTransporter);

    // Make sure to initialize the agent before using it.
    console.log('Processing agent init..');
    await agent.initialize();
    console.log('Initialized agent!');

    const handleBasicMessageReceive = event => {
      console.log(
        `New Basic Message with verkey ${event.verkey}:`,
        event.message,
      );
    };

    agent.events.on(
      AgentEventTypes.AgentMessageReceived,
      handleBasicMessageReceive,
    );

    agent.events.on<CredentialStateChangedEvent>(
      CredentialEventTypes.CredentialStateChanged,
      event => {
        handleCredentialStateChange(agent, event);
      },
    );

    agent.events.on<ConnectionStateChangedEvent>(
      ConnectionEventTypes.ConnectionStateChanged,
      event => {
        handleConnectionStateChange(agent, event);
      },
    );

    setAgentFunc(agent);
  } catch (error) {
    console.log(error);
    return error;
  }

  return '';
}

//Main Component
const AgentProvider = params => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [myAgent, setAgent] = useState<Agent>();
  const [isScanStarted, setIsScanStarted] = useState(false);
  return (
    <View>
      <Text>This is agent provider</Text>
      <TouchableOpacity
        style={styles.buttonStyles}
        onPress={async () => {
          var error = await initAgent(setAgent);
          if (error) {
            Alert.alert('Error', error);
          }
        }}>
        <Text style={styles.textStyle}>Init Agent</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buttonStyles}
        onPress={() => {
          setIsScanStarted(true);
          setModalVisible(true);
        }}>
        <Text style={styles.textStyle}>Scan QrCode</Text>
      </TouchableOpacity>

      <Modal animationType="slide" transparent={true} visible={isModalVisible}>
        <SafeAreaView style={styles.qrCodeWrapper}>
          <Text>Am modal displayed</Text>
          <QRCodeScanner
            onCodeRead={(code: string) => {
              if (isScanStarted) {
                console.log('got code:', code);
                setIsScanStarted(false);
                setModalVisible(false);
                if (myAgent) {
                  console.log('agent is set you can init the process');
                  console.log(`code recieved:${code}`);
                  handleQRCodeScanned(myAgent, code);
                } else {
                  Alert.alert('still cannot find aagent');
                }
              }
            }}
          />
          <Button
            title="Close"
            onPress={() => {
              setModalVisible(false);
            }}
          />
        </SafeAreaView>
      </Modal>

      <TouchableOpacity
        style={styles.buttonStyles}
        onPress={() => {
          if (myAgent) {
            getAllConnections(myAgent);
          } else {
            Alert.alert('still cannot find aagent');
          }
        }}>
        <Text style={styles.textStyle}>Connections</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buttonStyles}
        onPress={() => {
          if (myAgent) {
            getAllCredentials(myAgent);
          } else {
            Alert.alert('still cannot find aagent');
          }
        }}>
        <Text style={styles.textStyle}>Credentials</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonStyles: {
    backgroundColor: '#565656',
    flex: 1,
    padding: 20,
    marginTop: 5,
  },
  textStyle: {
    color: '#fff',
    fontSize: 18,
  },
  qrCodeWrapper: {
    alignContent: 'center',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
});

export default AgentProvider;
