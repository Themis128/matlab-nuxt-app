"""
Model Versioning System with Rollback Capability
Manages model versions, tracks scores, and handles rollback on failure
"""

import json
import logging
import shutil
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)

# Models directory
MODELS_DIR = Path(__file__).parent / "trained_models"
VERSIONS_DIR = MODELS_DIR / "versions"
VERSIONS_DIR.mkdir(parents=True, exist_ok=True)

# Version metadata file
VERSION_METADATA_FILE = VERSIONS_DIR / "version_metadata.json"


class ModelVersionManager:
    """Manages model versions with rollback capability"""

    def __init__(self):
        self.models_dir = MODELS_DIR
        self.versions_dir = VERSIONS_DIR
        self.metadata_file = VERSION_METADATA_FILE
        self._load_metadata()

    def _load_metadata(self):
        """Load version metadata from file"""
        if self.metadata_file.exists():
            try:
                with open(self.metadata_file, "r") as f:
                    self.metadata = json.load(f)
            except Exception as e:
                logger.warning(f"Failed to load version metadata: {e}")
                self.metadata = {}
        else:
            self.metadata = {}

    def _save_metadata(self):
        """Save version metadata to file"""
        try:
            with open(self.metadata_file, "w") as f:
                json.dump(self.metadata, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save version metadata: {e}")

    def backup_model(self, model_name: str, model_path: Path) -> Optional[str]:
        """
        Backup current model before training new version

        Args:
            model_name: Name of the model (e.g., 'price_predictor_sklearn')
            model_path: Path to the current model file

        Returns:
            Backup version ID or None if backup failed
        """
        if not model_path.exists():
            logger.warning(f"Model file not found for backup: {model_path}")
            return None

        try:
            # Create version ID
            version_id = f"{model_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            backup_dir = self.versions_dir / model_name
            backup_dir.mkdir(parents=True, exist_ok=True)

            # Copy model file
            backup_path = backup_dir / f"{version_id}.pkl"
            shutil.copy2(model_path, backup_path)

            # Get current model score if available
            current_score = self.get_current_score(model_name)

            # Save metadata
            if model_name not in self.metadata:
                self.metadata[model_name] = {"versions": [], "current_version": None}

            version_info = {
                "version_id": version_id,
                "backup_path": str(backup_path),
                "backup_time": datetime.now().isoformat(),
                "score": current_score,
                "status": "backed_up",
            }

            self.metadata[model_name]["versions"].append(version_info)
            self._save_metadata()

            logger.info(f"Backed up {model_name} as version {version_id}")
            return version_id

        except Exception as e:
            logger.error(f"Failed to backup model {model_name}: {e}")
            return None

    def get_current_score(self, model_name: str) -> Optional[float]:
        """Get current model score from metadata"""
        if model_name in self.metadata:
            current_version = self.metadata[model_name].get("current_version")
            if current_version:
                for version in self.metadata[model_name]["versions"]:
                    if version["version_id"] == current_version:
                        return version.get("score")
        return None

    def get_current_version(self, model_name: str) -> Optional[str]:
        """Get current version ID for a model"""
        if model_name in self.metadata:
            return self.metadata[model_name].get("current_version")
        return None

    def register_new_version(
        self, model_name: str, model_path: Path, score: float, version_id: Optional[str] = None
    ) -> Tuple[bool, Optional[str]]:
        """
        Register a new model version after training

        Args:
            model_name: Name of the model
            model_path: Path to the new model file
            score: Model score (R2, accuracy, etc.)
            version_id: Optional version ID (if None, uses backup version)

        Returns:
            Tuple of (should_keep_new_model, error_message)
        """
        try:
            if model_name not in self.metadata:
                self.metadata[model_name] = {"versions": [], "current_version": None}

            # Get previous version and score
            previous_version = self.metadata[model_name].get("current_version")
            previous_score = None
            if previous_version:
                for version in self.metadata[model_name]["versions"]:
                    if version["version_id"] == previous_version:
                        previous_score = version.get("score")
                        break

            # Determine if we should keep the new model
            should_keep = True
            error_message = None

            if previous_score is not None:
                if score < previous_score:
                    should_keep = False
                    error_message = (
                        f"New model score ({score:.4f}) is worse than previous ({previous_score:.4f})"
                    )
                else:
                    logger.info(
                        f"New model score ({score:.4f}) is better than previous ({previous_score:.4f})"
                    )

            if should_keep:
                # Use provided version_id or generate one
                if version_id is None:
                    version_id = f"{model_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

                # Update metadata
                version_info = {
                    "version_id": version_id,
                    "model_path": str(model_path),
                    "score": score,
                    "previous_score": previous_score,
                    "registration_time": datetime.now().isoformat(),
                    "status": "active",
                }

                # Find and update the backup version if it exists
                for version in self.metadata[model_name]["versions"]:
                    if version.get("version_id") == version_id or version.get("status") == "backed_up":
                        version.update(version_info)
                        break
                else:
                    self.metadata[model_name]["versions"].append(version_info)

                # Set as current version
                self.metadata[model_name]["current_version"] = version_id
                self._save_metadata()

                logger.info(f"Registered new version {version_id} for {model_name} with score {score:.4f}")
            else:
                logger.warning(f"Not keeping new model for {model_name}: {error_message}")

            return should_keep, error_message

        except Exception as e:
            logger.error(f"Failed to register new version for {model_name}: {e}")
            return False, str(e)

    def rollback_model(self, model_name: str) -> Tuple[bool, Optional[str]]:
        """
        Rollback to previous model version

        Args:
            model_name: Name of the model to rollback

        Returns:
            Tuple of (success, error_message)
        """
        try:
            if model_name not in self.metadata:
                return False, f"No metadata found for {model_name}"

            versions = self.metadata[model_name]["versions"]
            if not versions:
                return False, f"No versions found for {model_name}"

            # Find previous version (second to last active version)
            active_versions = [v for v in versions if v.get("status") == "active"]
            if len(active_versions) < 2:
                return False, f"No previous version to rollback to for {model_name}"

            # Get current and previous versions
            current_version_id = self.metadata[model_name].get("current_version")
            previous_versions = [v for v in active_versions if v["version_id"] != current_version_id]
            if not previous_versions:
                return False, f"No previous version found for {model_name}"

            # Sort by registration time and get most recent previous version
            previous_versions.sort(key=lambda x: x.get("registration_time", ""), reverse=True)
            previous_version = previous_versions[0]

            # Restore from backup
            backup_path = Path(previous_version.get("backup_path"))
            if not backup_path.exists():
                return False, f"Backup file not found: {backup_path}"

            # Get current model path
            current_model_path = self.models_dir / f"{model_name}.pkl"
            if current_model_path.exists():
                # Backup current (failed) model
                failed_backup = self.versions_dir / model_name / f"failed_{current_version_id}.pkl"
                failed_backup.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(current_model_path, failed_backup)

            # Restore previous version
            shutil.copy2(backup_path, current_model_path)

            # Update metadata
            self.metadata[model_name]["current_version"] = previous_version["version_id"]
            self._save_metadata()

            logger.info(f"Rolled back {model_name} to version {previous_version['version_id']}")
            return True, None

        except Exception as e:
            logger.error(f"Failed to rollback {model_name}: {e}")
            return False, str(e)

    def get_model_info(self, model_name: str) -> Optional[Dict[str, Any]]:
        """Get information about a model's versions"""
        if model_name in self.metadata:
            return self.metadata[model_name].copy()
        return None

    def list_all_models(self) -> List[str]:
        """List all models with versioning"""
        return list(self.metadata.keys())

    def get_model_versions(self, model_name: str) -> List[Dict[str, Any]]:
        """
        Get all versions for a specific model

        Args:
            model_name: Name of the model

        Returns:
            List of version dictionaries, sorted by registration time (newest first)
        """
        if model_name not in self.metadata:
            return []

        versions = self.metadata[model_name].get("versions", [])
        # Sort by registration_time or backup_time (newest first)
        versions_sorted = sorted(
            versions,
            key=lambda x: x.get("registration_time") or x.get("backup_time", ""),
            reverse=True
        )
        return versions_sorted

    def get_all_models_info(self) -> Dict[str, Dict[str, Any]]:
        """
        Get information about all models with versioning

        Returns:
            Dictionary mapping model names to their version info
        """
        return self.metadata.copy()
