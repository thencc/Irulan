import state from './state';

export const doTxn = async function (txns: any[]) {
    if (state.signingMode === 'sk') {
        return await state.algonaut.sendAtomicTransaction(txns);
    } else {
        const prepared = await state.algonaut.createWalletConnectTransactions(txns);
        return await state.algonaut.sendWalletConnectTxns(prepared);
    }
}