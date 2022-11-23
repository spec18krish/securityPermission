export class OutboundAccountPosition {
  public event: string = 'outboundAccountPosition';
  public eventTime!: number;
  public lastAccountUpdateTime!: number;
  public balanceArray!: BalanceModel[];
}

export class BalanceModel {
  public asset!: string;
  public free!: number;
  public locked!: number;
}
