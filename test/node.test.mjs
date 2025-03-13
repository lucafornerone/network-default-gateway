import { v4DefaultGateway, v6DefaultGateway } from '../dist/index.js';
import { DefaultGatewayNotAvailableError } from '../dist/src/types.js';
import { IPv4_REGEX, IPv6_REGEX } from './regexs.mjs';
import { expect } from 'chai';
import { gateway4async, gateway6async } from 'default-gateway';
import { platform } from 'node:os';

// network-default-gateway methods
let v4, v4Error;
let v4Available = false;
try {
  v4 = await v4DefaultGateway();
  v4Available = true;
} catch (error) {
  v4Error = error;
}

// benchmark methods
let v4BenchmarkValue, v4BenchmarkError;
try {
  v4BenchmarkValue = await gateway4async();
} catch (error) {
  v4BenchmarkError = error;
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

    it('should return gateway and interface equal to the benchmark value', () => {
      expect(v4BenchmarkValue).to.not.be.undefined;
      expect(v4.gateway).to.equal(v4BenchmarkValue.gateway);
      expect(v4.interface).to.equal(v4BenchmarkValue.int);
    });
  } else {
    it('should throw DefaultGatewayNotAvailableError if v4 gateway is not available', () => {
      expect(v4Error).to.be.instanceOf(DefaultGatewayNotAvailableError);
    });
    it('benchmark should throw "Unable to determine default gateway" if v4 gateway is not available', () => {
      expect(v4BenchmarkError).to.not.be.undefined;
      expect(v4BenchmarkError.message).to.equal('Unable to determine default gateway');
    });
  }
});

// network-default-gateway methods
let v6, v6Error;
let v6Available = false;
try {
  v6 = await v6DefaultGateway();
  v6Available = true;
} catch (error) {
  v6Error = error;
}

// benchmark methods
let v6BenchmarkValue, v6BenchmarkError;
try {
  v6BenchmarkValue = await gateway6async();
} catch (error) {
  v6BenchmarkError = error;
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

    it('should return gateway and interface equal to the benchmark value', () => {
      expect(v6BenchmarkValue).to.not.be.undefined;
      expect(v6.gateway).to.equal(v6BenchmarkValue.gateway);
      expect(v6.interface).to.equal(v6BenchmarkValue.int);
    });
  } else {
    it('should throw DefaultGatewayNotAvailableError if v6 gateway is not available', () => {
      expect(v6Error).to.be.instanceOf(DefaultGatewayNotAvailableError);
    });
    if (platform() !== 'darwin') {
      // this test is skipped on macOS because the benchmark package does not correctly handle missing v6 gateway
      it('benchmark should throw "Unable to determine default gateway" if v6 gateway is not available', () => {
        expect(v6BenchmarkError).to.not.be.undefined;
        expect(v6BenchmarkError.message).to.equal('Unable to determine default gateway');
      });
    }
  }
});
