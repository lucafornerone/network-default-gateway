import { expect } from 'chai';
import { v4DefaultGateway, v6DefaultGateway } from '../dist/index.js';
import { DefaultGatewayNotAvailableError } from '../dist/src/types.js';
import { IPv4_REGEX, IPv6_REGEX } from './regexs.mjs';

let v4, v4Error;
let v4Available = false;
try {
  v4 = await v4DefaultGateway();
  v4Available = true;
} catch (error) {
  v4Error = error;
}

describe('_v4DefaultGateway', () => {
  if (v4Available) {
    it('should succeed if v4 gateway is available', () => {
      expect(v4).to.not.be.undefined;
    });

    it('should return an object where all properties are defined', () => {
      expect(v4.gateway).to.not.be.undefined;
      expect(v4.interface).to.not.be.undefined;
      expect(v4.ip).to.not.be.undefined;
      expect(v4.prefixLength).to.not.be.undefined;
    });

    it('should return an object with properties of the correct types', () => {
      expect(v4.gateway).to.be.a('string');
      expect(v4.interface).to.be.a('string');
      expect(v4.ip).to.be.a('string');
      expect(v4.prefixLength).to.be.a('number');
      expect(IPv4_REGEX.test(v4.gateway)).to.be.true;
      expect(IPv4_REGEX.test(v4.ip)).to.be.true;
    });
  } else {
    it('should throw DefaultGatewayNotAvailableError if v4 gateway is not available', () => {
      expect(v4Error).to.be.instanceOf(DefaultGatewayNotAvailableError);
    });
  }
});

let v6, v6Error;
let v6Available = false;
try {
  v6 = await v6DefaultGateway();
  v6Available = true;
} catch (error) {
  v6Error = error;
}

describe('_v6DefaultGateway', () => {
  if (v6Available) {
    it('should succeed if v6 gateway is available', () => {
      expect(v6).to.not.be.undefined;
    });

    it('should return an object where all properties are defined', () => {
      expect(v6.gateway).to.not.be.undefined;
      expect(v6.interface).to.not.be.undefined;
      expect(v6.ip).to.not.be.undefined;
      expect(v6.prefixLength).to.not.be.undefined;
    });

    it('should return an object with properties of the correct types', () => {
      expect(v6.gateway).to.be.a('string');
      expect(v6.interface).to.be.a('string');
      expect(v6.ip).to.be.a('string');
      expect(v6.prefixLength).to.be.a('number');
      expect(IPv6_REGEX.test(v6.gateway)).to.be.true;
      expect(IPv6_REGEX.test(v6.ip)).to.be.true;
    });
  } else {
    it('should throw DefaultGatewayNotAvailableError if v6 gateway is not available', () => {
      expect(v6Error).to.be.instanceOf(DefaultGatewayNotAvailableError);
    });
  }
});
