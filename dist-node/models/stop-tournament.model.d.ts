import { TransactionJSON } from "@liskhq/lisk-transactions";
export interface StopTournamentJSON extends TransactionJSON {
    readonly asset: StopTournamentAsset;
}
export interface StopTournamentAsset {
    readonly tournamentId: string;
    readonly first: string;
    readonly second: string;
    readonly third: string;
    readonly address: string;
}
