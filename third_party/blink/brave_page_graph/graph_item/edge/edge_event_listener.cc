/* Copyright (c) 2019 The Brave Software Team. Distributed under the MPL2
 * license. This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "brave/third_party/blink/brave_page_graph/graph_item/edge/edge_event_listener.h"
#include <ostream>
#include <sstream>
#include <string>
#include "brave/third_party/blink/brave_page_graph/graphml.h"
#include "brave/third_party/blink/brave_page_graph/graph_item/edge/edge.h"
#include "brave/third_party/blink/brave_page_graph/graph_item/node/node_actor.h"
#include "brave/third_party/blink/brave_page_graph/graph_item/node/node_html_element.h"
#include "brave/third_party/blink/brave_page_graph/page_graph.h"
#include "brave/third_party/blink/brave_page_graph/types.h"

using ::std::string;
using ::std::stringstream;
using ::std::to_string;

namespace brave_page_graph {

EdgeEventListener::EdgeEventListener(const NodeHTMLElement* const out_node,
    NodeActor* const in_node, const std::string& event_type,
    const EventListenerId listener_id) :
      Edge(const_cast<NodeHTMLElement*>(out_node), in_node),
      event_type_(event_type),
      listener_id_(listener_id) {}

EdgeEventListener::EdgeEventListener(PageGraph* const graph,
    NodeHTMLElement* const out_node, NodeActor* const in_node,
    const std::string& event_type, const EventListenerId listener_id) :
      Edge(graph, out_node, in_node),
      event_type_(event_type),
      listener_id_(listener_id) {}

EdgeEventListener::~EdgeEventListener() {}

ItemName EdgeEventListener::GetItemName() const {
  return "EdgeEventListener#" + to_string(id_);
}

GraphMLXMLList EdgeEventListener::GraphMLAttributes() const {
  GraphMLXMLList attrs;

  attrs.push_back(GraphMLAttrDefForType(kGraphMLAttrDefEdgeType)
      ->ToValue("event listener"));

  attrs.push_back(GraphMLAttrDefForType(kGraphMLAttrDefKey)
      ->ToValue(event_type_));

  attrs.push_back(GraphMLAttrDefForType(kGraphMLAttrDefEventListenerId)
      ->ToValue(listener_id_));

  return attrs;
}

}  // namespace brave_page_graph
