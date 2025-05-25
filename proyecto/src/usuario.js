import { supabase } from './supabase.js';
import { mostrarAdministrador } from './administrador.js';

export async function mostrarDatos() {
  const app = document.getElementById('app');
  app.innerHTML = '<p>Cargando...</p>';

  // Obtener el usuario logueado
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    app.innerHTML = '<p>No hay sesión activa</p>';
    return;
  }

  // Obtener datos del usuario desde la tabla "usuario"
  const { data: usuario, error } = await supabase
    .from('usuario')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !usuario) {
    app.innerHTML = '<p>Error al obtener usuario</p>';
    return;
  }

  // Mostrar la interfaz del perfil
  app.innerHTML = `
    <div>
      <h2>Perfil de Usuario</h2>
      <label>Nombre: <input id="nombre" value="${usuario.nombre}" /></label><br/>
      <label>Correo: <input id="correo" value="${usuario.correo}" /></label><br/>
      <label>Fecha de nacimiento: <input type="date" id="fechaNacimiento" value="${usuario.fecha_nacimiento}" /></label><br/>
      <label>Teléfono: <input id="telefono" value="${usuario.telefono}" /></label><br/>
      <label>Rol: ${usuario.roll}</label><br/>
      <button id="btn-guardar">Guardar cambios</button>

      <hr/>

      <h3>Agregar imagen</h3>
      <input type="text" id="nueva-url" placeholder="URL de la imagen"/>
      <button id="btn-agregar-url">Agregar</button>

      <h3>Imágenes guardadas</h3>
      <ul id="lista-imagenes"></ul>

      <hr/>
      <h2>Quiero cerrar sesión</h2>
      <button id="btn-cerrar-sesion">Cerrar sesión</button>
      ${usuario.roll === "admin" ? `<button class="c-nav-item" id="btn-administrador">Administrador</button>` : ""} 
      <br/><br/><br/><br/><br/>
    </div>
  `;

  // Función para cargar imágenes
  async function cargarImagenes() {
    const { data: imagenes } = await supabase
      .from('multimedia')
      .select('*')
      .eq('usuarioid', user.id);

    const lista = document.getElementById('lista-imagenes');
    lista.innerHTML = '';

    imagenes.forEach(img => {
      const li = document.createElement('li');
      li.innerHTML = `
        <img src="${img.url}" width="150" />
        <br />
        <button data-id="${img.id}">Eliminar</button>
      `;
      lista.appendChild(li);

      li.querySelector('button').addEventListener('click', async () => {
        await supabase.from('multimedia').delete().eq('id', img.id);
        cargarImagenes();
      });
    });
  }

  cargarImagenes();

  // Guardar cambios del perfil
  document.getElementById('btn-guardar').addEventListener('click', async () => {
    const actualizado = {
      nombre: document.getElementById('nombre').value,
      correo: document.getElementById('correo').value,
      fecha_nacimiento: document.getElementById('fechaNacimiento').value,
      telefono: document.getElementById('telefono').value,
    };

    const { error } = await supabase
      .from('usuario')
      .update(actualizado)
      .eq('id', user.id);

    if (error) alert('Error al actualizar');
    else alert('Datos actualizados');
  });

  // Agregar imagen por URL
  document.getElementById('btn-agregar-url').addEventListener('click', async () => {
    const url = document.getElementById('nueva-url').value.trim();
    if (!url) return;

    const { error } = await supabase
      .from('multimedia')
      .insert([{ url, usuarioid: user.id }]);

    if (error) alert('Error al agregar imagen');
    else {
      document.getElementById('nueva-url').value = '';
      cargarImagenes();
    }
  });

  // Cerrar sesión
  document.getElementById('btn-cerrar-sesion').addEventListener('click', async () => {
    await supabase.auth.signOut();
    location.reload(); // Recarga la app
  });

  // administrador
  document.getElementById('btn-administrador').addEventListener('click', async () => {
    await supabase.auth.signOut();
    mostrarAdministrador()
  });

}
