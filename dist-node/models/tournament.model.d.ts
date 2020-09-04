import { TransactionJSON } from "@liskhq/lisk-transactions";
export interface CreateTournamentJSON extends TransactionJSON {
    readonly asset: CreateTournamentAsset;
}
export interface CreateTournamentAsset {
    readonly tournamentId: string;
    readonly name: string;
    readonly maxPlayers: number;
    readonly entryFee?: number;
    readonly distribution: PrizeDistributionModel;
    readonly endResult?: EndResultModel;
    readonly gameId: string;
    readonly status: number;
    readonly createdBy: string;
}
interface PrizeDistributionModel {
    readonly first: number;
    readonly second: number;
    readonly third: number;
}
interface EndResultModel {
    readonly first: number;
    readonly second: number;
    readonly third: number;
}
export {};
