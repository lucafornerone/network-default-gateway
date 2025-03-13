import { assertExists, assertEquals, assertInstanceOf } from 'jsr:@std/assert';
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

if (v4Available) {
  Deno.test('_v4DefaultGateway: should succeed if v4 gateway is available', () => {
    assertExists(v4);
  });

  Deno.test('_v4DefaultGateway: should return an object where all properties are defined', () => {
    assertExists(v4.gateway);
    assertExists(v4.interface);
    assertExists(v4.ip);
    assertExists(v4.prefixLength);
  });

  Deno.test(
    '_v4DefaultGateway: should return an object with properties of the correct types',
    () => {
      assertEquals(typeof v4.gateway, 'string');
      assertEquals(typeof v4.interface, 'string');
      assertEquals(typeof v4.ip, 'string');
      assertEquals(typeof v4.prefixLength, 'number');
      assertEquals(IPv4_REGEX.test(v4.gateway), true);
      assertEquals(IPv4_REGEX.test(v4.ip), true);
    }
  );
} else {
  Deno.test(
    '_v4DefaultGateway: should throw DefaultGatewayNotAvailableError if v4 gateway is not available',
    () => {
      assertInstanceOf(v4Error, DefaultGatewayNotAvailableError);
    }
  );
}

let v6: NetworkDefaultGateway;
let v6Available = false;
let v6Error: unknown;

try {
  v6 = await v6DefaultGateway();
  v6Available = true;
} catch (error) {
  v6Error = error;
}

if (v6Available) {
  Deno.test('_v6DefaultGateway: should succeed if v6 gateway is available', () => {
    assertExists(v6);
  });

  Deno.test('_v6DefaultGateway: should return an object where all properties are defined', () => {
    assertExists(v6.gateway);
    assertExists(v6.interface);
    assertExists(v6.ip);
    assertExists(v6.prefixLength);
  });

  Deno.test(
    '_v6DefaultGateway: should return an object with properties of the correct types',
    () => {
      assertEquals(typeof v6.gateway, 'string');
      assertEquals(typeof v6.interface, 'string');
      assertEquals(typeof v6.ip, 'string');
      assertEquals(typeof v6.prefixLength, 'number');
      assertEquals(IPv6_REGEX.test(v6.gateway), true);
      assertEquals(IPv6_REGEX.test(v6.ip), true);
    }
  );
} else {
  Deno.test(
    '_v6DefaultGateway: should throw DefaultGatewayNotAvailableError if v6 gateway is not available',
    () => {
      assertInstanceOf(v6Error, DefaultGatewayNotAvailableError);
    }
  );
}
