"""Unit tests for files API endpoints.

测试 /api/scan 和 /api/files 路由。
使用 conftest.py 中的 override_auth fixture 绕过认证。
"""

import pytest
from fastapi.testclient import TestClient

from server.main import app


@pytest.fixture
def files_client(override_auth) -> TestClient:
    """
    提供带认证覆盖的测试客户端。

    Args:
        override_auth: Authentication override fixture.

    Returns:
        Configured test client.
    """
    yield TestClient(app)
    app.dependency_overrides.clear()


class TestFilesAPI:
    """Tests for /api/scan endpoint."""

    def test_scan_folder_success(self, files_client, tmp_path):
        """Test successful folder scan."""
        # Create test video files
        (tmp_path / "video1.mp4").touch()
        (tmp_path / "video2.mkv").touch()

        response = files_client.post("/api/scan", json={"folder_path": str(tmp_path)})

        assert response.status_code == 200
        data = response.json()
        assert data["folder_path"] == str(tmp_path)
        assert data["total_files"] == 2
        assert len(data["files"]) == 2

    def test_scan_folder_empty(self, files_client, tmp_path):
        """Test scanning empty folder."""
        response = files_client.post("/api/scan", json={"folder_path": str(tmp_path)})

        assert response.status_code == 200
        data = response.json()
        assert data["total_files"] == 0
        assert data["files"] == []

    def test_scan_folder_not_found(self, files_client):
        """Test 400 response for non-existent folder."""
        response = files_client.post(
            "/api/scan",
            json={"folder_path": "/nonexistent/path/that/does/not/exist"},
        )

        # 应返回 400（使用 AppException）
        assert response.status_code == 400
        data = response.json()
        assert "error" in data

    def test_scan_folder_invalid_path(self, files_client, tmp_path):
        """Test 400 response when path is not a directory."""
        file_path = tmp_path / "file.txt"
        file_path.touch()

        response = files_client.post("/api/scan", json={"folder_path": str(file_path)})

        assert response.status_code == 400

    def test_scan_folder_missing_path(self, files_client):
        """Test 422 response for missing folder_path."""
        response = files_client.post("/api/scan", json={})

        assert response.status_code == 422

    def test_scan_folder_with_video_extensions(self, files_client, tmp_path):
        """Test that only video files are returned."""
        # Create various files
        (tmp_path / "video.mp4").touch()
        (tmp_path / "video.mkv").touch()
        (tmp_path / "video.avi").touch()
        (tmp_path / "document.txt").touch()
        (tmp_path / "image.jpg").touch()

        response = files_client.post("/api/scan", json={"folder_path": str(tmp_path)})

        assert response.status_code == 200
        data = response.json()
        # 只应返回视频文件
        assert data["total_files"] == 3


class TestHealthCheck:
    """Tests for health check endpoint."""

    def test_health_check(self):
        """Test health check endpoint (no auth required)."""
        # Health check 不需要认证
        client = TestClient(app)
        response = client.get("/health")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        # 可能包含 checks 字段
        if "checks" in data:
            assert "database" in data["checks"]


class TestFileBrowseAPI:
    """Tests for /api/files/browse endpoint."""

    def test_browse_folder_success(self, files_client, tmp_path):
        """Test successful folder browsing."""
        # Create test files and folders
        (tmp_path / "subfolder").mkdir()
        (tmp_path / "file.txt").touch()

        response = files_client.get(f"/api/files/browse?path={tmp_path}")

        assert response.status_code == 200
        data = response.json()
        assert "entries" in data
        assert len(data["entries"]) == 2

    def test_browse_folder_not_found(self, files_client):
        """Test browsing non-existent folder."""
        response = files_client.get("/api/files/browse?path=/nonexistent/folder/path")

        assert response.status_code == 400

    def test_browse_missing_path(self, files_client):
        """Test browsing without path parameter returns root or error."""
        response = files_client.get("/api/files/browse")

        # 应返回默认路径结果或 422
        assert response.status_code in [200, 422]
