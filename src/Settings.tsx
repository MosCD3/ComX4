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
