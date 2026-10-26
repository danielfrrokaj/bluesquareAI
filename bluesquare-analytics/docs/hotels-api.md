# LuxHotel Hotels API

Read-only access to the properties registered on LuxHotel System: when each one registered, its rooms, its
connected booking channels, its subscription and the modules it uses. The same key also reads the conversations
hotel staff have with the AI support assistant, the contact requests sent from the LuxHotel website, and the
technical issues hotels report from inside the system, and the subscription invoices and payments of every
property. It can also issue subscription invoices and POK payment links, priced exactly as in the LuxHotel admin
panel.

- **Base URL:** `https://us-central1-pms-channex-2030.cloudfunctions.net/hotelsApi`
- **Format:** JSON, UTF-8. All dates are ISO 8601 in UTC (for example `2026-04-18T13:27:33.277Z`).
- **Methods:** `GET` for reading. `POST` only for issuing invoices and payment links (see
  [Subscription invoices and payments](#subscription-invoices-and-payments)); send a JSON body with
  `Content-Type: application/json`.

## Authentication

Every request needs the API key you were given, sent in one of these headers:

```
Authorization: Bearer <your-api-key>
```

or

```
x-api-key: <your-api-key>
```

A missing or wrong key returns `401 Unauthorized`. Keep the key on your server: never put it in a web page,
a mobile app or a public repository. If it leaks, ask us to revoke it and issue a new one.

## Endpoints

### List all hotels

```
GET /hotels
```

```bash
curl -H "Authorization: Bearer $LUXHOTEL_API_KEY" \
  https://us-central1-pms-channex-2030.cloudfunctions.net/hotelsApi/hotels
```

Response:

```json
{
  "count": 22,
  "generated_at": "2026-10-13T16:46:18.216Z",
  "hotels": [ { ...hotel summary... } ]
}
```

Hotels are sorted by registration date, oldest first. All hotels are returned in one response (no pagination).

### Get one hotel

```
GET /hotels/{id}
```

```bash
curl -H "Authorization: Bearer $LUXHOTEL_API_KEY" \
  https://us-central1-pms-channex-2030.cloudfunctions.net/hotelsApi/hotels/ede5d55b-3b0b-45e4-aac1-e3a9cb5dc85f
```

Returns the hotel summary plus `room_types`, `rate_plans_count` and `onboarding` (see below).
An unknown id returns `404 Not Found`.

## Hotel summary fields

| Field | Type | Meaning |
|---|---|---|
| `id` | string | Hotel ID. Use it with `GET /hotels/{id}`. |
| `name` | string | Property name. |
| `vendor_id` | string | The account (business) the property belongs to. One account can own several properties. |
| `registered_at` | string | When the property was registered on LuxHotel. |
| `location.address`, `location.city`, `location.country` | string / null | Property address, as entered by the hotel. |
| `owner.name`, `owner.email` | string / null | The account owner. `owner` is `null` if no owner user is found. |
| `staff_count` | number | Number of user accounts (owner + staff) on the property's account. |
| `channel_manager_connected` | boolean | Whether the property is connected to the channel manager. |
| `rooms.physical` | number | Number of physical rooms set up. |
| `rooms.room_types` | number | Number of room types set up. |
| `bookings_count` | number | Total reservations stored for the property (all statuses, all time). |
| `channels` | array | Connected booking channels: `{ "ota": "BookingCom", "title": "…", "active": true }`. |
| `subscription.status` | string | `active`, `trial`, `expired` or `none`. |
| `subscription.plan` | string / null | `with_channel_manager` or `without_channel_manager`. |
| `subscription.expires_at` | string / null | When the current paid period ends. |
| `subscription.suspended` | boolean | `true` if the service is suspended for non-payment. |
| `modules.messages`, `modules.housekeeping`, `modules.online_checkin` | boolean | Optional modules the property has turned on. |

## Extra fields on `GET /hotels/{id}`

| Field | Type | Meaning |
|---|---|---|
| `room_types` | array | `{ "id", "name", "rooms", "max_adults", "max_children" }` for each room type. `rooms` is the number of rooms of that type. |
| `rate_plans_count` | number | Number of rate plans set up. |
| `onboarding.desired_channels` | array | Channels the hotel said it wanted to connect when it signed up (for example `booking_com`, `airbnb`). |
| `onboarding.discovery_source` | string / null | How the hotel heard about LuxHotel, as answered at sign-up. |

## AI chats, web requests and technical issues

These three endpoints work the same way:

| Endpoint | Returns |
|---|---|
| `GET /ai-chats` | Conversations between hotel staff and the AI support assistant inside LuxHotel. |
| `GET /web-requests` | Contact form submissions from the LuxHotel website. |
| `GET /technical-issues` | Problems hotel staff reported through "Report a technical problem" in LuxHotel. |
| `GET /ai-chats/{id}`, `GET /web-requests/{id}`, `GET /technical-issues/{id}` | One record, in the same shape as in the list. An unknown id returns `404 Not Found`. |

```bash
curl -H "Authorization: Bearer $LUXHOTEL_API_KEY" \
  "https://us-central1-pms-channex-2030.cloudfunctions.net/hotelsApi/technical-issues?since=2026-10-01T00:00:00Z"
```

Response:

```json
{
  "count": 100,
  "generated_at": "2026-10-16T12:41:03.259Z",
  "next_cursor": "8fJ2kQ0aLx3VbW1nYt5R",
  "technical_issues": [ { ...technical issue... } ]
}
```

The list is in the property named after the endpoint: `ai_chats`, `web_requests` or `technical_issues`.

### Paging and filtering

Records are sorted newest first and returned in pages. All query parameters are optional:

| Parameter | Default | Meaning |
|---|---|---|
| `limit` | `100` | Records per page, from `1` to `200`. |
| `since` | none | Only records created at or after this time (ISO 8601, for example `2026-10-01T00:00:00Z`). |
| `until` | none | Only records created before this time. |
| `cursor` | none | Pass the `next_cursor` from the previous response to get the next page. |

`next_cursor` is `null` on the last page. Keep the same `since`, `until` and `limit` while you follow the cursor.
To pick up only new records on each run, save the newest `created_at` (or `started_at` for AI chats) you have
seen and send it as `since` next time.

### AI chat fields

One record is one conversation. Records are sorted and filtered by `started_at`.

| Field | Type | Meaning |
|---|---|---|
| `id` | string | Conversation ID. |
| `vendor_id` | string / null | The account the staff member belongs to. Matches `vendor_id` on hotels. |
| `user.email`, `user.role` | string / null | Who asked, and their role on the account (for example `owner`). |
| `started_at` | string | When the conversation started. |
| `updated_at` | string / null | When the last message was added. |
| `messages` | array | Each question and the assistant's answer, oldest first (see below). |
| `feedback` | array | Ratings the user gave the answers: `{ "vote": "up" \| "down", "comment": "…" \| null, "at": "…" }`. |

Each item in `messages`:

| Field | Type | Meaning |
|---|---|---|
| `question` | string | What the user asked. A question sent with only a screenshot reads `📷 Screenshot`. |
| `answer` | string | The assistant's reply. |
| `needs_human` | boolean | `true` when the assistant could not resolve the question and offered to pass it to the support team. |
| `has_screenshot` | boolean | Whether the user attached a screenshot. The image itself is not available through the API. |
| `asked_at` | string / null | When the question was asked. |

A conversation can receive more messages after you first fetch it. To get its latest state, fetch it again with
`GET /ai-chats/{id}` and compare `updated_at`.

### Web request fields

Records are sorted and filtered by `created_at`.

| Field | Type | Meaning |
|---|---|---|
| `id` | string | Request ID. |
| `name` | string | Sender's name. |
| `email` | string | Sender's email address. |
| `phone` | string / null | Sender's phone number, if given. |
| `property_name` | string / null | The property name the sender typed in the form. It is free text and is not linked to a hotel `id`. |
| `message` | string | The message. |
| `created_at` | string | When the form was sent. |

### Technical issue fields

Records are sorted and filtered by `created_at`.

| Field | Type | Meaning |
|---|---|---|
| `id` | string | Issue ID. |
| `description` | string | The problem as the user described it. |
| `priority` | string | `low`, `medium` or `high`, as chosen by the user. |
| `due_date` | string / null | Date the user asked for a fix by (`YYYY-MM-DD`), if given. |
| `reported_by.email` | string / null | Who reported it. |
| `vendor_id` | string / null | The account the reporter belongs to. Matches `vendor_id` on hotels. |
| `hotel_id` | string / null | The property that was open when the issue was reported. Use it with `GET /hotels/{id}`. |
| `page_url` | string / null | The LuxHotel page the user was on when they reported it. |
| `created_at` | string | When the issue was reported. |

The API does not show whether an issue has been resolved.

## Subscription invoices and payments

Each property pays a subscription. LuxHotel bills it with **invoices**; a hotel pays an invoice through a POK
payment link, or LuxHotel records a cash or bank-transfer payment. Each attempt or recorded payment is a
**payment**. Paying an invoice that includes the base plan activates or extends the hotel's subscription
(`subscription` on the hotel summary) until the invoice's `period.end`.

| Endpoint | Returns |
|---|---|
| `GET /invoices` | All invoices, newest first, paged like the feeds above (`limit`, `since`, `until`, `cursor`, by `created_at`). |
| `GET /invoices/{id}` | One invoice, with its `payments`. |
| `GET /hotels/{id}/invoices` | All invoices of one hotel, newest first, each with its `payments`. Not paged. |
| `GET /payments` | All payments, newest first, paged like the feeds above (by `created_at`). |
| `GET /payments/{id}` | One payment. |
| `POST /invoices` | Issue a new invoice. |
| `POST /invoices/{id}/payment-link` | Create a POK payment link for an unpaid invoice. |

```bash
curl -H "Authorization: Bearer $LUXHOTEL_API_KEY" \
  https://us-central1-pms-channex-2030.cloudfunctions.net/hotelsApi/hotels/ede5d55b-3b0b-45e4-aac1-e3a9cb5dc85f/invoices
```

To see whether a hotel is up to date, check `subscription` on the hotel, or look for a `paid` invoice whose
`period.end` is in the future.

### Invoice fields

| Field | Type | Meaning |
|---|---|---|
| `id` | string | Invoice ID. |
| `number` | string | Invoice number, for example `INV-2026-0042`. |
| `hotel_id`, `vendor_id` | string | The hotel billed, and its account. Match `id` and `vendor_id` on hotels. |
| `billed_to.hotel_name`, `billed_to.legal_name`, `billed_to.tax_id`, `billed_to.email` | string / null | Who the invoice is addressed to, as on the PDF. |
| `status` | string | `sent` (waiting for payment), `paid` or `void` (cancelled). |
| `removed` | boolean | `true` if LuxHotel took the invoice off the hotel's billing page (for example one marked paid by mistake). Ignore removed invoices when totalling. |
| `includes_base_plan` | boolean | `false` for an invoice that only bills add-ons. Paying it does not change the subscription. |
| `plan` | string | `with_channel_manager` or `without_channel_manager`. |
| `period.start`, `period.end` | string | The period billed. Paying the invoice extends the subscription to `period.end`. |
| `room_count` | number | Physical rooms the invoice was priced on. |
| `line_items` | array | `{ "key", "label", "description", "amount" }` for each product. `key` is `base_plan`, an add-on key such as `messages_inbox`, or `custom`. |
| `subtotal`, `tax`, `total` | number | Amounts in `currency`. LuxHotel invoices carry no VAT, so `total` equals `subtotal`. |
| `currency` | string | `EUR` or `ALL`. |
| `paid_at` | string / null | When it was paid. |
| `payment_method` | string / null | `pok`, `cash` or `bank_transfer` once paid. |
| `payment_url` | string / null | The latest POK payment link, while the invoice is `sent`. |
| `fiscal_status` | string / null | Fiscalization of a paid invoice: `fiscalized` when done; `draft`, `processing` or `error` while pending or failed (LuxHotel retries failed ones from its admin panel); `null` before payment. |
| `pdf_url` | string / null | Download link for the invoice PDF. Anyone with the link can open it, so don't publish it. |
| `notes` | string / null | Notes printed on the invoice. |
| `created_at`, `updated_at` | string | When it was issued and last changed. |
| `payments` | array | Only on `GET /invoices/{id}`, `GET /hotels/{id}/invoices` and `POST` responses: its payments, oldest first. |

### Payment fields

| Field | Type | Meaning |
|---|---|---|
| `id` | string | Payment ID. |
| `invoice_id`, `hotel_id`, `vendor_id` | string | The invoice paid, its hotel and account. |
| `amount`, `currency` | number, string | Amount of the payment. |
| `status` | string | `pending` (POK link created, not paid yet), `completed`, `failed` or `refunded` (its invoice was removed after payment). |
| `method` | string | `pok`, `cash` or `bank_transfer`. |
| `payment_url` | string / null | The POK link, while `pending`. |
| `failure_reason` | string / null | Why it failed or was refunded. |
| `note` | string / null | Note LuxHotel added when recording a cash or bank payment. |
| `created_at`, `updated_at` | string | When the payment was created and last changed. |

A pending POK link that the hotel never pays stays `pending`; creating a new link adds a new payment.

### Issue an invoice

```
POST /invoices
```

The invoice is priced the same way as in the LuxHotel admin panel: the base plan, **PMS + Channel Manager**,
costs €2 per physical room per month. A period of whole calendar months counts as exactly that many months
(1–31 Oct is 1 month; 1 Oct 2026 – 30 Sep 2027 is 12), and leftover days count as 1/30 of a month each. The
room count is read from the hotel at the moment the invoice is issued.

The new invoice appears straight away on the hotel's billing page in LuxHotel, where the owner can pay it
and download its PDF.

```bash
curl -X POST https://us-central1-pms-channex-2030.cloudfunctions.net/hotelsApi/invoices \
  -H "Authorization: Bearer $LUXHOTEL_API_KEY" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: 2026-11-ede5d55b" \
  -d '{
    "hotel_id": "ede5d55b-3b0b-45e4-aac1-e3a9cb5dc85f",
    "period_start": "2026-11-01",
    "period_end": "2026-11-30",
    "add_ons": [{ "key": "messages_inbox" }],
    "payment_link": true
  }'
```

| Field | Required | Meaning |
|---|---|---|
| `hotel_id` | yes | The hotel to bill. |
| `period_start`, `period_end` | yes | The period billed, as `YYYY-MM-DD`, both days included. |
| `add_ons` | no | Extra products. Either a ready-made add-on, `{ "key": "messages_inbox" }` (Messages Inbox, €1 per room per month), or a custom line, `{ "label": "Setup", "monthly_price": 20 }` (a fixed amount per month, multiplied by the months in the period). |
| `include_base_plan` | no | Default `true`. Set `false` to bill only the add-ons; at least one add-on is then required. |
| `currency` | no | `EUR` (default) or `ALL`. Amounts are not converted: they are the prices above, labelled in this currency. |
| `notes` | no | Text printed on the invoice. |
| `payment_link` | no | Default `false`. Set `true` to also create a POK payment link, returned in `payment_url`. |

Returns `201 Created` with the invoice (and its `payments`). If the invoice was issued but the payment link
could not be created, the response also has `payment_link_error`; create the link later with
`POST /invoices/{id}/payment-link`.

**Retries.** Issuing an invoice uses up an invoice number, so don't blindly retry a request that timed out.
Send an `Idempotency-Key` header with a value unique to the invoice you mean to issue (for example the hotel
and the month). Repeating a request with the same key returns the invoice already issued, with status `200`,
instead of issuing another. A repeat sent while the first is still running gets `409` with
`"error": "in_progress"`.

### Create a payment link

```
POST /invoices/{id}/payment-link
```

No body. Creates a POK payment link for an invoice that is still `sent`, and returns:

```json
{
  "payment_url": "https://pay.pokpay.io/…",
  "payment_id": "Q8wJ…",
  "invoice": { ...invoice, with its payments... }
}
```

Send `payment_url` to the hotel. When they pay, the invoice becomes `paid`, the subscription is extended, the
invoice is fiscalized and the owner gets it by email — the same as paying from inside LuxHotel. A link stays
payable for 90 days. Each call creates a new link; earlier links for the same invoice remain payable until the
invoice is paid. An invoice that is already `paid` or `void` returns `409`.

## Errors

| Status | Body | When |
|---|---|---|
| `400` | `{"error":"invalid_param"}` | A query parameter or body field is invalid. `message` says which one. |
| `401` | `{"error":"unauthorized"}` | Missing or invalid API key. |
| `404` | `{"error":"not_found"}` | Unknown id or unknown path. |
| `405` | `{"error":"method_not_allowed"}` | Any method other than `GET` or `POST`. |
| `409` | `{"error":"conflict"}` or `{"error":"in_progress"}` | The invoice can't take that action (already paid or void), or an `Idempotency-Key` request is still running. |
| `500` | `{"error":"internal"}` | Temporary problem on our side; retry later. |

## Notes

- Data is read live on every request, so it is always current. A request can take a few seconds; please don't
  call the API more than about once a minute.
- If the channel manager can't be reached, `channels` is returned empty for that request rather than failing.
- `POST` requests change real billing data: issued invoices are numbered in sequence and shown to the hotel.
  To cancel one issued by mistake, contact LuxHotel; the API cannot void invoices.
- AI chats, web requests and technical issues contain personal data (names, email addresses, phone numbers and
  the content of messages). Store them securely and only for as long as you need them.
