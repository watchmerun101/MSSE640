from __future__ import annotations

import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from flask import Flask, jsonify, render_template, request

DB_PATH = Path(__file__).with_name("triangles.db")


def create_app() -> Flask:
    app = Flask(__name__)
    init_db()

    @app.get("/ui")
    def ui() -> Any:
        return render_template("index.html")

    @app.get("/")
    def root() -> Any:
        return jsonify(
            {
                "message": "Triangle API is running.",
                "docs": "/health, /triangles, /triangles/<id>, /triangles/summary",
            }
        )

    @app.get("/health")
    def health() -> Any:
        return jsonify({"status": "ok"})

    @app.get("/triangles")
    def list_triangles() -> Any:
        triangle_type_filter = request.args.get("type")
        with get_conn() as conn:
            if triangle_type_filter:
                rows = conn.execute(
                    """
                    SELECT id, a, b, c, is_valid, triangle_type, created_at
                    FROM triangles
                    WHERE triangle_type = ?
                    ORDER BY id ASC
                    """,
                    (triangle_type_filter,),
                ).fetchall()
            else:
                rows = conn.execute(
                    """
                    SELECT id, a, b, c, is_valid, triangle_type, created_at
                    FROM triangles
                    ORDER BY id ASC
                    """
                ).fetchall()

        return jsonify({"count": len(rows), "items": [row_to_dict(r) for r in rows]})

    @app.post("/triangles")
    def create_triangle() -> Any:
        payload = request.get_json(silent=True)
        if not isinstance(payload, dict):
            return error_response("Request body must be valid JSON.", 400)

        ok, result_or_error = parse_triangle_payload(payload)
        if not ok:
            return error_response(result_or_error, 400)

        a, b, c = result_or_error
        valid = is_valid_triangle(a, b, c)
        t_type = triangle_type(a, b, c) if valid else "NotATriangle"

        created_at = datetime.now(timezone.utc).isoformat()
        with get_conn() as conn:
            cur = conn.execute(
                """
                INSERT INTO triangles (a, b, c, is_valid, triangle_type, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (a, b, c, int(valid), t_type, created_at),
            )
            triangle_id = cur.lastrowid
            row = conn.execute(
                """
                SELECT id, a, b, c, is_valid, triangle_type, created_at
                FROM triangles
                WHERE id = ?
                """,
                (triangle_id,),
            ).fetchone()

        return jsonify({"message": "Triangle created.", "item": row_to_dict(row)}), 201

    @app.get("/triangles/<int:triangle_id>")
    def get_triangle(triangle_id: int) -> Any:
        with get_conn() as conn:
            row = conn.execute(
                """
                SELECT id, a, b, c, is_valid, triangle_type, created_at
                FROM triangles
                WHERE id = ?
                """,
                (triangle_id,),
            ).fetchone()

        if row is None:
            return error_response(f"Triangle with id {triangle_id} was not found.", 404)

        return jsonify({"item": row_to_dict(row)})

    @app.put("/triangles/<int:triangle_id>")
    def update_triangle(triangle_id: int) -> Any:
        payload = request.get_json(silent=True)
        if not isinstance(payload, dict):
            return error_response("Request body must be valid JSON.", 400)

        ok, result_or_error = parse_triangle_payload(payload)
        if not ok:
            return error_response(result_or_error, 400)

        a, b, c = result_or_error
        valid = is_valid_triangle(a, b, c)
        t_type = triangle_type(a, b, c) if valid else "NotATriangle"

        with get_conn() as conn:
            exists = conn.execute(
                "SELECT 1 FROM triangles WHERE id = ?", (triangle_id,)
            ).fetchone()
            if exists is None:
                return error_response(
                    f"Triangle with id {triangle_id} was not found.", 404
                )

            conn.execute(
                """
                UPDATE triangles
                SET a = ?, b = ?, c = ?, is_valid = ?, triangle_type = ?
                WHERE id = ?
                """,
                (a, b, c, int(valid), t_type, triangle_id),
            )
            row = conn.execute(
                """
                SELECT id, a, b, c, is_valid, triangle_type, created_at
                FROM triangles
                WHERE id = ?
                """,
                (triangle_id,),
            ).fetchone()

        return jsonify({"message": "Triangle updated.", "item": row_to_dict(row)})

    @app.delete("/triangles/<int:triangle_id>")
    def delete_triangle(triangle_id: int) -> Any:
        with get_conn() as conn:
            row = conn.execute(
                """
                SELECT id, a, b, c, is_valid, triangle_type, created_at
                FROM triangles
                WHERE id = ?
                """,
                (triangle_id,),
            ).fetchone()
            if row is None:
                return error_response(
                    f"Triangle with id {triangle_id} was not found.", 404
                )

            conn.execute("DELETE FROM triangles WHERE id = ?", (triangle_id,))

        return jsonify({"message": "Triangle deleted.", "item": row_to_dict(row)})

    @app.get("/triangles/summary")
    def summary() -> Any:
        with get_conn() as conn:
            total = conn.execute("SELECT COUNT(*) AS c FROM triangles").fetchone()["c"]
            valid_count = conn.execute(
                "SELECT COUNT(*) AS c FROM triangles WHERE is_valid = 1"
            ).fetchone()["c"]
            invalid_count = conn.execute(
                "SELECT COUNT(*) AS c FROM triangles WHERE is_valid = 0"
            ).fetchone()["c"]
            type_rows = conn.execute(
                """
                SELECT triangle_type, COUNT(*) AS c
                FROM triangles
                GROUP BY triangle_type
                ORDER BY triangle_type ASC
                """
            ).fetchall()

        type_counts = {row["triangle_type"]: row["c"] for row in type_rows}
        return jsonify(
            {
                "total": total,
                "valid": valid_count,
                "invalid": invalid_count,
                "by_type": type_counts,
            }
        )

    return app


def get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with get_conn() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS triangles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                a REAL NOT NULL,
                b REAL NOT NULL,
                c REAL NOT NULL,
                is_valid INTEGER NOT NULL,
                triangle_type TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )


def parse_triangle_payload(payload: dict[str, Any]) -> tuple[bool, tuple[float, float, float] | str]:
    required = ["a", "b", "c"]
    missing = [k for k in required if k not in payload]
    if missing:
        return False, f"Missing required field(s): {', '.join(missing)}"

    values: list[float] = []
    for side in required:
        raw = payload.get(side)
        if isinstance(raw, bool):
            return False, f"Field '{side}' must be a number."
        try:
            values.append(float(raw))
        except (TypeError, ValueError):
            return False, f"Field '{side}' must be a number."

    return True, (values[0], values[1], values[2])


def is_valid_triangle(a: float, b: float, c: float) -> bool:
    if a <= 0 or b <= 0 or c <= 0:
        return False
    return a + b > c and a + c > b and b + c > a


def triangle_type(a: float, b: float, c: float) -> str:
    if a == b == c:
        return "Equilateral"
    if a == b or b == c or a == c:
        return "Isosceles"
    return "Scalene"


def row_to_dict(row: sqlite3.Row | None) -> dict[str, Any]:
    if row is None:
        return {}

    return {
        "id": row["id"],
        "a": row["a"],
        "b": row["b"],
        "c": row["c"],
        "is_valid": bool(row["is_valid"]),
        "triangle_type": row["triangle_type"],
        "created_at": row["created_at"],
    }


def error_response(message: str, status_code: int) -> tuple[Any, int]:
    return jsonify({"error": message, "status": status_code}), status_code


app = create_app()

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
