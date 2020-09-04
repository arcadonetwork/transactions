import { BaseTransaction, TransactionError } from '@liskhq/lisk-transactions';
import { TRANSACTION_TYPES, NETWORK } from '../utils/constants';
import BigNum from '@liskhq/bignum';
import {CreateTournamentAsset, CreateTournamentJSON} from "../models/tournament.model";
import {StateStorePrepare} from "@liskhq/lisk-transactions/dist-node";

/**
 * Create new tournament with details
 */

export class CreateTournamentTransaction extends BaseTransaction {
    public readonly asset: CreateTournamentAsset;
    public static TYPE = TRANSACTION_TYPES.TOURNAMENTS;
    public static FEE = '0';

    public constructor(rawTransaction: unknown) {
        super(rawTransaction);
        const tx = (typeof rawTransaction === 'object' && rawTransaction !== null
            ? rawTransaction
            : {}) as Partial<CreateTournamentJSON>;

        if (tx.asset) {
            this.asset = {
                ...tx.asset,
            } as CreateTournamentAsset;
        } else {
            this.asset = {} as CreateTournamentAsset;
        }
    }

    async prepare(store: StateStorePrepare) {
        await store.account.cache([
            {
                address: NETWORK.GENESIS, // genesis
            },
            {
                address: this.asset.createdBy,
            }
        ]);
    }

    validateAsset() {
        const errors: TransactionError[] = [];
        const distributionSum = (this.asset.distribution.first + this.asset.distribution.second + this.asset.distribution.third)
        if (distributionSum !== 100) {
            errors.push(
                new TransactionError(
                    'Invalid "asset.distribution" defined on transaction -> not equal to 100',
                    this.id,
                    '.asset.distribution'
                )
            );
        }

        return errors;
    }

    applyAsset(store): ReadonlyArray<TransactionError> {
        const errors = [];
        const genesis = store.account.get(NETWORK.GENESIS);
        let asset = {
            tournaments: [],
            ...genesis.asset
        }

        asset.tournaments.push({
            createdBy: this.asset.createdBy,
            name: this.asset.name,
            tournamentId: this.asset.tournamentId,
            gameId: this.asset.gameId,
            entryFee: this.asset.entryFee, // string
            participants: [],
            distribution: this.asset.distribution,
            maxPlayers: this.asset.maxPlayers,
            status: 0 // 0 open to join, 1 started, 2 ended
        })

        const updatedGenesis = {
            ...genesis,
            asset
        };
        store.account.set(genesis.address, updatedGenesis);

        // No need for balance property in game object
        // Don't need this property as we can calculate the players * entryFee and use the distribution to pay out
        const player = store.account.get(this.asset.createdBy);
        const playerBalance = new BigNum(player.balance);
        const entryFeeBalance = new BigNum((this.asset.entryFee + ''))
        const updatedPlayerBalance = playerBalance.sub(entryFeeBalance);
        const updatedPlayer = {
            ...player,
            balance: updatedPlayerBalance.toString()
        }

        store.account.set(player.address, updatedPlayer);

        return errors;
    }

    undoAsset(store) {
        // Add entryfee back to user balance
        const errors = [];
        const genesis = store.account.get(NETWORK.GENESIS);

        const gameIndex = genesis.asset.tournaments.findIndex(game => game.tournamentId === this.asset.tournamentId)

        let asset = {
            ...genesis.asset
        }
        asset.tournaments.splice(gameIndex, 1)
        const updatedGenesis = {
            ...genesis,
            asset
        };
        store.account.set(genesis.address, updatedGenesis);

        return errors;
    }

}
