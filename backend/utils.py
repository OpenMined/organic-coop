# Standard library imports
from pathlib import Path
import os
import shutil
import tempfile


def save_uploads_to_temp(upload, allow_multiple=False):
    """
    Save one or more UploadFile(s) to a temp directory or file.
    If allow_multiple is True, expects a list of UploadFile and returns a temp dir path.
    If allow_multiple is False, expects a single UploadFile and returns a file path.
    Returns only the path to the temp dir or file.
    If a folder is selected, returns the path to the folder itself (not the parent temp dir).
    """
    if allow_multiple:
        # Try to find the common root folder from the uploaded files
        filenames = [up.filename for up in upload]
        # Remove any leading slashes
        filenames = [f.lstrip(os.sep) for f in filenames]
        # Find the common prefix (folder)
        common_prefix = os.path.commonprefix(filenames)
        # If the common prefix is a partial folder name, trim to the last full folder
        if common_prefix and not common_prefix.endswith(os.sep):
            common_prefix = os.path.dirname(common_prefix)
        temp_dir = tempfile.mkdtemp()
        for up in upload:
            file_path = os.path.join(temp_dir, up.filename)
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            with open(file_path, "wb") as f:
                shutil.copyfileobj(up.file, f)
        # If a folder was selected, return the path to that folder inside temp_dir
        if common_prefix:
            folder_path = os.path.join(temp_dir, common_prefix)
            if os.path.isdir(folder_path):
                return folder_path
        return temp_dir  # fallback: return the temp dir
    else:
        suffix = Path(upload.filename).suffix
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            shutil.copyfileobj(upload.file, tmp)
            return tmp.name  # Only return the file path
