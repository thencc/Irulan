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
    () => state.sAlgo.algonaut.account,
    () => {
        console.log('account changed', state.sAlgo.algonaut.account);
        if (state.sAlgo.algonaut.account) {
            bus.emit('signed-in');
        }
    },
    {
        immediate: false
    }
)

export default state;