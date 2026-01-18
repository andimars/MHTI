#!/usr/bin/env python
"""Server startup script with configurable host and port."""

import argparse
import uvicorn


def main():
    parser = argparse.ArgumentParser(description="MHTI Server")
    parser.add_argument(
        "--host",
        default="127.0.0.1",
        help="Host to bind (default: 127.0.0.1, use 0.0.0.0 for LAN access)",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=8000,
        help="Port to bind (default: 8000)",
    )
    parser.add_argument(
        "--reload",
        action="store_true",
        help="Enable auto-reload for development",
    )

    args = parser.parse_args()

    print(f"Starting server at http://{args.host}:{args.port}")
    if args.host == "0.0.0.0":
        print("LAN access enabled - accessible from other devices on the network")

    uvicorn.run(
        "server.main:app",
        host=args.host,
        port=args.port,
        reload=args.reload,
    )


if __name__ == "__main__":
    main()
