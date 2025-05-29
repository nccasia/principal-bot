import { EButtonMessageStyle } from 'mezon-sdk';
import {
  genderOptions as staticGenderOptions,
  TalentApiData,
  candidateTypesOptions as staticCandidateTypesOptions,
} from '../commands/asterisk/apply-cv/apply-cv.constant';
import {
  EMessageComponentType,
  MEZON_EMBED_FOOTER,
} from '../commands/asterisk/config/config.enum';
import { EmbedProps } from '../commands/asterisk/config/config.interface';
import { COLORS, findLabelById } from './helper';

export const BuildConfirmFormEmbed = (
  formValues: any,
  avatarUrl: string,
  talentApiFormData: TalentApiData | null | undefined,
): EmbedProps[] => {
  const positionLabel = findLabelById(
    formValues['position'],
    talentApiFormData?.subPositions,
    { idField: 'id', displayField: 'name' },
  );
  const branchLabel = findLabelById(
    formValues['branch'],
    talentApiFormData?.branches,
    { idField: 'id', displayField: 'displayName' },
  );
  const cvSourceLabel = findLabelById(
    formValues['cv-source'],
    talentApiFormData?.cvSources,
    { idField: 'id', displayField: 'name' },
  );

  let candidateTypeLabel = formValues['candidate-type'];
  if (
    talentApiFormData?.candidateTypes &&
    talentApiFormData.candidateTypes.length > 0
  ) {
    candidateTypeLabel = findLabelById(
      formValues['candidate-type'],
      talentApiFormData.candidateTypes,
      { idField: 'id', displayField: 'name' },
    );
  } else {
    const staticOption = staticCandidateTypesOptions.find(
      (opt) => opt.value === formValues['candidate-type'],
    );
    if (staticOption) candidateTypeLabel = staticOption.label;
  }

  let genderLabel = formValues['gender'];
  if (talentApiFormData?.genders && talentApiFormData.genders.length > 0) {
    genderLabel = findLabelById(
      formValues['gender'],
      talentApiFormData.genders,
      { idField: 'id', displayField: 'name' },
    );
  } else {
    const staticOption = staticGenderOptions.find(
      (opt) => opt.value === formValues['gender'],
    );
    if (staticOption) genderLabel = staticOption.label;
  }

  return [
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
          value: `Vị trí: ${positionLabel}  -  Chi nhánh: ${branchLabel}  -  Loại ứng viên: ${candidateTypeLabel}`,
        },
        ...(formValues['gender'] || formValues['dob'] || formValues['address']
          ? [
              {
                name: 'Thông tin bổ sung',
                value: `${formValues['gender'] ? `Giới tính: ${genderLabel}  ` : ''}${
                  formValues['dob']
                    ? `-  Ngày sinh: ${formValues['dob']}\n`
                    : ''
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
          value: cvSourceLabel,
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
};

export const BuildFormEmbed = (
  messageid: string,
  talentApiFormData: TalentApiData | null | undefined,
): EmbedProps[] => {
  const mapToSelectOptions = (
    items:
      | Array<{
          id?: number;
          name?: string;
          displayName?: string;
          label?: string;
          value?: string;
        }>
      | undefined,
    config: {
      nameField: 'name' | 'displayName' | 'label';
      valueField: 'id' | 'value';
    },
  ): Array<{ label: string; value: string }> => {
    if (!items || items.length === 0) {
      return [{ label: 'Không có lựa chọn', value: 'NO_OPTION_FALLBACK' }];
    }
    return items.map((item) => {
      const label = item[config.nameField] || item.name || item.label || 'N/A';
      const value =
        item[config.valueField]?.toString() ||
        item.value?.toString() ||
        'NO_VALUE_FALLBACK';
      return { label, value };
    });
  };

  const getSelectedValue = (
    options: Array<{ label: string; value: string }>,
  ): { label: string; value: string } => {
    return (
      options[0] || { label: 'Không có lựa chọn', value: 'NO_OPTION_FALLBACK' }
    );
  };

  const branchSelectOptions = mapToSelectOptions(talentApiFormData?.branches, {
    nameField: 'displayName',
    valueField: 'id',
  });
  const positionSelectOptions = mapToSelectOptions(
    talentApiFormData?.subPositions,
    { nameField: 'name', valueField: 'id' },
  );
  const cvSourceSelectOptions = mapToSelectOptions(
    talentApiFormData?.cvSources,
    { nameField: 'name', valueField: 'id' },
  );
  const candidateTypeSelectOptions =
    talentApiFormData?.candidateTypes &&
    talentApiFormData.candidateTypes.length > 0
      ? mapToSelectOptions(talentApiFormData.candidateTypes, {
          nameField: 'name',
          valueField: 'id',
        })
      : mapToSelectOptions(staticCandidateTypesOptions, {
          nameField: 'label',
          valueField: 'value',
        });
  const genderSelectOptions =
    talentApiFormData?.genders && talentApiFormData.genders.length > 0
      ? mapToSelectOptions(talentApiFormData.genders, {
          nameField: 'name',
          valueField: 'id',
        })
      : mapToSelectOptions(staticGenderOptions, {
          nameField: 'label',
          valueField: 'value',
        });
  return [
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
              options: candidateTypeSelectOptions,
              required: true,
              valueSelected: getSelectedValue(candidateTypeSelectOptions),
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
              options: positionSelectOptions,
              required: true,
              valueSelected: getSelectedValue(positionSelectOptions),
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
              options: branchSelectOptions,
              required: true,
              valueSelected: getSelectedValue(branchSelectOptions),
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
              options: cvSourceSelectOptions,
              required: true,
              valueSelected: getSelectedValue(cvSourceSelectOptions),
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
              options: genderSelectOptions,
              required: true,
              valueSelected: getSelectedValue(genderSelectOptions),
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
};

export const BuildComponentsButton = (
  originalCommandMessageId: string,
  originalSenderId: string,
) => [
  {
    components: [
      {
        id: `CV-${originalCommandMessageId}-${originalSenderId}-cancel`,
        type: EMessageComponentType.BUTTON,
        component: {
          label: `Cancel`,
          style: EButtonMessageStyle.SECONDARY,
        },
      },
      {
        id: `CV-${originalCommandMessageId}-${originalSenderId}-submit`,
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

export const ExpiredFormEmbed: EmbedProps[] = [
  {
    color: COLORS.Red,
    title: '❌ Lỗi gửi CV',
    description: 'Bạn đã hết thời gian nhập CV. Vui lòng gửi lại.',
  },
];

export const TalentCvFormDataNotFoundEmbed: EmbedProps[] = [
  {
    color: COLORS.Red,
    title: '❌ Lỗi gửi CV',
    description:
      'Không tìm thấy dữ liệu CV từ Talent API. Vui lòng liên hệ admin để được hỗ trợ hoặc thử lại sau.',
  },
];
