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

export const findLabelById = (
  id: string | number | undefined,
  optionsList:
    | Array<{
        id?: number;
        name?: string;
        displayName?: string;
        label?: string;
        value?: string;
      }>
    | undefined,
  config: { idField: 'id'; displayField: 'name' | 'displayName' | 'label' },
): string => {
  if (id === undefined || !optionsList || optionsList.length === 0) {
    return id?.toString() || 'N/A';
  }
  const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
  if (isNaN(numericId)) {
    return id.toString();
  }

  const foundOption = optionsList.find(
    (option) => option[config.idField] === numericId,
  );

  return foundOption
    ? foundOption[config.displayField] ||
        foundOption.name ||
        foundOption.label ||
        numericId.toString()
    : numericId.toString();
};
