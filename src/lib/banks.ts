/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface BankCountry {
  name: string;
  code: string;
  currency: string;
  accountLabel: string;
  accountPlaceholder: string;
  banks: string[];
}

export const SPANISH_SPEAKING_BANKS: BankCountry[] = [
  {
    name: 'España',
    code: 'ES',
    currency: 'EUR (€)',
    accountLabel: 'Código IBAN (España)',
    accountPlaceholder: 'ES00 0000 0000 0000 0000 0000',
    banks: [
      'Banco Santander',
      'BBVA',
      'CaixaBank',
      'Banco Sabadell',
      'Bankinter',
      'Abanca',
      'ING España',
      'Openbank',
      'Unicaja Banco',
      'Ibercaja',
      'Kutxabank',
      'Cajamar Caja Rural',
      'Laboral Kutxa',
      'Deutsche Bank España',
      'Evo Banco',
      'WiZink',
      'Caja Rural Central',
      'Banca March'
    ]
  },
  {
    name: 'Perú',
    code: 'PE',
    currency: 'PEN (S/) / USD ($)',
    accountLabel: 'Número de Cuenta o Código Interbancario (CCI)',
    accountPlaceholder: '002-123456789012-00 (20 dígitos CCI)',
    banks: [
      'BCP (Banco de Crédito del Perú)',
      'BBVA Perú',
      'Interbank',
      'Scotiabank Perú',
      'Banco de la Nación',
      'Banco Pichincha Perú',
      'BanBif',
      'Banco GNB Perú',
      'Banco de Comercio',
      'Banco Falabella Perú',
      'Banco Ripley Perú',
      'Banco Santander Perú',
      'Caja Arequipa',
      'Caja Huancayo',
      'Caja Cusco',
      'Caja Piura',
      'Caja Trujillo',
      'Yape / Plin'
    ]
  },
  {
    name: 'Ecuador',
    code: 'EC',
    currency: 'USD ($)',
    accountLabel: 'Número de Cuenta Corriente / Ahorros',
    accountPlaceholder: '10 o 12 dígitos de cuenta',
    banks: [
      'Banco Pichincha',
      'Banco Guayaquil',
      'Produbanco (Grupo Promerica)',
      'Banco del Pacífico',
      'Banco Bolivariano',
      'Banco Internacional',
      'Banco del Austro',
      'Banco Solidario',
      'Banco General Rumiñahui (BGR)',
      'Banco Diners Club del Ecuador',
      'Banco ProCredit',
      'Cooperativa JEP',
      'Cooperativa Policía Nacional',
      'Cooperativa Alianza del Valle',
      'Cooperativa Juventud Ecuatoriana Progresista',
      'Cooperativa Andalucía',
      'DeUna / Payphone'
    ]
  },
  {
    name: 'Colombia',
    code: 'CO',
    currency: 'COP ($)',
    accountLabel: 'Número de Cuenta / Identificador',
    accountPlaceholder: '11 dígitos de cuenta o celular',
    banks: [
      'Bancolombia',
      'Banco de Bogotá',
      'Davivienda',
      'BBVA Colombia',
      'Banco de Occidente',
      'Banco Popular Colombia',
      'Banco AV Villas',
      'Scotiabank Colpatria',
      'Banco Caja Social',
      'Banco Agrario de Colombia',
      'Banco Falabella Colombia',
      'Banco Itaú Colombia',
      'Banco Santander Colombia',
      'Nequi',
      'Daviplata',
      'Lulo Bank',
      'Nu Colombia'
    ]
  },
  {
    name: 'México',
    code: 'MX',
    currency: 'MXN ($)',
    accountLabel: 'CLABE Interbancaria (18 dígitos)',
    accountPlaceholder: '012180001234567890 (18 dígitos CLABE)',
    banks: [
      'BBVA México',
      'Citibanamex',
      'Santander México',
      'Banorte',
      'HSBC México',
      'Scotiabank México',
      'Banco Azteca',
      'Inbursa',
      'BanRegio',
      'Banco del Bajío (BanBajío)',
      'Banco Afirme',
      'Hey Banco',
      'Nu México',
      'Mercado Pago México',
      'Bancoppel',
      'Spin by OXXO'
    ]
  },
  {
    name: 'Argentina',
    code: 'AR',
    currency: 'ARS ($)',
    accountLabel: 'CBU / CVU o Alias (22 dígitos)',
    accountPlaceholder: '0070123456789012345678 o ALIAS.MERCADO',
    banks: [
      'Banco Santander Argentina',
      'Banco Galicia',
      'BBVA Argentina',
      'Banco Macro',
      'Banco Nación',
      'Banco Provincia de Buenos Aires',
      'Banco Ciudad',
      'HSBC Argentina',
      'ICBC Argentina',
      'Banco Credicoop',
      'Banco Patagonia',
      'Banco Supervielle',
      'Banco Hipotecario',
      'Brubank',
      'Ualá',
      'Mercado Pago Argentina'
    ]
  },
  {
    name: 'Chile',
    code: 'CL',
    currency: 'CLP ($)',
    accountLabel: 'Número de Cuenta Corriente / Vista (RUT)',
    accountPlaceholder: 'Número de cuenta o CuentaRUT',
    banks: [
      'Banco de Chile / Edwards',
      'Banco Santander Chile',
      'BCI (Banco de Crédito e Inversiones)',
      'BancoEstado (CuentaRUT)',
      'Scotiabank Chile',
      'Itaú Chile',
      'Banco Security',
      'Banco BICE',
      'Banco Falabella Chile',
      'Banco Ripley Chile',
      'Banco Consorcio',
      'Tenpo / Mach'
    ]
  },
  {
    name: 'República Dominicana',
    code: 'DO',
    currency: 'DOP (RD$)',
    accountLabel: 'Número de Cuenta Bancaria',
    accountPlaceholder: '10 a 12 dígitos de cuenta',
    banks: [
      'Banco Popular Dominicano',
      'Banreservas (Banco de Reservas)',
      'Banco BHD',
      'Scotiabank República Dominicana',
      'Banco Santa Cruz',
      'Banco Promerica República Dominicana',
      'Banco Caribe',
      'Banco Banesco República Dominicana',
      'Asociación Popular de Ahorros y Préstamos (APAP)'
    ]
  },
  {
    name: 'Centroamérica & Otros Países',
    code: 'OT',
    currency: 'Moneda Local / USD',
    accountLabel: 'Número de Cuenta / IBAN Internacional',
    accountPlaceholder: 'Número de cuenta bancaria internacional',
    banks: [
      'Banco General (Panamá)',
      'Banistmo (Panamá)',
      'BAC Credomatic (Panamá / Costa Rica / Guatemala / Honduras)',
      'Banco Nacional de Costa Rica (Costa Rica)',
      'Banco de Costa Rica - BCR (Costa Rica)',
      'Banco Industrial (Guatemala)',
      'Banrural (Guatemala)',
      'Banco G&T Continental (Guatemala)',
      'Banco Ficohsa (Honduras)',
      'Banco Atlántida (Honduras)',
      'Banco Agrícola (El Salvador)',
      'Banco Cuscatlán (El Salvador)',
      'Banco Lafise (Nicaragua)',
      'Banco Mercantil Santa Cruz (Bolivia)',
      'Banco Nacional de Bolivia - BNB (Bolivia)',
      'Banco Continental (Paraguay)',
      'Banco Itaú Paraguay (Paraguay)',
      'Banco de la República Oriental del Uruguay - BROU (Uruguay)',
      'Banco Santander Uruguay (Uruguay)'
    ]
  }
];

export const OTHER_BANK_OPTION = 'Otro Banco / Otra Entidad Financiera';
