# n8n-nodes-linkbreakers

The official [Linkbreakers](https://linkbreakers.com) node for [n8n](https://n8n.io).

Linkbreakers turns every link and QR code into a tracked visit that runs through a workflow: pages, forms, redirects and smart conditions on device, place, time or who the visitor is. This package lets an n8n workflow start when someone scans or clicks, and act on links and visitors.

[Installation](#installation) · [Credentials](#credentials) · [Nodes](#nodes) · [Compatibility](#compatibility) · [Resources](#resources)

## Installation

In n8n, open **Settings → Community Nodes**, choose **Install**, and enter `n8n-nodes-linkbreakers`. See the n8n [community nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/).

## Credentials

1. In Linkbreakers, open **Developers → API Tokens** and create a token.
2. In n8n, create a **Linkbreakers API** credential and paste the token.

The credential is checked against your workspace when you save it.

## Nodes

### Linkbreakers Trigger

Starts the workflow on each visit: a QR code scan or a link click, as it moves through the link's workflow.

- Each item is one delivery: its `type` (`visit.entered`, `visit.interacted`, `visit.routed`, `visit.exited`), the link, the workflow step, the device, the visitor and the `lbid` (the visit ID).
- Which links, which moments and how much visitor data are sent is set on the **n8n** page of your Linkbreakers integrations, for all your n8n workflows at once.
- Optionally, set **Link ID** to receive the visits of one link only.

The trigger subscribes a webhook in Linkbreakers when the workflow is activated, and removes it when the workflow is deactivated.

### Linkbreakers

| Resource | Operations |
|---|---|
| Link | Create (with its QR code), Get, Get Many, Delete |
| Visitor | Identify: add an email, a name, a phone, a company or any attribute to the visitor of a visit, by its `lbid` |

Example: a Linkbreakers Trigger, then a CRM lookup, then **Visitor → Identify** to write the company back on the visitor who scanned.

## Compatibility

Built and tested with n8n 2.x and `n8n-workflow` 2.16. No runtime dependencies.

## Resources

- [Linkbreakers help center](https://linkbreakers.com/help)
- [Linkbreakers API](https://linkbreakers.com/help/api)
- [n8n community nodes](https://docs.n8n.io/integrations/#community-nodes)

## License

[MIT](LICENSE.md)
