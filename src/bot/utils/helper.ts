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
