"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTournamentTransaction = void 0;
const tslib_1 = require("tslib");
const lisk_transactions_1 = require("@liskhq/lisk-transactions");
const constants_1 = require("../utils/constants");
const bignum_1 = tslib_1.__importDefault(require("@liskhq/bignum"));
class CreateTournamentTransaction extends lisk_transactions_1.BaseTransaction {
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
        const distributionSum = (this.asset.distribution.first + this.asset.distribution.second + this.asset.distribution.third);
        if (distributionSum !== 100) {
            errors.push(new lisk_transactions_1.TransactionError('Invalid "asset.distribution" defined on transaction -> not equal to 100', this.id, '.asset.distribution'));
        }
        return errors;
    }
    applyAsset(store) {
        const errors = [];
        const genesis = store.account.get(constants_1.NETWORK.GENESIS);
        let asset = {
            tournaments: [],
            ...genesis.asset
        };
        asset.tournaments.push({
            createdBy: this.asset.createdBy,
            name: this.asset.name,
            tournamentId: this.asset.tournamentId,
            gameId: this.asset.gameId,
            entryFee: this.asset.entryFee,
            participants: [],
            distribution: this.asset.distribution,
            maxPlayers: this.asset.maxPlayers,
            status: 0
        });
        const updatedGenesis = {
            ...genesis,
            asset
        };
        store.account.set(genesis.address, updatedGenesis);
        const player = store.account.get(this.asset.createdBy);
        const playerBalance = new bignum_1.default(player.balance);
        const entryFeeBalance = new bignum_1.default((this.asset.entryFee + ''));
        const updatedPlayerBalance = playerBalance.sub(entryFeeBalance);
        const updatedPlayer = {
            ...player,
            balance: updatedPlayerBalance.toString()
        };
        store.account.set(player.address, updatedPlayer);
        return errors;
    }
    undoAsset(store) {
        const errors = [];
        const genesis = store.account.get(constants_1.NETWORK.GENESIS);
        const gameIndex = genesis.asset.tournaments.findIndex(game => game.tournamentId === this.asset.tournamentId);
        let asset = {
            ...genesis.asset
        };
        asset.tournaments.splice(gameIndex, 1);
        const updatedGenesis = {
            ...genesis,
            asset
        };
        store.account.set(genesis.address, updatedGenesis);
        return errors;
    }
}
exports.CreateTournamentTransaction = CreateTournamentTransaction;
CreateTournamentTransaction.TYPE = constants_1.TRANSACTION_TYPES.TOURNAMENTS;
CreateTournamentTransaction.FEE = '0';
//# sourceMappingURL=create-tournament.js.map