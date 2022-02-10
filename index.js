// 修改自 https://github.com/naifen00/vue-input-limit
function optFilter(opt) {
  const type = opt.type
  const decimal = opt.decimal
  const min = opt.min
  const max = opt.max
  return function(value) {
    let result = null

    switch (type) {
      case 'int':
        result = value.replace(/[^\d]/g, '')
        if (value.indexOf('-') === 0 && min < 0) {
          result = '-' + result
        }
        result = deleteErrorZero(result)
        break
      case 'float':
        result = value.replace(/[^\d.]/g, '')
        result = result.split('.')
        if (result.length === 2) {
          result[1] = result[1].slice(0, decimal | 2)
        }
        result = result.splice(0, 2).join('.')
        if (value.indexOf('-') === 0 && min < 0) {
          result = '-' + result
        }
        result = deleteErrorZero(result)
        break
      default:
        result = value
    }

    if (min !== undefined && (value ?? '')!=='' && Number(value) < min) {
      result = min
    }
    if (max !== undefined && (value ?? '')!=='' && Number(value) > max) {
      result = max
    }

    return result
  }
}
// 去除首位多余的0
function deleteErrorZero(str) {
  if (!str) return ''
  let flag = true
  let count = 0
  let ret = []
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '.') {
      flag = false
    }
    if (str[i] !== '-' && str[i] !== '0') {
      flag = false
    }

    if (str[i] === '0' && flag) {
      if (!count) {
        ret.push(str[i])
      }

      count++
    } else {
      ret.push(str[i])
    }
  }

  if (ret[0] === '-') {
    if (ret.length >= 3) {
      if (ret[1] === '0' && ret[2] !== '.') {
        ret.splice(1, 1)
      }
    }
  } else {
    if (ret.length >= 2) {
      if (ret[0] === '0' && ret[1] !== '.') {
        ret.shift()
      }
    }
  }

  return ret.join('')
}
export default {
  bind(el, binding) {
    const type = Object.prototype.toString.call(binding.value)
    const input =
      el.nodeName.toUpperCase() === 'INPUT' ? el : el.querySelector('input')
    let composing = false
    let filter

    if (type === '[object RegExp]') {
      filter = (value = '') => value.replace(new RegExp(binding.value, 'g'), '')
    } else if (type === '[object Function]') {
      filter = binding.value
    } else if (type === '[object Object]') {
      filter = optFilter(binding.value)
    } else {
      throw new Error(
        `[Vue-input-limit:] ${binding.expression} is not a function, object or regexp`
      )
    }

    input.addEventListener(
      'compositionstart',
      () => {
        composing = true
      },
      false
    )

    input.addEventListener(
      'compositionend',
      e => {
        const wish = filter(e.target.value)

        composing = false
        e.target.value = wish

        setTimeout(() => {
          e.target.value = wish
          e.target.dispatchEvent(new InputEvent('input'))
        })
      },
      false
    )

    input.addEventListener(
      'input',
      e => {
        const wish = filter(e.target.value)

        if (!composing && e.target.value !== wish) {
          e.target.value = wish

          setTimeout(() => {
            e.target.value = wish
            e.target.dispatchEvent(new InputEvent('input'))
          })
        }
      },
      false
    )
  }
}
