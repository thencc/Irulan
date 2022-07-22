import router from './router';

declare module '@vue/runtime-core' {
	export interface ComponentCustomProperties {
		$router: typeof router;
	}
}
