"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StartTournamentTransaction = void 0;
const lisk_transactions_1 = require("@liskhq/lisk-transactions");
const constants_1 = require("../utils/constants");
class StartTournamentTransaction extends lisk_transactions_1.BaseTransaction {
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
                address: this.asset.address,
            }
        ]);
    }
    validateAsset() {
        return [];
    }
    applyAsset(store) {
        const errors = [];
        const genesis = store.account.get(constants_1.NETWORK.GENESIS);
        const tournament = genesis.asset.tournaments.find(tournament => tournament.tournamentId === this.asset.tournamentId);
        if (tournament.createdBy !== this.asset.address) {
            errors.push(new lisk_transactions_1.TransactionError('"asset.address" does not match createdBy field for tournament - you are not the owner of the tournament', this.id, '.asset.address', this.asset.address, tournament.createdBy));
            return errors;
        }
        let asset = {
            ...genesis.asset
        };
        const tournamentIndex = asset.tournaments.findIndex(tournament => tournament.tournamentId === this.asset.tournamentId);
        asset.tournaments[tournamentIndex].status = 1;
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
        const tournamentIndex = genesis.asset.tournaments.findIndex(tournament => tournament.tournamentId === this.asset.tournamentId);
        let asset = {
            ...genesis.asset
        };
        asset.tournaments[tournamentIndex].status = 0;
        const updatedGenesis = {
            ...genesis,
            asset
        };
        store.account.set(genesis.address, updatedGenesis);
        return errors;
    }
}
exports.StartTournamentTransaction = StartTournamentTransaction;
StartTournamentTransaction.TYPE = constants_1.TRANSACTION_TYPES.START_TOURNAMENT;
StartTournamentTransaction.FEE = '0';
//# sourceMappingURL=start-tournament.js.map