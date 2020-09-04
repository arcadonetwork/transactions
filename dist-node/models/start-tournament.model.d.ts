import { TransactionJSON } from "@liskhq/lisk-transactions";
export interface StartTournamentJSON extends TransactionJSON {
    readonly asset: StartTournamentAsset;
}
export interface StartTournamentAsset {
    readonly tournamentId: string;
    readonly address: string;
}
