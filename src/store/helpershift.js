import Vue from 'vue'
import { copyHelpershift } from '../Util.js'

const state = {
	categories: [],
	helpershifts: [],
	helpershiftsIds: {},
}

const getters = {
	numHelpershifts: (state) => () => {
		return state.helpershifts.length
	},

	helpershiftExists: (state) => (id) => {
		return state.helpershiftsIds[id] !== undefined
	},

	getHelpershift: (state) => (id) => {
		if (state.helpershiftsIds[id] === undefined) {
			return null
		}
		return state.helpershiftsIds[id]
	},

	getCategories: (state) => (maxLevel, details) => {
		function nthIndexOf(str, pattern, n) {
			let i = -1
			while (n-- && i++ < str.length) {
				i = str.indexOf(pattern, i)
				if (i < 0) {
					break
				}
			}
			return i
		}

		// get categories from helpershifts
		const categories = {}
		for (const helpershift of state.helpershifts) {
			let cat = helpershift.category
			if (maxLevel > 0) {
				const index = nthIndexOf(cat, '/', maxLevel)
				if (index > 0) {
					cat = cat.substring(0, index)
				}
			}
			if (categories[cat] === undefined) {
				categories[cat] = 1
			} else {
				categories[cat] += 1
			}
		}
		// get structured result from categories
		const result = []
		for (const category in categories) {
			if (details) {
				result.push({
					name: category,
					count: categories[category],
				})
			} else if (category) {
				result.push(category)
			}
		}
		if (details) {
			result.sort((a, b) => a.name.localeCompare(b.name))
		} else {
			result.sort()
		}
		return result
	},
}

const mutations = {
	updateHelpershift(state, updated) {
		const helpershift = state.helpershiftsIds[updated.id]
		if (helpershift) {
			copyHelpershift(updated, helpershift, ['id', 'etag', 'content'])
			// don't update meta-data over full data
			if (updated.content !== undefined && updated.etag !== undefined) {
				helpershift.content = updated.content
				helpershift.etag = updated.etag
				Vue.set(helpershift, 'unsaved', updated.unsaved)
				Vue.set(helpershift, 'error', updated.error)
				Vue.set(helpershift, 'errorType', updated.errorType)
			}
		} else {
			state.helpershifts.push(updated)
			Vue.set(state.helpershiftsIds, updated.id, updated)
		}
	},

	setHelpershiftAttribute(state, params) {
		const helpershift = state.helpershiftsIds[params.helpershiftId]
		if (helpershift) {
			Vue.set(helpershift, params.attribute, params.value)
		}
	},

	removeHelpershift(state, id) {
		state.helpershifts = state.helpershifts.filter(helpershift => helpershift.id !== id)
		Vue.delete(state.helpershiftsIds, id)
	},

	removeAllHelpershifts(state) {
		state.helpershifts = []
		state.helpershiftsIds = {}
	},

	setCategories(state, categories) {
		state.categories = categories
	},
}

const actions = {
	updateHelpershifts(context, { helpershiftIds, helpershifts }) {
		// add/update new helpershifts
		for (const helpershift of helpershifts) {
			// TODO check for parallel (local) changes!
			context.commit('updateHelpershift', helpershift)
		}
		// remove deleted helpershifts
		context.state.helpershifts.forEach(helpershift => {
			if (!helpershiftIds.includes(helpershift.id)) {
				context.commit('removeHelpershift', helpershift.id)
			}
		})
	},
}

export default { state, getters, mutations, actions }
