/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react'
import { Button } from 'brave-ui/components'
import { BatColorIcon } from 'brave-ui/components/icons'

import { FormSection } from '../formSection'
import { CreditCardForm, CreditCardFormHandle, CreditCardDetails } from '../creditCardForm'
import { GoBackLink } from '../goBackLink'

import {
  Subtitle,
  CurrentBalance,
  CurrentBalanceNeeded,
  CurrentBalanceBat,
  CurrentBalanceConverted,
  ExchangeRateDisplay,
  AmountOptionList,
  AmountOptionContainer,
  AmountOptionExchange,
  ChargeSummary,
  ChargeSummaryTotal,
  ChargeSummaryTotalAmount,
  PurchaseButtonRow,
  TermsOfSale
} from './style'

interface AddFundsAmountOption {
  amount: number
  amountConverted: string
  transactionFeeRate: string
  transactionFee: string
  totalCharge: string
}

interface AmountOpionPanelProps {
  amountOptions: AddFundsAmountOption[]
  selectedAmount: number
  setSelectedAmount: (amount: number) => void
}

function AmountOptionPanel (props: AmountOpionPanelProps) {
  if (props.amountOptions.length === 0) {
    return null
  }
  let selectedOption = props.amountOptions[0]
  for (const option of props.amountOptions) {
    if (option.amount === props.selectedAmount) {
      selectedOption = option
      break
    }
  }
  return (
    <>
        <AmountOptionList>
        {
          props.amountOptions.map(option => {
            const selectAmount = () => { props.setSelectedAmount(option.amount) }
            return (
              <AmountOptionContainer key={option.amount} selected={option === selectedOption}>
                <Button
                  text={`${option.amount} BAT`}
                  size={'medium'}
                  onClick={selectAmount}
                />
                <AmountOptionExchange>
                  {option.amountConverted}
                </AmountOptionExchange>
              </AmountOptionContainer>
            )
          })
        }
      </AmountOptionList>
      <ChargeSummary>
        <div>Transaction Fee ({selectedOption.transactionFeeRate})</div>
        <div>{selectedOption.transactionFee}</div>
        <ChargeSummaryTotal>Order Total</ChargeSummaryTotal>
        <ChargeSummaryTotalAmount>{selectedOption.totalCharge}</ChargeSummaryTotalAmount>
      </ChargeSummary>
    </>
  )
}

interface AddFundsPanelProps {
  amountNeeded: string
  walletBalance: string
  walletBalanceConverted: string
  unitValueConverted: string
  amountOptions: AddFundsAmountOption[]
  onCancel: () => void
  onPayWithCreditCard: (cardDetails: CreditCardDetails) => void
}

export function AddFundsPanel (props: AddFundsPanelProps) {
  const [selectedAmount, setSelectedAmount] = React.useState<number>(0)
  const creditCardFormRef = React.useRef<CreditCardFormHandle>(null)

  const onPurchaseClick = () => {
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

  return (
    <>
      <h1>Add Funds</h1>
      <Subtitle>
        Add BAT to your wallet using your credit card
      </Subtitle>
      <CurrentBalance>
        <div>
          Current balance
          <CurrentBalanceBat>{props.walletBalance} BAT</CurrentBalanceBat>
          <CurrentBalanceConverted>{props.walletBalanceConverted}</CurrentBalanceConverted>
        </div>
        <CurrentBalanceNeeded>
          {props.amountNeeded} BAT needed
        </CurrentBalanceNeeded>
      </CurrentBalance>
      <FormSection
        title={
          <>
            <div>1. Select amount to add</div>
            <div>
              <ExchangeRateDisplay>
                <BatColorIcon /> 1 BAT = {props.unitValueConverted}
              </ExchangeRateDisplay>
            </div>
          </>
        }
      >
        <AmountOptionPanel
          amountOptions={props.amountOptions}
          selectedAmount={selectedAmount}
          setSelectedAmount={setSelectedAmount}
        />
      </FormSection>
      <FormSection title={'2. Enter credit card info'}>
        <CreditCardForm handleRef={creditCardFormRef} />
      </FormSection>
      <PurchaseButtonRow>
        <div>
          <GoBackLink onClick={props.onCancel} />
        </div>
        <div>
          <Button
            text={'Add Funds & Purchase'}
            size='medium'
            onClick={onPurchaseClick}
            type='accent'
            brand='rewards'
          />
        </div>
      </PurchaseButtonRow>
      <TermsOfSale>
        By clicking Add Funds &amp; Purchase, you agree to <a href='javascript:void 0'>Brave’s Terms of Sale</a>.
      </TermsOfSale>
    </>
  )
}
