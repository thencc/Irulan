import { reactive, watch } from 'vue';
import router from '../../router';

export const sModal = reactive({
	modalId: ''
});

//
watch(
	() => router.currentRoute.value,
	(rc) => {
		console.log('router changed:', rc);

		if (rc.query.m) {
			if (typeof rc.query.m == 'string') {
				console.log('got modal param', rc.query.m);

				// TODO update getNewRoute to not override params + query like in Setup.vue > .applySettings()
				sModal.modalId = rc.query.m;
			} else {
				// its an array of strings or something...
				console.warn('bad modal query string');
			}
		}
	},
	{
		immediate: true, // happened immediately anyway on first load of router (i think)
		// deep: false // not needed
	}
)