from fastapi import APIRouter, HTTPException, Query
from services import xhs_login

router = APIRouter(prefix="/auth/xhs")

@router.post("/start")
def start_login():
    session_id = xhs_login.start_session()
    if not session_id:
        raise HTTPException(status_code=429, detail="Too many active sessions")
    return {"session_id": session_id}

@router.get("/status")
def login_status(session_id: str = Query(...)):
    status = xhs_login.get_status(session_id)
    if not status:
        raise HTTPException(status_code=404, detail="Session not found")
    return status

@router.post("/close")
def close_login(session_id: str):
    closed = xhs_login.close_session(session_id)
    if not closed:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"session_id": session_id, "closed": True}
