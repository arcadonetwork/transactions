import {JoinTournamentAsset, JoinTournamentJSON} from "../models/join-tournament.model";
import { BaseTransaction, TransactionError } from '@liskhq/lisk-transactions';
import { TRANSACTION_TYPES, NETWORK } from '../utils/constants';
import BigNum from '@liskhq/bignum';
import {StateStorePrepare} from "@liskhq/lisk-transactions/dist-node";

/**
 * Join active tournament
 * 1. Check if tournament exists and if maxPlayers has been reached
 * 2. Check balance of user to pay entryFee
 * 3. Add user to game object in asset of genesis account
 */
export class JoinTournamentTransaction extends BaseTransaction {
    public readonly asset: JoinTournamentAsset;
    public static TYPE = TRANSACTION_TYPES.JOIN_TOURNAMENT;
    public static FEE = '0';

    public constructor(rawTransaction: unknown) {
        super(rawTransaction);
        const tx = (typeof rawTransaction === 'object' && rawTransaction !== null
            ? rawTransaction
            : {}) as Partial<JoinTournamentJSON>;

        if (tx.asset) {
            this.asset = {
                ...tx.asset,
            } as JoinTournamentAsset;
        } else {
            this.asset = {} as JoinTournamentAsset;
        }
    }

    async prepare(store: StateStorePrepare) {
        await store.account.cache([
            {
                address: NETWORK.GENESIS, // genesis
            },
            {
                address: this.asset.address,
            }
        ]);
    }

    validateAsset() {
        return [];
    }

    applyAsset(store) {
        const errors: TransactionError[] = [];
        const genesis = store.account.get(NETWORK.GENESIS);
        const player = store.account.get(this.asset.address);

        const tournament = genesis.asset.tournaments.find(tournament => tournament.tournamentId === this.asset.tournamentId)
        if (!tournament) {
            errors.push(
                new TransactionError(
                    '"asset.tournamentId" does not exist',
                    this.id,
                    '.asset.tournamentId',
                    this.asset.tournamentId
                )
            );
            return errors;
        }

        if (tournament.participants.length >= tournament.maxPlayers) {
            errors.push(
                new TransactionError(
                    'Tournament is already full',
                    this.id,
                    '.asset.maxPlayers',
                    tournament.maxPlayers
                )
            );
            return errors;
        }

        const playerBalance = new BigNum(player.balance);
        if (playerBalance.lt(tournament.entryFee)) {
            errors.push(
                new TransactionError(
                    'Insufficient balance for player',
                    this.id,
                    '.asset.entryFee',
                    player.balance
                )
            );
            return errors;
        }

        let asset = {
            ...genesis.asset
        }

        const tournamentIndex = asset.tournaments.findIndex(tournament => tournament.tournamentId === this.asset.tournamentId)
        asset.tournaments[tournamentIndex].participants.push(this.asset.address)

        const updatedGenesis = {
            ...genesis,
            asset
        };
        store.account.set(genesis.address, updatedGenesis);

        // Substract fee from user
        const entryFeeBalance = new BigNum(tournament.entryFee)
        const updatedPlayerBalance = playerBalance.sub(entryFeeBalance);
        const updatedPlayer = {
            ...player,
            balance: updatedPlayerBalance.toString()
        }

        store.account.set(player.address, updatedPlayer);

        return errors;
    }

    undoAsset() {
        // Add entryfee back to user balance
        const errors = [];

        return errors;
    }

}
