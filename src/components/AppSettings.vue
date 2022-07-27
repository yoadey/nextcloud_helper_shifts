<template>
	<AppNavigationSettings :title="t('helpershift', 'Settings')" :class="{ loading: saving }">
		<!-- <div class="settings-block">
			<p class="settings-hint">
				<label for="helpershiftsPath">{{ t('helpershifts', 'Folder to store your helpershifts') }}</label>
			</p>
			<form @submit.prevent="onChangeSettingsReload">
				<input id="helpershiftsPath"
					v-model="settings.helpershiftsPath"
					type="text"
					name="helpershiftsPath"
					:placeholder="t('helpershifts', 'Root directory')"
					@change="onChangeSettingsReload"
				><input type="submit" class="icon-confirm" value="">
			</form>
		</div>
		<div class="settings-block">
			<p class="settings-hint">
				<label for="fileSuffix">{{ t('helpershifts', 'File extension for new helpershifts') }}</label>
			</p>
			<select id="fileSuffix" v-model="settings.fileSuffix" @change="onChangeSettings">
				<option v-for="extension in extensions" :key="extension.value" :value="extension.value">
					{{ extension.label }}
				</option>
			</select>
			<input v-show="settings.fileSuffix === 'custom'"
				id="customSuffix"
				v-model="settings.customSuffix"
				name="customSuffix"
				type="text"
				placeholder=".txt"
				@change="onChangeSettings"
			>
		</div> -->
		<div class="settings-block">
			<p class="settings-hint">
				<label for="helpershiftMode">{{ t('helpershifts', 'Display mode for helpershifts') }}</label>
			</p>
			<select id="helpershiftMode" v-model="settings.helpershiftMode" @change="onChangeSettings">
				<option v-for="mode in helpershiftModes" :key="mode.value" :value="mode.value">
					{{ mode.label }}
				</option>
			</select>
		</div>
	</AppNavigationSettings>
</template>

<script>
import {
	AppNavigationSettings,
} from '@nextcloud/vue'

import { setSettings } from '../HelpershiftsService.js'
import store from '../store.js'

export default {
	name: 'AppSettings',

	components: {
		AppNavigationSettings,
	},

	data() {
		return {
			extensions: [
				{ value: '.txt', label: '.txt' },
				{ value: '.md', label: '.md' },
				{ value: 'custom', label: t('helpershifts', 'User defined') },
			],
			helpershiftModes: [
				{ value: 'edit', label: t('helpershifts', 'Open in edit mode') },
				{ value: 'preview', label: t('helpershifts', 'Open in preview mode') },
			],
			saving: false,
		}
	},

	computed: {
		settings() {
			return store.state.app.settings
		},
	},

	created() {
	},

	methods: {
		onChangeSettings() {
			this.saving = true
			return setSettings(this.settings)
				.catch(() => {
				})
				.then(() => {
					this.saving = false
				})
		},

		onChangeSettingsReload() {
			this.onChangeSettings()
				.then(() => {
					this.$emit('reload')
				})
		},
	},
}
</script>
<style scoped>
.loading .settings-block {
	visibility: hidden;
}

.settings-block + .settings-block {
	padding-top: 2ex;
}

.settings-block form {
	display: inline-flex;
}
</style>
