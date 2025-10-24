import os

# Obtener la ruta del directorio actual
directorio_actual = os.getcwd()

# Crear una lista para almacenar los nombres de los archivos
nombres_archivos = []

# Extensiones que queremos buscar
extensiones = ('.png', '.jpg')

# Recorrer los archivos en el directorio
for archivo in os.listdir(directorio_actual):
    if archivo.lower().endswith(extensiones):
        nombres_archivos.append(archivo)
        os.remove(os.path.join(directorio_actual, archivo))

# Guardar los nombres en un archivo de texto
with open('img.txt', 'w', encoding='utf-8') as f:
    for nombre in nombres_archivos:
        f.write(nombre + '\n')

print(f"Se eliminaron {len(nombres_archivos)} archivos y se guardaron sus nombres en 'img.txt'.")
