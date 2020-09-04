import { BaseTransaction, TransactionError } from '@liskhq/lisk-transactions';
import { CreateGameAsset } from "../models/game.model";
import { StateStorePrepare } from "@liskhq/lisk-transactions/dist-node";
export declare class CreateGameTransaction extends BaseTransaction {
    readonly asset: CreateGameAsset;
    static TYPE: number;
    static FEE: string;
    constructor(rawTransaction: unknown);
    prepare(store: StateStorePrepare): Promise<void>;
    validateAsset(): ReadonlyArray<TransactionError>;
    applyAsset(store: any): never[];
    undoAsset(store: any): never[];
}
