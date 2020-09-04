import { StopTournamentAsset } from "../models/stop-tournament.model";
import { BaseTransaction, TransactionError } from '@liskhq/lisk-transactions';
export declare class StopTournamentTransaction extends BaseTransaction {
    readonly asset: StopTournamentAsset;
    static TYPE: number;
    static FEE: string;
    constructor(rawTransaction: unknown);
    prepare(store: any): Promise<void>;
    validateAsset(): never[];
    applyAsset(store: any): TransactionError[];
    undoAsset(store: any): never[];
}
