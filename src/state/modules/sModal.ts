import { reactive, watch } from 'vue';
import router from '../../router';

export const sModal = reactive({
	modalId: '', // empty is modal closed
	width: '40%',

	close() {
		// add resets here
		sModal.modalId = '';
		sModal.width = '40%';
	}
});

watch(
	() => sModal.modalId,
	async (mId, mIdOld) => {
		if (mId) {
			if (mId !== mIdOld) {
				// do something w the modalId

				// unique bits
				if (mId == 'contract-deploy') {
					sModal.width = '70%';
				} else if (mId == 'contract-update') {
					sModal.width = '70%';
				}

				await router.nonDestructivePush({
					query: {
						modal: mId
					}
				});
			}
		} else {
			// resets

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
			sModal.close();
		}
	},
	{
		immediate: true, // happened immediately anyway on first load of router (i think)
		// deep: false // not needed
	}
);
