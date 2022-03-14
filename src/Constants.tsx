export const KEY_STORAGE_ISAUTOACCEPTCONN = 'isautoacceptconn';
export const KEY_STORAGE_WALLETLABEL = 'wallet_label';
export const KEY_STORAGE_WALLETID = 'wallet_id';
export const KEY_STORAGE_WALLETKEY = 'wallet_key';
export const KEY_STORAGE_WALLET_RANDOMKEYS = 'iswalletrandomisekeys';

import {
  CANDy_Genesis,
  Dts_Genesis,
  Vonx_Greenlight_Genesis,
} from './Assets/Dts_Genesis';

export const LEDGERS = [
  {
    id: 'BCovrin Test',
    genesisTransactions: Dts_Genesis,
    isProduction: false,
  },
  {
    id: 'Vonx Greenlight',
    genesisTransactions: Vonx_Greenlight_Genesis,
    isProduction: false,
  },
  {
    id: 'CandyDev',
    genesisTransactions: CANDy_Genesis,
    isProduction: false,
  },
];

export const MediatorEndpoint = 'http://mediator3.test.indiciotech.io:3000';

// const MEDIATOR_URL = 'https://63a0c82ee8fe.ngrok.io';

//Mediator URL
//Head to https://mediator.animo.id/invitation then copy the resulting code
//Head to https://indicio-tech.github.io/mediator/ then copy the resulting code
var MEDIATOR_URL = 'https://mediator.animo.id/invitation';
// var MEDIATOR_INVITE =
//   'http://mediator.community.animo.id:9001?c_i=eyJAdHlwZSI6ICJkaWQ6c292OkJ6Q2JzTlloTXJqSGlxWkRUVUFTSGc7c3BlYy9jb25uZWN0aW9ucy8xLjAvaW52aXRhdGlvbiIsICJAaWQiOiAiYTA0OTg5MzgtNzZiYS00MmQ5LWE1NWEtM2FkY2E4ZmQ5OTY3IiwgInJlY2lwaWVudEtleXMiOiBbIkF3TVl1UHJ4TWNSeUFpZmMxdTdnUkhaaUFyRVdNWnJ4bkprZ2ZwNDlmVkZ0Il0sICJsYWJlbCI6ICJBbmltbyBDb21tdW5pdHkgTWVkaWF0b3IiLCAic2VydmljZUVuZHBvaW50IjogImh0dHA6Ly9tZWRpYXRvci5jb21tdW5pdHkuYW5pbW8uaWQ6OTAwMSJ9';

export const MEDIATOR_INVITE =
  'http://mediator3.test.indiciotech.io:3000?c_i=eyJAdHlwZSI6ICJkaWQ6c292OkJ6Q2JzTlloTXJqSGlxWkRUVUFTSGc7c3BlYy9jb25uZWN0aW9ucy8xLjAvaW52aXRhdGlvbiIsICJAaWQiOiAiYjE5YTM2ZjctZjhiZi00Mjg2LTg4ZjktODM4ZTIyZDI0ZjQxIiwgInJlY2lwaWVudEtleXMiOiBbIkU5VlhKY1pzaGlYcXFMRXd6R3RtUEpCUnBtMjl4dmJMYVpuWktTU0ZOdkE2Il0sICJzZXJ2aWNlRW5kcG9pbnQiOiAiaHR0cDovL21lZGlhdG9yMy50ZXN0LmluZGljaW90ZWNoLmlvOjMwMDAiLCAibGFiZWwiOiAiSW5kaWNpbyBQdWJsaWMgTWVkaWF0b3IifQ==';

const GENESIS_URL_INDICIO =
  'https://raw.githubusercontent.com/Indicio-tech/indicio-network/main/genesis_files/pool_transactions_testnet_genesis';
const GENESIS_URL_SOVRIN =
  'https://raw.githubusercontent.com/sovrin-foundation/sovrin/1.1.50-master/sovrin/pool_transactions_sandbox_genesis';

const GENESIS_URL_SOVRIN_LIVE =
  'https://raw.githubusercontent.com/sovrin-foundation/sovrin/master/sovrin/pool_transactions_live_genesis';

const GENESIS_URL_SOVRIN_BUILDER =
  'https://github.com/sovrin-foundation/sovrin/blob/master/sovrin/pool_transactions_builder_genesis';

// const GENESIS_URL_DTS = 'http://test.bcovrin.vonx.io/genesis';
// const GENESIS_URL_DTS_Dev = 'http://dev.greenlight.bcovrin.vonx.io/genesis';
// const poolName = 'comx4-pool';
//Just change here
// const GENESIS_URL = GENESIS_URL_DTS_Dev;
