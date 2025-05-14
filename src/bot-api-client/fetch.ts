/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// Configuration
// const API_URL =
//   'http://localhost:21021/api/services/app/Public/GetMezonCVFormData';
const API_URL =
  'https://dev-api-talent.nccsoft.vn/api/services/app/Public/GetMezonCVFormData';
const SIGNATURE = process.env.SIGNATURE; // Make sure this matches the server-side signature

function computeHash(input) {
  const hash = crypto.createHash('sha256');
  hash.update(input, 'utf8');
  return hash.digest('base64');
}

function computeHashForGet(params = {}, signature) {
  const parts = [];

  const sortedKeys = Object.keys(params).sort();

  for (const key of sortedKeys) {
    const value = params[key];
    if (Array.isArray(value)) {
      value.sort().forEach((v) => parts.push(`${key}=${v}`));
    } else {
      parts.push(`${key}=${value}`);
    }
  }

  const queryString = parts.join('&');

  const input = queryString ? queryString + signature : signature;

  console.log('String being hashed:', input);
  return computeHash(input);
}

export async function getFormData(params = {}) {
  try {
    const hash = computeHashForGet(params, SIGNATURE);
    console.log('Generated hash:', hash);

    const headers = {
      'X-Hash': hash,
    };

    console.log('Sending request to:', API_URL);

    const response = await axios.get(API_URL, {
      params: params,
      headers: headers,
    });

    console.log('Request successful!');
    return response.data;
  } catch (error) {
    console.error('Error fetching form data:', error);
    throw error;
  }
}
