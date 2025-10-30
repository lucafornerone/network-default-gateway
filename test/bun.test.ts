import { describe, expect, it } from 'bun:test';
import { v4DefaultGateway, v6DefaultGateway } from '../index.ts';
import { DefaultGatewayNotAvailableError, NetworkDefaultGateway } from '../src/types.ts';
import { IPv4_REGEX, IPv6_REGEX } from './regexs.mjs';

let v4: NetworkDefaultGateway;
let v4Available = false;
let v4Error: unknown;

try {
  v4 = await v4DefaultGateway();
  v4Available = true;
} catch (error) {
  v4Error = error;
}

describe('_v4DefaultGateway', () => {
  if (v4Available) {
    it('should succeed if v4 gateway is available', () => {
      expect(v4).toBeDefined();
    });

    it('should return an object where all properties are defined', () => {
      expect(v4.gateway).toBeDefined();
      expect(v4.interface).toBeDefined();
      expect(v4.ip).toBeDefined();
      expect(v4.prefixLength).toBeDefined();
    });

    it('should return an object with properties of the correct types', () => {
      expect(v4.gateway).toBeTypeOf('string');
      expect(v4.interface).toBeTypeOf('string');
      expect(v4.ip).toBeTypeOf('string');
      expect(v4.prefixLength).toBeTypeOf('number');
      expect(IPv4_REGEX.test(v4.gateway)).toBe(true);
      expect(IPv4_REGEX.test(v4.ip)).toBe(true);
    });
  } else {
    it('should throw DefaultGatewayNotAvailableError if v4 gateway is not available', () => {
      expect(v4Error).toBeInstanceOf(DefaultGatewayNotAvailableError);
    });
  }
});

let v6: NetworkDefaultGateway;
let v6Available = false;
let v6Error: unknown;

try {
  v6 = await v6DefaultGateway();
  v6Available = true;
} catch (error) {
  v6Error = error;
}

describe('_v6DefaultGateway', () => {
  if (v6Available) {
    it('should succeed if v6 gateway is available', () => {
      expect(v6).toBeDefined();
    });

    it('should return an object where all properties are defined', () => {
      expect(v6.gateway).toBeDefined();
      expect(v6.interface).toBeDefined();
      expect(v6.ip).toBeDefined();
      expect(v6.prefixLength).toBeDefined();
    });

    it('should return an object with properties of the correct types', () => {
      expect(v6.gateway).toBeTypeOf('string');
      expect(v6.interface).toBeTypeOf('string');
      expect(v6.ip).toBeTypeOf('string');
      expect(v6.prefixLength).toBeTypeOf('number');
      expect(IPv6_REGEX.test(v6.gateway)).toBe(true);
      expect(IPv6_REGEX.test(v6.ip)).toBe(true);
    });
  } else {
    it('should throw DefaultGatewayNotAvailableError if v6 gateway is not available', () => {
      expect(v6Error).toBeInstanceOf(DefaultGatewayNotAvailableError);
    });
  }
});
