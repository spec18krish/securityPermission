export class BalanceUpdateModel {
  public eventName: string = 'balanceUpdate';
  public eventTime!: number;
  public asset!: string;
  public balanceDelta!: number;
  public clearTime!: number;
}
