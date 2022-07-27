import Vue from 'vue'
import Vuex, { Store } from 'vuex'

import app from './store/app.js'
import helpershifts from './store/helpershift.js'
import sync from './store/sync.js'

Vue.use(Vuex)

export default new Store({
	modules: {
		app,
		helpershifts,
		sync,
	},
})
