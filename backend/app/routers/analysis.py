from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.inclusiview import Neighborhood, EquityScore, AccessibilityIssue, ServiceCenter
from app.schemas import BriefRequest, BriefResponse, RecommendationRequest
from app.services.ai_service import generate_equity_brief, generate_recommendations

router = APIRouter(prefix="/api/analysis", tags=["analysis"])


@router.post("/generate-brief", response_model=BriefResponse)
def generate_brief(req: BriefRequest, db: Session = Depends(get_db)):
    nh = db.query(Neighborhood).filter(Neighborhood.id == req.neighborhood_id).first()
    if not nh:
        raise HTTPException(status_code=404, detail="Neighborhood not found")

    scores = db.query(EquityScore).filter(
        EquityScore.neighborhood_id == nh.id
    ).all()
    issues = db.query(AccessibilityIssue).filter(
        AccessibilityIssue.neighborhood_id == nh.id
    ).all()
    services = db.query(ServiceCenter).filter(
        ServiceCenter.neighborhood_id == nh.id
    ).all()

    scores_data = [{"dimension": s.dimension, "score": s.score} for s in scores]
    issues_data = [{"title": i.title, "severity": i.severity} for i in issues]
    services_data = [{"name": s.name, "center_type": s.center_type, "accessibility_rating": s.accessibility_rating} for s in services]

    nh_data = {
        "name": nh.name,
        "population": nh.population,
        "median_income": nh.median_income,
        "description": nh.description,
    }

    result = generate_equity_brief(nh_data, scores_data, issues_data, services_data)
    return BriefResponse(**result)


@router.post("/recommendations")
def get_recommendations(req: RecommendationRequest, db: Session = Depends(get_db)):
    if req.neighborhood_id:
        neighborhoods = db.query(Neighborhood).filter(Neighborhood.id == req.neighborhood_id).all()
    else:
        neighborhoods = db.query(Neighborhood).all()

    all_recs = []
    for nh in neighborhoods:
        scores = db.query(EquityScore).filter(
            EquityScore.neighborhood_id == nh.id
        ).all()
        scores_data = [{"dimension": s.dimension, "score": s.score} for s in scores]
        nh_data = {"name": nh.name}

        recs = generate_recommendations(nh_data, scores_data, req.dimension)
        all_recs.append({
            "neighborhood_id": nh.id,
            "neighborhood_name": nh.name,
            "recommendations": recs,
        })

    return all_recs
