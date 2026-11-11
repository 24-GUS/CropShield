import time
from collections import defaultdict
from fastapi import Request, HTTPException, status
from typing import Dict, List

class InMemoryRateLimiter:
    """
    Sliding window in-memory rate limiter to protect authentication and scanning endpoints
    against brute-force password cracking and denial-of-service (DoS) image floods.
    """
    def __init__(self):
        # Maps client IP -> list of request timestamps
        self.requests: Dict[str, List[float]] = defaultdict(list)

    def check_rate_limit(self, request: Request, max_requests: int = 15, window_seconds: int = 60):
        client_ip = request.client.host if request.client else "127.0.0.1"
        now = time.time()
        
        # Clean timestamps older than the window
        timestamps = self.requests[client_ip]
        self.requests[client_ip] = [ts for ts in timestamps if now - ts < window_seconds]

        if len(self.requests[client_ip]) >= max_requests:
            retry_after = int(window_seconds - (now - self.requests[client_ip][0]))
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded. Too many requests from this IP. Please retry in {retry_after} seconds.",
                headers={"Retry-After": str(retry_after)}
            )

        self.requests[client_ip].append(now)

rate_limiter = InMemoryRateLimiter()
