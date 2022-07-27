<template>
	<AppSidebar v-if="sidebarOpen"
		:title="title"
		:subtitle="subtitle"
		:star-loading="loading.favorite"
		:starred="helpershift.favorite"
		@update:starred="onSetFavorite"
		@close="onCloseSidebar"
	>
		<div class="sidebar-content-wrapper">
			
			<div class="modified"
				:title="t('helpershifts', 'Click here to save manually')"
				@click="onManualSave"
			>
				<div v-show="helpershift.error" class="helpershift-error">
					{{ t('helpershifts', 'Saving failed!') }}
				</div>
				{{ t('helpershifts', 'Last modified: {date}', { date: formattedDate }) }}
				<span v-show="helpershift.unsaved" :title="t('helpershifts', 'Helpershift has unsaved changes')"> * </span>
			</div>
		</div>
	</AppSidebar>
</template>
<script>

import {
	AppSidebar,
	Multiselect,
	Tooltip,
} from '@nextcloud/vue'
import moment from '@nextcloud/moment'

import { saveHelpershiftManually } from '../HelpershiftsService.js'
import { categoryLabel } from '../Util.js'
import store from '../store.js'

export default {
	name: 'Sidebar',

	components: {
		AppSidebar,
		Multiselect,
	},

	directives: {
		tooltip: Tooltip,
	},

	filters: {
		categoryOptionLabel(obj) {
			const category = obj.isTag ? obj.label : obj
			return categoryLabel(category)
		},
	},

	props: {
		helpershiftId: {
			type: String,
			required: true,
		},
	},

	data() {
		return {
			loading: {
				// category: false,
				// favorite: false,
			},
			categoryInput: null,
		}
	},

	computed: {
		helpershift() {
			return store.getters.getHelpershift(parseInt(this.helpershiftId))
		},
		title() {
			return this.helpershift ? this.helpershift.title : ''
		},
		category() {
			return this.helpershift ? this.helpershift.category : ''
		},
		formattedDate() {
			return moment(this.helpershift.modified * 1000).format('LLL')
		},
		wordCount() {
			const value = this.helpershift?.content
			if (value && (typeof value === 'string')) {
				const wordCount = value.split(/\s+/).filter(
					// only count words containing
					// at least one alphanumeric character
					value => value.search(/[A-Za-z0-9]/) !== -1
				).length
				const charCount = Array.from(value).length
				return n('helpershifts', '%n word', '%n words', wordCount)
					+ ', ' + n('helpershifts', '%n character', '%n characters', charCount)
			} else {
				return ''
			}
		},
		subtitle() {
			return this.wordCount
		},
		sidebarOpen() {
			return store.state.app.sidebarOpen
		},
	},

	methods: {
		onCloseSidebar() {
			store.commit('setSidebarOpen', false)
		},

		onManualSave() {
			saveHelpershiftManually(this.helpershift.id)
		},

	},
}
</script>
<style scoped>
.sidebar-content-wrapper {
	padding: 0 10px;
}

.helpershift-error {
	background-color: var(--color-error);
	color: var(--color-primary-text);
	border-radius: 0.5ex;
	padding: 0.5ex 1ex;
}

.helpershift-category {
	margin-top: 1ex;
}

form.category > .multiselect,
form.category > .icon-confirm {
	vertical-align: middle;
}

form.category {
	display: flex;
	align-items: center;
}

.helpershift-category .icon-info {
	padding: 11px 20px;
	vertical-align: super;
}

.category-select {
	flex-grow: 1;
}

.gray {
	opacity: 0.5;
}

.modified {
	position: absolute;
	bottom: 0;
	padding: 1ex 0;
	opacity: 0.5;
}
</style>
