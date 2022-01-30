import uuid from 'react-native-uuid';
import {
  Agent,
  AutoAcceptCredential,
  ConnectionRecord,
  CredentialDefinitionTemplate,
  CredentialPreview,
  SchemaTemplate,
} from '@aries-framework/core';
import {CredDef} from 'indy-sdk';
import {Schema} from 'indy-sdk';
import {LinkedAttachment} from '@aries-framework/core/build/utils/LinkedAttachment';
import {
  Attachment,
  AttachmentData,
} from '@aries-framework/core/build/decorators/attachment/Attachment';

export const issueCredential = async (agent: Agent, connectionID: string) => {
  //1-Make sure you passed any random seed value to walled config while init wallet
  //example seed  = "issuer00000000000000000000000000"
  //This will tell the agent to generate a "publicDid" out of that seed

  const credentialPreview = CredentialPreview.fromRecord({
    name: 'John',
    age: '99',
  });

  const {definition} = await prepareForIssuance(agent, ['name', 'age']);

  let credentialTemplate = {
    credentialDefinitionId: definition.id,
    comment: 'some comment about credential',
    preview: credentialPreview,
    linkedAttachments: [
      new LinkedAttachment({
        name: 'image_0',
        attachment: new Attachment({
          filename: 'picture-of-a-cat.png',
          data: new AttachmentData({base64: 'cGljdHVyZSBvZiBhIGNhdA=='}),
        }),
      }),
      new LinkedAttachment({
        name: 'image_1',
        attachment: new Attachment({
          filename: 'picture-of-a-dog.png',
          data: new AttachmentData({base64: 'UGljdHVyZSBvZiBhIGRvZw=='}),
        }),
      }),
    ],
  };

  let issuerCredentialRecord = await agent.credentials.offerCredential(
    connectionID,
    {
      ...credentialTemplate,
      autoAcceptCredential: AutoAcceptCredential.ContentApproved,
    },
  );
};

//Helper functions
export async function prepareForIssuance(agent: Agent, attributes: string[]) {
  const publicDid = agent.publicDid?.did;

  if (!publicDid) {
    throw new Error('No public did');
  }

  const didInfo = await agent.wallet.createDid();
  const result = await agent.ledger.registerPublicDid(
    didInfo.did,
    didInfo.verkey,
    'moscdDid',
    'TRUST_ANCHOR',
  );

  if (!result) {
  }

  await ensurePublicDidIsOnLedger(agent, publicDid);

  const schema = await registerSchema(agent, {
    attributes,
    name: `schema-${uuid.v4()}`,
    version: '1.0',
  });

  const definition = await registerDefinition(agent, {
    schema,
    signatureType: 'CL',
    supportRevocation: false,
    tag: 'default',
  });

  return {
    schema,
    definition,
    publicDid,
  };
}

export async function registerDefinition(
  agent: Agent,
  definitionTemplate: CredentialDefinitionTemplate,
): Promise<CredDef> {
  const credentialDefinition = await agent.ledger.registerCredentialDefinition(
    definitionTemplate,
  );
  console.log(
    `created credential definition with id ${credentialDefinition.id}`,
    credentialDefinition,
  );
  return credentialDefinition;
}
export async function registerSchema(
  agent: Agent,
  schemaTemplate: SchemaTemplate,
): Promise<Schema> {
  const schema = await agent.ledger.registerSchema(schemaTemplate);
  console.log(`created schema with id ${schema.id}`, schema);
  return schema;
}

export async function ensurePublicDidIsOnLedger(
  agent: Agent,
  publicDid: string,
) {
  try {
    //This will write the created public did while wallet init -> to any of the given pools(ledgers)
    console.log(`Ensure test DID ${publicDid} is written to ledger`);
    await agent.ledger.getPublicDid(publicDid);
  } catch (error) {
    // regardless of thrown errors. We're more explicit about the problem with this error handling.
    throw new Error(
      `DID ${publicDid} is not written on ledger or ledger is not available: ${error.message}`,
    );
  }
}
