"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateGameTransaction = void 0;
const lisk_transactions_1 = require("@liskhq/lisk-transactions");
const constants_1 = require("../utils/constants");
class CreateGameTransaction extends lisk_transactions_1.BaseTransaction {
    constructor(rawTransaction) {
        super(rawTransaction);
        const tx = (typeof rawTransaction === 'object' && rawTransaction !== null
            ? rawTransaction
            : {});
        if (tx.asset) {
            this.asset = {
                ...tx.asset,
            };
        }
        else {
            this.asset = {};
        }
    }
    async prepare(store) {
        await store.account.cache([
            {
                address: constants_1.NETWORK.GENESIS,
            },
            {
                address: this.asset.createdBy,
            }
        ]);
    }
    validateAsset() {
        const errors = [];
        if (this.asset.gameId === '') {
            errors.push(new lisk_transactions_1.TransactionError('Invalid "asset.gameId" defined on transaction', this.id, '.asset.gameId', this.asset.gameId));
        }
        return errors;
    }
    applyAsset(store) {
        const errors = [];
        const genesis = store.account.get(constants_1.NETWORK.GENESIS);
        let asset = {
            games: [],
            ...genesis.asset
        };
        asset.games.push({
            createdBy: this.asset.createdBy,
            name: this.asset.name,
            description: this.asset.description,
            gameId: this.asset.gameId
        });
        const updatedGenesis = {
            ...genesis,
            asset
        };
        store.account.set(genesis.address, updatedGenesis);
        return errors;
    }
    undoAsset(store) {
        const errors = [];
        const genesis = store.account.get(constants_1.NETWORK.GENESIS);
        const gameIndex = genesis.asset.games.findIndex(game => game.gameId === this.asset.gameId);
        let asset = {
            ...genesis.asset
        };
        asset.games.splice(gameIndex, 1);
        const updatedGenesis = {
            ...genesis,
            asset
        };
        store.account.set(genesis.address, updatedGenesis);
        return errors;
    }
}
exports.CreateGameTransaction = CreateGameTransaction;
CreateGameTransaction.TYPE = constants_1.TRANSACTION_TYPES.GAMES;
CreateGameTransaction.FEE = lisk_transactions_1.utils.convertLSKToBeddows(constants_1.FEES.createGame);
//# sourceMappingURL=create-game.js.map