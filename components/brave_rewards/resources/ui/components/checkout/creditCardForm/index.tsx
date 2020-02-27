/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react'
import { Toggle } from 'brave-ui/components'

import { Behaviors } from './behaviors'
import { getCreditCardIcon } from './icons'
import { CreditCardDetails, CreditCardError } from './types'

import {
  Container,
  CardNumber,
  Expiration,
  SecurityCode,
  SaveThisCard,
  InputIconContainer
} from './style'

export { CreditCardDetails }

export interface CreditCardFormHandle {
  focus: () => void
  validate: () => Array<CreditCardError>
  details: CreditCardDetails
}

interface CreditCardFormProps {
  handleRef: React.MutableRefObject<CreditCardFormHandle | null>
}

export function CreditCardForm (props: CreditCardFormProps) {
  const [cardTypeId, setCardTypeId] = React.useState('')

  const [saveCardChecked, setSaveCardChecked] = React.useState(true)
  const toggleSaveCard = () => { setSaveCardChecked(!saveCardChecked) }

  const behaviorsRef = React.useRef<Behaviors | null>(null)
  const cardNumberRef = React.useRef<HTMLInputElement>(null)
  const expiryRef = React.useRef<HTMLInputElement>(null)
  const securityCodeRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    let behaviors = behaviorsRef.current
    if (!behaviors) {
      behaviorsRef.current = behaviors = new Behaviors({
        inputs: {
          cardNumber: cardNumberRef.current!,
          expiry: expiryRef.current!,
          securityCode: securityCodeRef.current!
        },
        onCardTypeChange: (cardType) => {
          setCardTypeId(cardType ? cardType.id : '')
        }
      })
    }
    props.handleRef.current = behaviors
  })

  const CardIcon = getCreditCardIcon(cardTypeId)

  return (
    <Container>
      <CardNumber>
        <label>
          Card number
          <input ref={cardNumberRef} autoComplete='cc-number' />
          <InputIconContainer><CardIcon /></InputIconContainer>
        </label>
      </CardNumber>
      <Expiration>
        <label>
          Expiration
          <input ref={expiryRef} placeholder={'MM/YY'} autoComplete='cc-exp' />
        </label>
      </Expiration>
      <SecurityCode>
        <label>
          Security code
          <input ref={securityCodeRef} autoComplete='cc-cvc' />
        </label>
      </SecurityCode>
      <SaveThisCard>
        <label>
          <div>
            Save this card
          </div>
          <div>
            <Toggle checked={saveCardChecked} onToggle={toggleSaveCard} />
          </div>
        </label>
      </SaveThisCard>
    </Container>
  )
}
