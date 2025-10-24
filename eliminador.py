import os

def eliminar_csv_excluyendo(ruta_base):
    for carpeta_actual, _, archivos in os.walk(ruta_base):
        for archivo in archivos:
            if archivo.endswith('.csv') and not (archivo.endswith('_EN.csv') or archivo.endswith('_ES.csv')):
                ruta_completa = os.path.join(carpeta_actual, archivo)
                try:
                    os.remove(ruta_completa)
                    print(f"Eliminado: {ruta_completa}")
                except Exception as e:
                    print(f"Error al eliminar {ruta_completa}: {e}")

# Usar la carpeta donde está este script como punto de partida
ruta_objetivo = os.path.dirname(os.path.abspath(__file__))
eliminar_csv_excluyendo(ruta_objetivo)
