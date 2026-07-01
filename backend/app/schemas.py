from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional


class NeighborhoodOut(BaseModel):
    id: int
    name: str
    latitude: float
    longitude: float
    population: int
    median_income: float
    description: str

    class Config:
        from_attributes = True


class AccessibilityIssueOut(BaseModel):
    id: int
    title: str
    description: str
    issue_type: str
    latitude: float
    longitude: float
    severity: str
    status: str
    neighborhood_id: Optional[int]
    reported_date: Optional[datetime]
    resolved_date: Optional[datetime]

    class Config:
        from_attributes = True


class TransitStopOut(BaseModel):
    id: int
    name: str
    stop_type: str
    latitude: float
    longitude: float
    accessibility_score: float
    wheelchair_accessible: int
    shelter_available: int
    neighborhood_id: Optional[int]

    class Config:
        from_attributes = True


class ServiceCenterOut(BaseModel):
    id: int
    name: str
    center_type: str
    latitude: float
    longitude: float
    hours: str
    phone: str
    neighborhood_id: Optional[int]
    wait_time_minutes: int
    accessibility_rating: float

    class Config:
        from_attributes = True


class EquityScoreOut(BaseModel):
    id: int
    neighborhood_id: int
    dimension: str
    score: float
    score_date: date
    details: str

    class Config:
        from_attributes = True


class EquitySummary(BaseModel):
    neighborhood_id: int
    neighborhood_name: str
    transportation: float
    healthcare: float
    education: float
    accessibility: float
    overall: float
    population: int
    median_income: float


class BriefRequest(BaseModel):
    neighborhood_id: int
    focus: str = "comprehensive"


class BriefResponse(BaseModel):
    brief: str
    recommendations: list[str]


class RecommendationRequest(BaseModel):
    dimension: str = "all"
    neighborhood_id: Optional[int] = None
