# VMOBIL GTFS Integration

We fetch the SBB/opentransportdata.ch GTFS feed as the canonical source for VMOBIL/VVV schedules.

Source:
- Current GTFS (example): https://data.opentransportdata.swiss/en/dataset/timetable-2025-gtfs2020/permalink
- License: https://opentransportdata.swiss/en/terms-of-use/

Endpoints:
- POST `/api/transport/vmobil/refresh` - download & extract GTFS zip, parse stops & stop_times
- GET `/api/transport/vmobil/stops` - list loaded stops
- GET `/api/transport/vmobil/departures?lat=&lng=&radius=` - nearest stops and next departures
- POST `/api/transport/vmobil/route` - schedule-based route search (origin/destination coords). Implements a **direct-trip** search plus a simple **one-transfer** heuristic to increase match recall.

Refresh:
- A GitHub Action runs nightly at 03:00 UTC to refresh the GTFS feed and extract stop_times.

Notes:
- Currently we store parsed data in `apps/next-h5/data/vmobil/` for prototyping. Later we can move to cloud storage.
- The map UI now shows **clickable VVA suggestions** (when transit is selected) as a compact overlay and populates the directions panel with the chosen option. The UI falls back to Google Directions if GTFS options are unavailable.
- For production-grade routing, a full routing engine (OpenTripPlanner) is recommended; current approach uses GTFS stop_times/trip matching for direct trip detection and a limited transfer heuristic.
