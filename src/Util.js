export const helpershiftAttributes = [
	'id',
	'etag',
	'title',
	'content',
	'modified',
	'favorite',
	'category',
]

export const copyHelpershift = (from, to, exclude) => {
	if (exclude === undefined) {
		exclude = []
	}
	helpershiftAttributes.forEach(attr => {
		if (!exclude.includes(attr)) {
			to[attr] = from[attr]
		}
	})
	return to
}

export const categoryLabel = (category) => {
	return category === '' ? t('helpershifts', 'Uncategorized') : category.replace(/\//g, ' / ')
}

export const routeIsNewHelpershift = ($route) => {
	return {}.hasOwnProperty.call($route.query, 'new')
}
