import { supabase } from "./supabase.js";

export async function mostrarAdministrador() {
  const app = document.querySelector("#app");

  // 1. Verificar si hay sesión activa
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    app.innerHTML = "Acceso no autorizado";
    return;
  }

  // 2. Validar que el usuario sea administrador
  const { data, error } = await supabase
    .from("usuario")
    .select("roll")
    .eq("id", user.id)
    .single();

  if (error || !data || data.roll !== "admin") {
    app.innerHTML = "Acceso denegado";
    return;
  }

  // 3. Obtener todos los usuarios
  const { data: usuariosData, error: usuariosError } = await supabase
    .from("usuario")
    .select("id, nombre, correo, roll, telefono");

  // 4. Obtener todas las fotos
  const { data: fotosData, error: fotosError } = await supabase
    .from("multimedia")
    .select("id, url, usuarioid");

  if (usuariosError || fotosError) {
    console.error(usuariosError || fotosError);
    app.innerHTML = "Error al cargar datos";
    return;
  }

  // 5. Relacionar usuarios con sus fotos
  const usuariosConFotos = usuariosData.map((usuario) => ({
    ...usuario,
    fotos: fotosData.filter((foto) => foto.usuarioid === usuario.id),
  }));

  // 6. Generar HTML dinámico
  let html = `
    <h1>Administrador - Gestión de Usuarios y Multimedia</h1>
    <table border="1">
      <thead>
        <tr>
          <th>ID Usuario</th>
          <th>Nombre</th>
          <th>Correo</th>
          <th>Teléfono</th>
          <th>Fotos</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
  `;

  usuariosConFotos.forEach((usuario) => {
    html += `
      <tr data-id="${usuario.id}">
        <td>${usuario.id}</td>
        <td><input type="text" value="${usuario.nombre}" class="nombre-input" /></td>
        <td>${usuario.correo}</td>
        <td><input type="tel" value="${usuario.telefono}" class="telefono-input" /></td>
        <td>
          ${usuario.fotos
            .map(
              (foto) => `
              <div data-imgid="${foto.id}" style="display:inline-block; margin-right:10px">
                <img src="${foto.url}" width="100" />
                <button class="eliminar-img-btn">Eliminar</button>
              </div>`
            )
            .join("")}
        </td>
        <td>
          <button class="guardar-cambios-btn">Guardar Cambios</button>
        </td>
      </tr>
    `;
  });

  html += `</tbody></table>`;
  app.innerHTML = html;

  // 7. Agregar eventos para guardar cambios
  document.querySelectorAll(".guardar-cambios-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const row = e.target.closest("tr");
      const id = row.dataset.id;
      const nombre = row.querySelector(".nombre-input").value;
      const telefono = row.querySelector(".telefono-input").value;

      const { error } = await supabase
        .from("usuario")
        .update({ nombre, telefono })
        .eq("id", id);

      alert(error ? "Error al guardar cambios" : "Cambios guardados");
    });
  });

  // 8. Agregar eventos para eliminar imágenes
  document.querySelectorAll(".eliminar-img-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const imgDiv = e.target.closest("div[data-imgid]");
      const id = imgDiv.dataset.imgid;

      const { error } = await supabase.from("multimedia").delete().eq("id", id);

      if (error) {
        alert("Error al eliminar imagen");
      } else {
        imgDiv.remove(); // Eliminar del DOM
      }
    });
  });
}
