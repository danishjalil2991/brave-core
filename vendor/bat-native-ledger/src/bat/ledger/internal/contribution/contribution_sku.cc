/* Copyright (c) 2020 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#include <utility>

#include "bat/ledger/internal/common/bind_util.h"
#include "bat/ledger/internal/contribution/contribution_sku.h"
#include "bat/ledger/internal/contribution/contribution_util.h"
#include "bat/ledger/internal/ledger_impl.h"
#include "bat/ledger/internal/static_values.h"
#include "bat/ledger/internal/uphold/uphold_util.h"

using std::placeholders::_1;
using std::placeholders::_2;

namespace {

const char ac_sku_dev[] = "MDAxN2xvY2F0aW9uIGJyYXZlLmNvbQowMDFhaWRlbnRpZmllciBwdWJsaWMga2V5CjAwMzJjaWQgaWQgPSA1Yzg0NmRhMS04M2NkLTRlMTUtOThkZC04ZTE0N2E1NmI2ZmEKMDAxN2NpZCBjdXJyZW5jeSA9IEJBVAowMDE1Y2lkIHByaWNlID0gMC4yNQowMDJmc2lnbmF0dXJlICRlYyTuJdmlRFuPJ5XFQXjzHFZCLTek0yQ3Yc8JUKC0Cg";  //NOLINT
const char ac_sku_staging[] = "MDAxN2xvY2F0aW9uIGJyYXZlLmNvbQowMDFhaWRlbnRpZmllciBwdWJsaWMga2V5CjAwMzJjaWQgaWQgPSA1Yzg0NmRhMS04M2NkLTRlMTUtOThkZC04ZTE0N2E1NmI2ZmEKMDAxN2NpZCBjdXJyZW5jeSA9IEJBVAowMDE1Y2lkIHByaWNlID0gMC4yNQowMDJmc2lnbmF0dXJlICRlYyTuJdmlRFuPJ5XFQXjzHFZCLTek0yQ3Yc8JUKC0Cg";  //NOLINT
const char ac_sku_production[] = "MDAxN2xvY2F0aW9uIGJyYXZlLmNvbQowMDFhaWRlbnRpZmllciBwdWJsaWMga2V5CjAwMzJjaWQgaWQgPSA1Yzg0NmRhMS04M2NkLTRlMTUtOThkZC04ZTE0N2E1NmI2ZmEKMDAxN2NpZCBjdXJyZW5jeSA9IEJBVAowMDE1Y2lkIHByaWNlID0gMC4yNQowMDJmc2lnbmF0dXJlICRlYyTuJdmlRFuPJ5XFQXjzHFZCLTek0yQ3Yc8JUKC0Cg";  //NOLINT

const char user_funds_sku_dev[] = "MDAxN2xvY2F0aW9uIGJyYXZlLmNvbQowMDFhaWRlbnRpZmllciBwdWJsaWMga2V5CjAwMzJjaWQgaWQgPSA1Yzg0NmRhMS04M2NkLTRlMTUtOThkZC04ZTE0N2E1NmI2ZmEKMDAxN2NpZCBjdXJyZW5jeSA9IEJBVAowMDE1Y2lkIHByaWNlID0gMC4yNQowMDJmc2lnbmF0dXJlICRlYyTuJdmlRFuPJ5XFQXjzHFZCLTek0yQ3Yc8JUKC0Cg";  //NOLINT
const char user_funds_sku_staging[] = "MDAxN2xvY2F0aW9uIGJyYXZlLmNvbQowMDFhaWRlbnRpZmllciBwdWJsaWMga2V5CjAwMzJjaWQgaWQgPSA1Yzg0NmRhMS04M2NkLTRlMTUtOThkZC04ZTE0N2E1NmI2ZmEKMDAxN2NpZCBjdXJyZW5jeSA9IEJBVAowMDE1Y2lkIHByaWNlID0gMC4yNQowMDJmc2lnbmF0dXJlICRlYyTuJdmlRFuPJ5XFQXjzHFZCLTek0yQ3Yc8JUKC0Cg";  //NOLINT
const char user_funds_sku_production[] = "MDAxN2xvY2F0aW9uIGJyYXZlLmNvbQowMDFhaWRlbnRpZmllciBwdWJsaWMga2V5CjAwMzJjaWQgaWQgPSA1Yzg0NmRhMS04M2NkLTRlMTUtOThkZC04ZTE0N2E1NmI2ZmEKMDAxN2NpZCBjdXJyZW5jeSA9IEJBVAowMDE1Y2lkIHByaWNlID0gMC4yNQowMDJmc2lnbmF0dXJlICRlYyTuJdmlRFuPJ5XFQXjzHFZCLTek0yQ3Yc8JUKC0Cg";  //NOLINT

std::string GetACSKU() {
  if (ledger::_environment == ledger::Environment::PRODUCTION) {
    return ac_sku_production;
  }

  if (ledger::_environment == ledger::Environment::STAGING) {
    return ac_sku_staging;
  }

  if (ledger::_environment == ledger::Environment::DEVELOPMENT) {
    return ac_sku_dev;
  }

  NOTREACHED();
  return ac_sku_dev;
}

std::string GetUserFundsSKU() {
  if (ledger::_environment == ledger::Environment::PRODUCTION) {
    return user_funds_sku_production;
  }

  if (ledger::_environment == ledger::Environment::STAGING) {
    return user_funds_sku_staging;
  }

  if (ledger::_environment == ledger::Environment::DEVELOPMENT) {
    return user_funds_sku_dev;
  }

  NOTREACHED();
  return user_funds_sku_dev;
}

}  // namespace

namespace braveledger_contribution {

ContributionSKU::ContributionSKU(bat_ledger::LedgerImpl* ledger):
    ledger_(ledger) {
  DCHECK(ledger_);
  credentials_ = braveledger_credentials::CredentialsFactory::Create(
      ledger_,
      ledger::CredsBatchType::SKU);
  DCHECK(credentials_);
}

ContributionSKU::~ContributionSKU() = default;

void ContributionSKU::AutoContribution(
    const double amount,
    ledger::ExternalWalletPtr wallet,
    ledger::ResultCallback callback) {
  if (amount == 0) {
    callback(ledger::Result::LEDGER_ERROR);
    BLOG(ledger_, ledger::LogLevel::LOG_ERROR)
        << "AutoContribution failed as amount is 0";
    return;
  }

  ledger::SKUOrderItem item;
  item.sku = GetACSKU();
  item.quantity = GetVotesFromAmount(amount);
  item.price = braveledger_ledger::_vote_price;

  std::vector<ledger::SKUOrderItem> items;
  items.push_back(item);

  Start(items, braveledger_uphold::GetACAddress(), std::move(wallet), callback);
}

void ContributionSKU::AnonUserFunds(
    const double amount,
    ledger::ExternalWalletPtr wallet,
    ledger::ResultCallback callback) {
  if (amount == 0) {
    callback(ledger::Result::LEDGER_ERROR);
    BLOG(ledger_, ledger::LogLevel::LOG_ERROR)
        << "Anon user funds failed as amount is 0";
    return;
  }

  ledger::SKUOrderItem item;
  item.sku = GetUserFundsSKU();
  item.quantity = GetVotesFromAmount(amount);
  item.price = braveledger_ledger::_vote_price;

  std::vector<ledger::SKUOrderItem> items;
  items.push_back(item);

  Start(items, braveledger_uphold::GetACAddress(), std::move(wallet), callback);
}

void ContributionSKU::Start(
    const std::vector<ledger::SKUOrderItem>& items,
    const std::string& destination,
    ledger::ExternalWalletPtr wallet,
    ledger::ResultCallback callback) {
  auto process_callback = std::bind(&ContributionSKU::GetOrder,
      this,
      _1,
      _2,
      callback);

  ledger_->ProcessSKU(
      destination,
      items,
      std::move(wallet),
      process_callback);
}

void ContributionSKU::GetOrder(
    const ledger::Result result,
    const std::string& order_id,
    ledger::ResultCallback callback) {
  if (result != ledger::Result::LEDGER_OK) {
    BLOG(ledger_, ledger::LogLevel::LOG_ERROR) << "SKU was not processed";
    callback(result);
    return;
  }

  auto get_callback = std::bind(&ContributionSKU::OnGetOrder,
      this,
      _1,
      callback);
  ledger_->GetSKUOrder(order_id, get_callback);
}

void ContributionSKU::OnGetOrder(
    ledger::SKUOrderPtr order,
    ledger::ResultCallback callback) {
  if (!order || order->items.empty()) {
    BLOG(ledger_, ledger::LogLevel::LOG_ERROR) << "Order was not found";
    callback(ledger::Result::LEDGER_ERROR);
    return;
  }

  DCHECK_EQ(order->items.size(), 1ul);

  std::vector<std::string> data;
  data.push_back(order->items[0]->order_item_id);
  data.push_back(std::to_string(static_cast<int>(order->items[1]->type)));

  braveledger_credentials::CredentialsTrigger trigger;
  trigger.id = order->order_id;
  trigger.size = order->items[0]->quantity;
  trigger.type = ledger::CredsBatchType::SKU;
  trigger.data = data;

  credentials_->Start(trigger, callback);
}

}  // namespace braveledger_contribution
