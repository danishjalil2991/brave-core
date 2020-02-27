/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import styled, { css } from 'styled-components'

import backgroundSrc from './assets/dialog_bg.svg'

export const MainPanel = styled.div<{ showBackground?: boolean }>`
  overflow: hidden;
  position: relative;
  top: 0;
  left: 0;
  max-width: 548px;
  background: ${p => p.theme.color.panelBackground};
  font-weight: normal;
  font-family: ${p => p.theme.fontFamily.heading};
  font-size: 14px;
  color: ${p => p.theme.palette.black};

  ${p => !p.showBackground ? '' : css`
    background-image: url(${backgroundSrc});
    background-repeat: no-repeat;
    background-position: bottom right;
  `}

  a {
    color: ${p => p.theme.color.brandBat};
  }
`

export const TopBar = styled.div`
  padding: 15px 22px 15px 35px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  color: ${p => p.theme.palette.grey600};
  font-weight: 500;
  font-family: ${p => p.theme.fontFamily.heading};
  font-size: 12px;
  text-transform: uppercase;
`

export const DialogTitle = styled.span`
  svg {
    position: absolute;
    top: 13px;
    left: 15px;
    height: 17px;
    width: auto;
  }
`

export const BatText = styled.span`
  color: ${p => p.theme.palette.neutral700};
`

export const CloseButton = styled.button`
  top: 22px;
  right: 22px;
  position: absolute;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  width: 14px;
  height: 14px;
  color: ${p => p.theme.palette.neutral600};
`

export const Content = styled.div`
  padding: 51px 49px 34px;

  h1 {
    margin: 0 0 18px 0;
    text-align: center;
    font-weight: 500;
    font-family: ${p => p.theme.fontFamily.heading};
    font-size: 22px;
    color: ${p => p.theme.color.grey800};
  }
`
