import pytest
from playwright.sync_api import Page, expect

def test_homepage_loads(page: Page):
    """
    Prueba E2E que verifica que la página principal de React carga correctamente
    y muestra elementos clave de la interfaz.
    """
    # Navegamos al frontend de React en local
    page.goto("http://localhost:5173/")
    
    # Verificamos que la página principal cargue y tenga el contenedor principal
    # (Adaptar el selector según la estructura real, e.g., buscar el texto "EduTest")
    expect(page.locator("text=EduTest")).to_be_visible()
