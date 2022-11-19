import { AccountType } from "../enum/account-type";


export interface AccountInfo {
    accountType: AccountType;
    balances: Balances[];
}

export interface Balances {
    asset: string;
    free: number;
    locked: number;
}
