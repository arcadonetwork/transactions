import { BaseTransaction, TransactionError } from '@liskhq/lisk-transactions';
import { TRANSACTION_TYPES, NETWORK } from '../utils/constants';
import {StartTournamentAsset, StartTournamentJSON} from '../models/start-tournament.model';


/**
 * Start the created tournament
 */
export class StartTournamentTransaction extends BaseTransaction {
    public readonly asset: StartTournamentAsset;
    public static TYPE = TRANSACTION_TYPES.START_TOURNAMENT;
    public static FEE = '0';

    public constructor(rawTransaction: unknown) {
        super(rawTransaction);
        const tx = (typeof rawTransaction === 'object' && rawTransaction !== null
            ? rawTransaction
            : {}) as Partial<StartTournamentJSON>;

        if (tx.asset) {
            this.asset = {
                ...tx.asset,
            } as StartTournamentAsset;
        } else {
            this.asset = {} as StartTournamentAsset;
        }
    }


    async prepare(store) {
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

        // Check if sender is the owner of the tournament otherwise reject
        const tournament = genesis.asset.tournaments.find(tournament => tournament.tournamentId === this.asset.tournamentId)
        if (tournament.createdBy !== this.asset.address) {
            errors.push(
                new TransactionError(
                    '"asset.address" does not match createdBy field for tournament - you are not the owner of the tournament',
                    this.id,
                    '.asset.address',
                    this.asset.address,
                    tournament.createdBy
                )
            );
            return errors;
        }

        let asset = {
            ...genesis.asset
        }

        const tournamentIndex = asset.tournaments.findIndex(tournament => tournament.tournamentId === this.asset.tournamentId)
        asset.tournaments[tournamentIndex].status = 1 // started

        const updatedGenesis = {
            ...genesis,
            asset
        };
        store.account.set(genesis.address, updatedGenesis);

        return errors;
    }

    /* Revert status game */
    undoAsset(store) {
        const errors = [];
        const genesis = store.account.get(NETWORK.GENESIS);

        const tournamentIndex = genesis.asset.tournaments.findIndex(tournament => tournament.tournamentId === this.asset.tournamentId)

        let asset = {
            ...genesis.asset
        }
        asset.tournaments[tournamentIndex].status = 0
        const updatedGenesis = {
            ...genesis,
            asset
        };
        store.account.set(genesis.address, updatedGenesis);

        return errors;
    }

}
