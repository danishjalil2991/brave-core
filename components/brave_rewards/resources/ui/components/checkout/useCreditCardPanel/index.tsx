/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react'
import { Button } from 'brave-ui/components'
import { CaratStrongRightIcon } from 'brave-ui/components/icons'

import { FormSection } from '../formSection'
import { CreditCardForm, CreditCardDetails, CreditCardFormHandle } from '../creditCardForm'
import { GoBackLink } from '../goBackLink'

import {
  ContinueBox,
  ContinueBoxLink,
  ContinueBoxText,
  ConfirmButtonRow,
  TermsOfSale
} from './style'

interface UseCreditCardPanelProps {
  hasSufficientFunds?: boolean
  rewardsEnabled?: boolean
  walletVerified?: boolean
  continueWithCard?: boolean
  setContinueWithCard: (value: boolean) => void
  onPayWithCreditCard: (cardDetails: CreditCardDetails) => void
}

export function UseCreditCardPanel (props: UseCreditCardPanelProps) {
  const onBack = () => { props.setContinueWithCard(false) }
  const onContinue = () => { props.setContinueWithCard(true) }

  const creditCardFormRef = React.useRef<CreditCardFormHandle>(null)

  const onConfirmClick = () => {
    const formHandle = creditCardFormRef.current
    if (formHandle) {
      const errors = formHandle.validate()
      if (errors.length === 0) {
        props.onPayWithCreditCard(formHandle.details)
      } else {
        errors[0].element.focus()
      }
    }
  }

  const title = props.rewardsEnabled && !props.continueWithCard
    ? 'Use credit card'
    : 'Enter credit card info'

  const showForm =
    props.continueWithCard ||
    !props.rewardsEnabled ||
    (!props.hasSufficientFunds && !props.walletVerified)

  React.useEffect(() => {
    if (showForm && creditCardFormRef.current) {
      creditCardFormRef.current.focus()
    }
  }, [showForm])

  if (showForm) {
    return (
      <div>
        <FormSection title={title}>
          <CreditCardForm handleRef={creditCardFormRef} />
        </FormSection>
        <ConfirmButtonRow showBackLink={props.continueWithCard}>
          {props.continueWithCard && <div><GoBackLink onClick={onBack} /></div>}
          <div>
            <Button
              text={'Confirm'}
              size='medium'
              onClick={onConfirmClick}
              type='accent'
              brand='rewards'
            />
          </div>
        </ConfirmButtonRow>
        <TermsOfSale>
          By clicking Confirm, you agree to <a href='javascript:void 0'>Brave’s Terms of Sale</a>.
        </TermsOfSale>
      </div>
    )
  }

  return (
    <FormSection title={title}>
      <ContinueBox>
        <ContinueBoxText>
          Make a one-time purchase using a credit card instead.
        </ContinueBoxText>
        <ContinueBoxLink>
          <a href='javascript:void 0' onClick={onContinue}>
            Continue with credit card
            <CaratStrongRightIcon />
          </a>
        </ContinueBoxLink>
      </ContinueBox>
    </FormSection>
  )
}
