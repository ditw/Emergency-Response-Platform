/*** utils.js (Common functions for request verification and validation) ***/

import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Function to verify the request signature
 * Crypto module provides cryptographic functionality that includes a set of wrappers for OpenSSL's hash, 
 * HMAC, cipher, decipher, sign, and verify functions.
 */
export const verifySWebHookSignature = (req) => {
    const signature = req.headers['x-webhook-signature'];
    const payload = JSON.stringify(req.body);
    const expectedSignature = crypto.createHmac('sha256', process.env.WEBHOOK_SECRET).update(payload).digest('hex');
    return signature === expectedSignature;
  };
/**
 * Function to verify the API key
 */
export const verifyApiKey = (req) => {
  const requestApiKey = req.headers['x-api-key'];
  return requestApiKey === process.env.API_KEY;
};
/**
 * Function to validate request input
 */
export const isValidInput = (input) => {
  const forbiddenList= [undefined, '', null];
  if(forbiddenList.indexOf(input.trim()) !== -1) {
    return false;
  }
  return true;
}