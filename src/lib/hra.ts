export type HraInput = {
  basic: number;
  hraReceived: number;
  rentPaid: number;
  metro: boolean;
};

export function hraExemption(input: HraInput): number {
  const basic = Math.max(0, input.basic);
  const received = Math.max(0, input.hraReceived);
  const rent = Math.max(0, input.rentPaid);
  if (basic === 0 || received === 0 || rent === 0) return 0;

  const excessRent = Math.max(0, rent - Math.round(0.1 * basic));
  const percentOfBasic = Math.round((input.metro ? 0.5 : 0.4) * basic);
  return Math.round(Math.min(received, excessRent, percentOfBasic));
}
