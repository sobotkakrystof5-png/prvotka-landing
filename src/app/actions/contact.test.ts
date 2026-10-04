import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const send = vi.fn();
vi.mock("resend", () => ({
  Resend: class {
    emails = { send };
  },
}));

const { sendContact } = await import("./contact");

const valid = {
  name: "Jana Ukázková",
  company: "Ukázková <b>kancelář</b>",
  email: "jana@example.com",
  phone: "777 123 456",
  invoiceVolume: "200-600",
  program: "POHODA",
  programOther: "",
  message: "<script>alert(1)</script>",
  consent: true,
};

describe("sendContact (Server Action)", () => {
  beforeEach(() => {
    send.mockReset();
    send.mockResolvedValue({ data: { id: "x" }, error: null });
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("CONTACT_TO_EMAIL", "poptavky@example.com");
    vi.stubEnv("CONTACT_FROM_EMAIL", "web@example.com");
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("vyplněný honeypot vrátí tichý úspěch a nic neodešle", async () => {
    const result = await sendContact({ ...valid, startedAt: Date.now() - 10_000, website: "spam" });
    expect(result).toEqual({ ok: true });
    expect(send).not.toHaveBeenCalled();
  });

  it("odmítne odeslání rychlejší než 3 s", async () => {
    const result = await sendContact({ ...valid, startedAt: Date.now() - 500 });
    expect(result).toEqual({ ok: false, error: "too-fast" });
    expect(send).not.toHaveBeenCalled();
  });

  it("nevalidní data vrátí chyby polí", async () => {
    const result = await sendContact({ ...valid, email: "neni-email", startedAt: 0 });
    expect(result.ok).toBe(false);
    if (!result.ok && result.error === "invalid") {
      expect(result.fieldErrors.email).toBeTruthy();
    }
    expect(send).not.toHaveBeenCalled();
  });

  it("bez konfigurace vrátí obecnou chybu", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const result = await sendContact({ ...valid, startedAt: Date.now() - 10_000 });
    expect(result).toEqual({ ok: false, error: "server" });
  });

  it("odešle e-mail se správným předmětem a escapovaným HTML", async () => {
    const result = await sendContact({ ...valid, startedAt: Date.now() - 10_000 });
    expect(result).toEqual({ ok: true });
    const payload = send.mock.calls[0][0];
    expect(payload.subject).toBe("Poptávka: Ukázková <b>kancelář</b> (200–600 faktur měsíčně)");
    expect(payload.replyTo).toBe("jana@example.com");
    expect(payload.html).not.toContain("<script>");
    expect(payload.html).toContain("&lt;script&gt;");
    expect(payload.html).toContain("&lt;b&gt;kancelář&lt;/b&gt;");
  });
});
