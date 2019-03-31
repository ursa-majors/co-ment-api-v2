/**
 * Higher order function to standardize request / controller handling.
 * Allows controllers to be written as pure functions.
 * Inspiration:
 * https://medium.com/@zurfyx/building-a-scalable-node-js-express-app-1be1a7134cfd
 * Example use:
 *   router.get('/:id', ctrlHandler(getProfile, (req) => ({ id: req.params.id })))
 * @param   {Function}  controller   Should return a promise
 * @param   {Function}  getReqProps  Optional function to pick req properties
 */
exports = module.exports = (controller, getReqProps) => async (req, res, next) => {
  const reqProps = getReqProps ? getReqProps(req) : {}
  try {
    const result = await controller({ ...reqProps })
    return res.status(200).json(result)
  } catch (err) {
    return next(err)
  }
}
