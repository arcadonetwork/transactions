import { BaseTransaction, TransactionError, utils } from '@liskhq/lisk-transactions';
import { FEES, TRANSACTION_TYPES, NETWORK } from '../utils/constants';
import {CreateGameAsset, CreateGameJSON} from "../models/game.model";
import {StateStorePrepare} from "@liskhq/lisk-transactions/dist-node";

/**
 * Create new tournament with details
 */

export class CreateGameTransaction extends BaseTransaction {
    public readonly asset: CreateGameAsset;
    public static TYPE = TRANSACTION_TYPES.GAMES;
    public static FEE = utils.convertLSKToBeddows(FEES.createGame);

    public constructor(rawTransaction: unknown) {
        super(rawTransaction);
        const tx = (typeof rawTransaction === 'object' && rawTransaction !== null
            ? rawTransaction
            : {}) as Partial<CreateGameJSON>;

        if (tx.asset) {
            this.asset = {
                ...tx.asset,
            } as CreateGameAsset;
        } else {
            this.asset = {} as CreateGameAsset;
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

    validateAsset(): ReadonlyArray<TransactionError> {
        const errors: TransactionError[] = [];
        if (this.asset.gameId === '') {
            errors.push(
                new TransactionError(
                    'Invalid "asset.gameId" defined on transaction',
                    this.id,
                    '.asset.gameId',
                    this.asset.gameId
                )
            );
        }

        return errors;
    }

    applyAsset(store) {
        const errors = [];
        const genesis = store.account.get(NETWORK.GENESIS);
        let asset = {
            games: [],
            ...genesis.asset
        }

        asset.games.push({
            createdBy: this.asset.createdBy,
            name: this.asset.name,
            description: this.asset.description,
            gameId: this.asset.gameId
        })

        const updatedGenesis = {
            ...genesis,
            asset
        };

        store.account.set(genesis.address, updatedGenesis);
        return errors;
    }

    undoAsset(store) {
        // Add entryfee back to user balance
        const errors = [];
        const genesis = store.account.get(NETWORK.GENESIS);

        const gameIndex = genesis.asset.games.findIndex(game => game.gameId === this.asset.gameId)

        let asset = {
            ...genesis.asset
        }
        asset.games.splice(gameIndex, 1)
        const updatedGenesis = {
            ...genesis,
            asset
        };
        store.account.set(genesis.address, updatedGenesis);

        return errors;
    }

}
