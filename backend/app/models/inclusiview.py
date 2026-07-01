from sqlalchemy import Column, Integer, String, Float, Text, DateTime, Date, Enum as SAEnum
from sqlalchemy.sql import func
from app.database import Base
import enum


class Severity(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class IssueStatus(str, enum.Enum):
    REPORTED = "reported"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"


class CenterType(str, enum.Enum):
    HEALTHCARE = "healthcare"
    EDUCATION = "education"
    SOCIAL = "social"
    EMERGENCY = "emergency"


class Neighborhood(Base):
    __tablename__ = "neighborhoods"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    population = Column(Integer, default=0)
    median_income = Column(Float, default=0.0)
    description = Column(Text, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AccessibilityIssue(Base):
    __tablename__ = "accessibility_issues"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False)
    description = Column(Text, default="")
    issue_type = Column(String(100), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    severity = Column(String(20), default=Severity.MEDIUM.value)
    status = Column(String(20), default=IssueStatus.REPORTED.value)
    neighborhood_id = Column(Integer, nullable=True)
    image_url = Column(String(500), default="")
    reported_date = Column(DateTime(timezone=True), server_default=func.now())
    resolved_date = Column(DateTime(timezone=True), nullable=True)


class TransitStop(Base):
    __tablename__ = "transit_stops"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    stop_type = Column(String(50), default="bus")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    accessibility_score = Column(Float, default=0.5)
    wheelchair_accessible = Column(Integer, default=0)
    shelter_available = Column(Integer, default=0)
    neighborhood_id = Column(Integer, nullable=True)


class ServiceCenter(Base):
    __tablename__ = "service_centers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(300), nullable=False)
    center_type = Column(String(50), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    hours = Column(String(200), default="9 AM - 5 PM")
    phone = Column(String(50), default="")
    neighborhood_id = Column(Integer, nullable=True)
    wait_time_minutes = Column(Integer, default=0)
    accessibility_rating = Column(Float, default=3.0)


class EquityScore(Base):
    __tablename__ = "equity_scores"

    id = Column(Integer, primary_key=True, index=True)
    neighborhood_id = Column(Integer, nullable=False)
    dimension = Column(String(50), nullable=False)
    score = Column(Float, nullable=False)
    score_date = Column(Date, nullable=False)
    details = Column(Text, default="")
