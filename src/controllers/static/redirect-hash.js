'use strict'

/**
 * REDIRECT HASH
 * Purpose: catch client-side routes that don't exist on the back-end.
 * Parameterizes the URL and redirects to root `/` route + hash fragment
 * consisting of the client route parameters.
 * For ex. /viewpost/bc37599dd92b8a2007161fc3
 * Is redirected to: /#/redirect=viewpost/bc37599dd92b8a2007161fc3
 * Client picks off the hash fragment and executes the route.
 */
exports = module.exports = function redirectHash (req, res) {
  // keep only keys with `truthy` values (not undefined)
  // GET >> /:client_route/:uid?
  const paramsKeys = Object.keys(req.params).filter(el => req.params[el])
  const baseHash = '#/redirect='
  const fullHash = paramsKeys.reduce((str, key, index) => {
    // only prepend with slash if the key is not the first key
    if (index !== 0) { str += '/' }
    // append the request parameter
    return str + `${req.params[key]}`
  }, baseHash)

  // send the redirect
  res.redirect(302, `/${fullHash}`)
}
