import { attentionReasons, channelLabel, dateLabel, hotelLocation, number, planLabel, timeLabel, type HotelDetail } from "@/lib/luxhotel-data";
import { Icon, Status } from "./parts";
import s from "./luxhotel.module.css";

/** Server-rendered details remain usable before (or without) client-side hydration. */
export function PropertyDetails({ hotel: h, checkedAt }: { hotel: HotelDetail; checkedAt: string }) {
  const reasons = attentionReasons(h, Date.parse(checkedAt));
  return <>
    <header className={s.propertyDetailHead}>
      <span className={s.propertyMark}><Icon name="hotel" /></span>
      <div><h1>{h.name}</h1><p>{hotelLocation(h)}</p></div>
      <Status hotel={h} />
    </header>
    {reasons.length > 0 && <div className={s.detailNotice}><strong>Items to review</strong><ul>{reasons.map(reason => <li key={reason}>{reason}</li>)}</ul></div>}
    <dl className={s.detailStats}>
      <div><dt>Physical rooms</dt><dd>{number(h.rooms.physical)}</dd></div>
      <div><dt>Reservations</dt><dd>{number(h.bookings_count)}</dd></div>
      <div><dt>Account staff</dt><dd>{number(h.staff_count)}</dd></div>
    </dl>
    <div className={s.detailGrid}>
      <div>
        <section className={s.detailPanel}>
          <h2>Property &amp; subscription</h2>
          <dl className={s.facts}>
            <div><dt>Registered</dt><dd>{dateLabel(h.registered_at)}</dd></div>
            <div><dt>Address</dt><dd>{h.location.address || "Not provided"}</dd></div>
            <div><dt>Owner</dt><dd>{h.owner?.name || "Not provided"}</dd></div>
            <div><dt>Email</dt><dd>{h.owner?.email ? <a href={`mailto:${h.owner.email}`}>{h.owner.email}</a> : "Not provided"}</dd></div>
            <div><dt>Plan</dt><dd>{planLabel(h.subscription.plan)}</dd></div>
            <div><dt>Period ends</dt><dd>{dateLabel(h.subscription.expires_at)}</dd></div>
            <div><dt>Channel manager</dt><dd>{h.channel_manager_connected ? "Connected" : "Disconnected"}</dd></div>
          </dl>
        </section>
        <section className={s.detailPanel}>
          <h2>Room types <span>{h.room_types.length}</span></h2>
          <p>{number(h.rate_plans_count)} rate plans configured</p>
          {h.room_types.length ? <div className={s.roomTypes}><table>
            <thead><tr><th scope="col">Type</th><th scope="col">Rooms</th><th scope="col">Max. guests</th></tr></thead>
            <tbody>{h.room_types.map(room => <tr key={room.id}><td>{room.name}</td><td>{number(room.rooms)}</td><td>{room.max_adults} adults{room.max_children > 0 ? `, ${room.max_children} children` : ""}</td></tr>)}</tbody>
          </table></div> : <p>No room types configured.</p>}
        </section>
      </div>
      <div>
        <section className={s.detailPanel}>
          <h2>Booking channels <span>{h.channels.length}</span></h2>
          {h.channels.length ? <ul className={s.channelList}>{h.channels.map((channel, i) => <li key={`${channel.ota}:${i}`}>
            <div><strong>{channelLabel(channel.ota)}</strong><small>{channel.title}</small></div>
            <span className={`${s.status} ${channel.active ? s.good : s.neutral}`}>{channel.active ? "Active" : "Inactive"}</span>
          </li>)}</ul> : <p>No channels were returned. The channel service may be temporarily unavailable.</p>}
        </section>
        <section className={s.detailPanel}>
          <h2>Modules</h2>
          <div className={s.moduleList}>{([["messages", "Messages"], ["housekeeping", "Housekeeping"], ["online_checkin", "Online check-in"]] as const).map(([key, label]) => <div key={key}><span>{label}</span><span className={`${s.status} ${h.modules[key] ? s.good : s.neutral}`}>{h.modules[key] ? "Enabled" : "Disabled"}</span></div>)}</div>
        </section>
        <section className={s.detailPanel}>
          <h2>Onboarding</h2>
          <dl className={s.facts}><div><dt>Discovery source</dt><dd>{h.onboarding.discovery_source || "Not provided"}</dd></div><div><dt>Requested channels</dt><dd>{h.onboarding.desired_channels.map(channelLabel).join(", ") || "None provided"}</dd></div></dl>
        </section>
      </div>
    </div>
    <footer className={s.detailFooter}>
      <span>Property ID</span><code>{h.id}</code><span>Last checked {timeLabel(checkedAt)}</span>
      <small>Reservations are all-time totals across all statuses. Staff counts apply to the business account.</small>
    </footer>
  </>;
}
