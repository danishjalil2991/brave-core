/* Copyright (c) 2019 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "brave/components/brave_rewards/browser/rewards_notification_service_impl.h"

#include <algorithm>
#include <limits>
#include <utility>

#include "base/json/json_reader.h"
#include "base/json/json_writer.h"
#include "base/rand_util.h"
#include "base/strings/stringprintf.h"
#include "base/time/time.h"
#include "base/values.h"
#include "bat/ledger/ledger.h"
#include "brave/components/brave_rewards/common/pref_names.h"
#include "brave/components/brave_rewards/browser/rewards_notification_service_observer.h"
#include "chrome/browser/profiles/profile.h"
#include "components/prefs/pref_service.h"
#include "extensions/buildflags/buildflags.h"

#if BUILDFLAG(ENABLE_EXTENSIONS)
#include "brave/components/brave_rewards/browser/extension_rewards_notification_service_observer.h"
#endif

namespace brave_rewards {

RewardsNotificationServiceImpl::RewardsNotificationServiceImpl(Profile* profile)
    : profile_(profile) {
#if BUILDFLAG(ENABLE_EXTENSIONS)
  extension_rewards_notification_service_observer_ =
          std::make_unique<ExtensionRewardsNotificationServiceObserver>
              (profile);
  AddObserver(extension_rewards_notification_service_observer_.get());
#endif
  ReadRewardsNotificationsJSON();
}

RewardsNotificationServiceImpl::~RewardsNotificationServiceImpl() {
  StoreRewardsNotifications();
#if BUILDFLAG(ENABLE_EXTENSIONS)
  RemoveObserver(extension_rewards_notification_service_observer_.get());
#endif
}

void RewardsNotificationServiceImpl::AddNotification(
    RewardsNotificationType type,
    RewardsNotificationArgs args,
    RewardsNotificationID id,
    bool only_once) {
  DCHECK(type != REWARDS_NOTIFICATION_INVALID);
  if (id.empty()) {
    id = GenerateRewardsNotificationID();
  } else if (only_once) {
    if (std::find(
        rewards_notifications_displayed_.begin(),
        rewards_notifications_displayed_.end(),
        id) != rewards_notifications_displayed_.end()) {
      return;
    }
  }

  RewardsNotification rewards_notification(
      id, type, GenerateRewardsNotificationTimestamp(), std::move(args));
  rewards_notifications_[id] = rewards_notification;
  StoreRewardsNotifications();
  OnNotificationAdded(rewards_notification);

  if (only_once) {
    rewards_notifications_displayed_.push_back(id);
  }
}

void RewardsNotificationServiceImpl::DeleteNotification(
    RewardsNotificationID id) {
  DCHECK(!id.empty());
  RewardsNotification rewards_notification;
  if (rewards_notifications_.find(id) == rewards_notifications_.end()) {
    rewards_notification.id_ = id;
    rewards_notification.type_ =
        RewardsNotificationType::REWARDS_NOTIFICATION_INVALID;

    // clean up, so that we don't have long standing notifications
    if (rewards_notifications_.size() == 1) {
      rewards_notifications_.clear();
    }
  } else {
    rewards_notification = rewards_notifications_[id];
    rewards_notifications_.erase(id);
  }
  StoreRewardsNotifications();

  OnNotificationDeleted(rewards_notification);
}

void RewardsNotificationServiceImpl::DeleteAllNotifications() {
  rewards_notifications_.clear();
#if defined(OS_ANDROID)
  rewards_notifications_displayed_.clear();
  StoreRewardsNotifications();
#endif
  OnAllNotificationsDeleted();
}

void RewardsNotificationServiceImpl::GetNotification(RewardsNotificationID id) {
  DCHECK(!id.empty());
  if (rewards_notifications_.find(id) == rewards_notifications_.end())
    return;
  OnGetNotification(rewards_notifications_[id]);
}

void RewardsNotificationServiceImpl::GetNotifications() {
  RewardsNotificationsList rewards_notifications_list;
  for (auto& item : rewards_notifications_) {
    rewards_notifications_list.push_back(item.second);
  }
  OnGetAllNotifications(rewards_notifications_list);
}

const RewardsNotificationService::RewardsNotificationsMap&
RewardsNotificationServiceImpl::GetAllNotifications() const {
  return rewards_notifications_;
}

RewardsNotificationServiceImpl::RewardsNotificationID
RewardsNotificationServiceImpl::GenerateRewardsNotificationID() const {
  return base::StringPrintf(
      "%d", base::RandInt(0, std::numeric_limits<int32_t>::max()));
}

RewardsNotificationServiceImpl::RewardsNotificationTimestamp
RewardsNotificationServiceImpl::GenerateRewardsNotificationTimestamp() const {
  return base::Time::NowFromSystemTime().ToTimeT();
}

void RewardsNotificationServiceImpl::ReadRewardsNotificationsJSON() {
  std::string json =
      profile_->GetPrefs()->GetString(prefs::kRewardsNotifications);
  if (json.empty())
    return;
  base::Optional<base::Value> dictionary = base::JSONReader::Read(json);

  // legacy read
  if (!dictionary || !dictionary->is_dict()) {
    base::Optional<base::Value> list = base::JSONReader::Read(json);
    if (!list || !list->is_list()) {
      LOG(ERROR) << "Failed to deserialize rewards notifications on startup";
      return;
    }

    ReadRewardsNotifications(list->GetList());
    return;
  }

  base::Value* notifications =
      dictionary->FindKeyOfType("notifications", base::Value::Type::LIST);
  if (notifications) {
    ReadRewardsNotifications(notifications->GetList());
  }

  base::Value* displayed =
      dictionary->FindKeyOfType("displayed", base::Value::Type::LIST);
  if (displayed) {
    for (const auto& it : displayed->GetList()) {
      rewards_notifications_displayed_.push_back(it.GetString());
    }
  }
}

void RewardsNotificationServiceImpl::ReadRewardsNotifications(
    base::Value::ConstListView root) {
  for (auto it = root.cbegin(); it != root.cend(); ++it) {
    if (!it->is_dict())
      continue;
    std::string notification_id;
    const std::string* notification_id_opt = it->FindStringKey("id");
    if (notification_id_opt)
      notification_id = *notification_id_opt;
    int notification_type = it->FindIntKey("type").value_or(0);
    int notification_timestamp = it->FindIntKey("timestamp").value_or(0);
    RewardsNotificationArgs notification_args;

    // The notification ID was originally an integer, but now it's a
    // string. For backwards compatibility, we need to handle the
    // case where the ID contains an invalid string or integer
    if (notification_id.empty()) {
      int old_id = it->FindIntKey("id").value_or(0);
      if (old_id == 0 && notification_type == 2)
        notification_id = "rewards_notification_grant";
      else
        notification_id = std::to_string(old_id);
    } else if (notification_id == "0" && notification_type == 2) {
      notification_id = "rewards_notification_grant";
    }

    const base::Value* args =
        it->FindKeyOfType("args", base::Value::Type::LIST);
    if (args) {
      for (auto& arg : args->GetList()) {
        std::string arg_string = arg.GetString();
        notification_args.push_back(arg_string);
      }
    }

    RewardsNotification notification(notification_id,
        static_cast<RewardsNotificationType>(notification_type),
        notification_timestamp,
        notification_args);
    rewards_notifications_[notification.id_] = notification;
  }
}

void RewardsNotificationServiceImpl::StoreRewardsNotifications() {
  base::DictionaryValue root;

  auto notifications = std::make_unique<base::ListValue>();
  for (auto& item : rewards_notifications_) {
    auto dict = std::make_unique<base::DictionaryValue>();
    dict->SetString("id", item.second.id_);
    dict->SetInteger("type", item.second.type_);
    dict->SetInteger("timestamp", item.second.timestamp_);
    auto args = std::make_unique<base::ListValue>();
    for (auto& arg : item.second.args_) {
      args->AppendString(arg);
    }
    dict->SetList("args", std::move(args));
    notifications->Append(std::move(dict));
  }

  auto displayed = std::make_unique<base::ListValue>();
  for (auto& item : rewards_notifications_displayed_) {
    displayed->AppendString(item);
  }

  root.SetList("notifications", std::move(notifications));
  root.SetList("displayed", std::move(displayed));

  std::string result;
  if (!base::JSONWriter::Write(root, &result)) {
    LOG(ERROR) << "Failed to serialize rewards notifications on shutdown";
    return;
  }

  profile_->GetPrefs()->SetString(prefs::kRewardsNotifications, result);
}

bool RewardsNotificationServiceImpl::Exists(RewardsNotificationID id) const {
  DCHECK(!id.empty());
  if (rewards_notifications_.find(id) == rewards_notifications_.end()) {
    return false;
  }

  return true;
}

void RewardsNotificationServiceImpl::TriggerOnNotificationAdded(
    const RewardsNotification& rewards_notification) {
  for (auto& observer : observers_)
    observer.OnNotificationAdded(this, rewards_notification);
}

void RewardsNotificationServiceImpl::TriggerOnNotificationDeleted(
    const RewardsNotification& rewards_notification) {
  for (auto& observer : observers_)
    observer.OnNotificationDeleted(this, rewards_notification);
}

void RewardsNotificationServiceImpl::TriggerOnAllNotificationsDeleted() {
  for (auto& observer : observers_)
    observer.OnAllNotificationsDeleted(this);
}

void RewardsNotificationServiceImpl::TriggerOnGetNotification(
    const RewardsNotification& rewards_notification) {
  for (auto& observer : observers_)
    observer.OnGetNotification(this, rewards_notification);
}

void RewardsNotificationServiceImpl::TriggerOnGetAllNotifications(
    const RewardsNotificationsList& rewards_notifications_list) {
  for (auto& observer : observers_)
    observer.OnGetAllNotifications(this, rewards_notifications_list);
}

void RewardsNotificationServiceImpl::OnNotificationAdded(
    const RewardsNotification& rewards_notification) {
  TriggerOnNotificationAdded(rewards_notification);
}

void RewardsNotificationServiceImpl::OnNotificationDeleted(
    const RewardsNotification& rewards_notification) {
  TriggerOnNotificationDeleted(rewards_notification);
}

void RewardsNotificationServiceImpl::OnAllNotificationsDeleted() {
  TriggerOnAllNotificationsDeleted();
}

void RewardsNotificationServiceImpl::OnGetNotification(
    const RewardsNotification& rewards_notification) {
  TriggerOnGetNotification(rewards_notification);
}

void RewardsNotificationServiceImpl::OnGetAllNotifications(
    const RewardsNotificationsList& rewards_notifications_list) {
  TriggerOnGetAllNotifications(rewards_notifications_list);
}

bool RewardsNotificationServiceImpl::IsAds(const uint32_t promotion_type) {
  return promotion_type == 1;  // ledger:PromotionType::ADS
}

std::string RewardsNotificationServiceImpl::GetPromotionIdPrefix(
    const uint32_t promotion_type) {
  return IsAds(promotion_type)
      ? "rewards_notification_grant_ads_"
      : "rewards_notification_grant_";
}

void RewardsNotificationServiceImpl::OnFetchPromotions(
    RewardsService* rewards_service,
    const uint32_t result,
    const std::vector<Promotion>& list) {
  if (static_cast<ledger::Result>(result) != ledger::Result::LEDGER_OK) {
    return;
  }

  for (auto & item : list) {
    if (item.status == 4) {  // ledger::PromotionStatus::FINISHED
      continue;
    }

    const std::string prefix = GetPromotionIdPrefix(item.type);
    auto notification_type = IsAds(item.type)
        ? RewardsNotificationService::REWARDS_NOTIFICATION_GRANT_ADS
        : RewardsNotificationService::REWARDS_NOTIFICATION_GRANT;

    RewardsNotificationService::RewardsNotificationArgs args;

    bool only_once = true;
  #if defined(OS_ANDROID)
    only_once = false;
  #endif

    AddNotification(
        notification_type,
        args,
        prefix + item.promotion_id,
        only_once);
  }
}

void RewardsNotificationServiceImpl::OnPromotionFinished(
    RewardsService* rewards_service,
    const uint32_t result,
    Promotion promotion) {
  std::string prefix = GetPromotionIdPrefix(promotion.type);

  DeleteNotification(prefix + promotion.promotion_id);
  // We keep it for back compatibility
  if (!IsAds(promotion.type)) {
    DeleteNotification("rewards_notification_grant");
  }
}

void RewardsNotificationServiceImpl::OnReconcileComplete(
    RewardsService* rewards_service,
    unsigned int result,
    const std::string& contribution_id,
    const double amount,
    const int32_t type) {
  auto converted_result = static_cast<ledger::Result>(result);
  auto converted_type = static_cast<ledger::RewardsType>(type);

  if (converted_type == ledger::RewardsType::ONE_TIME_TIP) {
    return;
  }

  const bool completed_auto_contribute =
      converted_result == ledger::Result::LEDGER_OK &&
      converted_type == ledger::RewardsType::AUTO_CONTRIBUTE;

  if (completed_auto_contribute ||
      converted_result == ledger::Result::NOT_ENOUGH_FUNDS ||
      converted_result == ledger::Result::LEDGER_ERROR ||
      converted_result == ledger::Result::TIP_ERROR) {
    RewardsNotificationService::RewardsNotificationArgs args;
    args.push_back(contribution_id);
    args.push_back(std::to_string(result));
    args.push_back(std::to_string(type));
    args.push_back(std::to_string(amount));

    AddNotification(
        RewardsNotificationService::REWARDS_NOTIFICATION_AUTO_CONTRIBUTE,
        args,
        "contribution_" + contribution_id);
  }
}

}  // namespace brave_rewards
