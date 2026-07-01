import os
import json
import logging

logger = logging.getLogger(__name__)

OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

_llm_provider = None  # "gemini", "openrouter", or None


def init_llm():
    global _llm_provider
    openrouter_key = os.getenv("OPENROUTER_API_KEY", "")
    gemini_key = os.getenv("GEMINI_API_KEY", "")

    if openrouter_key:
        _llm_provider = "openrouter"
        logger.info("LLM provider: OpenRouter")
    elif gemini_key:
        _llm_provider = "gemini"
        try:
            import google.generativeai as genai
            genai.configure(api_key=gemini_key)
            logger.info("LLM provider: Gemini")
        except Exception as e:
            logger.warning(f"Gemini init failed: {e}")
            _llm_provider = None
    else:
        logger.info("No LLM configured — using fallback engine")


def _call_llm(system: str, user: str) -> str:
    if _llm_provider == "openrouter":
        return _call_openrouter(system, user)
    elif _llm_provider == "gemini":
        return _call_gemini(system, user)
    return ""


def _call_openrouter(system: str, user: str) -> str:
    key = os.getenv("OPENROUTER_API_KEY", "")
    model = os.getenv("OPENROUTER_MODEL", "openai/gpt-4o-mini")
    try:
        import requests
        resp = requests.post(
            OPENROUTER_API_URL,
            headers={
                "Authorization": f"Bearer {key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://inclusiview.app",
                "X-Title": "InclusiView",
            },
            json={
                "model": model,
                "messages": [
                    {"role": "system", "content": system},
                    {"role": "user", "content": user},
                ],
                "response_format": {"type": "json_object"},
            },
            timeout=30,
        )
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"]
    except Exception as e:
        logger.warning(f"OpenRouter call failed: {e}")
        return ""


def _call_gemini(system: str, user: str) -> str:
    try:
        import google.generativeai as genai
        model = genai.GenerativeModel("gemini-1.5-flash")
        resp = model.generate_content(f"{system}\n\n{user}")
        return resp.text
    except Exception as e:
        logger.warning(f"Gemini call failed: {e}")
        return ""


def _parse_json(text: str) -> dict:
    try:
        start = text.index("{")
        end = text.rindex("}") + 1
        return json.loads(text[start:end])
    except (ValueError, json.JSONDecodeError):
        return {}


_SYSTEM_BRIEF = """You are an equity analyst for a city planning department.
Generate a comprehensive equity brief for the given neighborhood.
Respond ONLY with valid JSON containing keys: "brief" (string with markdown formatting) and "recommendations" (array of strings)."""

_SYSTEM_RECS = """You are an AI urban planning advisor.
Provide 5 specific, actionable recommendations based on the equity data.
Respond ONLY with valid JSON with key "recommendations" (array of objects with keys: "area", "action", "effort" ("low"/"medium"/"high"), "impact" ("low"/"medium"/"high"))."""


def generate_equity_brief(neighborhood: dict, equity_scores: list, issues: list, services: list):
    scores_str = "\n".join([f"- {s['dimension']}: {s['score']:.2f}" for s in equity_scores])
    issues_str = "\n".join([f"- {i['title']} (severity: {i['severity']})" for i in issues[:5]])
    services_str = "\n".join([f"- {s['name']} ({s['center_type']}, accessibility: {s['accessibility_rating']}/5)" for s in services[:5]])

    user = f"""Neighborhood: {neighborhood['name']}
Population: {neighborhood['population']}
Median Income: ${neighborhood['median_income']:,.0f}
Description: {neighborhood['description']}

Equity Scores (0-1, higher is better):
{scores_str}

Accessibility Issues:
{issues_str}

Service Centers:
{services_str}"""

    result = _call_llm(_SYSTEM_BRIEF, user)
    if result:
        parsed = _parse_json(result)
        if parsed and "brief" in parsed:
            return parsed
    return _fallback_brief(neighborhood, equity_scores)


def generate_recommendations(neighborhood: dict, equity_scores: list, dimension: str = "all"):
    filtered = [s for s in equity_scores if dimension == "all" or s["dimension"] == dimension]
    scores_str = "\n".join([f"- {s['dimension']}: {s['score']:.2f}" for s in filtered])

    user = f"Neighborhood: {neighborhood['name']}\n\nEquity Scores:\n{scores_str}"

    result = _call_llm(_SYSTEM_RECS, user)
    if result:
        parsed = _parse_json(result)
        if "recommendations" in parsed:
            return parsed["recommendations"]
    return _fallback_recommendations(filtered)


def _fallback_brief(neighborhood, scores):
    overall = sum(s["score"] for s in scores) / len(scores) if scores else 0
    lowest = min(scores, key=lambda s: s["score"]) if scores else None

    brief = (
        f"**Equity Brief for {neighborhood['name']}**\n\n"
        f"{neighborhood['name']} has an overall equity score of {overall:.2f} out of 1.00. "
        f"This places the neighborhood in the {'moderate' if overall > 0.5 else 'critical'} range for equitable access to resources and services.\n\n"
        f"**Key Challenge:** The lowest scoring dimension is '{lowest['dimension']}' with a score of {lowest['score']:.2f}. "
        f"This indicates significant disparities that require immediate attention from city planners.\n\n"
        f"**Demographic Context:** With a population of {neighborhood['population']:,} and median income of ${neighborhood['median_income']:,.0f}, "
        f"resource allocation should account for the specific socioeconomic needs of this community."
    )
    recommendations = [
        f"Prioritize infrastructure improvements in {lowest['dimension']} sector to address the {lowest['score']:.2f} equity gap" if lowest else "Conduct comprehensive equity audit across all dimensions",
        f"Establish community advisory board in {neighborhood['name']} to guide resource allocation decisions",
        "Increase accessibility audits at public transit stops and service centers",
        "Develop targeted outreach programs for underserved populations",
        "Allocate emergency funding for critical infrastructure repairs identified in accessibility assessment",
    ]
    return {"brief": brief, "recommendations": recommendations}


def _fallback_recommendations(scores):
    recs = []
    for s in sorted(scores, key=lambda x: x["score"]):
        if s["score"] < 0.4:
            recs.append({"area": s["dimension"], "action": f"Emergency investment needed in {s['dimension']} infrastructure and services", "effort": "high", "impact": "high"})
        elif s["score"] < 0.6:
            recs.append({"area": s["dimension"], "action": f"Develop improvement plan for {s['dimension']} with community input", "effort": "medium", "impact": "medium"})
        else:
            recs.append({"area": s["dimension"], "action": f"Maintain and expand successful {s['dimension']} programs", "effort": "low", "impact": "medium"})
    if not recs:
        recs = [{"area": "general", "action": "Conduct comprehensive community needs assessment", "effort": "medium", "impact": "high"}]
    return recs
