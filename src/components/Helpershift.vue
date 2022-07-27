<template>
	<AppContent :class="{ loading: loading || isManualSave, 'icon-error': !loading && (!helpershift || helpershift.error), 'sidebar-open': sidebarOpen }">
		<div v-if="!loading && helpershift && !helpershift.error && !helpershift.deleting"
			id="helpershift-container"
			class="helpershift-container"
			:class="{ fullscreen: fullscreen }"
		>
			
			<span class="action-buttons">
			</span>
		</div>
	</AppContent>
</template>
<script>

import {
	Actions,
	ActionButton,
	AppContent,
	Modal,
	Tooltip,
	isMobile,
} from '@nextcloud/vue'
import { showError } from '@nextcloud/dialogs'
import { emit } from '@nextcloud/event-bus'

import SyncAlertIcon from 'vue-material-design-icons/SyncAlert'
import PencilOffIcon from 'vue-material-design-icons/PencilOff'

import { config } from '../config.js'
import { fetchHelpershift, refreshHelpershift, saveHelpershiftManually, queueCommand } from '../HelpershiftsService.js'
import { routeIsNewHelpershift } from '../Util.js'
import store from '../store.js'

export default {
	name: 'Helpershift',

	components: {
		Actions,
		ActionButton,
		AppContent,
		Modal,
		PencilOffIcon,
		SyncAlertIcon,
	},

	directives: {
		tooltip: Tooltip,
	},

	mixins: [isMobile],

	props: {
		helpershiftId: {
			type: String,
			required: true,
		},
	},

	data() {
		return {
			loading: false,
			fullscreen: false,
			preview: false,
			actionsOpen: false,
			autosaveTimer: null,
			autotitleTimer: null,
			refreshTimer: null,
			etag: null,
			showConflict: false,
		}
	},

	computed: {
		helpershift() {
			return store.getters.getHelpershift(parseInt(this.helpershiftId))
		},
		title() {
			return this.helpershift ? this.helpershift.title : ''
		},
		isNewHelpershift() {
			return routeIsNewHelpershift(this.$route)
		},
		isManualSave() {
			return store.state.app.isManualSave
		},
		sidebarOpen() {
			return store.state.app.sidebarOpen
		},
	},

	watch: {
		$route(to, from) {
			if (to.name !== from.name || to.params.helpershiftId !== from.params.helpershiftId) {
				this.fetchData()
			}
		},
		title: 'onUpdateTitle',
		'helpershift.conflict'(newConflict, oldConflict) {
			if (newConflict) {
				this.showConflict = true
			}
		},
	},

	created() {
		this.fetchData()
		document.addEventListener('webkitfullscreenchange', this.onDetectFullscreen)
		document.addEventListener('mozfullscreenchange', this.onDetectFullscreen)
		document.addEventListener('fullscreenchange', this.onDetectFullscreen)
		document.addEventListener('keydown', this.onKeyPress)
		document.addEventListener('visibilitychange', this.onVisibilityChange)
	},

	destroyed() {
		this.stopRefreshTimer()
		document.removeEventListener('webkitfullscreenchange', this.onDetectFullscreen)
		document.removeEventListener('mozfullscreenchange', this.onDetectFullscreen)
		document.removeEventListener('fullscreenchange', this.onDetectFullscreen)
		document.removeEventListener('keydown', this.onKeyPress)
		document.removeEventListener('visibilitychange', this.onVisibilityChange)
		this.onUpdateTitle(null)
	},

	methods: {
		fetchData() {
			this.etag = null
			this.stopRefreshTimer()

			if (this.isMobile) {
				emit('toggle-navigation', { open: false })
			}

			this.onUpdateTitle(this.title)
			this.loading = true
			this.preview = store.state.app.settings.helpershiftMode === 'preview'
			fetchHelpershift(parseInt(this.helpershiftId))
				.then((helpershift) => {
					if (helpershift.error) {
						showError(t('helpershifts', 'Error from Nextcloud server: {msg}', { msg: helpershift.errorType }))
					}
					this.startRefreshTimer()
				})
				.catch(() => {
					// helpershift not found
				})
				.then(() => {
					this.loading = false
				})
		},

		onUpdateTitle(title) {
			const defaultTitle = store.state.app.documentTitle
			if (title) {
				document.title = title + ' - ' + defaultTitle
			} else {
				document.title = defaultTitle
			}
		},

		onTogglePreview() {
			this.preview = !this.preview
			this.actionsOpen = false
		},

		onDetectFullscreen() {
			this.fullscreen = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen
		},

		onToggleDistractionFree() {
			function launchIntoFullscreen(element) {
				if (element.requestFullscreen) {
					element.requestFullscreen()
				} else if (element.mozRequestFullScreen) {
					element.mozRequestFullScreen()
				} else if (element.webkitRequestFullscreen) {
					element.webkitRequestFullscreen()
				} else if (element.msRequestFullscreen) {
					element.msRequestFullscreen()
				}
			}

			function exitFullscreen() {
				if (document.exitFullscreen) {
					document.exitFullscreen()
				} else if (document.mozCancelFullScreen) {
					document.mozCancelFullScreen()
				} else if (document.webkitExitFullscreen) {
					document.webkitExitFullscreen()
				}
			}

			if (this.fullscreen) {
				exitFullscreen()
			} else {
				launchIntoFullscreen(document.getElementById('helpershift-container'))
			}
			this.actionsOpen = false
		},

		onToggleSidebar() {
			store.commit('setSidebarOpen', !store.state.app.sidebarOpen)
			this.actionsOpen = false
		},

		onVisibilityChange() {
			if (document.visibilityState === 'visible') {
				this.stopRefreshTimer()
				this.refreshHelpershift()
			}
		},

		stopRefreshTimer() {
			if (this.refreshTimer !== null) {
				clearTimeout(this.refreshTimer)
				this.refreshTimer = null
			}
		},

		startRefreshTimer() {
			this.stopRefreshTimer()
			const interval = document.visibilityState === 'visible' ? config.interval.helpershift.refresh : config.interval.helpershift.refreshHidden
			this.refreshTimer = setTimeout(() => {
				this.refreshTimer = null
				this.refreshHelpershift()
			}, interval * 1000)
		},

		refreshHelpershift() {
			if (this.helpershift.unsaved && !this.helpershift.conflict) {
				this.startRefreshTimer()
				return
			}
			refreshHelpershift(parseInt(this.helpershiftId), this.etag).then(etag => {
				if (etag) {
					this.etag = etag
					this.$forceUpdate()
				}
				this.startRefreshTimer()
			})
		},

		onEdit(newContent) {
			if (this.helpershift.content !== newContent) {
				this.stopRefreshTimer()
				const helpershift = {
					...this.helpershift,
					content: newContent,
					unsaved: true,
				}
				store.commit('updateHelpershift', helpershift)
				this.$forceUpdate()

				// queue auto saving helpershift content
				if (this.autosaveTimer === null) {
					this.autosaveTimer = setTimeout(() => {
						this.autosaveTimer = null
						queueCommand(helpershift.id, 'content')
					}, config.interval.helpershift.autosave * 1000)
				}

				// (re-) start auto refresh timer
				// TODO should be after save is finished
				this.startRefreshTimer()

				// stop old autotitle timer
				if (this.autotitleTimer !== null) {
					clearTimeout(this.autotitleTimer)
					this.autotitleTimer = null
				}
				// start autotitle timer if helpershift is new
				if (this.isNewHelpershift) {
					this.autotitleTimer = setTimeout(() => {
						this.autotitleTimer = null
						if (this.isNewHelpershift) {
							queueCommand(helpershift.id, 'autotitle')
						}
					}, config.interval.helpershift.autotitle * 1000)
				}
			}
		},

		onKeyPress(event) {
			if (event.ctrlKey || event.metaKey) {
				switch (event.key.toLowerCase()) {
				case 's':
					event.preventDefault()
					this.onManualSave()
					break
				case '/':
					event.preventDefault()
					this.onTogglePreview()
					break
				}
			}
		},

		onManualSave() {
			const helpershift = {
				...this.helpershift,
			}
			store.commit('updateHelpershift', helpershift)
			saveHelpershiftManually(this.helpershift.id)
		},
	},
}
</script>
<style scoped>
.helpershift-container {
	min-height: 100%;
	width: 100%;
	background-color: var(--color-main-background);
}

.helpershift-editor {
	max-width: 47em;
	font-size: 16px;
	padding: 1em;
	padding-bottom: 0;
}

/* center editor on large screens */
@media (min-width: 1600px) {
	.helpershift-editor {
		margin: 0 auto;
	}
	.helpershift-container {
		padding-right: 250px;
		transition-duration: var(--animation-quick);
		transition-property: padding-right;
	}
	.sidebar-open .helpershift-container {
		padding-right: 0px;
	}
}

/* distraction free styles */
.helpershift-container.fullscreen {
	width: 100vw;
	height: 100vh;
	overflow-y: auto;
	padding: 0;
}

.helpershift-container.fullscreen .helpershift-editor {
	margin: 0 auto;
}

/* placeholder */
.placeholder {
	position: absolute;
	padding: 1em;
	opacity: 0.5;
}

/* main editor button */
.action-buttons {
	position: fixed;
	top: 50px;
	right: 20px;
	width: 44px;
	margin-top: 1em;
	z-index: 2000;
}

.action-buttons .action-error {
	background-color: var(--color-error);
	margin-top: 1ex;
}

.helpershift-container.fullscreen .action-buttons {
	top: 0px;
}

/* Conflict Modal */
.conflict-modal {
	width: 70vw;
	margin: auto;
}

.conflict-header {
	padding: 1ex 1em;
}

.conflict-solutions {
	display: flex;
	flex-direction: row-reverse;
	max-height: 75vh;
	overflow-y: auto;
}

@media (max-width: 60em) {
	.conflict-solutions {
		flex-direction: column;
	}
}

</style>
