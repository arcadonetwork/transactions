import {StopTournamentAsset, StopTournamentJSON} from "../models/stop-tournament.model";
import { BaseTransaction, TransactionError } from '@liskhq/lisk-transactions';
import { TRANSACTION_TYPES, NETWORK } from '../utils/constants';
import BigNum from '@liskhq/bignum';

/**
 * Stop the created tournament and distribute the rewards based on the percentages set
 */
export class StopTournamentTransaction extends BaseTransaction {
    public readonly asset: StopTournamentAsset;
    public static TYPE = TRANSACTION_TYPES.STOP_TOURNAMENT;
    public static FEE = '0';

    public constructor(rawTransaction: unknown) {
        super(rawTransaction);
        const tx = (typeof rawTransaction === 'object' && rawTransaction !== null
            ? rawTransaction
            : {}) as Partial<StopTournamentJSON>;

        if (tx.asset) {
            this.asset = {
                ...tx.asset,
            } as StopTournamentAsset;
        } else {
            this.asset = {} as StopTournamentAsset;
        }
    }

    async prepare(store) {
        await store.account.cache([
            {
                address: NETWORK.GENESIS // genesis
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

        // Update status for game tournament
        const tournamentIndex = asset.tournaments.findIndex(tournament => tournament.tournamentId === this.asset.tournamentId)
        asset.tournaments[tournamentIndex].status = 2 // stopped

        const updatedGenesis = {
            ...genesis,
            asset
        };
        store.account.set(genesis.address, updatedGenesis);

        // Pay out the winnings
        const distribution = asset.tournaments[tournamentIndex].distribution
        const numOfParticipants = asset.tournaments[tournamentIndex].participants.length
        const entryFeeBalance = new BigNum(asset.tournaments[tournamentIndex].entryFee)
        const total = entryFeeBalance.mul(numOfParticipants)
        const firstWinnings = total.div(100).mul(distribution.first)
        const secondWinnings = total.div(100).mul(distribution.second)
        const thirdWinnings = total.div(100).mul(distribution.third)

        // First player
        const firstPlayer = store.account.get(this.asset.first);
        const firstBalance = new BigNum(firstPlayer.balance);
        const updatedFirstBalance = firstBalance.plus(firstWinnings)
        const updatedFirstPlayer = {
            ...firstPlayer,
            balance: updatedFirstBalance.toString()
        }
        store.account.set(firstPlayer.address, updatedFirstPlayer);

        // Second player
        const secondPlayer = store.account.get(this.asset.second);
        const secondBalance = new BigNum(secondPlayer.balance);
        const updatedSecondBalance = secondBalance.plus(secondWinnings);
        const updatedSecondPlayer = {
            ...secondPlayer,
            balance: updatedSecondBalance.toString()
        }
        store.account.set(secondPlayer.address, updatedSecondPlayer);

        // Third player
        const thirdPlayer = store.account.get(this.asset.third);
        const thirdBalance = new BigNum(thirdPlayer.balance);
        const updatedThirdBalance = thirdBalance.plus(thirdWinnings);
        const updatedThirdPlayer = {
            ...thirdPlayer,
            balance: updatedThirdBalance.toString()
        }
        store.account.set(thirdPlayer.address, updatedThirdPlayer);


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
        asset.tournaments[tournamentIndex].status = 1
        const updatedGenesis = {
            ...genesis,
            asset
        };
        store.account.set(genesis.address, updatedGenesis);

        return errors;
    }

}
