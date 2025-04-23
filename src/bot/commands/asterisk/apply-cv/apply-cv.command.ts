import { Command } from 'src/bot/decorators/command-storage.decorator';
import {
  EmbedProps,
  MEZON_EMBED_FOOTER,
} from 'src/bot/commands/asterisk/config/config';
import { getRandomColor } from 'src/bot/utils/helper';
import { MezonClientConfig } from 'src/mezon/dtos/mezon-client-config';
import { EMessageComponentType } from 'mezon-sdk';

@Command('apply-cv')
export class ApplyCVCommand {
  constructor(private readonly clientConfigService: MezonClientConfig) {}

  candidateTypesOptions = [
    { label: 'Internship', value: 'internship' },
    { label: 'Fresher', value: 'fresher' },
    { label: 'Junior', value: 'junior' },
    { label: 'Mid', value: 'mid' },
    { label: 'Senior', value: 'senior' },
  ];

  positionOptions = [
    { label: 'NodeJs Developer', value: 'nodejs' },
    { label: 'ReactJs Developer', value: 'reactjs' },
    { label: 'FullStack Developer', value: 'fullstack' },
    { label: 'QA Engineer', value: 'qa' },
    { label: 'DevOps Engineer', value: 'devops' },
    { label: 'UI/UX Designer', value: 'uiux' },
    { label: 'Project Manager', value: 'pm' },
  ];

  branchOptions = [
    { label: 'Hà Nội 1', value: 'hn1' },
    { label: 'Hà Nội 2', value: 'hn2' },
    { label: 'Hà Nội 3', value: 'hn3' },
    { label: 'Vinh', value: 'vinh' },
    { label: 'Đà Nẵng', value: 'danang' },
    { label: 'Hồ Chí Minh', value: 'saigon' },
    { label: 'Quy Nhơn', value: 'quynhon' },
  ];

  // CV Source options
  cvSourceOptions = [
    { label: 'LinkedIn', value: 'linkedin' },
    { label: 'Facebook', value: 'facebook' },
    { label: 'Zalo', value: 'zalo' },
    { label: 'Referral', value: 'referral' },
    { label: 'TopCV', value: 'topcv' },
    { label: 'Other', value: 'other' },
  ];

  genderOptions = [
    { lable: 'Male', value: 'male' },
    { lable: 'Female', value: 'female' },
  ];

  embed: EmbedProps[] = [
    {
      color: getRandomColor(),
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
              options: this.candidateTypesOptions,
              required: true,
              valueSelected: this.candidateTypesOptions[0],
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
              options: this.positionOptions,
              required: true,
              valueSelected: this.positionOptions[0],
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
              options: this.branchOptions,
              required: true,
              valueSelected: this.branchOptions[0],
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
              options: this.cvSourceOptions,
              required: true,
              valueSelected: this.cvSourceOptions[0],
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
              options: this.genderOptions,
              required: false,
              valueSelected: this.genderOptions[0],
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
