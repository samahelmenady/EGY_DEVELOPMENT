"""
core/dns_fallback.py - Resilient DNS fallback for Google APIs.

Prevents [Errno 11004] / [Errno 11001] getaddrinfo failures caused by local router
or ISP DNS timeouts/misconfigurations when querying generativelanguage.googleapis.com.
"""
import socket
import logging

logger = logging.getLogger(__name__)

_KNOWN_GOOGLE_IPS = [
    "172.217.119.4",
    "172.217.117.4",
    "172.217.118.4",
    "172.217.115.4",
    "172.217.112.4",
    "172.217.113.4",
    "172.217.116.4",
    "172.217.114.4",
]

_orig_getaddrinfo = socket.getaddrinfo

def _fallback_getaddrinfo(host, port, family=0, type=0, proto=0, flags=0):
    try:
        return _orig_getaddrinfo(host, port, family, type, proto, flags)
    except socket.gaierror:
        if isinstance(host, str) and ("generativelanguage.googleapis.com" in host or host.endswith(".googleapis.com")):
            logger.info("Using fallback DNS IP addresses for %s", host)
            port_num = 443 if port in ("https", 443, None) else (int(port) if str(port).isdigit() else 443)
            results = []
            for ip in _KNOWN_GOOGLE_IPS:
                results.append((socket.AF_INET, socket.SOCK_STREAM, 6, "", (ip, port_num)))
            return results
        raise

def setup_dns_fallback():
    socket.getaddrinfo = _fallback_getaddrinfo

setup_dns_fallback()

