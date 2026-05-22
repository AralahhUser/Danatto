"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, MapPin } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { formatCurrency } from "@/lib/format";
import {
  getShalomDistricts,
  getShalomProvinces,
  shalomDepartments,
  type ShalomAgencyOption
} from "@/lib/shalom";

export function CheckoutForm() {
  const { items, subtotal, clear } = useCart();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [department, setDepartment] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [selectedAgencyId, setSelectedAgencyId] = useState("");
  const [agencyOptions, setAgencyOptions] = useState<ShalomAgencyOption[]>([]);
  const [agenciesLoading, setAgenciesLoading] = useState(false);
  const [geocoded, setGeocoded] = useState(false);
  const [showAllAgencies, setShowAllAgencies] = useState(false);
  const shipping = items.length ? 12 : 0;
  const fieldClass = "min-h-12 rounded-md border border-ink/10 bg-white px-3 py-3 text-base outline-none transition focus:border-navy";
  const provinces = useMemo(() => getShalomProvinces(department), [department]);
  const districts = useMemo(() => getShalomDistricts(department, province), [department, province]);
  const selectedAgency = agencyOptions.find((agency) => agency.id === selectedAgencyId);
  const matchLevel = agencyOptions[0]?.matchLevel;
  const visibleAgencyOptions = useMemo(() => {
    if (showAllAgencies || matchLevel === "district") return agencyOptions;
    return agencyOptions.slice(0, 8);
  }, [agencyOptions, matchLevel, showAllAgencies]);

  useEffect(() => {
    setSelectedAgencyId(agencyOptions[0]?.id ?? "");
  }, [agencyOptions]);

  useEffect(() => {
    setShowAllAgencies(false);

    if (!department || !province || !district) {
      setAgencyOptions([]);
      setGeocoded(false);
      return;
    }

    const controller = new AbortController();
    const params = new URLSearchParams({ department, province, district });
    setAgenciesLoading(true);

    fetch(`/api/shalom/agencies?${params.toString()}`, { signal: controller.signal })
      .then((response) => response.json())
      .then((data: { agencies?: ShalomAgencyOption[]; geocoded?: boolean }) => {
        setAgencyOptions(data.agencies ?? []);
        setGeocoded(Boolean(data.geocoded));
      })
      .catch((error: Error) => {
        if (error.name !== "AbortError") {
          setAgencyOptions([]);
          setGeocoded(false);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setAgenciesLoading(false);
      });

    return () => controller.abort();
  }, [department, province, district]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedAgency) {
      setStatus("error");
      setMessage("Selecciona una agencia Shalom para continuar.");
      return;
    }

    setStatus("loading");
    const form = new FormData(event.currentTarget);
    const payload = {
      customer: {
        name: String(form.get("name") || ""),
        phone: String(form.get("phone") || ""),
        dni: String(form.get("dni") || ""),
        department: String(form.get("department") || ""),
        province: String(form.get("province") || ""),
        district: String(form.get("district") || ""),
        shalomAgencyId: selectedAgency.id
      },
      shippingMethod: "shalom_agency",
      paymentProvider: form.get("paymentProvider"),
      items: items.map((item) => ({ productId: item.productId, quantity: item.quantity }))
    };

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();

    if (!response.ok) {
      setStatus("error");
      setMessage(data.error || "No se pudo registrar el pedido.");
      return;
    }

    setStatus("success");
    setMessage(
      data.payment?.init_point
        ? "Pedido creado. Puedes continuar con el enlace de pago."
        : "Pedido creado. La pasarela queda lista al configurar las variables de entorno."
    );
    clear();
  }

  if (!items.length && status !== "success") {
    return (
      <div className="rounded-lg border border-ink/10 bg-white p-10 text-center">
        <h1 className="text-2xl font-semibold">Tu carrito esta vacio</h1>
        <p className="mt-2 text-ink/60">Agrega una prenda unica antes de finalizar compra.</p>
        <Link href="/shop" className="mt-6 inline-flex rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white">
          Ir a tienda
        </Link>
      </div>
    );
  }

  const agencyNotice =
    matchLevel === "district"
      ? geocoded
        ? "Estas agencias corresponden al distrito indicado y se ordenan por distancia aproximada."
        : "Estas agencias corresponden al distrito indicado."
      : matchLevel === "province"
        ? geocoded
          ? "No hay agencia exacta en ese distrito. Mostramos sedes de la misma provincia ordenadas por cercania aproximada."
          : "No hay agencia exacta en ese distrito. Mostramos sedes de la misma provincia."
        : matchLevel === "department"
          ? geocoded
            ? "No hay sedes en esa provincia. Mostramos opciones del mismo departamento ordenadas por cercania aproximada."
            : "No hay sedes en esa provincia. Mostramos opciones del mismo departamento."
          : "";

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_380px] lg:gap-8">
      <div className="grid gap-6">
        <section className="rounded-lg border border-ink/10 bg-white p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink text-sm font-semibold text-white">1</span>
            <div>
              <h2 className="text-lg font-semibold">Datos del cliente</h2>
              <p className="mt-1 text-sm leading-6 text-ink/60">Usaremos estos datos para registrar tu pedido.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <input name="name" required placeholder="Nombres completos" className={`${fieldClass} sm:col-span-2`} />
            <input name="phone" required inputMode="tel" placeholder="Numero de telefono" className={fieldClass} />
            <input
              name="dni"
              required
              inputMode="numeric"
              maxLength={8}
              pattern="[0-9]{8}"
              placeholder="Numero de DNI"
              className={fieldClass}
            />
          </div>
        </section>

        <section className="rounded-lg border border-ink/10 bg-white p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink text-sm font-semibold text-white">2</span>
            <div>
              <h2 className="text-lg font-semibold">Ubicacion de destino</h2>
              <p className="mt-1 text-sm leading-6 text-ink/60">
                Selecciona departamento, provincia y distrito para encontrar las sedes Shalom mas cercanas.
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <select
              name="department"
              required
              value={department}
              onChange={(event) => {
                setDepartment(event.target.value);
                setProvince("");
                setDistrict("");
              }}
              className={fieldClass}
            >
              <option value="">Departamento</option>
              {shalomDepartments.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <select
              name="province"
              required
              value={province}
              disabled={!department}
              onChange={(event) => {
                setProvince(event.target.value);
                setDistrict("");
              }}
              className={fieldClass}
            >
              <option value="">Provincia</option>
              {provinces.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <input
              name="district"
              required
              value={district}
              disabled={!province}
              list="shalom-districts"
              onChange={(event) => setDistrict(event.target.value)}
              placeholder="Distrito"
              className={fieldClass}
            />
            <datalist id="shalom-districts">
              {districts.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </div>
        </section>

        <section className="rounded-lg border border-ink/10 bg-white p-4 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink text-sm font-semibold text-white">3</span>
              <div>
                <h2 className="text-lg font-semibold">Agencia Shalom cercana</h2>
                <p className="mt-1 text-sm leading-6 text-ink/60">
                  Elige la sede donde prefieres recoger tu pedido.
                </p>
              </div>
            </div>
            {selectedAgency ? <span className="text-xs font-semibold uppercase tracking-[0.18em] text-olive">Seleccionada</span> : null}
          </div>
          {!district ? (
            <div className="mt-5 rounded-lg border border-dashed border-ink/15 bg-linen/40 p-5 text-sm text-ink/60">
              Completa departamento, provincia y distrito para ver sedes Shalom cercanas.
            </div>
          ) : agenciesLoading ? (
            <div className="mt-5 rounded-lg border border-dashed border-ink/15 bg-linen/40 p-5 text-sm text-ink/60">
              Buscando agencias Shalom cercanas...
            </div>
          ) : agencyOptions.length ? (
            <div className="mt-5 grid gap-3">
              {agencyNotice ? <p className="rounded-lg bg-linen/60 p-3 text-sm text-ink/60">{agencyNotice}</p> : null}
              <div className="grid max-h-[460px] gap-3 overflow-y-auto pr-1">
                {visibleAgencyOptions.map((agency) => (
                  <label
                    key={agency.id}
                    className={`grid cursor-pointer gap-3 rounded-lg border p-4 transition sm:grid-cols-[1fr_auto] ${
                      selectedAgencyId === agency.id ? "border-ink bg-ink text-white" : "border-ink/10 bg-white hover:border-ink/35"
                    }`}
                  >
                    <span className="flex gap-3">
                      <input
                        required
                        type="radio"
                        name="shalomAgencyId"
                        value={agency.id}
                        checked={selectedAgencyId === agency.id}
                        onChange={() => setSelectedAgencyId(agency.id)}
                        className="mt-1"
                      />
                      <span>
                        <span className="flex items-center gap-2 text-sm font-semibold sm:text-base">
                          {agency.name}
                          {selectedAgencyId === agency.id ? <CheckCircle2 className="h-4 w-4" /> : null}
                        </span>
                        <span className={`mt-1 block text-sm ${selectedAgencyId === agency.id ? "text-white/75" : "text-ink/60"}`}>
                          {agency.department} / {agency.province} / {agency.district}
                        </span>
                        <span className={`mt-2 block text-sm leading-5 ${selectedAgencyId === agency.id ? "text-white/75" : "text-ink/65"}`}>
                          {agency.address || "Direccion por confirmar con Shalom"}
                        </span>
                      </span>
                    </span>
                    <span className="flex items-start justify-between gap-3 sm:justify-end">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${selectedAgencyId === agency.id ? "bg-white/10 text-white" : "bg-linen text-ink/65"}`}>
                        {typeof agency.distanceKm === "number"
                          ? `${agency.distanceKm.toFixed(1)} km aprox.`
                          : agency.matchLevel === "district"
                            ? "Mismo distrito"
                            : agency.matchLevel === "province"
                              ? "Misma provincia"
                              : "Mismo departamento"}
                      </span>
                      {agency.mapsUrl ? (
                        <a
                          href={agency.mapsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className={`inline-flex h-9 w-9 items-center justify-center rounded-full border ${
                            selectedAgencyId === agency.id ? "border-white/20 text-white" : "border-ink/10 text-ink"
                          }`}
                          aria-label={`Ver mapa de ${agency.name}`}
                        >
                          <MapPin className="h-4 w-4" />
                        </a>
                      ) : null}
                    </span>
                  </label>
                ))}
              </div>
              {visibleAgencyOptions.length < agencyOptions.length ? (
                <button
                  type="button"
                  onClick={() => setShowAllAgencies(true)}
                  className="min-h-11 rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink"
                >
                  Ver todas las agencias disponibles
                </button>
              ) : null}
            </div>
          ) : (
            <div className="mt-5 rounded-lg border border-dashed border-ink/15 bg-linen/40 p-5 text-sm text-ink/60">
              No encontramos agencias para esa ubicacion. Prueba con una provincia o distrito cercano.
            </div>
          )}
        </section>

        <section className="rounded-lg border border-ink/10 bg-white p-4 sm:p-6">
          <h2 className="text-lg font-semibold">Metodo de pago</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="flex min-h-14 items-center rounded-lg border border-ink/10 p-4 text-sm sm:text-base">
              <input defaultChecked type="radio" name="paymentProvider" value="mercado_pago" className="mr-2" />
              Mercado Pago
            </label>
            <label className="flex min-h-14 items-center rounded-lg border border-ink/10 p-4 text-sm sm:text-base">
              <input type="radio" name="paymentProvider" value="culqi" className="mr-2" />
              Culqi
            </label>
            <label className="flex min-h-14 items-center rounded-lg border border-ink/10 p-4 text-sm sm:col-span-2 sm:text-base">
              <input type="radio" name="paymentProvider" value="yape_plin" className="mr-2" />
              Yape/Plin manual
            </label>
          </div>
        </section>
      </div>
      <aside className="h-fit rounded-lg border border-ink/10 bg-white p-4 sm:p-6 lg:sticky lg:top-28">
        <h2 className="text-lg font-semibold">Resumen</h2>
        <div className="mt-5 grid gap-3 text-sm">
          {items.map((item) => (
            <div key={item.productId} className="flex justify-between gap-4">
              <span>
                {item.name} x {item.quantity}
              </span>
              <span>{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="border-t border-ink/10 pt-3">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="mt-2 flex justify-between">
              <span>Envio Shalom</span>
              <span>{formatCurrency(shipping)}</span>
            </div>
            <div className="mt-3 flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatCurrency(subtotal + shipping)}</span>
            </div>
          </div>
        </div>
        {department || province || district ? (
          <div className="mt-5 rounded-lg bg-linen/60 p-4 text-sm">
            <p className="font-semibold">Destino</p>
            <p className="mt-1 text-ink/65">{[department, province, district].filter(Boolean).join(" / ")}</p>
          </div>
        ) : null}
        {selectedAgency ? (
          <div className="mt-3 rounded-lg bg-linen/60 p-4 text-sm">
            <p className="font-semibold">Recojo en Shalom</p>
            <p className="mt-1 text-ink/65">{selectedAgency.name}</p>
            <p className="mt-1 text-ink/55">{selectedAgency.address}</p>
          </div>
        ) : null}
        <button disabled={status === "loading"} className="mt-6 min-h-12 w-full rounded-full bg-ink px-5 py-3.5 text-sm font-semibold text-white disabled:bg-ink/35">
          {status === "loading" ? "Procesando..." : "Confirmar pedido"}
        </button>
        {message ? (
          <p className={`mt-4 rounded-md p-3 text-sm ${status === "error" ? "bg-red-50 text-red-700" : "bg-olive/10 text-olive"}`}>
            {message}
          </p>
        ) : null}
      </aside>
    </form>
  );
}
