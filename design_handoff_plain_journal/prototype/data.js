window.PJ_ENTRIES = [
  { id: 6, ts: '2026-09-03T08:14', text: "Woke before the alarm and lay there listening to the rain on the window. Wrote two pages before coffee, which never happens." },
  { id: 5, ts: '2026-09-02T21:40', text: "Long day. The good kind — the sort where you forget to check the time." },
  { id: 4, ts: '2026-09-02T07:05', text: "Ran the loop by the reservoir. Cold enough to see my breath at the far end." },
  { id: 3, ts: '2026-09-01T22:12', text: "Started the month by tidying the desk. Small thing, but the room feels different." },
  { id: 2, ts: '2026-08-30T19:30', text: "Dinner at home. Read a chapter and fell asleep with the light on." },
  { id: 1, ts: '2026-08-28T09:02', text: "Notes from the walk: the hedges have been cut back, the corner shop has new awnings." },
];
window.PJ_FMT = {
  date: iso => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
  time: iso => new Date(iso).toTimeString().slice(0, 5),
};
