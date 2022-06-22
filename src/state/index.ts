import { reactive, watch } from 'vue';
import { bus } from '../bus';

// modular states
import { sModal } from './modules/sModal';
import { sSearch } from './modules/sSearch';
import { sViewer } from './modules/sViewer';
import { sAlgo } from './modules/sAlgo';

export const state = reactive({
    // modules
    sModal,
    sSearch,
    sViewer,
    sAlgo,

    terminal: [] as { type: string, message: string, route?: string }[],
    connected: false,
    connecting: false,
    toolLoading: false,
    isAccount: false,
    indexer: {} as any,
    activeAccount: null as any,
    algonaut: sAlgo.algonaut,

    /**
     * Returns a new route to navigate to
     * @param currentRoute Current route object
     * @param toParams Params to update
     */
    getNewRoute(currentRoute: any, toParams: { query?: string, contractId?: string, ledger?: string }) {
        console.log('getNewRoute');
        let route = '/' + (currentRoute.params.ledger?.toLowerCase() || 'testnet');

        // replace ledger parameter
        if (toParams.ledger) {
            route = '/' + toParams.ledger;
        }

        // add contract parameter
        if (toParams.contractId) {
            route += '/contract/' + toParams.contractId;
        } else if (currentRoute.name === 'contract' || currentRoute.name === 'full') {
            route += '/contract/' + currentRoute.params.contractId;
        }

        // add search parameter
        if (toParams.query) {
            route += '/s/' + toParams.query;
        } else if (currentRoute.name === 'search' || currentRoute.name === 'full') {
            route += '/s/' + currentRoute.params.query;
        }

        return route;
    },

    // TODO move to sLog
    error: function (message: string) {
        this.terminal.unshift({ type: 'error', message });
    },

    log: function (message: string) {
        this.terminal.unshift({ type: 'normal', message });
    },

    logRoute: function (message: string, route: string) {
        this.terminal.unshift({ type: 'link', message, route });
    },

    success: function (message: string) {
        this.terminal.unshift({ type: 'success', message });
    }
});

// account watcher
watch(
    () => state.algonaut.account,
    () => {
        console.log('account changed', state.algonaut.account);
        if (state.algonaut.account) {
            bus.emit('signed-in');
        }
    },
    {
        immediate: false
    }
)

export default state;