"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Landmark, MapPin, MessageCircle, Smartphone } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { formatCurrency } from "@/lib/format";
import {
  getShalomProvinceAgencyCount,
  getShalomDistricts,
  getShalomProvinces,
  isShalomDistrictRequired,
  shalomDepartments,
  type ShalomAgencyOption
} from "@/lib/shalom";

type ManualPaymentProvider = "manual_yape" | "manual_plin" | "bank_transfer";

type ManualPaymentResult = {
  orderId: string;
  payment: {
    mode: "manual";
    provider: ManualPaymentProvider;
    label: string;
    title: string;
    total: number;
    expiresAt: string;
    qrUrl?: string;
    whatsappUrl: string;
    instructions: Array<{ label: string; value: string }>;
  };
};

const paymentOptions: Array<{
  value: ManualPaymentProvider;
  label: string;
  description: string;
  icon: typeof Smartphone;
}> = [
  {
    value: "manual_yape",
    label: "Yape manual",
    description: "Paga directo y envia tu comprobante por WhatsApp.",
    icon: Smartphone
  },
  {
    value: "manual_plin",
    label: "Plin manual",
    description: "Transferencia directa sin comision de pasarela.",
    icon: Smartphone
  },
  {
    value: "bank_transfer",
    label: "Transferencia",
    description: "Usa cuenta bancaria y confirma por WhatsApp.",
    icon: Landmark
  }
];

export function CheckoutForm() {
  const { items, subtotal, clear } = useCart();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [paymentProvider, setPaymentProvider] = useState<ManualPaymentProvider>("manual_yape");
  const [manualPayment, setManualPayment] = useState<ManualPaymentResult | null>(null);
  const [department, setDepartment] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [selectedAgencyId, setSelectedAgencyId] = useState("");
  const [agencyOptions, setAgencyOptions] = useState<ShalomAgencyOption[]>([]);
  const [agenciesLoading, setAgenciesLoading] = useState(false);
  const [geocoded, setGeocoded] = useState(false);
  const [showAllAgencies, setShowAllAgencies] = useState(false);
  const shipping = items.length ? 12 : 0;
  const total = subtotal + shipping;
  const fieldClass =
    "min-h-12 w-full rounded-md border border-ink/10 bg-white px-3 py-3 text-base outline-none transition focus:border-navy disabled:cursor-not-allowed disabled:opacity-60";
  const provinces = useMemo(() => getShalomProvinces(department), [department]);
  const districts = useMemo(() => getShalomDistricts(department, province), [department, province]);
  const provinceAgencyCount = useMemo(() => getShalomProvinceAgencyCount(department, province), [department, province]);
  const districtRequired = useMemo(() => isShalomDistrictRequired(department, province), [department, province]);
  const districtCanBeSkipped = Boolean(province && provinceAgencyCount > 0 && !districtRequired);
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

    if (!department || !province || (districtRequired && !district)) {
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
  }, [department, province, district, districtRequired]);

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
      paymentProvider: String(form.get("paymentProvider") || paymentProvider),
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

    const mercadoPagoUrl = data.payment?.initPoint || data.payment?.init_point;

    if (data.payment?.mode === "manual") {
      setManualPayment({ orderId: data.orderId, payment: data.payment });
      setStatus("success");
      setMessage("Pedido creado. Completa el pago manual y envia tu comprobante por WhatsApp.");
      clear();
      return;
    }

    setStatus("success");
    setMessage(
      mercadoPagoUrl
        ? "Pedido creado. Te estamos llevando a la pasarela de pago."
        : "Pedido creado. Te enviaremos las instrucciones de pago."
    );
    clear();

    if (mercadoPagoUrl) {
      window.location.assign(mercadoPagoUrl);
    }
  }

  if (status === "success" && manualPayment) {
    return <ManualPaymentConfirmation result={manualPayment} />;
  }

  if (!items.length && status !== "success") {
    return (
      <div className="mobile-card rounded-lg border border-ink/10 bg-white p-8 text-center sm:p-10 md:bg-white">
        <h1 className="text-2xl font-semibold">Tu carrito esta vacio</h1>
        <p className="mt-2 text-ink/60">Agrega una prenda unica antes de finalizar compra.</p>
        <Link href="/shop" className="mobile-primary mt-6 inline-flex rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white md:bg-ink md:text-white">
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
        ? districtCanBeSkipped && !district
          ? "Esta provincia tiene pocas sedes Shalom. Puedes elegir una agencia directamente sin indicar distrito."
          : geocoded
            ? "No hay agencia exacta en ese distrito. Mostramos sedes de la misma provincia ordenadas por cercania aproximada."
            : "No hay agencia exacta en ese distrito. Mostramos sedes de la misma provincia."
        : matchLevel === "department"
          ? geocoded
            ? "No hay sedes en esa provincia. Mostramos opciones del mismo departamento ordenadas por cercania aproximada."
            : "No hay sedes en esa provincia. Mostramos opciones del mismo departamento."
          : "";

  return (
    <form onSubmit={submit} className="grid gap-5 pb-28 lg:grid-cols-[1fr_380px] lg:gap-8 lg:pb-0">
      <div className="grid gap-6">
        <section className="mobile-card rounded-lg border border-ink/10 bg-white p-4 sm:p-6 md:bg-white">
          <div className="flex items-start gap-3">
            <span className="mobile-primary grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink text-xs font-semibold text-white sm:h-8 sm:w-8 sm:text-sm md:bg-ink md:text-white">1</span>
            <div className="min-w-0">
              <h2 className="text-base font-semibold sm:text-lg">Datos del cliente</h2>
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

        <section className="mobile-card rounded-lg border border-ink/10 bg-white p-4 sm:p-6 md:bg-white">
          <div className="flex items-start gap-3">
            <span className="mobile-primary grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink text-xs font-semibold text-white sm:h-8 sm:w-8 sm:text-sm md:bg-ink md:text-white">2</span>
            <div className="min-w-0">
              <h2 className="text-base font-semibold sm:text-lg">Ubicacion de destino</h2>
              <p className="mt-1 text-sm leading-6 text-ink/60">
                Selecciona departamento y provincia. En provincias con varias sedes, tambien pediremos distrito.
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
              required={districtRequired}
              value={district}
              disabled={!province}
              list="shalom-districts"
              onChange={(event) => setDistrict(event.target.value)}
              placeholder={districtCanBeSkipped ? "Distrito (opcional)" : "Distrito"}
              className={fieldClass}
            />
            <datalist id="shalom-districts">
              {districts.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </div>
          {districtCanBeSkipped ? (
            <p className="mobile-soft-surface mt-3 rounded-lg bg-linen/60 p-3 text-sm text-ink/60">
              {province} tiene {provinceAgencyCount} {provinceAgencyCount === 1 ? "sede" : "sedes"} Shalom. Puedes elegir una agencia sin completar distrito.
            </p>
          ) : province ? (
            <p className="mobile-soft-surface mt-3 rounded-lg bg-linen/60 p-3 text-sm text-ink/60">
              Esta provincia tiene varias sedes. Indica distrito para mostrar las mas cercanas.
            </p>
          ) : null}
        </section>

        <section className="mobile-card rounded-lg border border-ink/10 bg-white p-4 sm:p-6 md:bg-white">
          <div className="grid gap-3 sm:flex sm:items-start sm:justify-between sm:gap-4">
            <div className="flex items-start gap-3">
              <span className="mobile-primary grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink text-xs font-semibold text-white sm:h-8 sm:w-8 sm:text-sm md:bg-ink md:text-white">3</span>
              <div className="min-w-0">
                <h2 className="text-base font-semibold sm:text-lg">Agencia Shalom cercana</h2>
                <p className="mt-1 text-sm leading-6 text-ink/60">
                  Elige la sede donde prefieres recoger tu pedido.
                </p>
              </div>
            </div>
            {selectedAgency ? <span className="w-fit text-xs font-semibold uppercase tracking-[0.18em] text-olive">Seleccionada</span> : null}
          </div>
          {!province || (districtRequired && !district) ? (
            <div className="mobile-soft-surface mt-5 rounded-lg border border-dashed border-ink/15 bg-linen/40 p-5 text-sm text-ink/60">
              {province ? "Completa el distrito para ver sedes Shalom cercanas." : "Completa departamento y provincia para ver sedes Shalom cercanas."}
            </div>
          ) : agenciesLoading ? (
            <div className="mobile-soft-surface mt-5 rounded-lg border border-dashed border-ink/15 bg-linen/40 p-5 text-sm text-ink/60">
              Buscando agencias Shalom cercanas...
            </div>
          ) : agencyOptions.length ? (
            <div className="mt-5 grid gap-3">
              {agencyNotice ? <p className="mobile-soft-surface rounded-lg bg-linen/60 p-3 text-sm text-ink/60">{agencyNotice}</p> : null}
              <div className="grid max-h-[460px] gap-3 overflow-y-auto pr-1">
                {visibleAgencyOptions.map((agency) => (
                  <label
                    key={agency.id}
                    className={`grid cursor-pointer gap-3 rounded-lg border p-3 transition sm:grid-cols-[1fr_auto] sm:p-4 ${
                      selectedAgencyId === agency.id ? "mobile-selected border-ink bg-ink text-white ring-1 ring-white/25" : "mobile-card border-ink/10 bg-white hover:border-ink/35 md:bg-white"
                    }`}
                  >
                    <span className="flex min-w-0 gap-3">
                      <input
                        required
                        type="radio"
                        name="shalomAgencyId"
                        value={agency.id}
                        checked={selectedAgencyId === agency.id}
                        onChange={() => setSelectedAgencyId(agency.id)}
                        className="mt-1"
                      />
                      <span className="min-w-0">
                        <span className="flex min-w-0 items-center gap-2 text-sm font-semibold leading-snug sm:text-base">
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
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${selectedAgencyId === agency.id ? "mobile-chip-dark bg-white/10 text-white" : "mobile-chip-dark bg-linen text-ink/65 md:bg-linen md:text-ink/65"}`}>
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
                          } shrink-0`}
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
            <div className="mobile-soft-surface mt-5 rounded-lg border border-dashed border-ink/15 bg-linen/40 p-5 text-sm text-ink/60">
              No encontramos agencias para esa ubicacion. Prueba con una provincia o distrito cercano.
            </div>
          )}
        </section>

        <section className="mobile-card rounded-lg border border-ink/10 bg-white p-4 sm:p-6 md:bg-white">
          <h2 className="text-base font-semibold sm:text-lg">Metodo de pago</h2>
          <p className="mt-1 text-sm leading-6 text-ink/60">
            Estos metodos evitan comisiones de pasarela. Validaremos el comprobante antes de preparar el envio.
          </p>
          <div className="mt-5 grid gap-3">
            {paymentOptions.map((option) => {
              const Icon = option.icon;
              const selected = paymentProvider === option.value;

              return (
                <label
                  key={option.value}
                  className={`flex min-h-16 cursor-pointer items-center gap-3 rounded-lg border p-4 text-sm transition sm:text-base ${
                    selected ? "border-ink bg-ink text-white" : "border-ink/10 bg-white hover:border-ink/35"
                  }`}
                >
                  <input
                    required
                    type="radio"
                    name="paymentProvider"
                    value={option.value}
                    checked={selected}
                    onChange={() => setPaymentProvider(option.value)}
                    className="sr-only"
                  />
                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border ${
                      selected ? "border-white/20 bg-white/10 text-white" : "border-ink/10 bg-linen text-ink"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold">{option.label}</span>
                    <span className={`mt-1 block text-sm ${selected ? "text-white/70" : "text-ink/55"}`}>
                      {option.description}
                    </span>
                  </span>
                  {selected ? <CheckCircle2 className="ml-auto h-5 w-5 shrink-0" /> : null}
                </label>
              );
            })}
          </div>
        </section>
      </div>
      <aside className="mobile-card h-fit rounded-lg border border-ink/10 bg-white p-4 sm:p-6 lg:sticky lg:top-28 md:bg-white">
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
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
        {department || province || district ? (
          <div className="mobile-soft-surface mt-5 rounded-lg bg-linen/60 p-4 text-sm">
            <p className="font-semibold">Destino</p>
            <p className="mt-1 text-ink/65">{[department, province, district].filter(Boolean).join(" / ")}</p>
          </div>
        ) : null}
        {selectedAgency ? (
          <div className="mobile-soft-surface mt-3 rounded-lg bg-linen/60 p-4 text-sm">
            <p className="font-semibold">Recojo en Shalom</p>
            <p className="mt-1 text-ink/65">{selectedAgency.name}</p>
            <p className="mt-1 text-ink/55">{selectedAgency.address}</p>
          </div>
        ) : null}
        <button disabled={status === "loading"} className="mt-6 hidden min-h-12 w-full rounded-full bg-ink px-5 py-3.5 text-sm font-semibold text-white disabled:bg-ink/35 lg:block">
          {status === "loading" ? "Procesando..." : "Confirmar pedido"}
        </button>
        {message ? (
          <p className={`mt-4 rounded-md p-3 text-sm ${status === "error" ? "bg-red-50 text-red-700" : "bg-olive/10 text-olive"}`}>
            {message}
          </p>
        ) : null}
      </aside>
      {status !== "success" ? (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-black/95 px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-white shadow-[0_-18px_50px_rgba(0,0,0,0.45)] backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-7xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">Total</p>
              <p className="mt-0.5 text-lg font-semibold leading-none">{formatCurrency(total)}</p>
              {selectedAgency ? <p className="mt-1 truncate text-xs text-white/55">{selectedAgency.name}</p> : null}
            </div>
            <button
              disabled={status === "loading"}
              className="mobile-primary min-h-12 shrink-0 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black disabled:bg-white/30 disabled:text-white/50"
            >
              {status === "loading" ? "Procesando" : "Confirmar"}
            </button>
          </div>
        </div>
      ) : null}
    </form>
  );
}

function ManualPaymentConfirmation({ result }: { result: ManualPaymentResult }) {
  const expiration = new Date(result.payment.expiresAt);
  const expirationText = Number.isNaN(expiration.getTime())
    ? ""
    : expiration.toLocaleString("es-PE", {
        dateStyle: "short",
        timeStyle: "short"
      });

  return (
    <div className="grid gap-5 pb-12 lg:grid-cols-[1fr_360px] lg:gap-8">
      <section className="mobile-card rounded-lg border border-ink/10 bg-white p-5 sm:p-8 md:bg-white">
        <span className="mobile-primary grid h-12 w-12 place-items-center rounded-full bg-ink text-white">
          <CheckCircle2 className="h-6 w-6" />
        </span>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-olive">Pedido registrado</p>
        <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">Completa tu pago manual</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/65 sm:text-base">
          Tu pedido quedo pendiente de validacion. La prenda se marcara como vendida cuando confirmemos el pago.
        </p>

        <div className="mobile-soft-surface mt-6 rounded-lg bg-linen/60 p-4">
          <p className="text-sm font-semibold text-ink">Pedido</p>
          <p className="mt-1 break-all text-sm text-ink/60">{result.orderId}</p>
          {expirationText ? (
            <p className="mt-3 text-sm text-ink/60">
              Tiempo para enviar comprobante: <span className="font-semibold text-ink">{expirationText}</span>
            </p>
          ) : null}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-[220px_1fr]">
          <div className="mobile-soft-surface grid min-h-[220px] place-items-center rounded-lg border border-ink/10 bg-linen/40 p-4">
            {result.payment.qrUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={result.payment.qrUrl} alt={`QR ${result.payment.label}`} className="max-h-52 w-full object-contain" />
            ) : (
              <div className="text-center">
                <Smartphone className="mx-auto h-10 w-10 text-ink/55" />
                <p className="mt-3 text-sm font-semibold">{result.payment.label}</p>
                <p className="mt-1 text-xs leading-5 text-ink/55">Usa los datos de pago indicados.</p>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-ink/10 bg-white p-4">
            <p className="text-sm font-semibold">{result.payment.title}</p>
            <div className="mt-4 grid gap-3 text-sm">
              {result.payment.instructions.map((item) => (
                <div key={item.label} className="flex justify-between gap-4 border-b border-ink/10 pb-3 last:border-0 last:pb-0">
                  <span className="text-ink/55">{item.label}</span>
                  <span className="text-right font-semibold">{item.value}</span>
                </div>
              ))}
              <div className="flex justify-between gap-4 pt-1 text-base">
                <span className="font-semibold">Total</span>
                <span className="font-semibold">{formatCurrency(result.payment.total)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <a
            href={result.payment.whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="mobile-primary inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white md:bg-ink md:text-white"
          >
            <MessageCircle className="h-4 w-4" />
            Enviar comprobante
          </a>
          <Link
            href="/shop"
            className="mobile-outline inline-flex min-h-12 items-center justify-center rounded-full border border-ink/10 px-5 py-3 text-sm font-semibold text-ink"
          >
            Volver a tienda
          </Link>
        </div>
      </section>

      <aside className="mobile-card h-fit rounded-lg border border-ink/10 bg-white p-5 sm:p-6 md:bg-white">
        <h3 className="text-lg font-semibold">Como se confirma</h3>
        <div className="mt-4 grid gap-4 text-sm leading-6 text-ink/65">
          <p>1. Realiza el pago por el metodo elegido.</p>
          <p>2. Presiona "Enviar comprobante" y adjunta la captura por WhatsApp.</p>
          <p>3. Danatto valida el pago y marca el pedido como pagado desde el panel admin.</p>
          <p>4. La prenda pasa a vendida y se prepara el envio a Shalom.</p>
        </div>
      </aside>
    </div>
  );
}
