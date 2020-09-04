"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StopTournamentTransaction = void 0;
const tslib_1 = require("tslib");
const lisk_transactions_1 = require("@liskhq/lisk-transactions");
const constants_1 = require("../utils/constants");
const bignum_1 = tslib_1.__importDefault(require("@liskhq/bignum"));
class StopTournamentTransaction extends lisk_transactions_1.BaseTransaction {
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
                address: constants_1.NETWORK.GENESIS
            },
            {
                address: this.asset.first
            },
            {
                address: this.asset.second
            },
            {
                address: this.asset.third
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
        asset.tournaments[tournamentIndex].status = 2;
        const updatedGenesis = {
            ...genesis,
            asset
        };
        store.account.set(genesis.address, updatedGenesis);
        const distribution = asset.tournaments[tournamentIndex].distribution;
        const numOfParticipants = asset.tournaments[tournamentIndex].participants.length;
        const entryFeeBalance = new bignum_1.default(asset.tournaments[tournamentIndex].entryFee);
        const total = entryFeeBalance.mul(numOfParticipants);
        const firstWinnings = total.div(100).mul(distribution.first);
        const secondWinnings = total.div(100).mul(distribution.second);
        const thirdWinnings = total.div(100).mul(distribution.third);
        const firstPlayer = store.account.get(this.asset.first);
        const firstBalance = new bignum_1.default(firstPlayer.balance);
        const updatedFirstBalance = firstBalance.plus(firstWinnings);
        const updatedFirstPlayer = {
            ...firstPlayer,
            balance: updatedFirstBalance.toString()
        };
        store.account.set(firstPlayer.address, updatedFirstPlayer);
        const secondPlayer = store.account.get(this.asset.second);
        const secondBalance = new bignum_1.default(secondPlayer.balance);
        const updatedSecondBalance = secondBalance.plus(secondWinnings);
        const updatedSecondPlayer = {
            ...secondPlayer,
            balance: updatedSecondBalance.toString()
        };
        store.account.set(secondPlayer.address, updatedSecondPlayer);
        const thirdPlayer = store.account.get(this.asset.third);
        const thirdBalance = new bignum_1.default(thirdPlayer.balance);
        const updatedThirdBalance = thirdBalance.plus(thirdWinnings);
        const updatedThirdPlayer = {
            ...thirdPlayer,
            balance: updatedThirdBalance.toString()
        };
        store.account.set(thirdPlayer.address, updatedThirdPlayer);
        return errors;
    }
    undoAsset(store) {
        const errors = [];
        const genesis = store.account.get(constants_1.NETWORK.GENESIS);
        const tournamentIndex = genesis.asset.tournaments.findIndex(tournament => tournament.tournamentId === this.asset.tournamentId);
        let asset = {
            ...genesis.asset
        };
        asset.tournaments[tournamentIndex].status = 1;
        const updatedGenesis = {
            ...genesis,
            asset
        };
        store.account.set(genesis.address, updatedGenesis);
        return errors;
    }
}
exports.StopTournamentTransaction = StopTournamentTransaction;
StopTournamentTransaction.TYPE = constants_1.TRANSACTION_TYPES.STOP_TOURNAMENT;
StopTournamentTransaction.FEE = '0';
//# sourceMappingURL=stop-tournament.js.map