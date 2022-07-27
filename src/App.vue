<template>
	<Content app-name="helpershifts" :content-class="{loading: loading.helpershifts}">
		<AppNavigation :class="{loading: loading.helpershifts, 'icon-error': error}">
			<AppNavigationNew
				v-show=true
				:text="t('helpershifts', 'Helpershifts')"
				button-id="helpershists"
				:button-class="['icon-add', { loading: loading.create }]"
				@click="onHelpershifts"
			/>

			<template #footer>
				<AppSettings @reload="reloadHelpershifts" />
			</template>
		</AppNavigation>

		<AppContent v-if="error">
			<div style="margin: 2em;">
				<h2>{{ t('helpershifts', 'Error') }}</h2>
				<p>{{ error }}</p>
				<p>{{ t('helpershifts', 'Please see Nextcloud server log for details.') }}</p>
			</div>
		</AppContent>
		<router-view v-else />

		<router-view name="sidebar" />
	</Content>
</template>

<script>
import {
	AppContent,
	AppNavigation,
	AppNavigationNew,
	Content,
} from '@nextcloud/vue'
import { showSuccess, TOAST_UNDO_TIMEOUT, TOAST_PERMANENT_TIMEOUT } from '@nextcloud/dialogs'
import '@nextcloud/dialogs/styles/toast.scss'

import { config } from './config.js'
import { fetchHelpershifts, helpershiftExists, createHelpershift, undoDeleteHelpershift } from './HelpershiftsService.js'
import AppSettings from './components/AppSettings.vue'
import store from './store.js'

export default {
	name: 'App',

	components: {
		AppContent,
		AppNavigation,
		AppNavigationNew,
		AppSettings,
		Content,
	},

	data() {
		return {
			filter: {
				category: null,
			},
			loading: {
				helpershifts: true,
			},
			error: false,
			undoNotification: null,
			refresh: 30,
			refreshAfterHidden: 5,
		}
	},

	methods: {
		loadHelpershifts() {
			fetchHelpershifts()
				.then(data => {
					if (data === null) {
						// nothing changed
						return
					}
					if (data.helpershifts !== null) {
						this.error = false
					//	this.routeDefault(data.lastViewedHelpershift)
					} else if (this.loading.helpershifts) {
						// only show error state if not loading in background
						this.error = data.errorMessage
					} else {
						console.error('Server error while updating list of helpershifts: ' + data.errorMessage)
					}
				})
				.catch(() => {
					// only show error state if not loading in background
					if (this.loading.helpershifts) {
						this.error = true
					}
				})
				.then(() => {
					this.loading.helpershifts = false
					this.startRefreshTimer(config.interval.helpershifts.refresh)
				})
		},

		startRefreshTimer(seconds) {
			if (this.refreshTimer === null && document.visibilityState === 'visible') {
				this.refreshTimer = setTimeout(() => {
					this.refreshTimer = null
					this.loadHeleprshifts()
				}, seconds * 1000)
			}
		},

		stopRefreshTimer() {
			if (this.refreshTimer !== null) {
				clearTimeout(this.refreshTimer)
				this.refreshTimer = null
			}
		},

		onVisibilityChange() {
			if (document.visibilityState === 'visible') {
				this.startRefreshTimer(config.interval.helpershifts.refreshAfterHidden)
			} else {
				this.stopRefreshTimer()
			}
		},

		reloadHelpershifts() {
			if (this.$route.path !== '/') {
				this.$router.push('/')
			}
			store.commit('removeAllHelpershifts')
			store.commit('clearSyncCache')
			this.loading.helpershifts = true
			this.loadHelpershifts()
		},

		onClose(event) {
			if (!this.helpershifts.every(helpershift => !helpershift.unsaved)) {
				event.preventDefault()
				return this.t('helpershifts', 'There are unsaved helpershifts. Leaving the page will discard all changes!')
			}
		},
	},
}
</script>
