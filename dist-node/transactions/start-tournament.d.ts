import { BaseTransaction, TransactionError } from '@liskhq/lisk-transactions';
import { StartTournamentAsset } from '../models/start-tournament.model';
export declare class StartTournamentTransaction extends BaseTransaction {
    readonly asset: StartTournamentAsset;
    static TYPE: number;
    static FEE: string;
    constructor(rawTransaction: unknown);
    prepare(store: any): Promise<void>;
    validateAsset(): never[];
    applyAsset(store: any): TransactionError[];
    undoAsset(store: any): never[];
}
