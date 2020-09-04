import { JoinTournamentAsset } from "../models/join-tournament.model";
import { BaseTransaction, TransactionError } from '@liskhq/lisk-transactions';
import { StateStorePrepare } from "@liskhq/lisk-transactions/dist-node";
export declare class JoinTournamentTransaction extends BaseTransaction {
    readonly asset: JoinTournamentAsset;
    static TYPE: number;
    static FEE: string;
    constructor(rawTransaction: unknown);
    prepare(store: StateStorePrepare): Promise<void>;
    validateAsset(): never[];
    applyAsset(store: any): TransactionError[];
    undoAsset(): never[];
}
