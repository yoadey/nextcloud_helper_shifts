<template>
	<AppContent>
		<div class="welcome-content">
			<h2>{{ t('helpershifts', 'Helpershifts') }}</h2>
			<div class="feature icon-add">
				{{ t('helpershifts', 'Start create a helpershift by clicking on “{newhelpershift}” in the app navigation.', { newhelpershift: t('helpershifts', 'New helpershift') }) }}
			</div>
		</div>
	</AppContent>
</template>
<script>

import {
	AppContent,
} from '@nextcloud/vue'

export default {
	name: 'Welcome',

	components: {
		AppContent,
	},
}

</script>
<style>
.welcome-content {
	padding: 2em 3em;
}

.welcome-content h2 {
	margin-bottom: 1em;
}

.welcome-content a {
	color: var(--color-primary-element);
}

.feature {
	background-position: left top;
	min-height: 32px;
	padding-left: 32px;
	margin-top: 1em;
}

.feature ul {
	list-style: circle outside;
	padding-left: 2em;
}
</style>
