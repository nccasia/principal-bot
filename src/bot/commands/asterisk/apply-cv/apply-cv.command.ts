import { Command } from 'src/bot/decorators/command-storage.decorator';
import {
  EmbedProps,
  MEZON_EMBED_FOOTER,
} from 'src/bot/commands/asterisk/config/config';
import { COLORS } from 'src/bot/utils/helper';
import { MezonClientConfig } from 'src/mezon/dtos/mezon-client-config';
import { EMessageComponentType } from 'mezon-sdk';
import {
  branchOptions,
  candidateTypesOptions,
  cvSourceOptions,
  genderOptions,
  positionOptions,
} from './apply-cv.constant';

@Command('apply-cv')
export class ApplyCVCommand {
  constructor(private readonly clientConfigService: MezonClientConfig) {}

  embed: EmbedProps[] = [
    {
      color: COLORS.Aqua,
      title: `Candidate Application Form`,
      fields: [
        {
          name: 'Full Name*',
          value: '',
          inputs: {
            id: `applycv-${messageid}-fullname`,
            type: EMessageComponentType.INPUT,
            component: {
              id: `applycv-${messageid}-fullname-plhder`,
              placeholder: 'Enter full name',
              required: true,
            },
          },
        },
        {
          name: 'Email*',
          value: '',
          inputs: {
            id: `applycv-${messageid}-email`,
            type: EMessageComponentType.INPUT,
            component: {
              id: `applycv-${messageid}-email-plhder`,
              placeholder: 'example@example.com',
              required: true,
              type: 'email',
            },
          },
        },
        {
          name: 'Phone Number*',
          value: '',
          inputs: {
            id: `applycv-${messageid}-phone`,
            type: EMessageComponentType.INPUT,
            component: {
              id: `applycv-${messageid}-phone-plhder`,
              placeholder: 'Enter phone number',
              required: true,
              type: 'text',
            },
          },
        },
        {
          name: 'Candidate Type*',
          value: '',
          inputs: {
            id: `applycv-${messageid}-candidate-type`,
            type: EMessageComponentType.SELECT,
            component: {
              options: candidateTypesOptions,
              required: true,
              valueSelected: candidateTypesOptions[0],
            },
          },
        },
        {
          name: 'Position*',
          value: '',
          inputs: {
            id: `applycv-${messageid}-position`,
            type: EMessageComponentType.SELECT,
            component: {
              options: positionOptions,
              required: true,
              valueSelected: positionOptions[0],
            },
          },
        },
        {
          name: 'Branch*',
          value: '',
          inputs: {
            id: `applycv-${messageid}-branch`,
            type: EMessageComponentType.SELECT,
            component: {
              options: branchOptions,
              required: true,
              valueSelected: branchOptions[0],
            },
          },
        },
        {
          name: 'CV Source*',
          value: '',
          inputs: {
            id: `applycv-${messageid}-cv-source`,
            type: EMessageComponentType.SELECT,
            component: {
              options: cvSourceOptions,
              required: true,
              valueSelected: cvSourceOptions[0],
            },
          },
        },
        {
          name: 'Date of birth',
          value: '',
          inputs: {
            id: `applycv-${messageid}-dob`,
            type: EMessageComponentType.INPUT,
            component: {
              id: `applycv-${messageid}-dob-plhder`,
              placeholder: 'DD/MM/YYYY',
              required: false,
              type: 'date',
            },
          },
        },
        {
          name: 'Gender',
          value: '',
          inputs: {
            id: `applycv-${messageid}-gender`,
            type: EMessageComponentType.SELECT,
            component: {
              options: genderOptions,
              required: false,
              valueSelected: genderOptions[0],
            },
          },
        },
        {
          name: 'Address',
          value: '',
          inputs: {
            id: `applycv-${messageid}-address`,
            type: EMessageComponentType.INPUT,
            component: {
              id: `applycv-${messageid}-address-plhder`,
              placeholder: 'Enter address',
              required: false,
            },
          },
        },
        {
          name: 'Note',
          value: '',
          inputs: {
            id: `applycv-${messageid}-note`,
            type: EMessageComponentType.INPUT,
            component: {
              id: `applycv-${messageid}-note-plhder`,
              placeholder: 'Additional information',
              required: false,
              textarea: true,
            },
          },
        },
      ],
      timestamp: new Date().toISOString(),
      footer: MEZON_EMBED_FOOTER,
    },
  ];
}
