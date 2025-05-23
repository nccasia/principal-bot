/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { EButtonMessageStyle } from 'mezon-sdk';
import {
  branchOptions,
  cvSourceOptions,
  genderOptions,
  positionOptions,
} from '../commands/asterisk/apply-cv/apply-cv.constant';
import { candidateTypesOptions } from '../commands/asterisk/apply-cv/apply-cv.constant';
import {
  EMessageComponentType,
  MEZON_EMBED_FOOTER,
} from '../commands/asterisk/config/config.enum';
import { EmbedProps } from '../commands/asterisk/config/config.interface';

import { COLORS } from './helper';

export const BuildConfirmFormEmbed = (
  formValues: any,
  avatarUrl: string,
): EmbedProps[] => [
  {
    color: COLORS.Green,
    title: '✅ Gửi CV thành công!',
    description:
      'Cảm ơn bạn đã gửi CV. Chúng tôi sẽ liên hệ với bạn sớm nhất có thể.',
    fields: [
      {
        name: 'Thông tin cá nhân',
        value: `Họ tên: ${formValues['fullname']}  -  Email: ${formValues['email']}  -  Số điện thoại: ${formValues['phone']}`,
      },
      {
        name: 'Thông tin vị trí ứng tuyển',
        value: `Vị trí: ${formValues['position']}  -  Chi nhánh: ${formValues['branch']}  -  Loại ứng viên: ${formValues['candidate-type']}`,
      },
      ...(formValues['gender'] || formValues['dob'] || formValues['address']
        ? [
            {
              name: 'Thông tin bổ sung',
              value: `${formValues['gender'] ? `Giới tính: ${formValues['gender']}  ` : ''}${
                formValues['dob'] ? `-  Ngày sinh: ${formValues['dob']}\n` : ''
              }${formValues['address'] ? `-  Địa chỉ: ${formValues['address']}` : ''}`,
            },
          ]
        : []),
      ...(formValues['note']
        ? [
            {
              name: 'Ghi chú',
              value: formValues['note'],
            },
          ]
        : []),
      {
        name: 'Nguồn CV',
        value: formValues['cv-source'],
      },
    ],
    thumbnail: {
      url:
        avatarUrl ||
        'https://cdn.mezon.ai/1840673714920755200/1840673714937532416/1831911016607256600/1745203716783_undefinedbeautiful_green_tree_field_ireland_600nw_2493424341.webp',
    },
    timestamp: new Date().toISOString(),
    footer: MEZON_EMBED_FOOTER,
  },
];

export const BuildFormEmbed = (messageid: string): EmbedProps[] => [
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
        name: 'Gender*',
        value: '',
        inputs: {
          id: `applycv-${messageid}-gender`,
          type: EMessageComponentType.SELECT,
          component: {
            options: genderOptions,
            required: true,
            valueSelected: genderOptions[0],
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
            required: true,
            type: 'date',
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

export const BuildComponentsButton = (messageid: string) => [
  {
    components: [
      {
        id: `CV_${messageid}_cancel`,
        type: EMessageComponentType.BUTTON,
        component: {
          label: `Cancel`,
          style: EButtonMessageStyle.SECONDARY,
        },
      },
      {
        id: `CV_${messageid}_submit`,
        type: EMessageComponentType.BUTTON,
        component: {
          label: `Submit`,
          style: EButtonMessageStyle.SUCCESS,
        },
      },
    ],
  },
];

export const CancelFormEmbed: EmbedProps[] = [
  {
    color: COLORS.Red,
    title: '❌ Hủy gửi CV',
    description: 'Bạn đã hủy gửi CV.',
  },
];

export const ValidationErrorEmbed = (errorMessages: string[]): EmbedProps[] => {
  return [
    {
      color: COLORS.Red,
      title: '❌ Lỗi gửi CV',
      description: 'Vui lòng kiểm tra lại thông tin nhập vào:',
      fields: [{ name: 'Lỗi', value: errorMessages.join(' - ') }],
    },
  ];
};

export const LimitSubmitCVEmbed = (type: number): EmbedProps[] => {
  if (type === 1) {
    return [
      {
        color: COLORS.Red,
        title: '❌ Lỗi gửi CV',
        description:
          'Bạn đã gửi CV quá nhiều lần. Vui lòng thử lại sau 24 giờ.',
      },
    ];
  } else if (type === 2) {
    return [
      {
        color: COLORS.Red,
        title: '❌ Lỗi gửi CV',
        description:
          'Bạn đã gửi vượt quá số lần cho phép. Vui lòng liên hệ admin để được hỗ trợ.',
      },
    ];
  }
};
