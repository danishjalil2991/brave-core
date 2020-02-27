/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import { CreditCardDetails, CreditCardErrorType, CreditCardError } from './types'
import { CardType } from './cardType'
import { ExpiryFormat } from './expiryFormat'

function isDigitString (s: string) {
  return /^\d+$/.test(s)
}

function inputWillAddCharacters (event: any) {
  const input = event.target as HTMLInputElement
  const { selectionStart, selectionEnd } = input
  const selectionLength = (selectionEnd || 0) - (selectionStart || 0)
  return event.data.length > selectionLength
}

interface InputDictionary {
  cardNumber: HTMLInputElement,
  expiry: HTMLInputElement,
  securityCode: HTMLInputElement
}

interface BehaviorsInit {
  inputs: InputDictionary,
  expiryFormat?: ExpiryFormat
  onCardTypeChange?: (cardType: CardType | null) => void
}

// Attaches dynamic behavior to credit card input elements and
// provides composition of functionality over those input elements.
// An instance of this class is designed to be created only
// once for any given set of credit card input elements. This
// class is framework-agnostic and uses only DOM interfaces.
export class Behaviors {
  inputs: InputDictionary
  cardType: CardType | null
  expiryFormat: ExpiryFormat
  onCardTypeChange?: (cardType: CardType | null) => void
  onInvalidInput?: (error: CreditCardError) => void

  constructor (init: BehaviorsInit) {
    this.inputs = init.inputs
    this.expiryFormat = init.expiryFormat || new ExpiryFormat()
    this.cardType = null
    this.onCardTypeChange = init.onCardTypeChange

    this._attachCardNumberHandlers()
    this._attachExpiryHandlers()
    this._attachSecurityCodeHandlers()
  }

  focus () {
    this.inputs.cardNumber.focus()
  }

  get details (): CreditCardDetails {
    const { cardNumber, expiry, securityCode } = this.inputs

    const [
      expiryMonth,
      expiryYear
    ] = this.expiryFormat.parse(expiry.value)

    let cardNumberValue = cardNumber.value
    if (this.cardType) {
      cardNumberValue = this.cardType.removeCardNumberFormatting(cardNumberValue)
    }

    return {
      cardNumber: cardNumberValue,
      expiryMonth,
      expiryYear,
      securityCode: securityCode.value
    }
  }

  validate (): Array<CreditCardError> {
    return [
      ...this._validateCardNumber(),
      ...this._validateExpiry(),
      ...this._validateSecurityCode()
    ]
  }

  _attachCardNumberHandlers () {
    const { cardNumber } = this.inputs

    cardNumber.addEventListener('beforeinput', (event: any) => {
      if (!event.data) {
        return
      }
      if (!isDigitString(event.data)) {
        event.preventDefault()
      } else if (this.cardType && inputWillAddCharacters(event)) {
        const digits = this.cardType.removeCardNumberFormatting(cardNumber.value)
        if (digits.length >= this.cardType.maxLength) {
          event.preventDefault()
        }
      }
    })

    const fixCaretPositionAfterDelay = () => {
      let position = cardNumber.selectionStart || 0
      requestAnimationFrame(() => {
        if (document.activeElement === cardNumber) {
          // Advance past formatting characters
          if (cardNumber.value[position - 1] === ' ') {
            position += 1
          }
          cardNumber.setSelectionRange(position, position)
        }
      })
    }

    cardNumber.addEventListener('input', () => {
      const { value } = cardNumber
      const prevType = this.cardType
      this.cardType = CardType.fromCardNumber(value)
      if (this.cardType) {
        fixCaretPositionAfterDelay()
        cardNumber.value = this.cardType.formatCardNumber(value)
        if (this.cardType.validateCardNumber(value)) {
          this.inputs.expiry.focus()
        }
      }
      if (this.cardType !== prevType && this.onCardTypeChange) {
        this.onCardTypeChange.call(undefined, this.cardType)
      }
    })

    cardNumber.addEventListener('blur', () => {
      if (cardNumber.value) {
        this._validateCardNumber()
      }
    })
  }

  _attachExpiryHandlers () {
    const { expiry } = this.inputs

    expiry.addEventListener('beforeinput', (event: any) => {
      if (!event.data) {
        return
      }
      if (!isDigitString(event.data)) {
        if (event.data !== '/' || /^\s*\d+\s*\//.test(expiry.value)) {
          event.preventDefault()
        }
      } else if (inputWillAddCharacters(event)) {
        const digits = this.expiryFormat.removeFormatting(expiry.value)
        if (digits.length >= this.expiryFormat.maxDigits) {
          event.preventDefault()
        }
      }
    })

    expiry.addEventListener('input', (event) => {
      const formatted = this.expiryFormat.format(expiry.value)
      expiry.value = formatted
      const errors = this.expiryFormat.validate(formatted)
      if (errors.length === 0) {
        this.inputs.securityCode.focus()
      }
    })

    expiry.addEventListener('blur', () => {
      if (expiry.value) {
        this._validateExpiry()
      }
    })
  }

  _attachSecurityCodeHandlers () {
    const { securityCode } = this.inputs

    securityCode.addEventListener('beforeinput', (event: any) => {
      if (!event.data) {
        return
      }
      if (!isDigitString(event.data)) {
        event.preventDefault()
      } else if (inputWillAddCharacters(event)) {
        const max = this.cardType ? this.cardType.securityCodeLength : 4
        if (securityCode.value.length >= max) {
          event.preventDefault()
        }
      }
    })

    securityCode.addEventListener('blur', () => {
      if (securityCode.value) {
        this._validateSecurityCode()
      }
    })
  }

  _validateCardNumber () {
    return this._runValidator(this.inputs.cardNumber, (value) => {
      if (!value) {
        return ['required-input']
      }
      if (this.cardType && !this.cardType.validateCardNumber(value)) {
        return ['invalid-card-number']
      }
      return []
    })
  }

  _validateExpiry () {
    return this._runValidator(this.inputs.expiry, (value) => {
      if (!value) {
        return ['required-input']
      }
      const errors = this.expiryFormat.validate(value)
      if (errors.length !== 0) {
        return ['invalid-expiry']
      }
      return []
    })
  }

  _validateSecurityCode () {
    return this._runValidator(this.inputs.securityCode, (value) => {
      if (!value || this.cardType && !this.cardType.validateSecurityCode(value)) {
        return ['invalid-security-code']
      }
      return []
    })
  }

  _runValidator (
    element: HTMLInputElement,
    fn: (value: string) => Array<CreditCardErrorType>
  ): Array<CreditCardError> {
    const errors = fn(element.value)
    const valid = errors.length === 0
    element.dataset.validationError = valid ? '' : errors[0]
    element.classList.toggle('invalid', !valid)
    return errors.map(type => ({ type, element }))
  }

}
