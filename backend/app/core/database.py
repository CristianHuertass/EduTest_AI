"""
database.py – Cliente de Supabase para EduTest AI.

Lee las credenciales desde las variables de entorno definidas en .env
e inicializa el cliente oficial de Supabase.
"""

import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Carga las variables del archivo .env (solo en desarrollo)
load_dotenv()

SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError(
        "Las variables de entorno SUPABASE_URL y SUPABASE_KEY son obligatorias. "
        "Revisa tu archivo .env."
    )

# Cliente de Supabase listo para usar en toda la aplicación
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
