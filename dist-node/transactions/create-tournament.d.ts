import { BaseTransaction, TransactionError } from '@liskhq/lisk-transactions';
import { CreateTournamentAsset } from "../models/tournament.model";
import { StateStorePrepare } from "@liskhq/lisk-transactions/dist-node";
export declare class CreateTournamentTransaction extends BaseTransaction {
    readonly asset: CreateTournamentAsset;
    static TYPE: number;
    static FEE: string;
    constructor(rawTransaction: unknown);
    prepare(store: StateStorePrepare): Promise<void>;
    validateAsset(): TransactionError[];
    applyAsset(store: any): ReadonlyArray<TransactionError>;
    undoAsset(store: any): never[];
}
