from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.inclusiview import (
    Neighborhood, AccessibilityIssue, TransitStop, ServiceCenter, EquityScore
)
from app.schemas import (
    NeighborhoodOut, AccessibilityIssueOut, TransitStopOut,
    ServiceCenterOut, EquityScoreOut, EquitySummary
)

router = APIRouter(prefix="/api", tags=["insights"])


@router.get("/neighborhoods")
def list_neighborhoods(db: Session = Depends(get_db)):
    return db.query(Neighborhood).all()


@router.get("/neighborhoods/{nh_id}")
def get_neighborhood(nh_id: int, db: Session = Depends(get_db)):
    nh = db.query(Neighborhood).filter(Neighborhood.id == nh_id).first()
    if not nh:
        return {"error": "not found"}, 404
    return nh


@router.get("/accessibility/issues")
def list_issues(
    severity: str = None,
    status: str = None,
    neighborhood_id: int = None,
    db: Session = Depends(get_db)
):
    q = db.query(AccessibilityIssue)
    if severity:
        q = q.filter(AccessibilityIssue.severity == severity)
    if status:
        q = q.filter(AccessibilityIssue.status == status)
    if neighborhood_id:
        q = q.filter(AccessibilityIssue.neighborhood_id == neighborhood_id)
    return q.order_by(AccessibilityIssue.severity.desc()).all()


@router.get("/transit/stops")
def list_transit_stops(neighborhood_id: int = None, db: Session = Depends(get_db)):
    q = db.query(TransitStop)
    if neighborhood_id:
        q = q.filter(TransitStop.neighborhood_id == neighborhood_id)
    return q.all()


@router.get("/services/centers")
def list_service_centers(center_type: str = None, neighborhood_id: int = None, db: Session = Depends(get_db)):
    q = db.query(ServiceCenter)
    if center_type:
        q = q.filter(ServiceCenter.center_type == center_type)
    if neighborhood_id:
        q = q.filter(ServiceCenter.neighborhood_id == neighborhood_id)
    return q.all()


@router.get("/equity/scores")
def get_equity_scores(neighborhood_id: int = None, dimension: str = None, db: Session = Depends(get_db)):
    q = db.query(EquityScore)
    if neighborhood_id:
        q = q.filter(EquityScore.neighborhood_id == neighborhood_id)
    if dimension:
        q = q.filter(EquityScore.dimension == dimension)
    return q.all()


@router.get("/equity/summary")
def get_equity_summary(db: Session = Depends(get_db)):
    neighborhoods = db.query(Neighborhood).all()
    results = []

    for nh in neighborhoods:
        scores = db.query(EquityScore).filter(EquityScore.neighborhood_id == nh.id).all()
        score_map = {s.dimension: s.score for s in scores}
        dimensions = ["transportation", "healthcare", "education", "accessibility"]
        vals = [score_map.get(d, 0.0) for d in dimensions]
        overall = round(sum(vals) / len(vals), 2) if vals else 0.0

        results.append(EquitySummary(
            neighborhood_id=nh.id,
            neighborhood_name=nh.name,
            transportation=score_map.get("transportation", 0.0),
            healthcare=score_map.get("healthcare", 0.0),
            education=score_map.get("education", 0.0),
            accessibility=score_map.get("accessibility", 0.0),
            overall=overall,
            population=nh.population,
            median_income=nh.median_income,
        ))

    return sorted(results, key=lambda r: r.overall)


@router.get("/dashboard/stats")
def dashboard_stats(db: Session = Depends(get_db)):
    total_issues = db.query(AccessibilityIssue).count()
    critical_issues = db.query(AccessibilityIssue).filter(
        AccessibilityIssue.severity == "critical"
    ).count()
    total_neighborhoods = db.query(Neighborhood).count()
    avg_equity = db.query(func.avg(EquityScore.score)).scalar() or 0.0
    total_transit_stops = db.query(TransitStop).count()
    accessible_stops = db.query(TransitStop).filter(
        TransitStop.wheelchair_accessible == 1
    ).count()

    return {
        "total_issues": total_issues,
        "critical_issues": critical_issues,
        "total_neighborhoods": total_neighborhoods,
        "avg_equity_score": round(float(avg_equity), 2),
        "total_transit_stops": total_transit_stops,
        "accessible_stops": accessible_stops,
        "accessibility_rate": round(accessible_stops / total_transit_stops * 100, 1) if total_transit_stops else 0,
    }
