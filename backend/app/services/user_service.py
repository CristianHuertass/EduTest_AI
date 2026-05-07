"""
UserService – lógica de negocio para operaciones de usuario.
"""


class UserService:
    """Encapsula la lógica de negocio para la gestión de usuarios."""

    @staticmethod
    def get_all_users():
        """Retorna todos los usuarios desde la base de datos."""
        # TODO: inyectar una sesión de BD y consultar el modelo User
        return []

    @staticmethod
    def get_user_by_id(user_id: int):
        """Retorna un único usuario por su clave primaria."""
        # TODO: inyectar una sesión de BD y consultar el modelo User
        return None

    @staticmethod
    def create_user(email: str, password: str, full_name: str | None = None):
        """Hashea la contraseña y persiste un nuevo usuario."""
        # TODO: implementar con sesión de BD + security.get_password_hash
        return None
