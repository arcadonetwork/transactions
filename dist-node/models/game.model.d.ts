import { TransactionJSON } from "@liskhq/lisk-transactions";
export interface CreateGameJSON extends TransactionJSON {
    readonly asset: CreateGameAsset;
}
export interface CreateGameAsset {
    readonly gameId: string;
    readonly name: string;
    readonly description: string;
    readonly createdBy: string;
}
