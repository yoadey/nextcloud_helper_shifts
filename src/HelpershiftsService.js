import axios from '@nextcloud/axios'
import { generateUrl } from '@nextcloud/router'
import { showError } from '@nextcloud/dialogs'

import store from './store.js'
import { copyHelpershift } from './Util.js'

function url(url) {
	url = `apps/helpershifts${url}`
	return generateUrl(url)
}

function handleSyncError(message, err = null) {
	if (err?.response) {
		const statusCode = err.response?.status
		switch (statusCode) {
		case 404:
			showError(message + ' ' + t('helpershifts', 'Helpershift not found.'))
			break
		case 423:
			showError(message + ' ' + t('helpershifts', 'Helpershift is locked.'))
			break
		case 507:
			showError(message + ' ' + t('helpershifts', 'Insufficient storage.'))
			break
		default:
			showError(message + ' HTTP ' + statusCode + ' (' + err.response.data?.errorType + ')')
		}
	} else {
		showError(message + ' ' + t('helpershifts', 'See JavaScript console and server log for details.'))
	}
}

export const setSettings = settings => {
	return axios
		.put(url('/settings'), settings)
		.then(response => {
			const settings = response.data
			store.commit('setSettings', settings)
			return settings
		})
		.catch(err => {
			console.error(err)
			handleSyncError(t('helpershifts', 'Updating settings has failed.'), err)
			throw err
		})
}

export const getDashboardData = () => {
	return axios
		.get(url('/helpershifts/dashboard'))
		.then(response => {
			return response.data
		})
		.catch(err => {
			console.error(err)
			handleSyncError(t('helpershifts', 'Fetching helpershifts for dashboard has failed.'), err)
			throw err
		})
}

export const fetchHelpershifts = () => {
	const headers = {}
	return axios
		.get(
			url('/helpershifts'),
			{ headers }
		)
		.then(response => {
			store.commit('helpershifts', response.data.helpershifts)
			// store.commit('setSettings', response.data.settings)
			// if (response.data.categries !== null) {
			// 	store.commit('setCategories', response.data.categories)
			// }
			// if (response.data.helpershiftIds !== null) {
			// 	store.dispatch('updateHelpershifts', { helpershiftIds: response.data.helpershiftIds, helpershifts: response.data.helpershiftsData })
			// }
			// if (response.data.errorMessage) {
			// 	showError(t('helpershifts', 'Error from Nextcloud server: {msg}', { msg: response.data.errorMessage }))
			// } else {
			// 	store.commit('setSyncETag', response.headers.etag)
			// 	store.commit('setSyncLastModified', response.headers['last-modified'])
			// }
			return response.data
		})
		.catch(err => {
			console.error(err)
			handleSyncError(t('helpershifts', 'Fetching helpershifts has failed.'), err)
			throw err
		})
}

export const fetchHelpershift = helpershiftId => {
	return axios
		.get(url('/helpershifts/' + helpershiftId))
		.then(response => {
			const localHelpershift = store.getters.getHelpershift(parseInt(helpershiftId))
			// only overwrite if there are no unsaved changes
			if (!localHelpershift || !localHelpershift.unsaved) {
				_updateLocalHelpershift(response.data)
			}
			return response.data
		})
		.catch(err => {
			if (err?.response?.status === 404) {
				throw err
			} else {
				console.error(err)
				const msg = t('helpershifts', 'Fetching helpershift {id} has failed.', { id: helpershiftId })
				store.commit('setHelpershiftAttribute', { helpershiftId, attribute: 'error', value: true })
				store.commit('setHelpershiftAttribute', { helpershiftId, attribute: 'errorType', value: msg })
				return store.getter.getHelpershift(helpershiftId)
			}
		})
}

export const refreshHelpershift = (helpershiftId) => {
	const headers = {}
	const helpershift = store.getters.getHelpershift(helpershiftId)
	const oldContent = helpershift.content
	return axios
		.get(
			url('/helpershifts/' + helpershiftId),
			{ headers }
		)
		.then(response => {
			if (helpershift.conflict) {
				store.commit('setHelpershiftAttribute', { helpershiftId, attribute: 'conflict', value: response.data })
				return response.headers.etag
			}
			const currentContent = store.getters.getHelpershift(helpershiftId).content
			// only update if local content has not changed
			if (oldContent === currentContent) {
				_updateLocalHelpershift(response.data)
				return response.headers.etag
			}
			return null
		})
		.catch(err => {
			if (err?.response?.status === 304 || helpershift.deleting) {
				// ignore error if helpershift is deleting or not changed
				return null
			} else if (err?.code === 'ECONNABORTED') {
				// ignore cancelled request
				console.debug('Refresh Helpershift request was cancelled.')
				return null
			} else {
				console.error(err)
				handleSyncError(t('helpershifts', 'Refreshing helpershift {id} has failed.', { id: helpershiftId }), err)
			}
			return null
		})
}

export const createHelpershift = category => {
	return axios
		.post(url('/helpershifts'), { category })
		.then(response => {
			_updateLocalHelpershift(response.data)
			return response.data
		})
		.catch(err => {
			console.error(err)
			handleSyncError(t('helpershifts', 'Creating new helpershift has failed.'), err)
			throw err
		})
}

function _updateLocalHelpershift(helpershift, reference) {
	if (reference === undefined) {
		reference = copyHelpershift(helpershift, {})
	}
	store.commit('updateHelpershift', helpershift)
	store.commit('setHelpershiftAttribute', { helpershiftId: helpershift.id, attribute: 'reference', value: reference })
}

function _updateHelpershift(helpershift) {
	const requestOptions = { headers: { 'If-Match': '"' + helpershift.etag + '"' } }
	return axios
		.put(url('/helpershifts/' + helpershift.id), { content: helpershift.content }, requestOptions)
		.then(response => {
			helpershift.saveError = false
			store.commit('setHelpershiftAttribute', { helpershiftId: helpershift.id, attribute: 'conflict', value: undefined })
			const updated = response.data
			if (updated.content === helpershift.content) {
				// everything is fine
				// => update helpershift with remote data
				_updateLocalHelpershift(
					{ ...updated, unsaved: false }
				)
			} else {
				// content has changed locally in the meanwhile
				// => merge helpershift, but exclude content
				_updateLocalHelpershift(
					copyHelpershift(updated, helpershift, ['content']),
					copyHelpershift(updated, {})
				)
			}
		})
		.catch(err => {
			if (err?.response?.status === 412) {
				// ETag does not match, try to merge changes
				helpershift.saveError = false
				store.commit('setHelpershiftAttribute', { helpershiftId: helpershift.id, attribute: 'conflict', value: undefined })
				const reference = helpershift.reference
				const remote = err.response.data
				if (remote.content === helpershift.content) {
					// content is already up-to-date
					// => update helpershift with remote data
					_updateLocalHelpershift(
						{ ...remote, unsaved: false }
					)
				} else if (remote.content === reference.content) {
					// remote content has not changed
					// => use all other attributes and sync again
					_updateLocalHelpershift(
						copyHelpershift(remote, helpershift, ['content']),
						copyHelpershift(remote, {})
					)
					queueCommand(helpershift.id, 'content')
				} else {
					console.info('Helpershift update conflict. Manual resolution required.')
					store.commit('setHelpershiftAttribute', { helpershiftId: helpershift.id, attribute: 'conflict', value: remote })
				}
			} else {
				store.commit('setHelpershiftAttribute', { helpershiftId: helpershift.id, attribute: 'saveError', value: true })
				console.error(err)
				handleSyncError(t('helpershifts', 'Saving helpershift {id} has failed.', { id: helpershift.id }), err)
			}
		})
}

export const autotitleHelpershift = helpershiftId => {
	return axios
		.put(url('/helpershifts/' + helpershiftId + '/autotitle'))
		.then((response) => {
			store.commit('setHelpershiftAttribute', { helpershiftId, attribute: 'title', value: response.data })
		})
		.catch(err => {
			console.error(err)
			handleSyncError(t('helpershifts', 'Updating title for helpershift {id} has failed.', { id: helpershiftId }), err)
		})
}

export const undoDeleteHelpershift = (helpershift) => {
	return axios
		.post(url('/helpershifts/undo'), helpershift)
		.then(response => {
			_updateLocalHelpershift(response.data)
			return response.data
		})
		.catch(err => {
			console.error(err)
			handleSyncError(t('helpershifts', 'Undo delete has failed for helpershift {title}.', { title: helpershift.title }), err)
			throw err
		})
}

export const deleteHelpershift = async (helpershiftId, onHelpershiftDeleted) => {
	store.commit('setHelpershiftAttribute', { helpershiftId, attribute: 'deleting', value: 'deleting' })
	try {
		await axios.delete(url('/helpershifts/' + helpershiftId))
	} catch (err) {
		console.error(err)
		handleSyncError(t('helpershifts', 'Deleting helpershift {id} has failed.', { id: helpershiftId }), err)
	}
	// remove helpershift always since we don't know when exactly the error happened
	// (helpershift could be deleted on server even if an error was thrown)
	onHelpershiftDeleted()
	store.commit('removeHelpershift', helpershiftId)
}

export const queueCommand = (helpershiftId, type) => {
	store.commit('addToQueue', { helpershiftId, type })
	_processQueue()
}

function _processQueue() {
	const queue = Object.values(store.state.sync.queue)
	if (store.state.app.isSaving || queue.length === 0) {
		return
	}
	store.commit('setSaving', true)
	store.commit('clearQueue')

	async function _executeQueueCommands() {
		for (const cmd of queue) {
			try {
				switch (cmd.type) {
				case 'content':
					await _updateHelpershift(store.state.helpershifts.helpershiftsIds[cmd.helpershiftId])
					break
				case 'autotitle':
					await autotitleHelpershift(cmd.helpershiftId)
					break
				default:
					console.error('Unknown queue command: ' + cmd.type)
				}

			} catch (e) {
				console.error('Command has failed with error:')
				console.error(e)
			}
		}
		store.commit('setSaving', false)
		store.commit('setManualSave', false)
		_processQueue()
	}
	_executeQueueCommands()
}

export const saveHelpershiftManually = (helpershiftId) => {
	store.commit('setHelpershiftAttribute', { helpershiftId, attribute: 'saveError', value: false })
	store.commit('setManualSave', true)
	queueCommand(helpershiftId, 'content')
}

export const helpershiftExists = (helpershiftId) => {
	return store.getters.helpershiftExists(helpershiftId)
}

