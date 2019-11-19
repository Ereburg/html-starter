const polyfills = {
  collection: [
    function endEvents() {
      window.endEvents = {
        transition: {
          'transition': 'transitionend',
          'WebkitTransition': 'webkitTransitionEnd',
          'MozTransition': 'mozTransitionEnd',
          'OTransition': 'oTransitionEnd',
          'msTransition': 'MSTransitionEnd',
        },

        animation: {
          'animation': 'animationend',
          'WebkitAnimation': 'webkitAnimationEnd',
          'MozAnimation': 'mozAnimationEnd',
          'OAnimation': 'oAnimationEnd',
          'msAnimation': 'MSAnimationEnd',
        },
      }

      const elem = document.createElement('div')

      for (let endKey in window.endEvents) {
        const endType = window.endEvents[endKey]

        for (let event in endType) {
          if (event in elem.style) {
            window.endEvents[endKey] = endType[event]
            break
          }
        }
      }
    },

    function passiveEvent() {
      window.passiveIfSupported = null

      try {
        window.addEventListener('test', null, Object.defineProperty({}, 'passive', {
          get: function() {
            window.passiveIfSupported = { passive: true }
          },
        }))
      } catch (err) {
        window.passiveIfSupported = false
      }
    },

    function customEvent() {
      if (typeof window.CustomEvent !== 'function') {
        const CustomEvent = (event, params) => {
          const evt = document.createEvent('CustomEvent')

          params = params || { bubbles: false, cancelable: false, detail: undefined }
          evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail)

          return evt
        }

        CustomEvent.prototype = window.Event.prototype
        window.CustomEvent = CustomEvent
      }
    },

    function raf() {
      window.raf =
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.msRequestAnimationFrame
    },

    function raf2x() {
      window.raf2x = callback => {
        raf(() => raf(callback))
      }
    },

    function matches() {
      if (!Element.prototype.matches) {
        Element.prototype.matches = Element.prototype.webkitMatchesSelector ||
          Element.prototype.msMatchesSelector
      }
    },

    function closest() {
      if (!Element.prototype.closest) {
        Element.prototype.closest = function(selector) {
          for (let i = this; i !== document.documentElement; i = i.parentNode) {
            if (i.matches(`${selector}`)) return i
          }

          return null
        }
      }
    },
  ],

  init() {
    this.collection.forEach(item => item())
  },
}

polyfills.init()