export function extractMessage(message: string) {
  const args = message.replace('\n', ' ').slice('*'.length).trim().split(/ +/);
  if (args.length > 0) {
    return [args.shift().toLowerCase(), args];
  } else return [false, []];
}

export const COLORS: Readonly<Record<string, string>> = Object.freeze({
  Aqua: '#1ABC9C',
  DarkAqua: '#11806A',
  Green: '#57F287',
  DarkGreen: '#1F8B4C',
  Blue: '#3498DB',
  DarkBlue: '#206694',
  Purple: '#9B59B6',
  DarkPurple: '#71368A',
  LuminousVividPink: '#E91E63',
  DarkVividPink: '#AD1457',
  Gold: '#F1C40F',
  DarkGold: '#C27C0E',
  Orange: '#E67E22',
  DarkOrange: '#A84300',
  Red: '#ED4245',
  DarkRed: '#992D22',
  LightGrey: '#BCC0C0',
  Yellow: '#FFFF00',
});

export function getBranchIdFromBranchName(
  branchName: string,
): number | undefined {
  switch (branchName) {
    case 'hn1':
      return 1;
    case 'hn2':
      return 2;
    case 'hn3':
      return 3;
    case 'vinh':
      return 4;
    case 'saigon':
      return 5;
    case 'quynhon':
      return 6;
    case 'danang':
      return 7;
    default:
      throw new Error(`Unknown branch: ${branchName}`);
  }
}

export function getSubPositionIdFromSubPositionName(
  subPositionValue: string,
): number | undefined {
  switch (subPositionValue) {
    case 'nodejs':
      return 1;
    case 'reactjs':
      return 2;
    case 'fullstack':
      return 3;
    case 'qa':
      return 4;
    case 'devops':
      return 5;
    case 'uiux':
      return 6;
    case 'pm':
      return 7;
    case 'internship':
      return 8;
    default:
      throw new Error(`Unknown sub-position value: ${subPositionValue}`);
  }
}

export function getCVSourceIdFromCVSourceValue(
  cvSourceValue: string,
): number | undefined {
  switch (cvSourceValue) {
    case 'linkedin':
      return 1;
    case 'facebook':
      return 2;
    case 'zalo':
      return 3;
    case 'referral':
      return 4;
    case 'topcv':
      return 5;
    case 'other':
      return 6;
    default:
      throw new Error(`Unknown CV source value: ${cvSourceValue}`);
  }
}

export interface ButtonClickEventData {
  message_id: string;
  button_id: string;
  user_id: string;
  channel_id: string;
  extra_data: string;
}

export const CACHE_DURATION = {
  FIVE_MINUTES_MS: 300000,
  FIVE_MINUTES_SECONDS: 300,
  TWO_SECONDS_MS: 2000,
  ONE_DAY_SECONDS: 86400,
  ONE_DAY_MS: 86400000,
};

export const SUBMISSION_LIMITS = {
  CACHE_LIMIT: 10,
  DATABASE_LIMIT: 20,
};

export const FORM_TYPES = {
  CV: 'CV',
};

export const ACTIONS = {
  SUBMIT: 'submit',
  CANCEL: 'cancel',
};

export const FORM_FIELD_KEYS = [
  'fullname',
  'email',
  'phone',
  'candidate-type',
  'position',
  'branch',
  'cv-source',
  'dob',
  'gender',
  'address',
  'note',
];
