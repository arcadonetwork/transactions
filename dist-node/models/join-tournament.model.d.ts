import { TransactionJSON } from "@liskhq/lisk-transactions";
export interface JoinTournamentJSON extends TransactionJSON {
    readonly asset: JoinTournamentAsset;
}
export interface JoinTournamentAsset {
    readonly tournamentId: string;
    readonly gameId: string;
    readonly address: string;
}
