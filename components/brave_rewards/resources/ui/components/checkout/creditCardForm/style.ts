/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import styled from 'styled-components'

export const Container = styled.div`
  max-width: 270px;
  margin: 32px auto 10px;
  display: grid;
  grid-template-columns: 1fr 1fr;

  input {
    margin-top: 6px;
    border: 1px solid ${p => p.theme.palette.grey300};
    border-radius: 3px;
    padding: 8px 10px;
    outline: unset;
    font-size: 14px;
    font-family: ${p => p.theme.fontFamily.body};
    width: 100%;

    &:focus {
      border-color: ${p => p.theme.palette.blurple300};
    }

    &.invalid {
      border-color: ${p => p.theme.color.warn};
    }
  }
`

export const InputIconContainer = styled.div`
  position: relative;
  top: 0;
  left: 0;
  height: 0;

  svg {
    position: absolute;
    top: -28px;
    left: 7px;
    width: 22px;
    color: ${p => p.theme.palette.grey400};
    opacity: .668;
  }
`

export const CardNumber = styled.div`
  grid-column: 1 / 3;
  margin-bottom: 18px;

  input {
    padding-left: 36px;
  }
`

export const Expiration = styled.div`
  margin-bottom: 20px;
`

export const SecurityCode = styled.div`
  margin-bottom: 20px;
  margin-left: 20px;
`

export const SaveThisCard = styled.div`
  grid-column: 1 / 3;
  margin-top: -6px;

  > label {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
`
