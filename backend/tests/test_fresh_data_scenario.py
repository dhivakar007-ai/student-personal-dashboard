import httpx
import sys

API_BASE = "http://127.0.0.1:8000/api"

def run_test():
    with httpx.Client(base_url=API_BASE, timeout=10) as client:
        # Step 0: Ensure fresh reset
        r_reset = client.post("/admin/reset-progress")
        assert r_reset.status_code == 200, f"Reset failed: {r_reset.text}"
        print("[OK] Reset completed safely")

        # Step 1: Verify fresh state for Sept 29
        r29_fresh = client.get("/daily/2026-09-29").json()
        assert r29_fresh["daily_score"] == 0.0, f"Expected 0.0 score, got {r29_fresh['daily_score']}"
        assert r29_fresh["status"] == "NOT STARTED", f"Expected NOT STARTED, got {r29_fresh['status']}"
        assert r29_fresh["wake_up_target"] is False
        assert r29_fresh["water_l"] == 0.0
        assert r29_fresh["coding_min"] == 0
        print("[OK] September 29 starts fresh with score 0 and status 'NOT STARTED'")

        # Verify no activities
        acts = client.get("/activities?date=2026-09-29").json()
        assert len(acts) == 0, f"Expected 0 activities, got {len(acts)}"
        print("[OK] No fake activities exist")

        # Verify streak is 0
        streaks = client.get("/analytics/streaks?date=2026-09-29").json()
        assert streaks["overall_streak"] == 0
        print("[OK] Streak is 0 (No streak yet)")

        # Step 2: Perform the 6 manual actions on September 29
        # Action 1: Check Wake Up
        client.put("/daily/2026-09-29/checklist", json={"wake_up_target": True})
        # Action 2: Check Reading
        client.put("/daily/2026-09-29/checklist", json={"reading_done": True})
        # Action 3: Enter Water = 1 L
        client.put("/daily/2026-09-29/measurements", json={"water_l": 1.0})
        # Action 4: Enter Coding = 30 min
        client.put("/daily/2026-09-29/measurements", json={"coding_min": 30})
        # Action 5: Add one activity
        client.post("/activities", json={
            "date": "2026-09-29",
            "activity": "Deep Work - Architecture",
            "category": "Engineering",
            "start_time": "09:00",
            "end_time": "09:30",
            "duration_min": 30
        })
        # Action 6: Write a diary entry
        client.put("/diary/2026-09-29", json={
            "title": "Clean Slate Focus",
            "what_happened": "Reset and verified minimal calm command center",
            "what_accomplished": "All test actions completed successfully",
            "tomorrow_priority": "DSA Graphs"
        })
        print("[OK] All 6 user actions executed on September 29")

        # Step 3: Simulate browser reload
        r29_after = client.get("/daily/2026-09-29").json()
        assert r29_after["wake_up_target"] is True
        assert r29_after["reading_done"] is True
        assert r29_after["water_l"] == 1.0
        assert r29_after["coding_min"] == 30
        assert r29_after["daily_score"] > 0
        assert r29_after["status"] != "NOT STARTED"

        acts29 = client.get("/activities?date=2026-09-29").json()
        assert len(acts29) == 1
        assert acts29[0]["activity"] == "Deep Work - Architecture"

        diary29 = client.get("/diary/2026-09-29").json()
        assert diary29["title"] == "Clean Slate Focus"
        print("[OK] All 6 changes remain intact after simulated reload")

        # Step 4: Navigate to September 28
        r28 = client.get("/daily/2026-09-28").json()
        assert r28["daily_score"] == 0.0
        assert r28["status"] == "NOT STARTED"
        assert r28["coding_min"] == 0
        assert r28["wake_up_target"] is False
        acts28 = client.get("/activities?date=2026-09-28").json()
        assert len(acts28) == 0
        print("[OK] September 28 remains fresh and untouched")

        # Step 5: Navigate back to September 29
        r29_return = client.get("/daily/2026-09-29").json()
        assert r29_return["coding_min"] == 30
        assert r29_return["water_l"] == 1.0
        assert r29_return["wake_up_target"] is True
        assert r29_return["reading_done"] is True
        print("[OK] September 29 data is 100% preserved after navigating back")

        # Step 6: Create September 30
        r30 = client.get("/daily/2026-09-30").json()
        assert r30["daily_score"] == 0.0
        assert r30["status"] == "NOT STARTED"
        assert r30["coding_min"] == 0

        # Verify September 29 remains unchanged
        r29_final = client.get("/daily/2026-09-29").json()
        assert r29_final["coding_min"] == 30
        assert r29_final["water_l"] == 1.0
        print("[OK] September 30 is fresh, September 29 remains completely unchanged")

        print("\nALL FRESH DATA TEST SCENARIOS PASSED WITH 100% SUCCESS!")

if __name__ == "__main__":
    run_test()

