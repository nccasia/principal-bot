/* eslint-disable @typescript-eslint/no-empty-object-type */
export const BOT_ID = process.env.BOT_KOMU_ID;

export const EMAIL_DOMAIN = 'ncc.asia';

export const MEZON_IMAGE_URL =
  'https://cdn.mezon.vn/1837043892743049216/1840654271217930240/1827994776956309500/857_0246x0w.webp';

export const MEZON_EMBED_FOOTER = {
  text: 'Powered by Mezon',
  icon_url: MEZON_IMAGE_URL,
};

export enum EUserType {
  DISCORD = 'DISCORD',
  MEZON = 'MEZON',
}

export enum StatusInvoiceType {
  REJECT = 'REJECT',
  APPROVE = 'APPROVE',
  CANCEL = 'CANCEL',
  CONFIRM = 'CONFIRM',
  FINISH = 'FINISH',
}

export enum TypeOrderMessage {
  CREATE = 'CREATE',
  CONFIRM = 'CONFIRM',
  REPORT = 'REPORT',
  FINISH = 'FINISH',
}

export enum BetStatus {
  WIN = 'WIN',
  LOSE = 'LOSE',
  CANCEL = 'CANCEL',
}

export enum EMessageMode {
  CHANNEL_MESSAGE = 2,
  DM_MESSAGE = 4,
  THREAD_MESSAGE = 6,
}

export enum FileType {
  NCC8 = 'ncc8',
  FILM = 'film',
  AUDIOBOOK = 'audioBook',
  MUSIC = 'music',
}

export enum FFmpegImagePath {
  NCC8 = '/dist/public/images/ncc8.png',
  AUDIOBOOK = '/dist/public/images/audiobook.png',
}

export enum ErrorSocketType {
  TIME_OUT = 'The socket timed out while waiting for a response.',
  NOT_ESTABLISHED = 'Socket connection has not been established yet.',
}

export enum DynamicCommandType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
}

export interface EmbedProps {
  color?: string;
  title?: string;
  url?: string;
  author?: {
    name: string;
    icon_url?: string;
    url?: string;
  };
  description?: string;
  thumbnail?: { url: string };
  fields?: Array<{
    name: string;
    value: string;
    inline?: boolean;
    options?: any[];
    inputs?: {};
  }>;
  image?: { url: string };
  timestamp?: string;
  footer?: { text: string; icon_url?: string };
}

export enum EUnlockTimeSheet {
  PM = 'PM',
  STAFF = 'STAFF',
  CONFIRM = 'CONFIRM',
  CANCEL = 'CANCEL',
  SUBMIT = 'SUBMIT',
}

export enum EUnlockTimeSheetPayment {
  PM_PAYMENT = 50000,
  STAFF_PAYMENT = 20000,
}

export enum EMessageSelectType {
  TEXT = 1,
  USER = 2,
  ROLE = 3,
  CHANNEL = 4,
}

export enum ERequestAbsenceDayStatus {
  CONFIRM = 'CONFIRM',
  CANCEL = 'CANCEL',
}

export enum ERequestAbsenceType {
  OFF = 0,
  ONSITE = 1,
  REMOTE = 2,
}
export enum ERequestAbsenceDateType {
  FULL_DAY = 1,
  MORNING = 2,
  AFTERNOON = 3,
  CUSTOM = 4,
}

export enum ERequestAbsenceTime {
  ARRIVE_LATE = 1,
  MIDDLE_OF_DAY = 2,
  LEAVE_EARLY = 3,
}

export enum EMessageComponentType {
  BUTTON = 1,
  SELECT = 2,
  INPUT = 3,
  DATEPICKER = 4,
  RADIO = 5,
}

export enum ERequestAbsenceDayType {
  OFF = 'OFF',
  ONSITE = 'ONSITE',
  REMOTE = 'REMOTE',
  OFFCUSTOM = 'OFFCUSTOM',
  HELP = '```' +
    'request remote\n' +
    'command: *ts remote\n' +
    '\n' +
    'request off\n' +
    'command: *ts off\n' +
    '\n' +
    'request onsite\n' +
    'command: *ts onsite\n' +
    '\n' +
    'request Đi muộn/ Về sớm\n' +
    'command: *ts offcustom ' +
    '```',
}

export enum EValueTypeOfWork {
  NormalTime = 0,
  Overtime = 1,
}

export const optionTypeOfWork = [
  {
    label: 'Normal Time',
    value: EValueTypeOfWork.NormalTime,
  },
  {
    label: 'Overtime',
    value: EValueTypeOfWork.Overtime,
  },
];
export enum ERequestW2Type {
  CHANGEOFFICE = 'changeoffice',
  DEVICE = 'device',
  OFFICEEQUIPMENT = 'officeequipment',
  PROBATIONARYCONFIRMATION = 'probationaryconfirmation',
  WFH = 'wfh',
  HELP = '```' +
    'Change Office Request\n' +
    'command: *w2request changeoffice\n' +
    '\n' +
    'Device Request\n' +
    'command: *w2request device\n' +
    '\n' +
    'Office Equipment Request\n' +
    'command: *w2request officeequipment\n' +
    '\n' +
    'Probationary Confirmation Request\n' +
    'command: *w2request probationaryconfirmation\n' +
    '\n' +
    'WFH Request\n' +
    'command: *w2request wfh' +
    '```',
}

export enum EPMRequestAbsenceDay {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
}
export enum EPMTaskW2Type {
  ADVANCE_PAYMENT = 'Advance Payment Request',
  CHANGE_OFFICE = 'Change Office Request',
  DEVICE = 'Device Request',
  OFFICE_EQUIPMENT = 'Office Equipment Request',
  PROBATIONARY_CONFIRMATION = 'Probationary Confirmation Request',
  WFH = 'WFH Request',
  RESIGNATION = 'Resignation Request',
  UNLOCK_TIMESHEET = 'Unlock Timesheet Request',
}
export enum EPMButtonTaskW2 {
  APPROVE_TASK = 'Approve',
  REJECT_TASK = 'Reject',
  SUBMIT_REJECT_TASK = 'submitRejectTask',
  CONFIRM_PROBATIONARY = 'ConfirmProbationaryConfirmationRequest',
  COMFIRM_REGISNATION = 'ConfirmResignationRequest',
}

export enum EmbebButtonType {
  CONFIRM = 'CONFIRM',
  CANCEL = 'CANCEL',
  VOTE = 'VOTE',
  FINISH = 'FINISH',
  ORDER = 'ORDER',
  REPORT = 'REPORT',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
}

export enum VoucherExchangeType {
  NCCSoft = 'NccSoft',
  Market = 'Market',
}

export enum UserType {
  Intern,
  Staff,
}
