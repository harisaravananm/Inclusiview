from app.database import SessionLocal, engine, Base
from app.models.inclusiview import (
    Neighborhood, AccessibilityIssue, TransitStop, ServiceCenter, EquityScore
)
from datetime import date
import random


NEIGHBORHOODS = [
    {"name": "Riverside", "latitude": 40.7128, "longitude": -74.0060, "population": 45200, "median_income": 68000, "description": "Historic district along the river with mixed residential and commercial zones."},
    {"name": "Oakwood Heights", "latitude": 40.7282, "longitude": -73.7949, "population": 32100, "median_income": 92000, "description": "Affluent hillside neighborhood with excellent schools and parks."},
    {"name": "Millside", "latitude": 40.6892, "longitude": -74.0445, "population": 28400, "median_income": 41000, "description": "Working-class community with aging infrastructure and growing family population."},
    {"name": "Eastgate", "latitude": 40.7484, "longitude": -73.9857, "population": 38500, "median_income": 55000, "description": "Diverse urban neighborhood with strong cultural institutions."},
    {"name": "Northpark", "latitude": 40.7851, "longitude": -73.9684, "population": 22300, "median_income": 78000, "description": "Residential area adjacent to the city's largest park system."},
    {"name": "South Bay", "latitude": 40.6782, "longitude": -74.0057, "population": 19700, "median_income": 35000, "description": "Coastal community facing climate resilience challenges."},
    {"name": "West End", "latitude": 40.7644, "longitude": -73.9735, "population": 41200, "median_income": 63000, "description": "Vibrant mixed-use neighborhood with strong small business presence."},
    {"name": "Central District", "latitude": 40.7024, "longitude": -73.9882, "population": 56300, "median_income": 48000, "description": "Dense urban core with the highest population and transit usage."},
]

ACCESSIBILITY_ISSUES = [
    {"title": "Missing curb ramp at Broadway & 42nd", "description": "Wheelchair users cannot safely cross this intersection.", "issue_type": "missing_ramp", "latitude": 40.7562, "longitude": -73.9869, "severity": "high", "neighborhood_idx": 3},
    {"title": "Broken sidewalk on Oak Ave between 5th-7th", "description": "Heaved pavement creates tripping hazard and wheelchair barrier.", "issue_type": "broken_sidewalk", "latitude": 40.7350, "longitude": -73.9900, "severity": "medium", "neighborhood_idx": 0},
    {"title": "No crosswalk signal at school zone entrance", "description": "Children and elderly face dangerous crossing during peak hours.", "issue_type": "no_crosswalk", "latitude": 40.7200, "longitude": -74.0100, "severity": "critical", "neighborhood_idx": 2},
    {"title": "Bus shelter missing on Market St", "description": "Elderly residents wait in extreme weather with no protection.", "issue_type": "missing_shelter", "latitude": 40.7100, "longitude": -74.0050, "severity": "medium", "neighborhood_idx": 7},
    {"title": "Narrow doorway at community center", "description": "Doorway too narrow for standard wheelchairs to pass through.", "issue_type": "narrow_doorway", "latitude": 40.7450, "longitude": -73.9800, "severity": "high", "neighborhood_idx": 4},
    {"title": "Flooded underpass at South Bay entrance", "description": "After rain, the only pedestrian route to beach is impassable.", "issue_type": "flooded_path", "latitude": 40.6800, "longitude": -74.0100, "severity": "critical", "neighborhood_idx": 5},
    {"title": "Missing tactile paving at West End station", "description": "Visually impaired commuters cannot navigate platform safely.", "issue_type": "missing_tactile", "latitude": 40.7650, "longitude": -73.9750, "severity": "high", "neighborhood_idx": 6},
    {"title": "Steep ramp angle at library entrance", "description": "Ramp exceeds ADA recommended slope, dangerous for manual wheelchair users.", "issue_type": "steep_ramp", "latitude": 40.7300, "longitude": -73.7950, "severity": "medium", "neighborhood_idx": 1},
    {"title": "Overgrown vegetation blocking sidewalk on Elm St", "description": "Bushes force pedestrians with strollers or walkers into the street.", "issue_type": "blocked_path", "latitude": 40.6900, "longitude": -74.0450, "severity": "low", "neighborhood_idx": 2},
    {"title": "No audible crosswalk signal at Central Ave", "description": "Visually impaired pedestrians cannot safely determine walk phase.", "issue_type": "no_audible_signal", "latitude": 40.7030, "longitude": -73.9900, "severity": "high", "neighborhood_idx": 7},
]

TRANSIT_STOPS = [
    {"name": "Riverside Terminal", "stop_type": "bus", "latitude": 40.7150, "longitude": -73.9920, "accessibility_score": 0.7, "wheelchair": 1, "shelter": 1, "neighborhood_idx": 0},
    {"name": "Oakwood Station", "stop_type": "train", "latitude": 40.7300, "longitude": -73.7960, "accessibility_score": 0.9, "wheelchair": 1, "shelter": 1, "neighborhood_idx": 1},
    {"name": "Millside Square", "stop_type": "bus", "latitude": 40.6880, "longitude": -74.0420, "accessibility_score": 0.3, "wheelchair": 0, "shelter": 0, "neighborhood_idx": 2},
    {"name": "Eastgate Hub", "stop_type": "bus", "latitude": 40.7500, "longitude": -73.9870, "accessibility_score": 0.6, "wheelchair": 1, "shelter": 1, "neighborhood_idx": 3},
    {"name": "Northpark Transit Center", "stop_type": "train", "latitude": 40.7870, "longitude": -73.9700, "accessibility_score": 0.85, "wheelchair": 1, "shelter": 1, "neighborhood_idx": 4},
    {"name": "South Bay Shuttle", "stop_type": "bus", "latitude": 40.6760, "longitude": -74.0030, "accessibility_score": 0.2, "wheelchair": 0, "shelter": 0, "neighborhood_idx": 5},
    {"name": "West End Plaza", "stop_type": "bus", "latitude": 40.7620, "longitude": -73.9710, "accessibility_score": 0.5, "wheelchair": 1, "shelter": 0, "neighborhood_idx": 6},
    {"name": "Central Station", "stop_type": "train", "latitude": 40.7000, "longitude": -73.9860, "accessibility_score": 0.4, "wheelchair": 0, "shelter": 1, "neighborhood_idx": 7},
    {"name": "Riverside East", "stop_type": "bus", "latitude": 40.7180, "longitude": -73.9850, "accessibility_score": 0.55, "wheelchair": 1, "shelter": 0, "neighborhood_idx": 0},
    {"name": "Millside Industrial", "stop_type": "bus", "latitude": 40.6850, "longitude": -74.0480, "accessibility_score": 0.15, "wheelchair": 0, "shelter": 0, "neighborhood_idx": 2},
]

SERVICE_CENTERS = [
    {"name": "Riverside Community Health", "center_type": "healthcare", "latitude": 40.7140, "longitude": -73.9950, "hours": "8 AM - 8 PM", "phone": "555-0101", "neighborhood_idx": 0, "wait_time": 45, "accessibility_rating": 4.0},
    {"name": "Oakwood Medical Center", "center_type": "healthcare", "latitude": 40.7320, "longitude": -73.7980, "hours": "7 AM - 9 PM", "phone": "555-0102", "neighborhood_idx": 1, "wait_time": 15, "accessibility_rating": 4.8},
    {"name": "Millside Clinic", "center_type": "healthcare", "latitude": 40.6870, "longitude": -74.0430, "hours": "9 AM - 5 PM", "phone": "555-0103", "neighborhood_idx": 2, "wait_time": 90, "accessibility_rating": 2.5},
    {"name": "Eastgate Wellness Center", "center_type": "healthcare", "latitude": 40.7490, "longitude": -73.9860, "hours": "8 AM - 7 PM", "phone": "555-0104", "neighborhood_idx": 3, "wait_time": 35, "accessibility_rating": 3.5},
    {"name": "Northpark Hospital", "center_type": "healthcare", "latitude": 40.7880, "longitude": -73.9660, "hours": "24 hours", "phone": "555-0105", "neighborhood_idx": 4, "wait_time": 20, "accessibility_rating": 4.5},
    {"name": "South Bay Health Post", "center_type": "healthcare", "latitude": 40.6770, "longitude": -74.0060, "hours": "9 AM - 4 PM", "phone": "555-0106", "neighborhood_idx": 5, "wait_time": 75, "accessibility_rating": 2.0},
    {"name": "West End Family Practice", "center_type": "healthcare", "latitude": 40.7630, "longitude": -73.9720, "hours": "8 AM - 6 PM", "phone": "555-0107", "neighborhood_idx": 6, "wait_time": 40, "accessibility_rating": 3.0},
    {"name": "Central District Hospital", "center_type": "healthcare", "latitude": 40.7010, "longitude": -73.9870, "hours": "24 hours", "phone": "555-0108", "neighborhood_idx": 7, "wait_time": 60, "accessibility_rating": 2.8},
    {"name": "Riverside Elementary", "center_type": "education", "latitude": 40.7160, "longitude": -73.9930, "hours": "8 AM - 3 PM", "phone": "555-0201", "neighborhood_idx": 0, "wait_time": 0, "accessibility_rating": 3.2},
    {"name": "Oakwood Academy", "center_type": "education", "latitude": 40.7290, "longitude": -73.7930, "hours": "8 AM - 4 PM", "phone": "555-0202", "neighborhood_idx": 1, "wait_time": 0, "accessibility_rating": 4.9},
    {"name": "Millside Community School", "center_type": "education", "latitude": 40.6860, "longitude": -74.0440, "hours": "8 AM - 3 PM", "phone": "555-0203", "neighborhood_idx": 2, "wait_time": 0, "accessibility_rating": 2.0},
    {"name": "Eastgate Library", "center_type": "education", "latitude": 40.7510, "longitude": -73.9840, "hours": "9 AM - 8 PM", "phone": "555-0204", "neighborhood_idx": 3, "wait_time": 0, "accessibility_rating": 3.8},
    {"name": "South Bay Community Center", "center_type": "social", "latitude": 40.6750, "longitude": -74.0080, "hours": "10 AM - 6 PM", "phone": "555-0301", "neighborhood_idx": 5, "wait_time": 0, "accessibility_rating": 1.5},
    {"name": "West End Senior Center", "center_type": "social", "latitude": 40.7660, "longitude": -73.9740, "hours": "9 AM - 5 PM", "phone": "555-0302", "neighborhood_idx": 6, "wait_time": 0, "accessibility_rating": 3.5},
    {"name": "Central District Food Bank", "center_type": "social", "latitude": 40.7040, "longitude": -73.9890, "hours": "10 AM - 4 PM", "phone": "555-0303", "neighborhood_idx": 7, "wait_time": 0, "accessibility_rating": 2.5},
    {"name": "Oakwood Fire Station", "center_type": "emergency", "latitude": 40.7310, "longitude": -73.7950, "hours": "24 hours", "phone": "555-0401", "neighborhood_idx": 1, "wait_time": 5, "accessibility_rating": 4.2},
    {"name": "Central District Police Precinct", "center_type": "emergency", "latitude": 40.7050, "longitude": -73.9900, "hours": "24 hours", "phone": "555-0402", "neighborhood_idx": 7, "wait_time": 10, "accessibility_rating": 3.0},
]


def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    if db.query(Neighborhood).count() > 0:
        db.close()
        return

    for nh in NEIGHBORHOODS:
        db.add(Neighborhood(**nh))

    for iss in ACCESSIBILITY_ISSUES:
        ni = iss.pop("neighborhood_idx")
        sid = db.query(Neighborhood).offset(ni).first()
        db.add(AccessibilityIssue(**iss, neighborhood_id=sid.id if sid else None))

    for ts in TRANSIT_STOPS:
        ni = ts.pop("neighborhood_idx")
        ts["wheelchair_accessible"] = ts.pop("wheelchair")
        ts["shelter_available"] = ts.pop("shelter")
        sid = db.query(Neighborhood).offset(ni).first()
        db.add(TransitStop(**ts, neighborhood_id=sid.id if sid else None))

    for sc in SERVICE_CENTERS:
        ni = sc.pop("neighborhood_idx")
        sc["wait_time_minutes"] = sc.pop("wait_time")
        sid = db.query(Neighborhood).offset(ni).first()
        db.add(ServiceCenter(**sc, neighborhood_id=sid.id if sid else None))

    db.flush()
    neighborhoods = db.query(Neighborhood).all()
    dimensions = ["transportation", "healthcare", "education", "accessibility"]
    random.seed(42)

    for nh in neighborhoods:
        for dim in dimensions:
            base = {"Riverside": 0.65, "Oakwood Heights": 0.88, "Millside": 0.35,
                    "Eastgate": 0.55, "Northpark": 0.82, "South Bay": 0.28,
                    "West End": 0.52, "Central District": 0.40}.get(nh.name, 0.5)
            jitter = random.uniform(-0.1, 0.1)
            score = round(min(1.0, max(0.0, base + jitter)), 2)
            db.add(EquityScore(
                neighborhood_id=nh.id,
                dimension=dim,
                score=score,
                score_date=date.today(),
                details=f"{dim.capitalize()} equity assessment for {nh.name}"
            ))

    db.commit()
    db.close()
