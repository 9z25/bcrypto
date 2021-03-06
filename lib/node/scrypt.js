/*!
 * scrypt.js - scrypt for bcrypto
 * Copyright (c) 2018-2019, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcrypto
 */

'use strict';

const assert = require('bsert');
const crypto = require('crypto');

/*
 * Feature Detection
 */

// Added in 10.5.0.
if (!crypto.scryptSync)
  throw new Error('Scrypt not available.');

try {
  crypto.scryptSync();
} catch (e) {
  if (e.code === 'ERR_CRYPTO_SCRYPT_NOT_SUPPORTED')
    throw new Error('Scrypt not available.');
}

/**
 * Perform scrypt key derivation.
 * @param {Buffer} passwd
 * @param {Buffer} salt
 * @param {Number} N
 * @param {Number} r
 * @param {Number} p
 * @param {Number} len
 * @returns {Buffer}
 */

function derive(passwd, salt, N, r, p, len) {
  if (typeof passwd === 'string')
    passwd = Buffer.from(passwd, 'utf8');

  if (typeof salt === 'string')
    salt = Buffer.from(salt, 'utf8');

  if (salt == null)
    salt = Buffer.alloc(0);

  assert(Buffer.isBuffer(passwd));
  assert(Buffer.isBuffer(salt));
  assert((N >>> 0) === N);
  assert((r >>> 0) === r);
  assert((p >>> 0) === p);
  assert((len >>> 0) === len);

  if (r * p >= (1 << 30))
    throw new Error('EFBIG');

  if ((N & (N - 1)) !== 0 || N === 0)
    throw new Error('EINVAL');

  if (N > 0xffffffff)
    throw new Error('EINVAL');

  const options = {
    N,
    r,
    p,
    maxmem: getMaxMemory()
  };

  return crypto.scryptSync(passwd, salt, len, options);
}

/**
 * Perform scrypt key derivation (async).
 * @param {Buffer} passwd
 * @param {Buffer} salt
 * @param {Number} N
 * @param {Number} r
 * @param {Number} p
 * @param {Number} len
 * @returns {Promise}
 */

async function deriveAsync(passwd, salt, N, r, p, len) {
  if (typeof passwd === 'string')
    passwd = Buffer.from(passwd, 'utf8');

  if (typeof salt === 'string')
    salt = Buffer.from(salt, 'utf8');

  if (salt == null)
    salt = Buffer.alloc(0);

  assert(Buffer.isBuffer(passwd));
  assert(Buffer.isBuffer(salt));
  assert((N >>> 0) === N);
  assert((r >>> 0) === r);
  assert((p >>> 0) === p);
  assert((len >>> 0) === len);

  if (r * p >= (1 << 30))
    throw new Error('EFBIG');

  if ((N & (N - 1)) !== 0 || N === 0)
    throw new Error('EINVAL');

  if (N > 0xffffffff)
    throw new Error('EINVAL');

  const options = {
    N,
    r,
    p,
    maxmem: getMaxMemory()
  };

  return new Promise((resolve, reject) => {
    const cb = (err, key) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(key);
    };

    try {
      crypto.scrypt(passwd, salt, len, options, cb);
    } catch (e) {
      reject(e);
    }
  });
}

/*
 * Helpers
 */

let maxMemory = 0;

function getMaxMemory() {
  if (maxMemory === 0) {
    try {
      // Added in 12.8.0.
      crypto.scryptSync('', '', 0, { maxmem: Number.MAX_SAFE_INTEGER });
      maxMemory = Number.MAX_SAFE_INTEGER;
    } catch (e) {
      maxMemory = 2 ** 31 - 1;
    }
  }

  return maxMemory;
}

/*
 * Expose
 */

exports.native = 1;
exports.derive = derive;
exports.deriveAsync = deriveAsync;
