# Changelog

## 0.1.2

- Linkbreakers Trigger: on activation, only a 404 counts as "webhook gone". Any other error (authentication, server, network) now fails the activation, so a second webhook is never created next to the first.
- Linkbreakers Trigger: the notice on the form is gone; the Link ID description and the README explain the integration settings instead.
- Link → Get Many: Return All, paging through every link; Limit shows only when Return All is off.

## 0.1.1

- Published from GitHub Actions with npm provenance.
- Identify: Company and Title are saved as visitor attributes.

## 0.1.0

- Linkbreakers Trigger: starts a workflow on each visit (QR code scan or link click), optionally for one link.
- Linkbreakers: create, get, list and delete links; identify the visitor of a visit by its lbid.
