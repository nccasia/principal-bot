export const candidateTypesOptions = [
  { label: 'Internship', value: 'internship' },
  { label: 'Fresher', value: 'fresher' },
  { label: 'Junior', value: 'junior' },
  { label: 'Mid', value: 'mid' },
  { label: 'Senior', value: 'senior' },
];

export const genderOptions = [
  { label: 'Nam', value: 'male' },
  { label: 'Nữ', value: 'female' },
  { label: 'Khác', value: 'other' },
];

export const validAttachmentTypes = [
  'pdf',
  'application/pdf',
  'docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

interface ApiBranchOption {
  id: number;
  displayName: string;
  name: string;
}

interface ApiSubPositionOption {
  id: number;
  name: string;
}

interface ApiCvSourceOption {
  id: number;
  name: string;
}

interface ApiGeneralOption {
  id: number;
  name: string;
}

export interface TalentApiData {
  branches: ApiBranchOption[];
  subPositions: ApiSubPositionOption[];
  cvSources: ApiCvSourceOption[];
  candidateTypes?: ApiGeneralOption[];
  genders?: ApiGeneralOption[];
}
