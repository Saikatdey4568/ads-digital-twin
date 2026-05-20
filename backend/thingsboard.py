import requests
from typing import Optional
from config_manager import settings

class ThingsBoardClient:
    def __init__(self):
        self.host = settings.TB_HOST.rstrip("/")
        self.username = settings.TB_USERNAME
        self.password = settings.TB_PASSWORD
        self.device_id = settings.TB_DEVICE_ID
        self._token = None

    def _login(self):
        resp = requests.post(f"{self.host}/api/auth/login",
            json={"username": self.username, "password": self.password}, timeout=10)
        resp.raise_for_status()
        self._token = resp.json().get("token")
        return self._token

    def _headers(self):
        if not self._token:
            self._login()
        return {"Content-Type": "application/json", "X-Authorization": f"Bearer {self._token}"}

    def push_shared_attributes(self, payload):
        if not self.device_id:
            raise ValueError("TB_DEVICE_ID not set in .env file")
        url = f"{self.host}/api/plugins/telemetry/DEVICE/{self.device_id}/SHARED_SCOPE"
        resp = requests.post(url, json=payload, headers=self._headers(), timeout=15)
        if resp.status_code == 401:
            self._token = None
            resp = requests.post(url, json=payload, headers=self._headers(), timeout=15)
        resp.raise_for_status()
        return {"status": "ok", "device_id": self.device_id}

    def get_device_status(self):
        if not self.device_id:
            return {"connected": False, "reason": "TB_DEVICE_ID not configured"}
        try:
            url = f"{self.host}/api/plugins/telemetry/DEVICE/{self.device_id}/values/timeseries"
            resp = requests.get(url, headers=self._headers(), params={"keys": "event", "limit": 1}, timeout=10)
            resp.raise_for_status()
            data = resp.json()
            event = data.get("event", [{}])[0].get("value") if data.get("event") else None
            return {"connected": True, "event": event, "safe_to_deploy": event == "IDLE"}
        except Exception as e:
            return {"connected": False, "reason": str(e)}

tb_client = ThingsBoardClient()
