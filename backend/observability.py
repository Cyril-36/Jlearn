"""
Observability: structured JSON logging + Sentry error tracking.
Call setup() once at application startup.
"""
import json
import logging
import os
import time
from typing import Callable

import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


# ── JSON log formatter ────────────────────────────────────────────

class JSONFormatter(logging.Formatter):
    """Emit one JSON object per log line."""

    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "ts": self.formatTime(record, "%Y-%m-%dT%H:%M:%SZ"),
            "level": record.levelname,
            "logger": record.name,
            "msg": record.getMessage(),
        }
        if record.exc_info:
            payload["exc"] = self.formatException(record.exc_info)
        return json.dumps(payload)


def setup(app=None):
    """
    Configure JSON logging and (optionally) Sentry.
    Pass the FastAPI app instance to attach request-logging middleware.
    """
    # ── JSON logging ──────────────────────────────────────────────
    root = logging.getLogger()
    root.setLevel(logging.INFO)
    handler = logging.StreamHandler()
    handler.setFormatter(JSONFormatter())
    root.handlers = [handler]

    # ── Sentry ────────────────────────────────────────────────────
    dsn = os.getenv("SENTRY_DSN", "")
    if dsn:
        sentry_sdk.init(
            dsn=dsn,
            traces_sample_rate=float(os.getenv("SENTRY_TRACES_RATE", "0.1")),
            integrations=[
                FastApiIntegration(),
                SqlalchemyIntegration(),
            ],
            environment=os.getenv("ENVIRONMENT", "development"),
        )
        logging.getLogger("jlearn").info("Sentry initialised", extra={"dsn_prefix": dsn[:20]})

    # ── Request / response middleware ─────────────────────────────
    if app is not None:
        app.add_middleware(RequestLoggingMiddleware)


# ── Middleware ────────────────────────────────────────────────────

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Log every request with method, path, status, and duration."""

    logger = logging.getLogger("jlearn.http")

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start = time.perf_counter()
        response = await call_next(request)
        duration_ms = round((time.perf_counter() - start) * 1000, 1)

        self.logger.info(
            "%s %s %s %.1fms",
            request.method,
            request.url.path,
            response.status_code,
            duration_ms,
            extra={
                "method": request.method,
                "path": request.url.path,
                "status": response.status_code,
                "duration_ms": duration_ms,
                "client": request.client.host if request.client else None,
            },
        )
        return response
