import { Feature } from '../feature'

/**
 * @class ProfilerFeature
 * @classdesc provides basic profiling capabilities for named events.
 * @example
 *
 *  runtime.feature('profiler').enable()
 *
 *
 *  runtime.profiler
 *
 *  profiler.start('something')
 *
 *  somethingTakesAMinute().then(() => {
 *    profiler.end('something')
 *  })
 */
export default class ProfilerFeature extends Feature {
  static shortcut = 'profiler'

  shortcut = 'profiler'

  /**
   * @typedef {Object} TimingReport
   * @property {Number} start
   * @property {Number} stop
   * @property {Number} duration
   */

  /**
   * @typedef {Object<String, TimingReport>} TimingsReport
   */

  /**
   * @type {TimingsReport}
   */
  get report() {
    const timings = this.runtime.convertToJS(this.timings.toJSON())

    return this.chain
      .plant(timings)
      .pickBy(v => v.start && v.end)
      .mapValues(({ start, end }) => ({
        start,
        end,
        duration: end - start,
      }))
      .value()
  }

  observables() {
    /**
     * @property {Map} timings
     * @memberof ProfilerFeature
     */
    return {
      timings: ['shallowMap', []],
    }
  }

  /**
   * @param {String} eventName the name of the event you're finished timing
   * @memberof ProfilerFeature
   */
  end(eventName) {
    return this.profileEnd(eventName)
  }

  profileEnd(eventName) {
    try {
      const stamp = +new Date()

      this.timings.set(eventName, {
        ...(this.timings.get(eventName) || {}),
        end: stamp,
      })
    } catch (error) {}
  }

  /**
   * @param {String} eventName the name of the event you're starting to time
   * @memberof ProfilerFeature
   */
  start(eventName) {
    this.profileStart(eventName)
  }

  profileStart(eventName) {
    const stamp = +new Date()
    try {
      this.timings.set(eventName, {
        start: stamp,
      })
    } catch (error) {}

    return stamp
  }
}
