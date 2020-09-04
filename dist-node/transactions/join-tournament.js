"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JoinTournamentTransaction = void 0;
const tslib_1 = require("tslib");
const lisk_transactions_1 = require("@liskhq/lisk-transactions");
const constants_1 = require("../utils/constants");
const bignum_1 = tslib_1.__importDefault(require("@liskhq/bignum"));
class JoinTournamentTransaction extends lisk_transactions_1.BaseTransaction {
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
        const player = store.account.get(this.asset.address);
        const tournament = genesis.asset.tournaments.find(tournament => tournament.tournamentId === this.asset.tournamentId);
        if (!tournament) {
            errors.push(new lisk_transactions_1.TransactionError('"asset.tournamentId" does not exist', this.id, '.asset.tournamentId', this.asset.tournamentId));
            return errors;
        }
        if (tournament.participants.length >= tournament.maxPlayers) {
            errors.push(new lisk_transactions_1.TransactionError('Tournament is already full', this.id, '.asset.maxPlayers', tournament.maxPlayers));
            return errors;
        }
        const playerBalance = new bignum_1.default(player.balance);
        if (playerBalance.lt(tournament.entryFee)) {
            errors.push(new lisk_transactions_1.TransactionError('Insufficient balance for player', this.id, '.asset.entryFee', player.balance));
            return errors;
        }
        let asset = {
            ...genesis.asset
        };
        const tournamentIndex = asset.tournaments.findIndex(tournament => tournament.tournamentId === this.asset.tournamentId);
        asset.tournaments[tournamentIndex].participants.push(this.asset.address);
        const updatedGenesis = {
            ...genesis,
            asset
        };
        store.account.set(genesis.address, updatedGenesis);
        const entryFeeBalance = new bignum_1.default(tournament.entryFee);
        const updatedPlayerBalance = playerBalance.sub(entryFeeBalance);
        const updatedPlayer = {
            ...player,
            balance: updatedPlayerBalance.toString()
        };
        store.account.set(player.address, updatedPlayer);
        return errors;
    }
    undoAsset() {
        const errors = [];
        return errors;
    }
}
exports.JoinTournamentTransaction = JoinTournamentTransaction;
JoinTournamentTransaction.TYPE = constants_1.TRANSACTION_TYPES.JOIN_TOURNAMENT;
JoinTournamentTransaction.FEE = '0';
//# sourceMappingURL=join-tournament.js.map