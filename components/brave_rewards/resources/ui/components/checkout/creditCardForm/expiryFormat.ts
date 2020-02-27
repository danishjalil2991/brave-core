/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

export type ExpiryErrorType =
  'invalid-month' |
  'invalid-year' |
  'date-in-past'

function splitParts (value: string) {
  return value.split(/\s*\/\s*/)
}

export class ExpiryFormat {
  fullYear: boolean

  constructor (init: { fullYear?: boolean } = {}) {
    this.fullYear = init.fullYear || false
  }

  get maxDigits () {
    return this.fullYear ? 6 : 4
  }

  parse (value: string): [string, string] {
    const [month = '', year = ''] = splitParts(value)
    return [month, year]
  }

  format (value: string) {
    let [month, year = null] = splitParts(value)
    if (!month) {
      return ''
    }
    if (month.length === 1 && (/[2-9]/.test(month) || year !== null)) {
      month = `0${month}`
    }
    if (value.endsWith(' /')) {
      return month
    }
    if (year === null) {
      return month.length > 1 ? `${month} / ` : month
    }
    return `${month} / ${year}`
  }

  removeFormatting (value: string) {
    return value.replace(/\s*\/\s*/, '')
  }

  validate (value: string) {
    const currentMonth = new Date().getMonth() + 1
    let currentYear = new Date().getFullYear()
    if (!this.fullYear) {
      currentYear -= 2000
    }
    const errors: Array<ExpiryErrorType> = []
    const [month, year] = this.parse(value).map(
      (x) => parseInt(x, 10) || 0
    )
    if (month < 1 || month > 12) {
      errors.push('invalid-month')
    }
    if (year < 0) {
      errors.push('invalid-year')
    } else if (
        year < currentYear ||
        year === currentYear && month < currentMonth) {
      errors.push('date-in-past')
    }
    return errors
  }

}
