"""Unit tests for FileService."""

import pytest

from server.core.exceptions import FolderNotFoundError, InvalidFolderError
from server.services.file_service import SUPPORTED_VIDEO_EXTENSIONS, FileService


class TestFileService:
    """Tests for FileService class."""

    def test_scan_folder_finds_video_files(self, tmp_path, file_service):
        """Test that video files are correctly identified."""
        # Create test files
        (tmp_path / "video.mp4").touch()
        (tmp_path / "video.mkv").touch()
        (tmp_path / "document.pdf").touch()
        (tmp_path / "image.jpg").touch()

        result = file_service.scan_folder(str(tmp_path))

        assert len(result) == 2
        extensions = {f.extension for f in result}
        assert extensions == {".mp4", ".mkv"}

    def test_scan_folder_recursive(self, tmp_path, file_service):
        """Test that subdirectories are scanned recursively."""
        # Create nested directory structure
        subdir = tmp_path / "subdir"
        subdir.mkdir()
        nested = subdir / "nested"
        nested.mkdir()

        (tmp_path / "root.mp4").touch()
        (subdir / "sub.mkv").touch()
        (nested / "deep.avi").touch()

        result = file_service.scan_folder(str(tmp_path))

        assert len(result) == 3
        filenames = {f.filename for f in result}
        assert filenames == {"root.mp4", "sub.mkv", "deep.avi"}

    def test_scan_folder_empty_directory(self, tmp_path, file_service):
        """Test scanning an empty directory returns empty list."""
        result = file_service.scan_folder(str(tmp_path))

        assert result == []

    def test_scan_folder_no_video_files(self, tmp_path, file_service):
        """Test scanning a directory with no video files."""
        (tmp_path / "document.pdf").touch()
        (tmp_path / "image.png").touch()
        (tmp_path / "text.txt").touch()

        result = file_service.scan_folder(str(tmp_path))

        assert result == []

    def test_scan_folder_not_found(self, file_service):
        """Test that FolderNotFoundError is raised for non-existent path."""
        with pytest.raises(FolderNotFoundError) as exc_info:
            file_service.scan_folder("/nonexistent/path/to/folder")

        assert "/nonexistent/path/to/folder" in str(exc_info.value)

    def test_scan_folder_invalid_folder(self, tmp_path, file_service):
        """Test that InvalidFolderError is raised when path is a file."""
        file_path = tmp_path / "not_a_folder.txt"
        file_path.touch()

        with pytest.raises(InvalidFolderError) as exc_info:
            file_service.scan_folder(str(file_path))

        assert "not_a_folder.txt" in str(exc_info.value)

    def test_scanned_file_has_correct_attributes(self, tmp_path, file_service):
        """Test that ScannedFile has all required attributes."""
        video_file = tmp_path / "test_video.mp4"
        video_file.write_bytes(b"fake video content")

        result = file_service.scan_folder(str(tmp_path))

        assert len(result) == 1
        scanned = result[0]
        assert scanned.filename == "test_video.mp4"
        assert scanned.path.endswith("test_video.mp4")
        assert scanned.size == 18  # len(b"fake video content")
        assert scanned.extension == ".mp4"

    def test_scan_folder_case_insensitive_extensions(self, tmp_path, file_service):
        """Test that file extensions are matched case-insensitively."""
        (tmp_path / "video.MP4").touch()
        (tmp_path / "video.MKV").touch()
        (tmp_path / "video.Avi").touch()

        result = file_service.scan_folder(str(tmp_path))

        assert len(result) == 3

    def test_supported_extensions_constant(self):
        """Test that all expected extensions are supported."""
        expected = {
            ".mp4", ".mkv", ".avi", ".wmv", ".mov", ".flv",
            ".rmvb", ".ts", ".m2ts", ".bdmv", ".webm",
            ".3gp", ".mpg", ".mpeg", ".vob", ".iso",
        }
        assert SUPPORTED_VIDEO_EXTENSIONS == expected
