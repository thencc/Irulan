import { reactive, watch } from 'vue';
import router from '../../router';

export const sModal = reactive({
	modalId: '' // empty is modal closed
});

watch(
	() => sModal.modalId,
	async (mId, mIdOld) => {
		if (mId) {
			if (mId !== mIdOld) {
				// do something w the modalId
				// ...

				//
				await router.nonDestructivePush({
					query: {
						modal: mId
					}
				});
			}
		} else {
			// reset
			// sSearch.response = null;

			// removes just "modal" query param
			router.nonDestructivePush({
				query: {
					modal: undefined
				}
			});
		}
	},
	{
		immediate: false
	}
);

//
watch(
	() => router.currentRoute.value.query.modal,
	(mId) => {
		// console.log('router changed:', rc);

		if (mId) {
			if (typeof mId == 'string') {
				console.log('got modal param:', mId);
				sModal.modalId = mId;
			} else {
				// its an array of strings or something...
				console.warn('bad modal query string');
			}
		} else {
			console.warn('TODO reset sModal');
		}
	},
	{
		immediate: true, // happened immediately anyway on first load of router (i think)
		// deep: false // not needed
	}
)