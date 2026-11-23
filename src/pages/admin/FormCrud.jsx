/**
 * Formulario genérico de alta/edición para recursos admin
 * (puntos, vehículos, cooperativas, factores).
 * campos: [{ clave, label, tipo?, opciones?, placeholder? }]
 */
import { useEffect, useState } from 'react'

export default function FormCrud({
  titulo,
  campos,
  inicial,
  onGuardar,
  onCancelar,
}) {
  const [form, setForm] = useState(inicial)

  // Al pulsar Editar, precargar los datos del registro elegido.
  // (Depende del contenido serializado para no resetear mientras se escribe.)
  const inicialJson = JSON.stringify(inicial)
  useEffect(() => {
    setForm(JSON.parse(inicialJson))
  }, [inicialJson])

  async function submit(e) {
    e.preventDefault()
    await onGuardar(form)
  }

  const input =
    'mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:border-emerald-500'

  return (
    <form
      onSubmit={submit}
      className="mt-6 grid gap-3 rounded-2xl bg-white p-5 shadow-sm md:grid-cols-2"
    >
      <h2 className="font-semibold text-gray-800 md:col-span-2">{titulo}</h2>
      {campos.map((c) => (
        <label key={c.clave} className="text-sm font-medium text-gray-700">
          {c.label}
          {c.opciones ? (
            <select
              value={form[c.clave] ?? ''}
              onChange={(e) => setForm({ ...form, [c.clave]: e.target.value })}
              className={input}
            >
              {c.opciones.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={c.tipo || 'text'}
              value={form[c.clave] ?? ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  [c.clave]:
                    c.tipo === 'number' ? Number(e.target.value) : e.target.value,
                })
              }
              placeholder={c.placeholder}
              required={c.required}
              className={input}
            />
          )}
        </label>
      ))}
      <div className="flex gap-2 md:col-span-2">
        <button
          type="submit"
          className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700"
        >
          Guardar
        </button>
        {onCancelar && (
          <button
            type="button"
            onClick={onCancelar}
            className="rounded-lg border px-4 py-2 text-sm"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}
