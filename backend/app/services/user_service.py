"""
UserService – business logic for user operations.
"""


class UserService:
    """Encapsulates business logic for user management."""

    @staticmethod
    def get_all_users():
        """Return all users from the database."""
        # TODO: inject a DB session and query User model
        return []

    @staticmethod
    def get_user_by_id(user_id: int):
        """Return a single user by primary key."""
        # TODO: inject a DB session and query User model
        return None

    @staticmethod
    def create_user(email: str, password: str, full_name: str | None = None):
        """Hash the password and persist a new user."""
        # TODO: implement with DB session + security.get_password_hash
        return None
