import logging
import os

import jwt
from fastapi import Depends, FastAPI, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

app = FastAPI()
bearer = HTTPBearer(auto_error=False)
issuer = os.environ["ISSUER"]
audience = os.environ["AUDIENCE"]
keys = jwt.PyJWKClient(os.environ["JWKS_URL"], timeout=5)
log = logging.getLogger("uvicorn.error")


@app.get("/api/me")
def current_user(credentials: HTTPAuthorizationCredentials | None = Depends(bearer)):
    unauthorized = HTTPException(401, "Valid access token required", headers={"WWW-Authenticate": "Bearer"})
    if credentials is None:
        raise unauthorized
    try:
        token = credentials.credentials
        key = keys.get_signing_key_from_jwt(token)
        claims = jwt.decode(token, key.key, algorithms=["RS256"], audience=audience,
                            issuer=issuer, options={"require": ["exp", "sub", "iat", "aud", "iss"]})
        if claims.get("typ") != "Bearer":
            raise unauthorized
    except jwt.PyJWKClientConnectionError as exc:
        raise HTTPException(503, "Keycloak signing keys unavailable") from exc
    except jwt.PyJWTError as exc:
        raise unauthorized from exc
    user = {"sub": claims["sub"], "username": claims.get("preferred_username")}
    log.info("Verified /api/me user=%r sub=%r", user["username"], user["sub"])
    return user
