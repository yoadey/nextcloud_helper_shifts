import Vue from 'vue'

const state = {
	queue: {},
	etag: null,
	lastModified: 0,
	active: false,
}

const getters = {
}

const mutations = {
	addToQueue(state, { helpershiftId, type }) {
		const cmd = { helpershiftId, type }
		const key = helpershiftId + '-' + type
		Vue.set(state.queue, key, cmd)
	},

	clearQueue(state) {
		state.queue = {}
	},

	setSyncETag(state, etag) {
		if (etag) {
			state.etag = etag
		}
	},

	setSyncLastModified(state, strLastModified) {
		const lastModified = Date.parse(strLastModified)
		if (lastModified) {
			state.lastModified = lastModified / 1000
		}
	},

	clearSyncCache(state) {
		state.etag = null
		state.lastModified = 0
	},

	setSyncActive(state, active) {
		state.active = active
	},
}

const actions = {
}

export default { state, getters, mutations, actions }
