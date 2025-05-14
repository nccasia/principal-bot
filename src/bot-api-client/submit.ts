/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import axios from 'axios';
import crypto from 'crypto';
import FormData from 'form-data';
import dotenv from 'dotenv';
import { CvFormDto } from 'src/bot/dtos/cv-form.dto';
import { ExternalCvPayloadDto } from 'src/bot/dtos/external-cv-payload.dto';

dotenv.config();

// const API_URL =
//   'http://localhost:21021/api/services/app/Public/CreateMezonInternCV';
const API_URL =
  'https://dev-api-talent.nccsoft.vn/api/services/app/Public/CreateMezonInternCV';
const SIGNATURE = process.env.SIGNATURE;

function computeHash(input: string) {
  const hash = crypto.createHash('sha256');
  hash.update(input);
  return hash.digest('base64');
}

function computeHashForFormData(
  candidateData: ExternalCvPayloadDto,
  signature: string,
) {
  const formValues = [];
  const sortedKeys = Object.keys(candidateData).sort();

  for (const key of sortedKeys) {
    const value = candidateData[key];

    if (value === undefined) {
      continue; // Skip undefined properties for hashing
    }

    let processedValue;
    if (value === null) {
      processedValue = '';
    } else if (typeof value === 'boolean' || typeof value === 'number') {
      processedValue = String(value);
    } else {
      processedValue = value; // Assumed string
    }
    formValues.push(`${key}=${processedValue}`);
  }

  const formString = formValues.join('&');

  const input = formString + signature;

  const hash = crypto.createHash('sha256');
  hash.update(input, 'utf8');
  return hash.digest('base64');
}

export async function submitCandidateCV(candidateData: ExternalCvPayloadDto) {
  try {
    const formData = new FormData();

    Object.entries(candidateData).forEach(([key, value]) => {
      if (value === undefined) {
        return; // Skip undefined properties for FormData
      }

      let valueToAppend;
      if (value === null) {
        valueToAppend = '';
      } else if (typeof value === 'boolean' || typeof value === 'number') {
        valueToAppend = String(value);
      } else {
        // Assuming value is already a string if not number, boolean, null, or undefined.
        // If LinkCV or other fields could be something else (e.g. a File object for actual uploads),
        // this part might need adjustment, but for now, DTO implies strings.
        valueToAppend = value;
      }
      formData.append(key, valueToAppend);
    });

    const hash = computeHashForFormData(candidateData, SIGNATURE);

    console.log('Generated hash:', hash);

    const headers = {
      ...formData.getHeaders(),
      'X-Hash': hash,
    };

    const response = await axios.post(API_URL, formData, { headers });

    console.log('Success! CV submitted with ID:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error submitting CV:', error);
    throw error;
  }
}

export function debugHashInput(
  candidateData: ExternalCvPayloadDto,
  signature: string,
) {
  const formValues = [];
  const sortedKeys = Object.keys(candidateData).sort();

  for (const key of sortedKeys) {
    const value = candidateData[key];

    if (value === undefined) {
      continue; // Skip undefined properties
    }

    let processedValue;
    if (value === null) {
      processedValue = '';
    } else if (typeof value === 'boolean' || typeof value === 'number') {
      processedValue = String(value);
    } else {
      processedValue = value; // Assumed string
    }
    formValues.push(`${key}=${processedValue}`);
  }

  const formString = formValues.join('&');
  const input = formString + signature;

  console.log('Raw string being hashed:', input);
  return input;
}
