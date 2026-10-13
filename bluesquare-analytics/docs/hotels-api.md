# LuxHotel Hotels API

Read-only access to the properties registered on LuxHotel System: when each one registered, its rooms, its
connected booking channels, its subscription and the modules it uses.

- **Base URL:** `https://us-central1-pms-channex-2030.cloudfunctions.net/hotelsApi`
- **Format:** JSON, UTF-8. All dates are ISO 8601 in UTC (for example `2026-04-18T13:27:33.277Z`).
- **Methods:** `GET` only.

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

## Errors

| Status | Body | When |
|---|---|---|
| `401` | `{"error":"unauthorized"}` | Missing or invalid API key. |
| `404` | `{"error":"not_found"}` | Unknown hotel id or unknown path. |
| `405` | `{"error":"method_not_allowed"}` | Any method other than `GET`. |
| `500` | `{"error":"internal"}` | Temporary problem on our side; retry later. |

## Notes

- Data is read live on every request, so it is always current. A request can take a few seconds; please don't
  call the API more than about once a minute.
- If the channel manager can't be reached, `channels` is returned empty for that request rather than failing.
